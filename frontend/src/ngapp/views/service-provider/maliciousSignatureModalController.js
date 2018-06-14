import ng from 'angular';
import ngapp from '../../ngappmodule.js';
import crypto from '../../services/crypto.js';
import dataService from '../../services/data.js';


const CONTROLLER_NAME = 'maliciousSignatureModalController';

var def = {
	'controller': ['$scope', crypto.toString(), dataService.toString(), function ($scope, crypto, dataService) {
		var $ctrl = this;

		var keypair = {};
		$ctrl.crypto = crypto;
		$scope.keypair = keypair;

		$ctrl.submit =function submit(diff, rsaPrivateKey) {
			dataService.sendMaliciousChanges(diff, rsaPrivateKey).then(function () {
				$scope.panel = 1000;
			});
			if (rsaPrivateKey) {
				dataService.savePublicKey('service-provider', $scope.keypair.public);
			}
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