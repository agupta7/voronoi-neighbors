import ngapp from '../../ngappmodule.js';
import dataService from '../../services/data.js';
import verifierService from '../../services/verifier.js';
import crypto from '../../services/crypto.js';

const COMPONENT_NAME = 'endUserComponent';

var def = {
	controller: ['$scope', dataService.toString(), verifierService.toString(), crypto.toString(), 'AUBURN_DOWNTOWN',
	function ($scope, dataService, verifierService, crypto, AUBURN_DOWNTOWN) {
		var $ctrl = this;

		$scope.AUBURN_DOWNTOWN = AUBURN_DOWNTOWN;
		$scope.originDot = require('../../../images/Location_dot_blue.svg');

		$scope.$on('gmapInitialized', function (event, gmapCtrl) {
			$scope._gmapCtrl = gmapCtrl;
		});

		$ctrl.nearestNeighbors = function (originPoint, k, range) {
			var nnPromise = dataService.nearestNeighbors(originPoint, k || null, range || null);
			nnPromise.then(function (neighbors) {
				$scope.nNeighbors = neighbors;
			});
			dataService.getPublicKey('dataowner').then(function (result) {
				nnPromise.then(function (neighbors) {
					$scope.cryptographicVerification = verifierService.signatureVerification(neighbors, crypto.readPEM(result.publicKey));
					$scope.geometricVerification = verifierService.geometricVerificationKnn(neighbors, originPoint, k || null, range || null);
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
