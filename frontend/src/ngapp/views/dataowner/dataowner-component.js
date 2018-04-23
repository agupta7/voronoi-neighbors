import ngapp from '../../ngappmodule.js';
import dataService from '../../services/data.js';
import CartesianPoint from '../../../voronoi-util/CartesianPoint.js';
import './dataowner.css';
import poiRowDirective from './poiRowDirective.js';
import voronoiDiagram from '../../../voronoi-util/voronoi.js';
import signatureModalController from './signatureModalController.js';

const COMPONENT_NAME = 'dataownerComponent';

var def = {
	controller: ['$scope', '$q', dataService, 'ngDialog', function ($scope, $q, dataService, ngDialog) {
		var $ctrl = this;
		$scope.AUBURN_DOWNTOWN = {lat: 32.608357, lng: -85.481163};
		$scope['CartesianPoint'] = CartesianPoint;

		$q.all([dataService.getPoints()]).then(function (resolves) {
			//var gmapCtrl = resolves[0];
			var points = resolves[0].map(serviceToViewPoint);

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
		$ctrl.loadHardcoded = function () {
			var POIs = $scope['POIs'] || ($scope['POIs'] = []);
			var POINTS = dataService.getHardcoded();
			POINTS = POINTS.map(serviceToViewPoint);

			var existingKeys = POIs.map(keyFunction);
			var hardcodedKeys = POINTS.map(keyFunction);
			for (var i = 0; i < hardcodedKeys.length; i++) {
				if (existingKeys.indexOf(hardcodedKeys[i]) > -1)
					continue;
				POIs.push(POINTS[i]);
			}
			
			function keyFunction(point) {
				return point.lat.toString() + "," + point.lng.toString();
			}
		};
		$ctrl.prepareAuthentication = function () {
			var vordiag = voronoiDiagram($scope['POIs']);

			for (var i = 0; i < (vordiag && vordiag.cells && vordiag.cells.length || 0); i++) {
				var cell = vordiag.cells[i];
				var neighborCells = cell.getNeighbors();
				cell.owner.neighbors = neighborCells.map(function (cell) {
					return cell.owner;
				});
			}
			ngDialog.open({
				template: require('!raw-loader!./signature-modal.html'),
				plain: true,
				className: 'dataowner-component signature-modal',
				closeByDocument: false,
				scope: $scope,
				controller: signatureModalController.toString(),
				controllerAs: '$ctrl'
			});
		};

		$scope.$on('pointAdded', function (event, point) {
			point.expanded = true;
		});
		$scope['authenticationNeighbors'] = function authenticationNeighbors(neighbors) {
			var out = neighbors.length.toString() + ",";
			for (var i = 0; i < neighbors.length; i++) {
				var neighbor = neighbors[i];
				out += neighbor.lat + "," + neighbor.lng;
				if (i < neighbors.length - 1)
					out += ","
			}
			return out;
		}

		function serviceToViewPoint(point) {
			// gmap directive expects lat lng here
			point.lat = point.location.lat;
			point.lng = point.location.lng;
			delete point['location'];
			return point;
		}
	}],
	controllerName: COMPONENT_NAME + 'Controller',
	componentDdo: {
		templateUrl: require('./dataowner.html'),
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
	ngapp._directive(poiRowDirective.name, poiRowDirective.ddo);
	return def;
}

export default doit();
