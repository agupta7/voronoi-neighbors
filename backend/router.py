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

connection = psycopg2.connect(host='localhost', port=5432, database="voronoi_neighbors", user="voronoi_neighbors", password="voronoi")
CROSS_ORIGIN_ALLOW = '*'
app = Flask(__name__)

@app.route('/pois', methods=['GET'])
def allPOIs():
	records = dataowner.allPois(connection)
	response = Response(json.dumps(records), mimetype='application/json')
	response.headers['Access-Control-Allow-Origin'] = CROSS_ORIGIN_ALLOW
	return response

@app.route('/updatePois', methods=['POST'])
def updatePOIs():
	js = request.get_json()
	dataowner.uploadData(connection, js)
	response = Response('pass', mimetype='text/plain')
	response.headers['Access-Control-Allow-Origin'] = CROSS_ORIGIN_ALLOW
	return response

@app.route('/publicKey', methods=['POST', 'GET'])
def publicKey():
	if request.method == 'GET':
		source = request.args['source']
		(pubKeyPem, timestamp) = km.getPublicKey(connection, source)

		obj = dict(publicKey=pubKeyPem)
		obj['time'] = timestamp.replace(microsecond=0).isoformat() + 'Z'
		response = Response(json.dumps(obj), mimetype='application/json')

	elif request.method == 'POST':
		js = request.get_json()
		response = Response(km.savePublicKey(connection, js['source'], js['publicKey']), mimetype='application/json')

	response.headers['Access-Control-Allow-Origin'] = CROSS_ORIGIN_ALLOW
	return response

@app.route('/malicious/changes', methods=['POST'])
def maliciousUpdate():
	js = request.get_json()
	serviceProvider.maliciousUploadData(connection, js)
	response = Response('pass', mimetype='text/plain')
	response.headers['Access-Control-Allow-Origin'] = CROSS_ORIGIN_ALLOW
	return response

@app.route('/nearestNeighbors')
def nearestNeighbors():
	js = request.args

	obj = queries.nearestNeighbors(connection, json.loads(js['origin']), js.get('range_meters', None) and int(js['range_meters']), js.get('k', None) and int(js['k']))
	response = Response(json.dumps(obj), mimetype='application/json')
	response.headers['Access-Control-Allow-Origin'] = CROSS_ORIGIN_ALLOW

	return response


if __name__ == '__main__':
	app.run(host='0.0.0.0', port=8087)
