import ng from 'angular';
import ngapp from '../../ngappmodule.js';
import crypto from '../../services/crypto.js';
import dataService from '../../services/data.js';
import voronoiDiagram from '../../../voronoi-util/voronoi.js';
import util from '../../services/util.js';

const CONTROLLER_NAME = 'maliciousSignatureModalController';

var def = {
	'controller': ['$scope', crypto.toString(), dataService.toString(), util.toString(), function ($scope, crypto, dataService, util) {
		var $ctrl = this;

		var keypair = {};
		$ctrl.crypto = crypto;
		$scope.keypair = keypair;
		$scope.diff = util.diffArrays($scope.POIsCopy, $scope.POIs, poiEqualityComparator, keyFunction);

		$ctrl.generateMatchingKey = function generateMatchingKey(rsaPrivateKey) {
			return crypto.getRSAPublicKey(rsaPrivateKey);
		};

		$ctrl.submit =function submit(diff, rsaPrivateKey) {
			for (var i = 0; i < diff.changed.length; i++) {
				var point = diff.changed[i];
				if (!point.location) {
					point.location = {
						'lat': point.lat,
						'lng': point.lng
					};
				}
				point.neighbors = point['_meta_']['neighbors'];
			}
			for (i = 0; i < diff.deleted.length; i++) {
				var point = diff.deleted[i];
				if (!point.location) {
					point.location = {
						'lat': point.lat,
						'lng': point.lng
					};
				}
				point.neighbors = point['_meta_']['neighbors']; // for attachPoiMetadata in data service
			}
			dataService.sendMaliciousChanges(diff, rsaPrivateKey).then(function () {
				$scope.panel = 1000;
			});
			if (rsaPrivateKey) {
				dataService.savePublicKey('service-provider', $scope.keypair.public);
			}
		};

		$ctrl.voronoiChangesToggled = function voronoiChangesToggled(changeVoronoi) {
			var existing = $scope.POIsCopy;
			var pois = $scope.POIs;
			if (changeVoronoi && pois[0]) {
				if (pois[0]._meta_.neighborsServiceProvider) {
					for (var i = 0; i < pois.length; i++) {
						pois[i]._meta_.neighbors = pois[i]._meta_.neighborsServiceProvider;
					}
				} else {
					var vordiag = voronoiDiagram(pois);
					for (var i = 0; i < (vordiag && vordiag.cells && vordiag.cells.length || 0); i++) {
						var cell = vordiag.cells[i];
						var neighborCells = cell.getNeighbors();
						if (!cell.owner._meta_.neighborsDataowner)
							cell.owner._meta_.neighborsDataowner = cell.owner._meta_.neighbors;
						cell.owner._meta_.neighbors = neighborCells.map(function (cell) {
							return {
								'location': {
									'lat': cell.owner.lat || cell.owner.location.lat,
									'lng': cell.owner.lng || cell.owner.location.lng
								}
							};
						});
						cell.owner._meta_.neighborsServiceProvider = cell.owner._meta_.neighbors;
					}

				}
			} else if (!changeVoronoi && pois[0]) {
				if (pois[0]._meta_.neighborsDataowner) {
					for (var i = 0; i < pois.length; i++) {
						pois[i]._meta_.neighbors = pois[i]._meta_.neighborsDataowner;
					}
				}
			}

			$scope.diff = util.diffArrays(existing, pois, poiEqualityComparator, keyFunction);
		};

		function poiEqualityComparator(old, latest, keyFunc) {
			if (old.lat == latest.lat && old.lng == latest.lng
				&& old.tail.address == latest.tail.address && old.tail.name == latest.tail.name && old.tail.phone == latest.tail.phone) {
					if ((old._meta_.neighbors || []).length != (latest._meta_.neighbors || []).length || old._meta_.verificationObject != latest._meta_.verificationObject)
						return false;
					for (var i = 0; i < (old._meta_.neighbors || []).length; i++) {
						if (old._meta_.neighbors[i].location.lat != latest._meta_.neighbors[i].location.lat || old._meta_.neighbors[i].location.lng != latest._meta_.neighbors[i].location.lng)
							return false;
					}
					return true;
			}
			return false;
		}

		function keyFunction(point) {
			return point.lat.toString() + "," + point.lng.toString();
		}
	}],
	'getName': function () {
		return CONTROLLER_NAME;
	}
};
def['toString'] = def['getName'];
export default (function doit(definition) {
	ngapp._controller(CONTROLLER_NAME, definition['controller']);

	return definition;
})(def);