import ngapp from '../../ngappmodule.js';
import dataService from '../../services/data.js';
import verifierService from '../../services/verifier.js';
import crypto from '../../services/crypto.js';

const COMPONENT_NAME = 'endUserComponent';

var def = {
	controller: ['$scope', '$q', 'gmapsApiLoader', dataService.toString(), verifierService.toString(), crypto.toString(), 
	function ($scope, $q, gmapsApiLoader, dataService, verifierService, crypto) {
		var $ctrl = this;

		$scope.AUBURN_DOWNTOWN = {lat: 32.608357, lng: -85.481163};
		$scope.originDot = require('../../../images/Location_dot_blue.svg');

		$ctrl.nearestNeighbors = function (originPoint, range, k) {
			var nnPromise = dataService.nearestNeighbors(originPoint, range, k);
			nnPromise.then(function (neighbors) {
				$scope.nNeighbors = neighbors;
			});
			dataService.getPublicKey('dataowner').then(function (result) {
				nnPromise.then(function (neighbors) {
					$scope.cryptographicVerification = verifierService.signatureVerification(neighbors, crypto.readPEM(result.publicKey));
					$scope.geometricVerification = verifierService.geometricVerificationKnn(neighbors, originPoint, k);
				});
			});
		};

		$ctrl.geocode = function (address) {
			return gmapsApiLoader.then(function (gmaps) {
				return $q(function (resolve, reject) {
					var geocoder = new gmaps.Geocoder();

					geocoder.geocode({'address': address}, function (results, status) {
						if (status == "OK") {
							$scope.geocodes = results;
							$scope.centerLatLng = {
								'lat': results[0].geometry.location.lat(),
								'lng': results[0].geometry.location.lng()
							};
							resolve($scope.centerLatLng);
						}
					});
				});
			});
		};

		$ctrl.cryptographicVerification = function (points, publicKey) {
			$scope.cryptographicVerification = verifierService.signatureVerification(points, publicKey);
		};

		$ctrl.latLngString = function (latlng) {
			return latlng.lat + '\xB0, ' + latlng.lng + '\xB0';
		};
	}],
	controllerName: COMPONENT_NAME + 'Controller',
	componentDdo: {
		templateUrl: require('./end-user.html'),
		controller: COMPONENT_NAME + 'Controller',
		controllerAs: '$ctrl',
		scope: {

		}
	},
	componentName: COMPONENT_NAME
};

function doit() {
	ngapp._controller(def.controllerName, def.controller);
	ngapp._component(def.componentName, def.componentDdo);
	return def;
}

export default doit();
