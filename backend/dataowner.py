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

def uploadData(records, connection):
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
            (shapely.wkt.dumps(pt), tail.get('name'), tail.get('phone'), tail.get('address'), neighborsBytes, verificationObject)
        )

    connection.commit()
    cursor.close()
