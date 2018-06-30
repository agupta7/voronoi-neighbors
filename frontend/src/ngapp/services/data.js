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
	service.getHardcoded = function getHardcoded() {
		return ng.copy(POINTS).map(function (point) {
			point.lat = point.location.lat;
			point.lng = point.location.lng;

			return point;
		});
	};
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
	service.sendMaliciousChanges = function sendMaliciousChanges(diff, privateRsaKey) {
		diff = diff || {};
		diff.changed = diff.changed || [];
		diff.deleted = diff.deleted || [];

		attachPoiMetadata(diff.changed, privateRsaKey);
		return $http.post(API_URL_BASE + '/malicious/changes', diff);
	};

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

	service.savePublicKey = function savePublicKey(source, publicKey) {
		return $http.post(API_URL_BASE + '/publicKey', {
			'source': source,
			'publicKey': publicKey.toString()
		}).then(dataGetter);
	};

	service.getPublicKey = function getPublicKey(source) {
		return $http.get(API_URL_BASE + '/publicKey', {
			'params': {
				'source': source
			}
		}).then(dataGetter);
	};

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