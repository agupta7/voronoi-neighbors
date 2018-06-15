import ngapp from '../ngappmodule.js';
import crypto from './crypto.js';
import util from './util.js'
import voronoi from '../../voronoi-util/voronoi.js';
import CartesianPoint from '../../voronoi-util/CartesianPoint.js';

const SERVICE_NAME = 'verifier';
var serviceFactory = [crypto.toString(), util.toString(), function (crypto, util) {
	var service = this;

	service.signatureVerification = function signatureVerification(points, publicKey) {
		for (var i = 0; i < points.length; i++) {
			var point = points[i];
			var vo = service._generateVerificationObject(point);
			if (!crypto.verifyHex(service._generateVerificationObject(point), point._meta_.verificationObject, publicKey)) {
				return false;
			}
		}
		return true;
	};

	/**
	 * q is query point
	 * the nearest point p1 (points[0]) should contain q in its voronoi cell
	 * points[1] should be a voronoi neighbor of points[0]
	 * points[2] should be a voronoi neighbor of either points[0] or points[1]
	 * points[n - 1] should be a voronoi neighbor of one of the poins[0...n-2]
	 * VO.result() == points
	 * H is a sorted by distance list of the points
	 * 
	 * @param {*} points 
	 * @param {*} queryPoint 
	 * @param {*} k 
	 */
	service.geometricVerificationKnn = function geometricVerificationKnn(points, queryPoint, k) {
		if (!points || !points.length) {
			// we can't verify anything if nothing was returned
			// for a Knn query, the only legitimate reason to return no records
			// is if the dataowner has not added any points, making this entire exercise futile.
			return null;
		}
		var visited = {};
		var H = [];

		// Event though the server returns the list sorted by distance, we will not trust the server in its sort abilities.
		var qp = new CartesianPoint.fromLatLng(queryPoint);
		points.sort(function (a, b) {
			return a._meta_.distance_meters - b._meta_.distance_meters;
		});


		var voronoiPoints = [];
		var vorPointsMap = {};
		for (var i = 0; i < points.length; i++) {
			vorPointsMap[pointKey(points[i])] = points[i];
			// since signature verification is done first, we can trust what the server says about neighbors
			var n = points[i]._meta_.neighbors;
			for (var j = 0; j < n.length; j++) {
				var nKey = pointKey(n[j]);
				if (!(nKey in vorPointsMap)) {
					vorPointsMap[nKey] = n[j];
				}
			}
		}
		for (var key in vorPointsMap) {
			voronoiPoints.push(vorPointsMap[key]);
		}
		sortByDistance(voronoiPoints, qp);
		// check the the nearest neighbor
		if (points[0] != voronoiPoints[0]) {// the first claimed kNN is not nearest to the query point when considering all neighbors
			// queryPoint does not fall inside points[0] voronoi cell
			return false;
		}
		visited[pointKey(points[0])] = points[0];

		for (i = 0; i < k-1; i++) {
			n = points[i]._meta_.neighbors;
			for (j = 0; j < n.length; j++) {
				if (!(pointKey(n[j]) in visited)) {
					visited[pointKey(n[j])] = n[j];
					H.push(n[j]);
				}
			}
			
			// the server ran out of points to return (k was too high)
			if (!points[i+1] && H.length == 0)
				return true;
			sortByDistance(H, qp);
			// checking H.length > 0 means that there were yet unvisited neighbors in the voronoi graph that could have returned by the server as kNN
			if (!points[i+1] && H.length > 0 || pointKey(points[i+1]) != pointKey(H.shift()))
				return false;
		}

		return true;

		function sortByDistance(arr, qp) {
			arr.sort(function (a, b) {
				return qp.distanceTo(CartesianPoint.fromLatLng(a.location)) - qp.distanceTo(CartesianPoint.fromLatLng(b.location));
			});
		}
	};

	service._generateVerificationObject = function (point) {
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

		return util.bytesToHexString(verificationBytes);
	};

	function pointKey(point) {
		return point.location.lat.toString() + ',' + point.location.lng.toString();
	}
}];

serviceFactory['toString'] = function () {
	return SERVICE_NAME;
};

export default (function doit(definition) {
	ngapp._service(SERVICE_NAME, definition);
	return definition;
})(serviceFactory);