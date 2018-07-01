var NAMES = require('../NAMES.js');
var testUtil = require('../testUtil.js');

beforeEach(angular.mock.module(NAMES.APP_MODULE));

const POINTS = [
	{
		"_meta_": {
			"neighbors": [{"location": {"lat": 32.6024610880116, "lng": -85.4865717887878}}, {"location": {"lat": 32.6048833157383, "lng": -85.485160946846}}, {"location": {"lat": 32.6068264734675, "lng": -85.4864645004272}}, {"location": {"lat": 32.6092937711381, "lng": -85.4826557636261}}], 
			"verificationObject": "15f2f9e92f8d2ce8c5f41d8ad1119af6dae2abe391f2833bd6a630b0c99cd3dd73d8963a22d1a7432f75aa77d68f2d30b91749eee2d4f9bbe8beeb6be6f74b8dea223c67f198fea1c9e713d6a25be952c83f942aa6204afee6513499d3b47192345799a88bd8e5c08c5b24a64826e16ad5d9dc12fe349a29472c50dd76985159", 
			"id": 153
		}, 
		"tail": {"phone": "3348217740", "name": "Chipotle Mexican Grill", "address": "346 W Magnolia Ave, Auburn, AL, 36832"}, 
		"location": {"lat": 32.606736094973, "lng": -85.4873335361481}
	}, 
	{
		"_meta_": {
			"neighbors": [{"location": {"lat": 32.606736094973, "lng": -85.4873335361481}}, {"location": {"lat": 32.6048833157383, "lng": -85.485160946846}}, {"location": {"lat": 32.6070885705858, "lng": -85.4838573932648}}, {"location": {"lat": 32.6092937711381, "lng": -85.4826557636261}}], 
			"verificationObject": "01777702978c6f0ff97797fedbe08dc8c85161f437aa25e2cbe122e11bbb7a57d4e0cb9cbc7a8838e08f335f9d472603d2f5619cf32d6ab1b0fb4733e9ac6ef7546050184cc6885bc548fd74599bd4e99793d7813cfa5cdc52a031b863e11ec275296445d3c1fabd86eb802fe932331457a4f2df20fd143f6401cd627218fac0", 
			"id": 154
		}, 
		"tail": {"phone": "3348267630", "name": "Chick-fil-A", "address": "326 W Magnolia Ave, Auburn, AL 36832"}, 
		"location": {"lat": 32.6068264734675, "lng": -85.4864645004272}
	}, 
	{
		"_meta_": {
			"neighbors": [{"location": {"lat": 32.6068264734675, "lng": -85.4864645004272}}, {"location": {"lat": 32.6048833157383, "lng": -85.485160946846}}, {"location": {"lat": 32.6066909056915, "lng": -85.4827737808228}}, {"location": {"lat": 32.6073642236242, "lng": -85.4815399646759}}, {"location": {"lat": 32.6092937711381, "lng": -85.4826557636261}}], 
			"verificationObject": "12ee3ea82060458f121e699d4105f0a5e3fefb4c228f58454ebc84b96eb8cb660b55d427d0173b510d6d35a3ac6ff817c815719e13ef3958ff172322dbdb3b473ecb3253d7a18f8c733757289d47508a803806496697baa850c681b3ba3f649af5e269e50a53d54f1530504b3644663f0067f5e3d54988ef96847dc23f5ac51c", 
			"id": 155
		}, 
		"tail": {"phone": "3348217185", "name": "McDonald's", "address": "224 W Magnolia Ave, Auburn, AL 36830"}, 
		"location": {"lat": 32.6070885705858, "lng": -85.4838573932648}
	}, 
	{
		"_meta_": {
			"neighbors": [{"location": {"lat": 32.6048833157383, "lng": -85.485160946846}}, {"location": {"lat": 32.6063158337755, "lng": -85.4800432920456}}, {"location": {"lat": 32.6067089814068, "lng": -85.4809498786926}}, {"location": {"lat": 32.6073642236242, "lng": -85.4815399646759}}, {"location": {"lat": 32.6070885705858, "lng": -85.4838573932648}}], 
			"verificationObject": "0d85938d7e3fec4471dc92f0325ada782547eca3d54bc86f2bc22c80da8b7ec1fcb95ef916cd9be35698094277659769bbe946168a62935e890cbdc2d1c41061cf0074cce879446308c647f708bf95fca6351929a6d23afc8bd2badd455b1262d15b3650cc7479714a526eee63896c4d068526902907463be512e5b17cc74f90", 
			"id": 156
		}, 
		"tail": {"phone": "3348214001", "name": "Skybar Cafe", "address": "136 W Magnolia Ave, Auburn, AL 36830"}, 
		"location": {"lat": 32.6066909056915, "lng": -85.4827737808228}
	}, 
	{
		"_meta_": {
			"neighbors": [{"location": {"lat": 32.6066909056915, "lng": -85.4827737808228}}, {"location": {"lat": 32.6063158337755, "lng": -85.4800432920456}}, {"location": {"lat": 32.6073642236242, "lng": -85.4815399646759}}], 
			"verificationObject": "097faef120ecb28692b8ec200d2841ca9fe85fc282c17c6495c3adbaa21b2dce57572f98d7b489ba6b304aa87f4f81f211ed2bc480b9b6911afef41502bfb533167d920c743c8923c940dc56dbd2e43e5cbcc76a286ed127fbae64a45b65e79dd40fbfb3aff7d34980c3873c23fa0ac5335dfae8affec56f56ce00b15009c3de", 
			"id": 157
		}, 
		"tail": {"phone": "3348216161", "name": "Little Italy Pizzeria", "address": "129 E Magnolia Ave, Auburn, AL 36830"}, 
		"location": {"lat": 32.6067089814068, "lng": -85.4809498786926}
	}, 
	{
		"_meta_": {
			"neighbors": [{"location": {"lat": 32.6070885705858, "lng": -85.4838573932648}}, {"location": {"lat": 32.6066909056915, "lng": -85.4827737808228}}, {"location": {"lat": 32.6067089814068, "lng": -85.4809498786926}}, {"location": {"lat": 32.6063158337755, "lng": -85.4800432920456}}, {"location": {"lat": 32.6092937711381, "lng": -85.4826557636261}}], 
			"verificationObject": "442ae7da5fb9d19117b80f865f84e571fc59204ef22cda861057ea7b91d336a39c7d56b16d08ced55a3bcf8c1ed28fcb318673f166d1dbc01c7e11314db282fecf377a59579f8ba8ed2be90ce86d6f95bfd86d85a883f1ebbc8c62a61e895e7664032d50854a49f78525d84208e66c7bdc4380d27b9c78974c7977d6b5217cce", 
			"id": 158
		}, 
		"tail": {"phone": "3348876356", "name": "Mellow Mushroom", "address": "128 N College St, Auburn, AL 36830"}, 
		"location": {"lat": 32.6073642236242, "lng": -85.4815399646759}
	}, 
	{
		"_meta_": {
			"neighbors": [{"location": {"lat": 32.606736094973, "lng": -85.4873335361481}}, {"location": {"lat": 32.6068264734675, "lng": -85.4864645004272}}, {"location": {"lat": 32.6024610880116, "lng": -85.4865717887878}}, {"location": {"lat": 32.6070885705858, "lng": -85.4838573932648}}, {"location": {"lat": 32.6073642236242, "lng": -85.4815399646759}}, {"location": {"lat": 32.6063158337755, "lng": -85.4800432920456}}], 
			"verificationObject": "60f28cf6644be97a2665763cc3c4c17dff13efc80c26cdd193545a65d44ca17ffb267214c2a2545b7c271b49d9df05d461ada4844e993ced060a5dec2471afa79c04fb01bbaa1f2e699d042b46ba57daba527c0ae9731b67dc6d3573796fa904b280ded51e48543b63cdd58f7dc1f84fd3d382a53b9106e958fd7d46f98c2c87", 
			"id": 159
		}, 
		"tail": {"phone": "3348260987", "name": "Waffle House", "address": "110 W Glenn Ave, Auburn, AL 36830"}, 
		"location": {"lat": 32.6092937711381, "lng": -85.4826557636261}
	}, 
	{
		"_meta_": {
			"neighbors": [{"location": {"lat": 32.6048833157383, "lng": -85.485160946846}}, {"location": {"lat": 32.6024610880116, "lng": -85.4865717887878}}, {"location": {"lat": 32.6092937711381, "lng": -85.4826557636261}}, {"location": {"lat": 32.6073642236242, "lng": -85.4815399646759}}, {"location": {"lat": 32.6067089814068, "lng": -85.4809498786926}}, {"location": {"lat": 32.6066909056915, "lng": -85.4827737808228}}], 
			"verificationObject": "4feec7bb5090f7c9e7ea409d6c113aea8cb5be0af59905b0e42e7d511ae7fb93d5f0a83b86047582488aa9e0f9a2ef1e55adf1678749ff3104d8c2dcf9c3f1986ac5f15bcac9b43a569bf68b0019de5243604331dbc1122b703ac4d6218d19f323e0338b6b0d56ce5a45bef45781b241031463ad4c70fa351d969a93bff700e0", 
			"id": 160
		}, 
		"tail": {"phone": "3348872677", "name": "Hamilton's On Magnolia", "address": "174 E Magnolia Ave, Auburn, AL 36830"}, 
		"location": {"lat": 32.6063158337755, "lng": -85.4800432920456}
	}, 
	{
		"_meta_": {
			"neighbors": [{"location": {"lat": 32.6024610880116, "lng": -85.4865717887878}}, {"location": {"lat": 32.6063158337755, "lng": -85.4800432920456}}, {"location": {"lat": 32.6066909056915, "lng": -85.4827737808228}}, {"location": {"lat": 32.6070885705858, "lng": -85.4838573932648}}, {"location": {"lat": 32.6068264734675, "lng": -85.4864645004272}}, {"location": {"lat": 32.606736094973, "lng": -85.4873335361481}}], 
			"verificationObject": "5a39a70e21be9cdc34f9420b6450dbe94d18abe1461365cea16f047353a953ae376d510c7c28db559ec3254328a3a7be6b10a26113a2aa1641a2895b2b7c09ec8ee3ab7b886e8aa16e59c6c256c7e3681e7f1a80b171f678d34a28be0144f604d045b285db2459b9e6db0a5336486049bc329ba615ac30bb8ab356da7dad59c4", 
			"id": 161
		}, 
		"tail": {"phone": "3348441818", "name": "Panda Express", "address": "1310 Wilmore Dr, Auburn, AL 36849"}, 
		"location": {"lat": 32.6048833157383, "lng": -85.485160946846}
	}, 
	{
		"_meta_": {
			"neighbors": [{"location": {"lat": 32.6063158337755, "lng": -85.4800432920456}}, {"location": {"lat": 32.6048833157383, "lng": -85.485160946846}}, {"location": {"lat": 32.6092937711381, "lng": -85.4826557636261}}, {"location": {"lat": 32.606736094973, "lng": -85.4873335361481}}], 
			"verificationObject": "26ef9a7fbbcbd9e46f3c8623805db150b81b1416322ec4bde9ec461f3bbb40f0c7d688dc8ef13c0a849808093beebddce77a40be39bad23445f9742e97677e7eb0f7cea4a2cd873d66d76dc2ef4b6b010fd1e1e0c07cda7cb3ab7e655f8b0849cdd139b3a21d5fb77a5c9d2458a6bf46e7c554e9a856b140a9f4b9d133054480", 
			"id": 162
		}, 
		"tail": {"phone": "2057674494", "name": "Starbucks", "address": "Quad Center, 255 Duncan Dr, Auburn, AL 36849"}, 
		"location": {"lat": 32.6024610880116, "lng": -85.4865717887878}
	}
];
var publicKeyStr = '-----BEGIN PUBLIC KEY-----\n\
		MIGeMA0GCSqGSIb3DQEBAQUAA4GMADCBiAKBgHDB9ZHF5/lbrm2L4ZZ7su2Yd3j4\n\
		B/dA/khLUHGQOD6GRsrBH1ZAO53kG8DeLTRZ8BnG7kvvfmZUiPq6BaIHXmKSSyNE\n\
		GBETBnh8jNrkeGdUnZyCYjoHySUuE3WDaP6jFvcQhSMdy3FtCIgwMRn09JQiB+hZ\n\
		nGjEU1dxNDuShODtAgMBAAE=\n\
		-----END PUBLIC KEY-----';
