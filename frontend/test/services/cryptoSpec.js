require('angular-mocks/ngMock');
var NAMES = require('../NAMES.js');
var testUtil = require('../testUtil.js');

beforeEach(angular.mock.module(NAMES.APP_MODULE));

describe('cryptoSpec', function () {
	var cryptoService;
	beforeEach(angular.mock.inject(['$controller', '$rootScope', NAMES.cryptoService, function(_$controller_, _$rootScope_, _cryptoService_) {
		cryptoService = _cryptoService_;
	}]));

	var keyPair = {
		prvKeyStr: '-----BEGIN PRIVATE KEY-----\n\
		               MIICdQIBADANBgkqhkiG9w0BAQEFAASCAl8wggJbAgEAAoGAcMH1kcXn+VuubYvh\n\
		               lnuy7Zh3ePgH90D+SEtQcZA4PoZGysEfVkA7neQbwN4tNFnwGcbuS+9+ZlSI+roF\n\
		               ogdeYpJLI0QYERMGeHyM2uR4Z1SdnIJiOgfJJS4TdYNo/qMW9xCFIx3LcW0IiDAx\n\
		               GfT0lCIH6FmcaMRTV3E0O5KE4O0CAwEAAQKBgE0LCep3aeAEV7M774Bttr0G/yLl\n\
		               fjPf8Z6d7zIZE4UNJFOnDu1U6Cci1B+87vAlP5utQ+cYlan/urRt5ClolYEmLy2e\n\
		               3whA7AQamt1U+BAFLLw6MfAuWLUxp4ZxefUC1MnYFxiOEZA8DYOrYGaN6oD2WiVL\n\
		               9WuRF/BOL0Hq/oi1AkEArZ9h1ScF7VJsucAIWE4shOpkSi/aF8pdIz1PzS+sskto\n\
		               Hj42nkQodIPOiqZGgZY/5Wq/MOVM2W6u4UQum2m9rwJBAKZBxo40NKt8BnameTE6\n\
		               iNouQIs3tN9whegJ+JZ5rcvab4+aQZ9yEsgnhHH4GbdQdGVBVMdloLstL/NjBiHN\n\
		               riMCQQCQj38ewdIeip16f5izJcvNk3eTiYo2esjXuYoDVumcvkpfu/8wAaIJeWF0\n\
		               cgOMjDSBaULtjE5TT+QOLf38aquDAkAvpPfetq1FW2SKygg/CFRBmjGa89rckWV+\n\
		               aqUXkkUw/ycrUvxtUgZ534FAG+Zaty6z+bXu8nvOSBPOvtj6BPRbAkBEHvWKjXOB\n\
		               tIAXzud+9tImNJW+oAyjmnkHHf+bidLzrLqNK9KbFc5z6383yEmsM5NSQKXUMwLG\n\
		               bJ/+GfUCuBBX\n\
							-----END PRIVATE KEY-----',
		pubKeyStr: '-----BEGIN PUBLIC KEY-----\n\
		               MIGeMA0GCSqGSIb3DQEBAQUAA4GMADCBiAKBgHDB9ZHF5/lbrm2L4ZZ7su2Yd3j4\n\
		               B/dA/khLUHGQOD6GRsrBH1ZAO53kG8DeLTRZ8BnG7kvvfmZUiPq6BaIHXmKSSyNE\n\
		               GBETBnh8jNrkeGdUnZyCYjoHySUuE3WDaP6jFvcQhSMdy3FtCIgwMRn09JQiB+hZ\n\
		               nGjEU1dxNDuShODtAgMBAAE=\n\
		               -----END PUBLIC KEY-----'
	};

	it('cryptoService.hash() uses sha256', function () {
		var cryptoService;
		angular.mock.inject(function (crypto) {
			cryptoService = crypto;
		});
		expect(cryptoService.hash('hash should use sha256\n')).toBe('c332fd72b602f7ba673f2883c13205f080d02ec551dcd90d43c9b2779465cbd7');
	});

	it('cryptoService.readPEM() and cryptoService.keyToPEM() works for PKCS8 format private key', function () {
		var privateKeyObj = cryptoService.readPEM(keyPair.prvKeyStr);
		expect(nowhitespace(cryptoService.keyToPEM(privateKeyObj))).toBe(nowhitespace(keyPair.prvKeyStr));
	});

	it('cryptoService.readPEM() and cryptoService.keyToPEM() works for PKCS8/SubjectPublicKeyInfo format public key', function () {
		var pubKeyObj = cryptoService.readPEM(keyPair.pubKeyStr);
		expect(nowhitespace(cryptoService.keyToPEM(pubKeyObj))).toBe(nowhitespace(keyPair.pubKeyStr));
	});

	it('cryptoService.getRSAPublicKey() private key converts to public key', function () {
		var privateKeyObj = cryptoService.readPEM(keyPair.prvKeyStr);
		var pubKeyObj = cryptoService.getRSAPublicKey(privateKeyObj);

		expect(nowhitespace(cryptoService.keyToPEM(pubKeyObj))).toBe(nowhitespace(keyPair.pubKeyStr));
	});

	it('cryptoService.generateKeys() generates correct keypair', function () {
		var keypair = cryptoService.generateKeys();

		expect(nowhitespace(cryptoService.keyToPEM(keypair.public))).toBe(nowhitespace(cryptoService.keyToPEM(cryptoService.getRSAPublicKey(keypair.private))));
	});

	function nowhitespace(str) {
		if (str) {
			return str.split('\n').map(function (line) {
				return testUtil.strip(line);
			}).join('');
		} else
			return str;
	}
});
