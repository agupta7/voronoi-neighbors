import shapely.wkt
from shapely.geometry.point import Point
import struct

def allPois(connection):
    query = '''select id, ST_AsText(location), name, phone, address, neighbors, encode(verificationObject, 'hex') from POIs ORDER BY id'''
    cursor = connection.cursor()
    cursor.execute(query)
    records = list()

    for idd, location, name, phone, address, neighborsBytes, verificationObjectHexStr in cursor:
        pt = shapely.wkt.loads(location)
        lat = pt.y
        lng = pt.x

        record = dict(location={'lat': lat, 'lng': lng})
        tail = dict(name=name, phone=phone, address=address)
        record['tail'] = tail
        record['_meta_'] = dict(id=idd, verificationObject=verificationObjectHexStr)
        record['_meta_']['neighbors'] = list()
        n = struct.unpack('>H', neighborsBytes[0:2])[0]
        for i in range(0, n):
            lnglat = struct.unpack('>dd', neighborsBytes[(i * 16 + 2):(i*16 + 18)])
            record['_meta_']['neighbors'].append(dict(location=dict(lng=lnglat[0], lat=lnglat[1])))
        
        records.append(record)
    connection.commit()
    cursor.close()

    return records

def uploadData(connection, records):
    cursor = connection.cursor()
    cursor.execute('TRUNCATE TABLE POIs;')
    for record in records:
        pt = Point([record['location']['lng'], record['location']['lat']])

        tail = record['tail']
        neighbors = record['_meta_']['neighbors']
        neighborsBytes = bytearray.fromhex('{:04x}'.format(len(neighbors)))
        for n in neighbors:
            neighborsBytes.extend(struct.pack('>dd', n['location']['lng'], n['location']['lat']))
        verificationObject = record['_meta_']['verificationObject']
        cursor.execute('''INSERT INTO POIs (location, name, phone, address, neighbors, verificationObject) 
            VALUES (ST_GeomFromText(%s, 4326), %s, %s, %s, %s, decode(%s, 'hex'))''',
            (shapely.wkt.dumps(pt), tail['name'], tail['phone'], tail['address'], neighborsBytes, verificationObject)
        )

    connection.commit()
    cursor.close()

def maliciousUploadData(connection, diff):
    cursor = connection.cursor()
    records = diff['changed']
    for record in records:
        pt = Point([record['location']['lng'], record['location']['lat']])
        neighbors = record['_meta_']['neighbors']
        neighborsBytes = bytearray.fromhex('{:04x}'.format(len(neighbors)))
        for n in neighbors:
            neighborsBytes.extend(struct.pack('>dd', n['location']['lng'], n['location']['lat']))

        sql = '''WITH vals (id, location, name, phone, address, neighbors, verificationObject)
                    as (
                        values (%s, ST_GeomFromText(%s, 4326), %s, %s, %s, %s, decode(%s, 'hex'))
                    ),
                    update_result as (
                        update POIs p set 
                            location = vals.location,
                            name = vals.name,
                            phone = vals.phone,
                            address = vals.address,
                            neighbors = vals.neighbors,
                            verificationObject = vals.verificationObject
                        FROM vals
                        WHERE p.id = vals.id
                        RETURNING p.*
                    )
                INSERT INTO POIs (location, name, phone, address, neighbors, verificationObject)
                SELECT vals.location, vals.name, vals.phone, vals.address, vals.neighbors, vals.verificationObject
                FROM vals 
                WHERE NOT EXISTS (SELECT 1 FROM update_result WHERE update_result.id = vals.id)
        '''
        cursor.execute(sql, (record['_meta_']['id'], shapely.wkt.dumps(pt), record['tail']['name'], record['tail']['phone'], record['tail']['address'], neighborsBytes, record['_meta_']['verificationObject']))

    records = diff['deleted']
    for record in records:
        cursor.execute('DELETE FROM POIs WHERE id = %s', (record['_meta_']['id'],))

    connection.commit()
    cursor.close()

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
