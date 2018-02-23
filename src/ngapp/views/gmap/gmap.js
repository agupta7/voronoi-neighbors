import ngapp from '../../ngappmodule.js';
import voronoiDiagram from '../../../voronoi-util/voronoi.js';

const DIRECTIVE_NAME = 'gmap';
const CONTROLLER_NAME = DIRECTIVE_NAME + 'Controller';

gmapDirective.$inject = ['gmapsApiLoader'];
function gmapDirective(gmapsApiLoader) {
	var ddo = {
			template: require('!raw-loader!./gmap.html'),
			controller: DIRECTIVE_NAME + 'Controller',
			controllerAs: '$ctrl',
			require: DIRECTIVE_NAME,
			scope: {
				'zoom': '=',
				'center': '='
			},
			link: function (scope, element, attrs, ctrl) {
				gmapsApiLoader.then(function (googleMaps) {
					var map = new googleMaps.Map(element[0], {
						zoom: scope.zoom,
						center: scope.center
					});

					scope.$watch('zoom', function (zoom) {
						map.setZoom(zoom);
					});
	
					googleMaps.event.addListener(map, 'click', function (event) {
						ctrl.addMarker(event.latLng);
					});
	
					ctrl.mapInitialized(googleMaps, map);
				});
			}
	};

	return ddo;
}

gmapController.$inject = ['$scope', '$window'];
function gmapController($scope, $window) {
	var $ctrl = this;
	
	var googleMaps;
	$ctrl._gmap; // this is the Map that is eventually instantiated in the link function

	$scope.gmapData = {
		markers: [],
		voronoiEdgePaths: []
	};
	$scope.voronoi = {
		centers: [],
		smoothness: null
	};
	
	$ctrl.mapInitialized = function (gmaps, mapInstance) {
		$ctrl._gmap = mapInstance;
		googleMaps = gmaps;
		$scope.$emit('gmapInitialized', $ctrl);
	};
	$ctrl.addMarker = function (latlng) {
		var marker = new googleMaps.Marker({
			position: latlng,
			map: $ctrl._gmap
		});

		$scope.gmapData.markers.push(marker);

		// re-calculate voronoi with new marker
		var points = $scope.gmapData.markers.map(function (marker) {
			return {
				lat: marker.position.lat(),
				lng: marker.position.lng()
			};
		});
		$ctrl.drawVoronoi(points, $scope.voronoi.smoothness);
	};
	$ctrl.drawVoronoi = function (points, threshold) {
		$ctrl._clearVoronoi();
		var voronoiEdges = voronoiDiagram(points);

		for (var i = 0; i < voronoiEdges.length; i++) {
			var edge = voronoiEdges[i];

			var latLngPath = edge.latLngPathSmooth(threshold);
			var path = new googleMaps.Polyline({
				path: latLngPath,
				strokeColor: '#FF0000',
				strokeOpacity: 1.0,
				strokeWeight: 1
			});

			$scope.voronoi.centers = points;
			$scope.voronoi.smoothness = threshold;
			$scope.gmapData.voronoiEdgePaths.push(path);
			path.setMap($ctrl._gmap);
		}
	};

	/**
	 * 
	 * @param {*} threshold - Optional threshold parameter to pass on.
	 */
	$ctrl.smoothenVoronoi = function smoothenVoronoi(threshold) {
		var points = $scope.voronoi.centers;
		var t = threshold || ($scope.voronoi.smoothness || 2) / 2;
		$ctrl.drawVoronoi(points, t);
	};
	$ctrl._clearVoronoi = function () {
		for (var i = 0; i < $scope.gmapData.voronoiEdgePaths.length; i++) {
			$scope.gmapData.voronoiEdgePaths[i].setMap(null);
		}
		$scope.voronoi.centers = [];
		$scope.gmapData.voronoiEdgePaths = [];
	};

}



function doit() {
	ngapp.controller(CONTROLLER_NAME, gmapController)
	ngapp._directive(DIRECTIVE_NAME, gmapDirective);
	return gmapDirective;
}

export default doit();