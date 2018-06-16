import ngapp from '../../ngappmodule.js';

const DIRECTIVE_NAME = 'gmapPlace';
const CONTROLLER_NAME = DIRECTIVE_NAME + 'Controller';

gmapPlaceDirective.$inject = ['gmapsApiLoader', '$filter'];
function gmapPlaceDirective(gmapsApiLoader, $filter) {
	var ddo = {
		'controller': CONTROLLER_NAME,
		'controllerAs': '$ctrl',
		'require': [DIRECTIVE_NAME],
		'scope': {
			'gmapCtrl': '=',
			'gmapPlace': '='
		},
		'link': function (scope, element, attrs, ctrls) {
			var $ctrl = ctrls[0];
			gmapsApiLoader.then(function (googleMaps) {
				var autocomplete = new googleMaps.places.Autocomplete(element[0]);
				scope.$watch('gmapCtrl', function (gmapCtrl) {
					autocomplete.bindTo('bounds', gmapCtrl._gmap);
				});

				autocomplete.addListener('place_changed', function () {
					var place = autocomplete.getPlace();

					if (!place.geometry)
						return;
					if (place.geometry.viewport && scope.gmapCtrl._gmap) {
						scope.gmapCtrl._gmap.fitBounds(place.geometry.viewport);
					}
					var latlng = {'lat': place.geometry.location.lat(), 'lng': place.geometry.location.lng()};
					scope.gmapPlace = latlng;
					scope.$apply();
				});
			});
		}
	};

	return ddo;
}

gmapPlaceDirective['toString'] = function toString() {
	return DIRECTIVE_NAME;
};

gmapPlaceController.$inject = ['$scope'];
function gmapPlaceController($scope) {
	var $ctrl = this;

	$ctrl.initialized = function initialized(googleMaps, autocomplete) {

	};
}

export default (function doit(defintion) {
	ngapp._directive(DIRECTIVE_NAME, defintion);
	ngapp._controller(CONTROLLER_NAME, gmapPlaceController)
	return defintion;
})(gmapPlaceDirective);