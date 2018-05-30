import ng from 'angular';
import ngapp from '../../ngappmodule.js';
import dataService from '../../services/data.js';
import voronoiDiagram from '../../../voronoi-util/voronoi.js';
import util from '../../services/util.js';
import maliciousSignatureModalController from './maliciousSignatureModalController.js';

const COMPONENT_NAME = 'serviceProviderComponent';

var def = {
	controller: ['$scope', '$q', util.toString(), dataService, 'ngDialog', function ($scope, $q, util, dataService, ngDialog) {
		var $ctrl = this;

		$q.all([dataService.getPoints()]).then(function (resolves) {
			var points = resolves[0];
			$scope['POIs'] = ($scope['POIs'] || []).concat(points);
			$ctrl.POIsCopy = ng.copy($scope['POIs']);
		});

		$ctrl.addPoint = function () {
			$scope['POIs'].push({});
		};

		$ctrl.submitChanges = function (pois) {
			var existing = $ctrl.POIsCopy;
			var vordiag = voronoiDiagram(pois);
			for (var i = 0; i < (vordiag && vordiag.cells && vordiag.cells.length || 0); i++) {
				var cell = vordiag.cells[i];
				var neighborCells = cell.getNeighbors();
				cell.owner._meta_.neighbors = neighborCells.map(function (cell) {
					if (!cell.owner.location) {
						cell.owner.location = {
							'lat': cell.owner.lat,
							'lng': cell.owner.lng
						};
					}
					return cell.owner;
				});
				cell.owner.neighbors = cell.owner._meta_.neighbors;
			}
			var diff = util.diffArrays(existing, pois, poiEqualityComparator, keyFunction);
			$scope.diff = diff;

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

		function poiEqualityComparator(old, latest, keyFunc) {
			if (old.lat == latest.lat && old.lng == latest.lng
				&& old.tail.address == latest.tail.address && old.tail.name == latest.tail.name && old.tail.phone == latest.tail.phone) {
					if ((old._meta_.neighbors || []).length != (latest._meta_.neighbors || []).length || old._meta_.verificationObject != latest._meta_.verificationObject)
						return false;
					for (var i = 0; i < (old._meta_.neighbors || []).length; i++) {
						if (old._meta_.neighbors[i].location.lat != latest._meta_.neighbors[i].location.lat || old._meta_.neighbors[i].location.lng != latest._meta_.neighbors[i].location.lng)
							return false;
					}
					return true;
			}
			return false;
		}

		function keyFunction(point) {
			return point.lat.toString() + "," + point.lng.toString();
		}
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
