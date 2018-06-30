import {MessageDigest, KEYUTIL, KJUR, RSAKey} from 'jsrsasign';
import util from './util.js';
import ngapp from '../ngappmodule.js';

const SERVICE_NAME = 'crypto';
	
var serviceFactory = [util.toString(), function (util) {
	var service = this;

	service.hash = function hashSHA256(str) {
		var cryptoHash = new MessageDigest({
			'alg': 'sha256',
			'prov': 'cryptojs'
		});
		cryptoHash.updateString(str);
		
		return cryptoHash.digest();
	};
	/**
	 * 
	 * Code inspired from jsrsasign's source of KEYUTIL.generateKeypair(...) function : http://kjur.github.io/jsrsasign/api/symbols/src/keyutil-1.0.js.html
	 * @param {*} rsaPrivateKey 
	 */
	service.getRSAPublicKey = function getRSAPublicKey(rsaPrivateKey) {
		if (rsaPrivateKey == null)
			return null;
		else if (!rsaPrivateKey)
			return undefined;
		var pk = new RSAKey();

		pk.setPublic(rsaPrivateKey.n.toString(16), rsaPrivateKey.e.toString(16));
		pk.isPrivate = false;
		pk.isPublic = true;

		return pk;
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
		/* This was how I first got it to work, but it's depracated.
		var md = new MessageDigest({'alg': 'sha256', 'prov': 'cryptojs'});
		md.updateHex(hexStr);
		var digest = md.digest();

		return rsaPrivateKey.signWithMessageHash(digest, 'sha256');
		*/
	};
	service.verifyHex = function verifyHex(expectedMessageHex, signedHexStr, rsaPublicKey) {
		var sig = new KJUR.crypto.Signature({'alg': 'SHA256withRSA'});
		sig.init(rsaPublicKey);
		sig.updateHex(expectedMessageHex);

		return sig.verify(signedHexStr);
		/* This was how I first got it to work, but it's depracated.
		var md = new MessageDigest({'alg': 'sha256', 'prov': 'cryptojs'});
		md.updateHex(expectedMessageHex);
		var digest = md.digest();

		return rsaPublicKey.verifyWithMessageHash(digest, signedHexStr);
		*/
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
	service.keyToPEM = function (keyObj, format) {
		var ku = KEYUTIL;
		if (!keyObj)
			return null;
		if (keyObj.isPrivate)
			return KEYUTIL.getPEM(keyObj, format || 'PKCS8PRV');
		else // jsrsasign only supports the following method signature for public key.  It returns it in PKCS#8/SubjectPublicKeyInfo format
			return KEYUTIL.getPEM(keyObj);
	};
	service.readPEM = function (pemKeyString) {
		var split = pemKeyString.split('\n').filter(function (line) {
			return !/\s*-----/i.test(line) && line != '';
		});
		var k = new RSAKey();
		if (/-----BEGIN\s+(RSA\s+)?PUBLIC\s+KEY/i.test(pemKeyString)) {
			// https://holtstrom.com/michael/tools/asn1decoder.php
			// https://gist.github.com/awood/9338235
			var encodedDERHex = util.bytesToHexString(util.base64ToBytes(split.join('')));
			if (/-----BEGIN\s+RSA\s+PUBLIC/i.test(pemKeyString))
				//-----BEGIN RSA PUBLIC KEY-----
				k.readPKCS5PubKeyHex(encodedDERHex);
			else
				//-----BEGIN PUBLIC KEY-----
				// https://security.stackexchange.com/questions/32768/converting-keys-between-openssl-and-openssh
				// openssl calls this PKCS8 (which used to be only for private keys in RFC-5208) format SubjectPublicKeyInfo:
				// as of RFC-5958, PKCS8 can be used for public keys also: https://crypto.stackexchange.com/questions/35093/why-ssh-gen-makes-difference-between-pem-and-pkcs8
				k.readPKCS8PubKeyHex(encodedDERHex);
		} else {
			if (/-----BEGIN\s+RSA/i.test(pemKeyString)) {
				k.readPrivateKeyFromPEMString(pemKeyString);
			} else {
				try {
					k.readPKCS8PrvKeyHex(util.bytesToHexString(util.stringToBytes(atob(split.join('')))));
				} catch (e) {
					// atob will throw an exception
					return undefined;
				}
			}
		}

		return k;
	};

	// The default text formatter in ngModelController uses the object's toString() method
	// override RSAKey toString
	RSAKey.prototype.toString = function () {
		return service.keyToPEM(this);
	};
}];
serviceFactory['toString'] = function () {
	return SERVICE_NAME;
};

export default (function doit(definition) {
	ngapp._service(SERVICE_NAME, definition);
	return definition;
})(serviceFactory);