import ngapp from '../ngappmodule.js';
import util from '../../lib/util.js';

const SERVICE_NAME = 'util';

ngapp._factory(SERVICE_NAME, [function () {
	return util;
}]);

export default SERVICE_NAME;