from flask import Flask
from flask import Response
import knn
import json

app = Flask(__name__)

@app.route('/', methods=['GET'])
def allPOIs():
	records = knn.allPois()
	return Response(json.dumps(records), mimetype='application/json')


if __name__ == '__main__':
	app.run(host='0.0.0.0', port=8087)