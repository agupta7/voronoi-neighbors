import ng from 'angular';
import ngapp from '../../ngappmodule.js';
import dataService from '../../services/data.js';
import util from '../../services/util.js';
import maliciousSignatureModalController from './maliciousSignatureModalController.js';

const COMPONENT_NAME = 'serviceProviderComponent';

var def = {
	controller: ['$scope', '$q', util.toString(), dataService, 'ngDialog', function ($scope, $q, util, dataService, ngDialog) {
		var $ctrl = this;

		$q.all([dataService.getPoints()]).then(function (resolves) {
			var points = resolves[0];
			$scope['POIs'] = ($scope['POIs'] || []).concat(points);
			$scope.POIsCopy = ng.copy($scope['POIs']);
		});

		$ctrl.addPoint = function () {
			$scope['POIs'].push({});
		};

		$ctrl.submitChanges = function (pois) {
			ngDialog.open({
				template: require('!raw-loader!./malicious-signature-modal.html'),
				plain: true,
				className: 'dataowner-component signature-modal',
				closeByDocument: false,
				scope: $scope,
				controller: maliciousSignatureModalController.toString(),
				controllerAs: '$ctrl'
			});
		};
	}],
	controllerName: COMPONENT_NAME + 'Controller',
	componentDdo: {
		templateUrl: require('./service-provider.html'),
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
