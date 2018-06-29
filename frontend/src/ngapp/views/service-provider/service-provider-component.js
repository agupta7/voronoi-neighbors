import ng from 'angular';
import ngapp from '../../ngappmodule.js';
import dataService from '../../services/data.js';
import settingsService from '../../services/settings.js';
import util from '../../services/util.js';
import maliciousSignatureModalController from './maliciousSignatureModalController.js';

const COMPONENT_NAME = 'serviceProviderComponent';

var def = {
	controller: ['$scope', '$q', util.toString(), dataService, settingsService.toString(), 'ngDialog', function ($scope, $q, util, dataService, settingsService, ngDialog) {
		var $ctrl = this;

		// called by angularjs as a part of component life-cycle management
		$ctrl.$onInit = function $onInit() {
			var settings = $ctrl.settings; // comes from the component's bindings definition
			
			$scope.dropRecordsRandom = !!settings.dropRecordsRandom; 
			$scope.modifyRecordsRandom = !!settings.modifyRecordsRandom;
		};

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

		$ctrl.modifyRecordsRandomChanged = function modifyRecordsRandomChanged(modifyRecordsRandom) {
			settingsService.saveSettings({
				'modifyRecordsRandom': !!modifyRecordsRandom
			});
		};
		$ctrl.dropRecordsRandomChanged = function dropRecordsRandomChanged(dropRecordsRandom) {
			settingsService.saveSettings({
				'dropRecordsRandom': !!dropRecordsRandom
			});
		};
	}],
	controllerName: COMPONENT_NAME + 'Controller',
	componentDdo: {
		template: require('!raw-loader!./service-provider.html'),
		controller: COMPONENT_NAME + 'Controller',
		controllerAs: '$ctrl',
		bindings: {
			// passed in by the template of this component defined in ngroute-definitions
			'settings': '='
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
