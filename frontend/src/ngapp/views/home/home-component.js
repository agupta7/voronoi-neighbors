import ngapp from '../../ngappmodule.js';
import dataService from '../../services/data.js';
import CartesianPoint from '../../../voronoi-util/CartesianPoint.js';

const COMPONENT_NAME = 'homeComponent';

var def = {
	controller: ['$scope', '$q', dataService, function ($scope, $q, dataService) {
		var $ctrl = this;
		$scope.AUBURN_DOWNTOWN = {lat: 32.608357, lng: -85.481163};
		$scope['CartesianPoint'] = CartesianPoint;

		$q.all([dataService.getPoints()]).then(function (resolves) {
			//var gmapCtrl = resolves[0];
			var points = resolves[0].map(function (point) {
				point.lat = point.location.lat;
				point.lng = point.location.lng;
				return point;
			});

			//$scope['gmapCtrl'] = gmapCtrl;
			$scope['POIs'] = ($scope['POIs'] || []).concat(points);
		});

		$ctrl.zoomToggle = function (zoom) {
			if (zoom == 16) {
				$scope.zoom = 2;
			} else {
				$scope.zoom = 16;
			}
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
