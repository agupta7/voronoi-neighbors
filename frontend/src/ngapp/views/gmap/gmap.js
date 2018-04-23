import ngapp from '../../ngappmodule.js';
import voronoiDiagram from '../../../voronoi-util/voronoi.js';
import debounce from '../../services/debounce.js';

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
				'center': '=',
				'markers': '=',
				'options': '=',
				'voronoiInfo': '=?'
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

					var clickListener = null;
					scope.$watch('options.markersEditor', function (isEditor) {
						if (!isEditor) {
							if (clickListener) {
								googleMaps.event.removeListener(clickListener);
								clickListener = null;
							}
							return;
						}
						clickListener = googleMaps.event.addListener(map, 'click', function (event) {
							ctrl.addMarker({'lat': event.latLng.lat(), 'lng': event.latLng.lng()});
						});
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

gmapController.$inject = ['$scope', '$window', debounce];
function gmapController($scope, $window, debounce) {
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

		$scope.$watchCollection('markers', function (latLngs) {
			if (!latLngs) {
				for (i = 0; i < $scope.gmapData.markers.length; i++) {
					var marker = $scope.gmapData.markers[i];
					$ctrl.removeMarker(marker._latlng, true);
				}
				return;
			}
			for (var i = 0; i < latLngs.length; i++) {
				var latLng = latLngs[i];
				if (!latLng._gmapAdded) {
					$ctrl.addMarker(latLng, true);
				}
			}
			for (i = 0; i < $scope.gmapData.markers.length; i++) {
				var marker = $scope.gmapData.markers[i];
				if (latLngs.indexOf(marker._latlng) < 0) {
					$ctrl.removeMarker(marker._latlng, true);
				}
			}
		});
	};
	$ctrl.addMarker = function (latlng, alreadyAddedToMarkers) {
		var marker = new googleMaps.Marker({
			position: latlng,
			map: $ctrl._gmap
		});
		marker._latlng = latlng;
		latlng._gmapAdded = true;

		$scope.gmapData.markers.push(marker);
		
		// housekeeping
		if (!alreadyAddedToMarkers) {
			$scope.$emit('pointAdded', latlng);
			$scope['markers'].push(latlng);
		}
		if ($scope.$eval('options.autoVoronoi')) {
			debounce($ctrl.drawVoronoi, 100);
		}
	};
	$ctrl.removeMarker = function (latlng, alreadyRemovedFromMarkers) {
		for (var i = 0; i < $scope.gmapData.markers.length; i++) {
			var marker = $scope.gmapData.markers[i];
			if (latlng == marker._latlng) {
				marker.setMap(null);
				$scope.gmapData.markers.splice(i--, 1);
			}
		}
		
		var ind = $scope['markers'].indexOf(latlng);
		if (ind > 0) {
			$scope['markers'].splice(ind, 1);
		}

		if ($scope.$eval('options.autoVoronoi')) {
			debounce($ctrl.drawVoronoi, 100);
		}
	};
	$ctrl.drawVoronoi = function (points) {
		if (!points) {
			points = $scope.gmapData.markers.map(function (marker) {
				return marker._latlng;
			});
		}
		$ctrl._clearVoronoi();
		var diagram = voronoiDiagram(points);
		var voronoiEdges = diagram.edges;
		$scope.voronoi.centers = points;
		$scope.voronoi.diagram = diagram;
		$scope.voronoiInfo = diagram;

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
		if (!diagram || !diagram.cells.length) return;

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