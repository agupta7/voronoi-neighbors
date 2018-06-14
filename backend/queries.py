import shapely.wkt
from shapely.geometry.point import Point
import struct

def nearestNeighbors(connection, origin, range_, k):
    pt = Point(origin['lng'], origin['lat'])
    query = '''SELECT * FROM (SELECT row_number() OVER () as rownum, p.* FROM 
                    (SELECT id, ST_AsText(location), name, phone, address, neighbors, encode(verificationObject, 'hex'), ST_Distance(
                        Geography(location),
                        ST_GeographyFromText(%s)
                        ) as meters
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
        
        records.append(record)

    return records
