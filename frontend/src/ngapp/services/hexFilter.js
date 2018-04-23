import ng from 'angular';
import ngapp from '../ngappmodule.js';
import util from './util.js';

const NAME = 'hex';

ngapp._filter(NAME, [util.toString(), function hexFilterProvider(util) {
	return function hexFilter(strOrBytes) {
		var bytes;
		if (typeof strOrBytes === "string")
			bytes = util.stringToBytes(strOrBytes);
		else 
			bytes = strOrBytes;

		return bytesToHexString(bytes);
	};

	function bytesToHexString(bytesArr) {
		var str = [];
		for (var i = 0; i < bytesArr.length; i++) {
			var hex = (bytesArr[i] & 0xFF).toString(16);
			hex = hex.length > 1 ? hex : '0' + hex;
			str.push(hex);
		}
		return str.join('');
	}
}]);

export default NAME;