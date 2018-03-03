import ngapp from '../../ngappmodule.js';
import dataService from '../../services/data.js';

const COMPONENT_NAME = 'homeComponent';

var def = {
	controller: ['$scope', '$q', dataService, function ($scope, $q, dataService) {
		var $ctrl = this;
		$scope.AUBURN_DOWNTOWN = {lat: 32.608357, lng: -85.481163};

		$ctrl.zoomToggle = function (zoom) {
			if (zoom == 16) {
				$scope.zoom = 2;
			} else {
				$scope.zoom = 16;
			}
		};
		$ctrl.loadData - function loadData() {
			$q.all([dataService.getPoints()]).then(function (resolves) {
				//var gmapCtrl = resolves[0];
				var points = resolves[0];
	
				//$scope['gmapCtrl'] = gmapCtrl;
				$scope['POIs'] = points;
			});
		};
		
	}],
	controllerName: COMPONENT_NAME + 'Controller',
	componentDdo: {
		template: require('!raw-loader!./home.html'),
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
