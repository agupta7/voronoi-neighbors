import ngapp from '../ngappmodule.js';

const NAME = 'latlng';

ngapp._filter(NAME, [function latlngFilterProvider() {
	return function latlngFilter(latlng) {
		if (!latlng)
			return null;
		return latlng.lat + '\xB0, ' + latlng.lng + '\xB0';
	};
}]);

export default NAME;