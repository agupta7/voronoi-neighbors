describe('cryptoService', function () {
	var $controller, $rootScope;

	beforeEach(angular.mock.inject(function(_$controller_, _$rootScope_) {
		// The injector unwraps the underscores (_) from around the parameter names when matching
		$controller = _$controller_;
		$rootScope = _$rootScope_;
	}));

	it('1+1 should equal 2', function () {
		expect(2).toBe(2);
	});
});
