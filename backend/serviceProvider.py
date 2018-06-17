import shapely.wkt
from shapely.geometry.point import Point
import struct

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
        cursor.execute(sql, (record['_meta_']['id'], shapely.wkt.dumps(pt), record['tail'].get('name'), record['tail'].get('phone'), record['tail'].get('address'), neighborsBytes, record['_meta_']['verificationObject']))

    records = diff['deleted']
    for record in records:
        cursor.execute('DELETE FROM POIs WHERE id = %s', (record['_meta_']['id'],))

    connection.commit()
    cursor.close()

def saveSettings(settings, connection):
    dropRecords = settings.get('dropRecordsRandom')
    modifyRecords = settings.get('modifyRecordsRandom')
    cursor = connection.cursor()
    if dropRecords is not None:
        sql = '''WITH vals (key, value)
                    as (
                            values ('dropRecordsRandom', %s)
                        ),
                    update_result as (
                        UPDATE settings s set
                                value = vals.value
                        FROM vals
                        WHERE s.key = vals.key
                        RETURNING s.*
                    )
                    INSERT INTO settings (key, value)
                    SELECT vals.key, vals.value
                    FROM vals
                    WHERE NOT EXISTS (SELECT 1 FROM update_result WHERE update_result.key = vals.key)
        '''
        cursor.execute(sql, (str(dropRecords),))
    
    if modifyRecords is not None:
        sql = '''WITH vals (key, value)
                    as (
                            values ('modifyRecordsRandom', %s)
                        ),
                    update_result as (
                        UPDATE settings s set
                                value = vals.value
                        FROM vals
                        WHERE s.key = vals.key
                        RETURNING s.*
                    )
                    INSERT INTO settings (key, value)
                    SELECT vals.key, vals.value
                    FROM vals
                    WHERE NOT EXISTS (SELECT 1 FROM update_result WHERE update_result.key = vals.key)
        '''
        cursor.execute(sql, (str(modifyRecords),))

    connection.commit()
    cursor.close()

def getSettings(connection):
    cursor = connection.cursor()
    result = dict()

    sql = '''SELECT s.key, s.value FROM settings s WHERE s.key in ('dropRecordsRandom', 'modifyRecordsRandom')'''
    cursor.execute(sql)

    for key, value in cursor:
        result[key] = bool(True if value == 'True' else False)

    cursor.close()
    return result