var mellowMushroom = POINTS[5];

var knn3 = [
	{
		"_meta_": {
			"neighbors": [{"location": {"lat": 32.6066909056915, "lng": -85.4827737808228}}, {"location": {"lat": 32.6063158337755, "lng": -85.4800432920456}}, {"location": {"lat": 32.6073642236242, "lng": -85.4815399646759}}], 
			"distance_meters": 75.97868215, 
			"verificationObject": "097faef120ecb28692b8ec200d2841ca9fe85fc282c17c6495c3adbaa21b2dce57572f98d7b489ba6b304aa87f4f81f211ed2bc480b9b6911afef41502bfb533167d920c743c8923c940dc56dbd2e43e5cbcc76a286ed127fbae64a45b65e79dd40fbfb3aff7d34980c3873c23fa0ac5335dfae8affec56f56ce00b15009c3de", 
			"id": 157
		}, 
		"tail": {"phone": "3348216161", "name": "Little Italy Pizzeria", "address": "129 E Magnolia Ave, Auburn, AL 36830"}, 
		"location": {"lat": 32.6067089814068, "lng": -85.4809498786926}
	}, 
	{
		"_meta_": {
			"neighbors": [{"location": {"lat": 32.6070885705858, "lng": -85.4838573932648}}, {"location": {"lat": 32.6066909056915, "lng": -85.4827737808228}}, {"location": {"lat": 32.6067089814068, "lng": -85.4809498786926}}, {"location": {"lat": 32.6063158337755, "lng": -85.4800432920456}}, {"location": {"lat": 32.6092937711381, "lng": -85.4826557636261}}], 
			"distance_meters": 90.90079143, 
			"verificationObject": "442ae7da5fb9d19117b80f865f84e571fc59204ef22cda861057ea7b91d336a39c7d56b16d08ced55a3bcf8c1ed28fcb318673f166d1dbc01c7e11314db282fecf377a59579f8ba8ed2be90ce86d6f95bfd86d85a883f1ebbc8c62a61e895e7664032d50854a49f78525d84208e66c7bdc4380d27b9c78974c7977d6b5217cce", 
			"id": 158
		},
		"tail": {"phone": "3348876356", "name": "Mellow Mushroom", "address": "128 N College St, Auburn, AL 36830"}, 
		"location": {"lat": 32.6073642236242, "lng": -85.4815399646759}
	}, 
	{
		"_meta_": {
			"neighbors": [{"location": {"lat": 32.6048833157383, "lng": -85.485160946846}}, {"location": {"lat": 32.6063158337755, "lng": -85.4800432920456}}, {"location": {"lat": 32.6067089814068, "lng": -85.4809498786926}}, {"location": {"lat": 32.6073642236242, "lng": -85.4815399646759}}, {"location": {"lat": 32.6070885705858, "lng": -85.4838573932648}}], "distance_meters": 98.02725382, 
			"verificationObject": "0d85938d7e3fec4471dc92f0325ada782547eca3d54bc86f2bc22c80da8b7ec1fcb95ef916cd9be35698094277659769bbe946168a62935e890cbdc2d1c41061cf0074cce879446308c647f708bf95fca6351929a6d23afc8bd2badd455b1262d15b3650cc7479714a526eee63896c4d068526902907463be512e5b17cc74f90", 
			"id": 156
		}, 
		"tail": {"phone": "3348214001", "name": "Skybar Cafe", "address": "136 W Magnolia Ave, Auburn, AL 36830"}, 
		"location": {"lat": 32.6066909056915, "lng": -85.4827737808228}
	}
];

