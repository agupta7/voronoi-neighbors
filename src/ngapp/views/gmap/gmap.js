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
						ctrl.addMarker({'lat': event.latLng.lat(), 'lng': event.latLng.lng()});
						ctrl.drawVoronoi(scope.gmapData.markers.map(function (marker) {
							return marker._latlng;
						}));
					});

					googleMaps.event.addListener(map, 'mousemove', function (event) {
						var latlng = {
							'lat': event.latLng.lat(),
							'lng': event.latLng.lng()
						};
						ctrl._highlightVoronoiCells(latlng);
					});

					googleMaps.event.addListener(map, 'mouseout', function (event) {
						ctrl._clearVoronoiHighlight();
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
		'markers': [],
		'voronoiEdgePaths': [],
		'voronoiHoverPaths': []
	};
	$scope.voronoi = {
		'centers': [],
		'diagram': null
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
		marker._latlng = latlng;

		$scope.gmapData.markers.push(marker);
	};
	$ctrl.drawVoronoi = function (points) {
		$ctrl._clearVoronoi();
		var diagram = voronoiDiagram(points);
		var neighbors = diagram.cells[0].getNeighbors();
		var voronoiEdges = diagram.edges;
		$scope.voronoi.centers = points;
		$scope.voronoi.diagram = diagram;

		for (var i = 0; i < voronoiEdges.length; i++) {
			var edge = voronoiEdges[i];

			var latLngPath = edge.latLngPath();
			var path = new googleMaps.Polyline({
				path: latLngPath,
				strokeColor: '#FF0000',
				strokeOpacity: 1.0,
				strokeWeight: 1,
				geodesic: true
			});

			$scope.gmapData.voronoiEdgePaths.push(path);
			path.setMap($ctrl._gmap);
		}
	};
	$ctrl._highlightVoronoiCells = function _highlightVoronoiCells(latlng) {
		var diagram = $scope.voronoi.diagram;
		if (!diagram) return;

		$ctrl._clearVoronoiHighlight();
		var path;

		var ownerCell = diagram.cells.getClosest(latlng);
		var neighbors = ownerCell.getNeighbors();
		for (var i = 0; i < neighbors.length; i++) {
			var neigh = neighbors[i];
			path = new googleMaps.Polyline({
				path: neigh.cellBoundary.map(function (point) {
					return point.toLatLng();
				}),
				strokeColor: '#0000ff',
				strokeOpacity: 1.0,
				strokeWeight: 2,
				geodesic: true
			});
			path.setMap($ctrl._gmap);
			$scope.gmapData.voronoiHoverPaths.push(path);
		}

		path = new googleMaps.Polyline({
			path: ownerCell.cellBoundary.map(function (point) {
				return point.toLatLng();
			}),
			strokeColor: '#000000',
			strokeOpacity: 1.0,
			strokeWeight: 3,
			geodesic: true
		});
		path.setMap($ctrl._gmap);
		$scope.gmapData.voronoiHoverPaths.push(path);
	};
	$ctrl._clearVoronoiHighlight = function _clearVoronoiHighlight() {
		var path;
		while (path = $scope.gmapData.voronoiHoverPaths.pop()) {
			path.setMap(null);
		}
	};

	$ctrl._clearVoronoi = function () {
		$ctrl._clearVoronoiHighlight();
		for (var i = 0; i < $scope.gmapData.voronoiEdgePaths.length; i++) {
			$scope.gmapData.voronoiEdgePaths[i].setMap(null);
		}
		$scope.voronoi.centers = [];
		$scope.voronoi.diagram = null;
		$scope.gmapData.voronoiEdgePaths = [];
	};

}

function doit() {
	ngapp.controller(CONTROLLER_NAME, gmapController)
	ngapp._directive(DIRECTIVE_NAME, gmapDirective);
	return gmapDirective;
}

export default doit();