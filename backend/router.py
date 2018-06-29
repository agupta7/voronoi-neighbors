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
    app.run(host='0.0.0.0', port=webservicePort, processes=True)

@app.route('/pois', methods=['GET'])
def allPOIs():
    '''
    Returns all points in the database.

    Output is a JSON array:
        [{
            "location": {
                "lat": float,
                "lnt": float
            },
            "tail": {
                "name": string,
                "phone": string,
                "address": string
            },
            "_meta_": {
                "id": number,
                "neighbors": [{
                    "location": {
                        "lat": float,
                        "lng": float
                    }
                }...],
                "verificationObject": hex string
            }
        }...]
    '''
    records = _retry(functools.partial(dataowner.allPois), DB_RETRIES)
    response = Response(json.dumps(records), mimetype='application/json')
    _responseHeaders(response)
    return response

@app.route('/updatePois', methods=['POST'])
def updatePOIs():
    '''
    Replaces all points in the database

    Input JSON array:
        [{
            "location": {
                "lat": float,
                "lng": float
            },
            "tail": {
                "name": string,
                "phone": string,
                "address": string
            },
            "_meta_": {
                "neighbors": [{
                    "location": {
                        "lat": float,
                        "lng": float
                    }
                }...],
                "verificationObject": hex string
            }
        }]

    Output: "pass"
    '''
    js = request.get_json()
    _retry(functools.partial(dataowner.uploadData, js), DB_RETRIES)
    response = Response(json.dumps('pass'), mimetype='text/plain')
    _responseHeaders(response)
    return response

@app.route('/publicKey', methods=['POST', 'GET'])
def publicKey():
    if request.method == 'GET':
        '''
            Gets the public key of the dataowner.  This public key is used on the end-user tab for signature verification.

            Input query parameters:
                source=dataowner

            Output JSON object:
                {
                    "publicKey": null || PKCS#8/SubjectPublicKeyInfo format string,
                    "time": null || ISO 8601 string (YYYY-MM-DDTHH:mm:ssZ)
                }
        '''
        source = request.args['source']
        (pubKeyPem, timestamp) = _retry(functools.partial(km.getPublicKey, source), DB_RETRIES)

        obj = dict(publicKey=pubKeyPem)
        obj['time'] = None if timestamp is None else timestamp.replace(microsecond=0).isoformat() + 'Z'
        response = Response(json.dumps(obj), mimetype='application/json')

    elif request.method == 'POST':
        '''
            Sets the public key of the dataowner.

            Input JSON object:
                {
                    "source": string ("dataowner"),
                    "publicKey": PKCS#8/SubjectPublicKeyInfo format string
                }

            Output JSON string: "pass"
        '''
        js = request.get_json()
        response = Response(json.dumps(_retry(functools.partial(km.savePublicKey, js['source'], js['publicKey']), DB_RETRIES)), mimetype='application/json')

    _responseHeaders(response)
    return response

@app.route('/settings', methods=['PUT', 'GET'])
def settings():
    '''
        Gets or sets persistent settings.  Right now, it only contains two settings that control
        whether the service provider is going to act maliciously when evaluating queries:
            dropRecordsRandom
            modifyRecordsRandom
    '''
    if request.method == 'GET':
        '''
            Output JSON object:
                {
                    "dropRecordsRandom": true/false,
                    "modifyRecordsRandom": true/false
                }
        '''
        settings = _retry(functools.partial(serviceProvider.getSettings), DB_RETRIES)
        response = Response(json.dumps(settings), mimetype='application/json')
        _responseHeaders(response)

    elif request.method == 'PUT':
        '''
            Input JSON object:
            {
                "dropRecordsRandom": true/false,
                "modifyRecordsRandom": true/false
            }

            Only a minimum of one key has to be present.

            Output JSON string: "pass"
        '''
        js = request.get_json()
        _retry(functools.partial(serviceProvider.saveSettings, js), DB_RETRIES)
        response = Response(json.dumps('pass'), mimetype='application/json')
        _responseHeaders(response)

    return response

@app.route('/malicious/changes', methods=['POST'])
def maliciousUpdate():
    '''
        Simulates a service provider maliciously manipulating records.

        Input JSON object:
            {
                "changed": [{
                    "location": {
                        "lat": float,
                        "lnt": float
                    },
                    "tail": {
                        "name": string,
                        "phone": string,
                        "address": string
                    },
                    "_meta_": {
                        "id": number,
                        "neighbors": [{
                            "location": {
                                "lat": float,
                                "lng": float
                            }
                        }...],
                        "verificationObject": hex string
                    }
                }...],
                "deleted": [{
                    "_meta_": {
                        "id": number
                    }
                }...]
            }
    '''
    js = request.get_json()
    _retry(functools.partial(serviceProvider.maliciousUploadData, js), DB_RETRIES)
    response = Response(json.dumps('pass'), mimetype='text/plain')
    _responseHeaders(response)
    return response

@app.route('/nearestNeighbors')
def nearestNeighbors():
    '''
    Gets the nearest neighbors to the query origin point.  
    May give a number k, in which case it would return k-nearest neighbors.
    May also give a range in meters, in which case it would restrict the search area to the specified number of line-of-sight meters from the origin.
    
    Alternatively, may specify both k and range in which case both parameters are used to restrict the results.
    If neither k nor range is specified, this will return all points from the database.

    Input query parameters:
        origin=(URL encoded object:) {
            "lat": float,
            "lng": float
        },
        k=number || null /* or may be skipped */,
        range=number || null /* in meters or may be skipped */

    Output JSON array:
        [{
            "location": {
                "lat": float,
                "lnt": float
            },
            "tail": {
                "name": string,
                "phone": string,
                "address": string
            },
            "_meta_": {
                "id": number,
                "neighbors": [{
                    "location": {
                        "lat": float,
                        "lng": float
                    }
                }...],
                "verificationObject": hex string,
                "distance_meters": float /*distance in meters from the input origin point*/
            }
        }...]
    '''
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