describe('verifierSpec', function () {
	var verifierService, crypto;

	beforeEach(angular.mock.inject([NAMES.verifierService, NAMES.cryptoService, function(_verifierService_, cryptoService) {
		verifierService = _verifierService_;
		crypto = cryptoService;
	}]));

	it('verifierService._generateVerificationObject() works.', function () {
		var verificationObjectHexStr = verifierService._generateVerificationObject(mellowMushroom);

		var lat = '40404dbe1c629cfa';
		var lng = 'c0555ed18d000000';
		var name = '4d656c6c6f77204d757368726f6f6d';
		var phone = '33333438383736333536';
		var address = '313238204e20436f6c6c6567652053742c2041756275726e2c20414c203336383330';
		var neighborsLen = '0005';
		var neighbors = [
			'40404db5140a3880c0555ef785000002',
			'40404da80c2f5ce1c0555ee5c4000003',
			'40404da8a3d0aa74c0555ec7e1fffffe',
			'40404d9bc1da8e6ec0555eb907800000',
			'40404dfd569a58eac0555ee3d5000000'
		];

		expect(verificationObjectHexStr).toBe(lat + lng + name + phone + address + neighborsLen + neighbors.join(''));
	});

	it('verifierService.signatureVerification() works.', function () {
		var pubkey = crypto.readPEM(publicKeyStr);
		var verfication = verifierService.signatureVerification(POINTS, pubkey);
		expect(verfication).toBe(true);
	});

	it('verifierService.geometricVerificationKnn() works.', function () {
		expect(verifierService.geometricVerificationKnn(knn3, {"lat":32.606562317045885,"lng":-85.48174055491711}, 3, null)).toBe(true);
	});
});
