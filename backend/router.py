#!/usr/bin/python -uB
from flask import Flask
from flask import Response
from flask import Request
from flask import request
import knn
import json

app = Flask(__name__)

@app.route('/pois', methods=['GET'])
def allPOIs():
	records = knn.allPois()
	response = Response(json.dumps(records), mimetype='application/json')
	response.headers['Access-Control-Allow-Origin'] = '*'
	return response

@app.route('/updatePois', methods=['POST'])
def updatePOIs():
	js = request.get_json()
	knn.uploadData(js)
	return 'pass'

if __name__ == '__main__':
	app.run(host='0.0.0.0', port=8087)
