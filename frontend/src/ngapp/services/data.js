import ngapp from '../ngappmodule.js';

const SERVICE_NAME = 'data';

dataService.$inject = ['$http', '$location', 'API_URL_BASE'];
ngapp._service(SERVICE_NAME, dataService);

function dataService($http, $location, API_URL_BASE) {
	var service = this;

	service.getPoints = function getPoints() {
		return $http.get(API_URL_BASE + '/pois').then(dataGetter);
	};

	function dataGetter(httpResponse) {
		return httpResponse.data;
	}
}

export default SERVICE_NAME;

var POINTS = [
	{"lat":32.606736094972966,"lng":-85.48733353614807},
	{"lat":32.60682647346745,"lng":-85.48646450042725},
	{"lat":32.6070885705858,"lng":-85.48385739326477},
	{"lat":32.606690905691494,"lng":-85.48277378082275},
	{"lat":32.60670898140683,"lng":-85.48094987869263},
	{"lat":32.60736422362415,"lng":-85.4815399646759},
	{"lat":32.609293771138134,"lng":-85.4826557636261},
	{"lat":32.606315833775504,"lng":-85.4800432920456},
	{"lat":32.6048833157383,"lng":-85.48516094684601},
	{"lat":32.602461088011616,"lng":-85.48657178878784}
];