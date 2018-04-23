import ng from 'angular';

// This should stay in sync with ng-app tag in ../index.html
const NG_APP_NAME = 'gmaps-api';

var module = ng.module(NG_APP_NAME, []);

module.provider('gmapsApiLoader', [function () {

	/**
	 * API key 1 for `voronoi-neighbors` project under anujgupta7854@gmail.com Google APIs
	 */
	const GMAPS_API_KEY = 'AIzaSyAZeo_rOHhFbgWDZNZxZFaUdyHH48dIBTg';

	this.$get = ['$window', '$document', '$q', function ($window, $document, $q) {
		var document = $document[0];
		
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = 'https://maps.googleapis.com/maps/api/js?callback=initMapCallback&key=' + GMAPS_API_KEY;
		
		return $q(function (resolver, rejector) {
			$window.initMapCallback = function () {
				resolver($window.google.maps);
			};
			
			document.body.appendChild(script);
		});
	}];
}]);

export default NG_APP_NAME;