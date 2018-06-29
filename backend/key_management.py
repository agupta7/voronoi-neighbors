from datetime import datetime

def savePublicKey(source, publicKeyPemStr, connection):
    query = ''' INSERT INTO keystore (source, type, key, time_utc) 
              VALUES (%s, %s, %s, %s)'''
    cursor = connection.cursor()
    cursor.execute(query, (source, 'public', publicKeyPemStr, datetime.utcnow()))
    connection.commit()
    cursor.close()

    return 'pass'

def getPublicKey(source, connection):
    query = '''SELECT key, time_utc FROM keystore WHERE source = %s ORDER BY time_utc DESC'''
    cursor = connection.cursor()
    cursor.execute(query, (source,))
    record = cursor.fetchone()
    if record is None:
        record = (None, None)

    connection.commit()
    cursor.close()
    return record
