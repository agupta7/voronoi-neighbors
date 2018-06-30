import ng from 'angular';
import ngapp from '../ngappmodule.js';
import crypto from './crypto.js';
import util from './util.js';
import voronoiDiagram from '../../voronoi-util/voronoi.js';

const SERVICE_NAME = 'data';

dataService.$inject = ['$http', '$location', 'API_URL_BASE', crypto.toString(), util.toString()];
ngapp._service(SERVICE_NAME, dataService);

function dataService($http, $location, API_URL_BASE, crypto, util) {
	var service = this;

	/**
	 * Gets all points from the server
	 * 
	 * @returns $q promise which resolves to an array of points:
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
	 */
	service.getPoints = function getPoints() {
		return $http.get(API_URL_BASE + '/pois').then(dataGetter).then(function (points) {
			return points.map(function serviceToViewPoint(point) {
				// gmap directive expects lat lng here
				point.lat = point.location.lat;
				point.lng = point.location.lng;
				delete point['location'];
				return point;
			});
		});
	};

	/**
	 * Gets the list of hardcoded points to quickly load into the server.
	 * @returns JSON array of points
	 */
	service.getHardcoded = function getHardcoded() {
		return ng.copy(POINTS).map(function (point) {
			point.lat = point.location.lat;
			point.lng = point.location.lng;

			return point;
		});
	};
	/**
	 * Sends points off to the server from the dataowner.
	 * These points replace all points in the server.
	 * 
	 * @param {*} newpoints Array of points:
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
	 * @param {*} oldpoints Reserved for future.  Pass null for now.
	 * @param {*} privateRsaKey RSAKey object that represents the private key from jsrsasign
	 */
	service.sendPoints = function sendPoints(newpoints, oldpoints, privateRsaKey) {
		var points = newpoints.map(function (point) {
			return {
				'location': {
					'lat': point.lat,
					'lng': point.lng
				},
				'tail': point.tail
			};
		});
		return $http.post(API_URL_BASE + '/updatePois', attachPoiMetadata(points, privateRsaKey));
	};
	/**
	 * Used to send malicious changes from the service provider tab.
	 * 
	 * @param {*} diff object with two keys 'changed' and 'deleted':
			{
				"changed": [points...],
				"deleted": [{
					"_meta_": {
						"id": number
					}
				}]
			}
	 * @param {*} privateRsaKey privateRsaKey RSAKey object that represents the private key from jsrsasign
	 * @returns $q promise
	 */
	service.sendMaliciousChanges = function sendMaliciousChanges(diff, privateRsaKey) {
		diff = diff || {};
		diff.changed = diff.changed || [];
		diff.deleted = diff.deleted || [];

		attachPoiMetadata(diff.changed, privateRsaKey);
		return $http.post(API_URL_BASE + '/malicious/changes', diff);
	};

	/**
	 * Gets the nearest neighbors in the database as claimed by the server.
	 * Note that the server may be acting malicious so the results have to checked with the verifier service.
	 * 
	 * @param {*} originPoint object with keys "lat" and "lng":
				{
					"lat": float,
					"lng:": float
				}
	 * @param {*} k Optional parameter
	 * @param {*} range Optional range in meters
	 * @returns $q promise that resolves to array of points:
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
	 */
	service.nearestNeighbors = function nearestNeighbors(originPoint, k, range) {
		return $http.get(API_URL_BASE + "/nearestNeighbors", {
			'params': {
				'origin': originPoint,
				'range_meters': range,
				'k': k
			}
		}).then(dataGetter).then(function (neighbors) {
			return neighbors.map(function serviceToViewPoint(neighbor) {
				// gmap directive expects lat lng here
				neighbor.lat = neighbor.location.lat;
				neighbor.lng = neighbor.location.lng;
				return neighbor;
			});
		});
	};

	/**
	 * Saves the public key of the data owner.  This is used on the end-user tab to verify the verification object signatures.
	 * @param {*} source String There for multiple signers but for now it should say "dataowner"
	 * @param {*} publicKey RSAKey public key object from the jsrsasign library.  Can use crypto service to get this.
	 * @returns $q promise
	 */
	service.savePublicKey = function savePublicKey(source, publicKey) {
		return $http.post(API_URL_BASE + '/publicKey', {
			'source': source,
			'publicKey': publicKey.toString()
		}).then(dataGetter);
	};

	/**
	 * Gets the public key of the data owner for verification on the end-user tab.
	 * @param {*} source String that should say "dataowner" for now.
	 * @returns $q promise that resolves to the public key string in PKCS#8/SubjectPublicKeyInfo format 
	 */
	service.getPublicKey = function getPublicKey(source) {
		return $http.get(API_URL_BASE + '/publicKey', {
			'params': {
				'source': source
			}
		}).then(dataGetter);
	};

	/**
	 * Add _meta_ data to the points.  This includes Voronoi neighbors and the verification object if private key is included.
	 * @param {*} points Array of points
	 * @param {*} privateRsaKey RSAKey private key object from jsrsasign.  Use crypto service to generate this.
	 */
	function attachPoiMetadata(points, privateRsaKey) {
		var vordiag = voronoiDiagram(points.map(function (point) {
			return {
				'lat': point.location.lat,
				'lng': point.location.lng
			};
		}));
		points = points.map(function (point, index) {
			var neighborCells = vordiag.cells[index].getNeighbors();
			point['_meta_'] = ng.extend(point['_meta_'] || {}, {
				'neighbors': neighborCells.map(function (neighborCell) {
					return {
						'location': {
							'lat': points[neighborCell.index].location.lat,
							'lng': points[neighborCell.index].location.lng
						}
					};
				})
			});
			
			return point;
		});
		if (privateRsaKey) {
			for (var i = 0; i < points.length; i++) {
				var point = points[i];
				var verificationBytes = Array.from(util.floatToBytes(point.location.lat));
				verificationBytes.push.apply(verificationBytes, Array.from(util.floatToBytes(point.location.lng)));
				verificationBytes.push.apply(verificationBytes, Array.from(util.stringToBytes(point.tail.name + point.tail.phone + point.tail.address)));
				var neighbors = point['_meta_'].neighbors;
				var neighborsLengthBytes = Array.from(util.numToBytes(neighbors.length));
				if (neighborsLengthBytes.length < 2)
				neighborsLengthBytes.unshift(0);
				verificationBytes.push.apply(verificationBytes, neighborsLengthBytes);
				for (var j = 0; j < neighbors.length; j++) {
					var n = neighbors[j];
					verificationBytes.push.apply(verificationBytes, Array.from(util.floatToBytes(n.location.lat)));
					verificationBytes.push.apply(verificationBytes, Array.from(util.floatToBytes(n.location.lng)));
				}
				
				point['_meta_']['verificationObject'] = crypto.signHex(util.bytesToHexString(verificationBytes), privateRsaKey);
			}
		}
		return points;
	}

	function dataGetter(httpResponse) {
		return httpResponse.data;
	}
}

