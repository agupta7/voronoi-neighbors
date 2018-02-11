import ngapp from '../../ngappmodule.js';
import dataService from '../../services/data.js';

const COMPONENT_NAME = 'homeComponent';

var def = {
	controller: ['$scope', '$window', dataService, function ($scope, $window, dataService) {
		var $ctrl = this;
		$scope.AUBURN_DOWNTOWN = {lat: 32.608357, lng: -85.481163};

		$scope.$on('gmapInitialized', function (event, gmapCtrl) {
			$scope.gmapCtrl = gmapCtrl;

			dataService.getPoints().then(function (points) {
				for (var i = 0; i < points.length; i++) {
					var point = points[i];
					gmapCtrl.addMarker(point);
				}
			});
		});
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
