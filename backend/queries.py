import shapely.wkt
from shapely.geometry.point import Point
import struct
import serviceProvider
import random

def nearestNeighbors(connection, origin, range_, k):
    (dropRecordsRandom, modifyRecordsRandom) = getMaliciousSettings(connection)
    random.seed()
    pt = Point(origin['lng'], origin['lat'])
    query = '''SELECT * FROM (SELECT row_number() OVER () as rownum, p.* FROM 
                    (SELECT id, 
                        ST_AsText(location), name, phone, address, neighbors, encode(verificationObject, 'hex'), 
                        ST_Distance(Geography(location), ST_GeographyFromText(%s)) as meters
                    FROM POIs ORDER BY meters) p'''
    args = [shapely.wkt.dumps(pt)]
    if range_ is not None:
        query += ' WHERE p.meters < %s) q'
        args.append(range_)
    else:
        query += ') q'
    if k is not None:
        query += ' WHERE q.rownum <= %s'
        args.append(k)

    cursor = connection.cursor()
    cursor.execute(query, tuple(args))

    records = list()
    for rownum, id_, location, name, phone, address, neighborsBytes, verificationObjectHexStr, distanceOrigin in cursor:
        if modifyRecordsRandom is True and random.choice((True, False)):
            cursor2 = connection.cursor()
            args2 = [shapely.wkt.dumps(pt)]
            args2.extend(args)
            query2 = '''SELECT id,
                                    ST_AsText(location), name, phone, address, neighbors, encode(verificationObject, 'hex'), 
                                    ST_Distance(Geography(location), ST_GeographyFromText(%s)) as meters
                                FROM POIS WHERE POIs.id IN (SELECT id
                                        FROM POIs WHERE id NOT IN (SELECT id FROM (''' + query + ''') r) 
                                        ORDER BY random() LIMIT 1)
            '''
            cursor2.execute(query2, tuple(args2))
            (id_, location, name, phone, address, neighborsBytes, verificationObjectHexStr, distanceOrigin) = cursor2.fetchone()
            cursor2.close()
        pt = shapely.wkt.loads(location)
        lat = pt.y
        lng = pt.x

        record = dict(location={'lat': lat, 'lng': lng})
        tail = dict(name=name, phone=phone, address=address)
        record['tail'] = tail
        record['_meta_'] = dict(id=id_, verificationObject=verificationObjectHexStr, distance_meters=distanceOrigin)
        record['_meta_']['neighbors'] = list()
        n = struct.unpack('>H', neighborsBytes[0:2])[0]
        for i in range(0, n):
            lnglat = struct.unpack('>dd', neighborsBytes[(i * 16 + 2):(i*16 + 18)])
            record['_meta_']['neighbors'].append(dict(location=dict(lng=lnglat[0], lat=lnglat[1])))
        
        if dropRecordsRandom is True and random.choice((True, False)):
            # randomly skip this record
            continue
        records.append(record)

    connection.commit()
    cursor.close()
    return records

def getMaliciousSettings(connection):
    settings = serviceProvider.getSettings(connection)
    return (settings['dropRecordsRandom'], settings['modifyRecordsRandom'])
