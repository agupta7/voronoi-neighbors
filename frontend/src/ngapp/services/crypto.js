import {MessageDigest, KEYUTIL, KJUR, RSAKey} from 'jsrsasign';
import ngapp from '../ngappmodule.js';

const SERVICE_NAME = 'crypto';
var serviceFactory = [function () {
	// assert(KJUR.crypto.MessageDigest == MessageDigest);
	var service = this;

	service.hash = function hashSHA256(str) {
		var cryptoHash = new MessageDigest({
			'alg': 'sha256',
			'prov': 'cryptojs'
		});
		cryptoHash.updateString(str);
		
		return cryptoHash.digest();
	};
	service.sign = function signSHA256(str, rsaPrivateKey) {
		var sig = new KJUR.crypto.Signature({'alg': 'SHA256withRSA'});
		sig.init(rsaPrivateKey);

		return sig.signString(str);
	};
	service.signHex = function signHexSHA256(hexStr, rsaPrivateKey) {
		var sig = new KJUR.crypto.Signature({'alg': 'SHA256withRSA'});
		sig.init(rsaPrivateKey);

		return sig.signHex(hexStr);
	};
	service.generateKeys = function keyGen() {
		var keyutil = KEYUTIL;

		// paper specifies that signature overhead is 128 bytes
		// RSA signatures are equal to key-length
		var keypair = keyutil.generateKeypair('RSA', 1024);

		return {
			'private': keypair.prvKeyObj,
			'public': keypair.pubKeyObj
		};
	};
	service.keyToPEM = function (keyObj) {
		if (!keyObj)
			return null;
		if (keyObj.isPrivate)
			return KEYUTIL.getPEM(keyObj, 'PKCS1PRV');
		else
			return KEYUTIL.getPEM(keyObj);
	};
	service.readPEM = function (pemKeyString) {
		var k = new RSAKey();
		k.readPrivateKeyFromPEMString(pemKeyString);

		return k;
	};
}];
serviceFactory['toString'] = function () {
	return SERVICE_NAME;
};

export default (function doit(definition) {
	ngapp._service(SERVICE_NAME, definition);
	return definition;
})(serviceFactory);