export default SERVICE_NAME;

var POINTS = [
	{
		"tail": {"phone": "3348217740", "name": "Chipotle Mexican Grill", "address": "346 W Magnolia Ave, Auburn, AL, 36832"},
		"location": {"lat": 32.606736094973, "lng": -85.4873335361481}
	},
	{
		"tail": {"phone": "3348267630", "name": "Chick-fil-A", "address": "326 W Magnolia Ave, Auburn, AL 36832"},
		"location": {"lat": 32.6068264734675, "lng": -85.4864645004272}},
	{
		"tail": {"phone": "3348217185", "name": "McDonald's", "address": "224 W Magnolia Ave, Auburn, AL 36830"},
		"location": {"lat": 32.6070885705858, "lng": -85.4838573932648}},
	{
		"tail": {"phone": "3348214001", "name": "Skybar Cafe", "address": "136 W Magnolia Ave, Auburn, AL 36830"},
		"location": {"lat": 32.6066909056915, "lng": -85.4827737808228}},
	{
		"tail": {"phone": "3348216161", "name": "Little Italy Pizzeria", "address": "129 E Magnolia Ave, Auburn, AL 36830"},
		"location": {"lat": 32.6067089814068, "lng": -85.4809498786926}},
	{
		"tail": {"phone": "3348876356", "name": "Mellow Mushroom", "address": "128 N College St, Auburn, AL 36830"},
		"location": {"lat": 32.6073642236242, "lng": -85.4815399646759}},
	{
		"tail": {"phone": "3348260987", "name": "Waffle House", "address": "110 W Glenn Ave, Auburn, AL 36830"},
		"location": {"lat": 32.6092937711381, "lng": -85.4826557636261}},
	{
		"tail": {"phone": "3348872677", "name": "Hamilton's On Magnolia", "address": "174 E Magnolia Ave, Auburn, AL 36830"},
		"location": {"lat": 32.6063158337755, "lng": -85.4800432920456}},
	{
		"tail": {"phone": "3348441818", "name": "Panda Express", "address": "1310 Wilmore Dr, Auburn, AL 36849"},
		"location": {"lat": 32.6048833157383, "lng": -85.485160946846}},
	{
		"tail": {"phone": "2057674494", "name": "Starbucks", "address": "Quad Center, 255 Duncan Dr, Auburn, AL 36849"},
		"location": {"lat": 32.6024610880116, "lng": -85.4865717887878}
	}
];