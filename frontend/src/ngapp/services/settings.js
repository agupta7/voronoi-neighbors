import ng from 'angular';
import ngapp from '../ngappmodule.js';

const SERVICE_NAME = 'settings';

settingsService.$inject = ['$http', '$location', 'API_URL_BASE'];
settingsService.toString = function () {
	return SERVICE_NAME;
};

function settingsService($http, $location, API_URL_BASE) {
	var service = this;

	service.getSettings = function getSettings() {
		return $http.get(API_URL_BASE + '/settings').then(function (httpResponse) {
			return httpResponse.data || {};
		});
	};	
	service.saveSettings = function saveSettings(keyValueMap) {
		return $http.put(API_URL_BASE + '/settings', keyValueMap).then(dataGetter);
	};

	function dataGetter(httpResponse) {
		return httpResponse.data;
	}
}

export default (function doit(definition) {
	ngapp._service(SERVICE_NAME, definition);
	return definition;
})(settingsService);
