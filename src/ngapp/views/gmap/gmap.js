import ngapp from '../../ngappmodule.js';

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
	$scope.markers = [];
	
	$ctrl.addMarker = function (latlng) {
		var marker = new googleMaps.Marker({
			position: latlng,
			map: $ctrl._gmap
		});

		$scope.markers.push(latlng);
	};
	$ctrl.mapInitialized = function (gmaps, mapInstance) {
		$ctrl._gmap = mapInstance;
		googleMaps = gmaps;
		$scope.$emit('gmapInitialized', $ctrl);
	};

}



function doit() {
	ngapp.controller(CONTROLLER_NAME, gmapController)
	ngapp._directive(DIRECTIVE_NAME, gmapDirective);
	return gmapDirective;
}

export default doit();