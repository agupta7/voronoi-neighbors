import ng from 'angular';
import ngapp from '../../ngappmodule.js';
import crypto from '../../services/crypto.js';
import dataService from '../../services/data.js';


const CONTROLLER_NAME = 'signatureModalController';

var def = {
	'controller': ['$scope', crypto.toString(), dataService.toString(), function ($scope, crypto, dataService) {
		var $ctrl = this;

		var keypair = crypto.generateKeys();
		$scope.keypair = keypair;

		$ctrl.generateMatchingKey = function generateMatchingKey(rsaPrivateKey) {
			return crypto.getRSAPublicKey(rsaPrivateKey);
		};

		$ctrl.submit =function submit(points, rsaPrivateKey) {
			dataService.sendPoints(points, null, rsaPrivateKey).then(function () {
				$scope.panel = 1000;
			});
			dataService.savePublicKey('dataowner', $scope.keypair.public);
		};
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