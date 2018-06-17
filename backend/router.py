#!/usr/bin/python -uB
from flask import Flask
from flask import Response
from flask import Request
from flask import request
import psycopg2
import json
import queries
import dataowner
import serviceProvider
import key_management as km
import functools
import argparse

# settings to adjust
CROSS_ORIGIN_ALLOW = '*'
DB_RETRIES = 3

connection = None
DB_CONNECTION_STRING = None
app = Flask(__name__)

def main(dbhost, dbport, dbname, dbuser, dbpassword, webservicePort):
    global DB_CONNECTION_STRING
    global connection
    DB_CONNECTION_STRING = 'host=%s port=%s dbname=%s user=%s password=%s' % (dbhost, dbport, dbname, dbuser, dbpassword)
    connection = psycopg2.connect(DB_CONNECTION_STRING)
    app.run(host='0.0.0.0', port=webservicePort)

@app.route('/pois', methods=['GET'])
def allPOIs():
    records = _retry(functools.partial(dataowner.allPois), DB_RETRIES)
    response = Response(json.dumps(records), mimetype='application/json')
    _responseHeaders(response)
    return response

@app.route('/updatePois', methods=['POST'])
def updatePOIs():
    js = request.get_json()
    _retry(functools.partial(dataowner.uploadData, js), DB_RETRIES)
    response = Response(json.dumps('pass'), mimetype='text/plain')
    _responseHeaders(response)
    return response

@app.route('/publicKey', methods=['POST', 'GET'])
def publicKey():
    if request.method == 'GET':
        source = request.args['source']
        (pubKeyPem, timestamp) = _retry(functools.partial(km.getPublicKey, source), DB_RETRIES)

        obj = dict(publicKey=pubKeyPem)
        obj['time'] = timestamp.replace(microsecond=0).isoformat() + 'Z'
        response = Response(json.dumps(obj), mimetype='application/json')

    elif request.method == 'POST':
        js = request.get_json()
        response = Response(km.savePublicKey(connection, js['source'], js['publicKey']), mimetype='application/json')

    _responseHeaders(response)
    return response

@app.route('/settings', methods=['PUT', 'GET'])
def settings():
    if request.method == 'GET':
        settings = _retry(functools.partial(serviceProvider.getSettings), DB_RETRIES)
        response = Response(json.dumps(settings), mimetype='application/json')
        _responseHeaders(response)

    elif request.method == 'PUT':
        js = request.get_json()
        _retry(functools.partial(serviceProvider.saveSettings, js), DB_RETRIES)
        response = Response(json.dumps('pass'), mimetype='application/json')
        _responseHeaders(response)

    return response

@app.route('/malicious/changes', methods=['POST'])
def maliciousUpdate():
    js = request.get_json()
    _retry(functools.partial(serviceProvider.maliciousUploadData, js), DB_RETRIES)
    response = Response(json.dumps('pass'), mimetype='text/plain')
    _responseHeaders(response)
    return response

@app.route('/nearestNeighbors')
def nearestNeighbors():
    js = request.args

    obj = _retry(functools.partial(queries.nearestNeighbors, json.loads(js['origin']), js.get('k', None) and int(js['k']), js.get('range_meters', None) and int(js['range_meters'])), DB_RETRIES)
    response = Response(json.dumps(obj), mimetype='application/json')
    _responseHeaders(response)

    return response

def _responseHeaders(response):
    response.headers['Access-Control-Allow-Origin'] = CROSS_ORIGIN_ALLOW

    return response

def _retry(func, retries):
    global connection
    for i in range(retries):
        try:
            return func(connection=connection)
        except (psycopg2.OperationalError, psycopg2.InterfaceError) as err:
            if i == retries - 1:
                raise
            connection = psycopg2.connect(DB_CONNECTION_STRING)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Host the backend web service for the Voronoi neighbors demo.')
    parser.add_argument('--dbhost', help='Resolvable hostname or IP address of Postgres database server', required=True)
    parser.add_argument('--dbport', help='Port number of database server [5432]', type=int, default=5432)
    parser.add_argument('--dbuser', help='Name of database user', required=True)
    parser.add_argument('--dbpassword', help='Database password', required=True)
    parser.add_argument('--dbname', help='Name of database on Postgres server [=dbuser]', default=None, required=False)
    parser.add_argument('--port', help='Port on which to host the web service [8081]', default=8081, type=int)

    args = parser.parse_args()
    main(args.dbhost, args.dbport, args.dbname or args.dbuser, args.dbuser, args.dbpassword, args.port)
