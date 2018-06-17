import ng from 'angular';
import ngroute from 'angular-route';
import gmapsApi from '../lib/gmaps-api.js';
import ngDialog from 'imports-loader?angular=angular!ng-dialog';

// This should stay in sync with ng-app tag in ../index.html
const NG_APP_NAME = 'voronoi';

/**
 *	This is the module that represents the angularjs application for the boilerplate
 *	Check out ngroute-definitions for the wiring that makes the pages work.
 */
var ngappmodule = ng.module(NG_APP_NAME, [ngroute, gmapsApi, 'ngDialog']);

ngappmodule.config(["$locationProvider", function ($locationProvider) {
	$locationProvider.html5Mode(true);
}]);

ngappmodule.value('AUBURN_DOWNTOWN', {lat: 32.606562317045885, lng: -85.48174055491711});

ngappmodule._controller = ngappmodule.controller;
ngappmodule._service = ngappmodule.service;
ngappmodule._factory = ngappmodule.factory;
ngappmodule._filter = ngappmodule.filter;
ngappmodule._value = ngappmodule.value;
ngappmodule._directive = ngappmodule.directive;
ngappmodule._component = ngappmodule.component;
ngappmodule.config(["$compileProvider", "$controllerProvider", "$provide", function ($compileProvider, $controllerProvider, $provide) {
	/*
	 * This publishes information attached to DOM elements so we can do stuff
	 * like angular.element($0).injector() and angular.element($0).scope() in Chrome
	 * and debug the angularjs app
	 * Disable this in production for performance reasons
	 * It is not a security feature!  A user can always run angular.reloadWithDebugInfo(); from the JS console!
	 * https://docs.angularjs.org/guide/production
	 */
	$compileProvider.debugInfoEnabled(true);

	ngappmodule._controller = $controllerProvider.register.bind($controllerProvider);
	ngappmodule._component = $compileProvider.component.bind($compileProvider);
	ngappmodule._directive = $compileProvider.directive.bind($compileProvider);
}]);

export default ngappmodule;
