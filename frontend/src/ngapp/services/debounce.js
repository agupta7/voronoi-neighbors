import ngapp from '../ngappmodule.js';
import debounce from '../../lib/debounce.js';

const SERVICE_NAME = 'debounce';

ngapp._factory(SERVICE_NAME, ['$timeout', '$q', function ($timeout, $q) {
	return function ngDebounce(f, milliseconds) {
		var defer = $q.defer();
		debounce(function () {
			defer.resolve(f());
		}, milliseconds, $timeout, $timeout.cancel);

		return defer.promise;
	};
}]);

export default SERVICE_NAME;