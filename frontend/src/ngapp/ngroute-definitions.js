import ng from 'angular';
import ngapp from './ngappmodule.js'

var routes = {
	'/': {
		'html': '<home-component></home-component>',
		'loader': require('./views/home/home-component.js'),
		'resolve': {
			'resolveKey': ['$q', function ($q) {
				return '';
			}]
		}
	},
	'/ondemand': {
		'html': '<ondemand-component></ondemand-component>',
		'loader': require('bundle-loader?name=ondemand-component&lazy!./views/ondemand/ondemand-component.js')
	}
};

ngapp.directive('delayCompile', ["$compile", delayCompileDirective]);
ngapp.directive('activeClassRoute', ["$route", activeClassRouteDirective]);

ngapp.config(['$routeProvider', function ($routeProvider) {
	ng.forEach(routes, function registerWithRouteProvider(route, path) {
		// as per the routes array defined above,
		// each route contains 
		//      'html' : string defining the template loaded for the route
		//       'loader' : function which will download the required resource when called and invoke the 
		//                  provided callback with the resource
		//                  *** OR ***
		//                  the resource itself
		//                  This resource should register all directives and controllers required to make the route's html work.
		$routeProvider.when(path, {
			template: '<delay-compile>' + route.html + '</delay-compile>',
			resolve: ng.extend(route.resolve || {}, {routeComponent: ['$q', routeComponentResolver]})
		});

		function routeComponentResolver ($q) {
			return $q(function (resolver, rejector) {
				if (ng.isFunction(route.loader)) // route.loader is asynchronous loader
					route.loader(resolver);
				else if (route.loader)
					resolver(route.loader) // route.loader is the exported object from the component
				else
					rejector('route.loader is not a valid object!');
			});
		}
	}); // end ng.forEach
	$routeProvider.otherwise('/');
}]);

export default routes;
export {delayCompileDirective};
export {activeClassRouteDirective};



/**
 * @description This directive allows us to load route controllers asyncronously.
 * The is done because the $route.resolve object hash properties each return a $q promise
 * This promise is resolved when an external script is loaded and executed via the 'bundle-loader?name=' (see ondemand route)
 * The route's controller is only initialized once the promises are resolved.  However, this means the route's template or templateUrl is
 * processed by $compile as soon as the template is available.
 * 
 * delay-compile directive achieves this wrapping all routes' html inside delay-compile directive.  This directive is compiled with the
 * terminal: true set.  Therefore $compile will stop compiling the route's template as soon as it hits this directive.
 * This directive waits until postLink, which will only occur after $compile -> controller initialized -> prelink all directives (only delay-compile) -> postLink
 * 
 * Once postLink occurs, the directive will take the original html that was stubbed out and put it back in freshly compiled.
 * 
 * The directive will put $resolve inside the scope of the route which contains all the resolved properties.
 * 
 * @param {object : $compile} $compile - The $compile service from ng.
 * @returns {object} ddo - The directive definition object.
 */
function delayCompileDirective($compile) {
	var originalHtml = '';
	return {
		restrict: 'EA',
		priority: 2000,
		terminal: true,
		compile: function compile(tElement, tAttrs, transclude) {
			var attrsSet = tAttrs.$set('delay-compile');
			tAttrs.$set('delay-compile', null);
			
			originalHtml = tElement[0].tagName.match(/delay-compile/i) ? tElement.html() : tElement[0].outerHTML;
			
			tElement.empty();
			tAttrs.$set('delay-compile', attrsSet);
			return postLink;
		}
	};
	
	function postLink (scope, element, attrs) {
		var $resolve = scope.$resolve;
		var resolvedComponentDef = $resolve.routeComponent.default;
		
		var linked = $compile(originalHtml)(scope);
		element.append(linked);
	}
	
}

/**
 * This directive allows efficiently assigning an 'active' class 
 *     to the navbar component depending upon which route is active currently.
 * It is more efficient and cleaner than using ng-class because ng-class will end up registering 
 *     a more heavy-weight scope $watch than the $observe here.  Also, ng-class requires exposing
 *     $route information in the scope like a global variable.  Not fun.
 * @param {object} $route - The $route service injected from ng.
 * @returns {void} null
 */
function activeClassRouteDirective($route) {
	return {
		link: function (scope, element, attrs) {
			
			/* There's no need to change this at run time
			 * so making it hard-coded instead of $observed 
			 */
			var CLASS_NAME = 'active-route';

			var routeWatcherDeregister = ng.noop;
			attrs.$observe('activeClassRoute', function (rtowatch) {
				routeWatcherDeregister();
				scope.$on("$routeChangeSuccess", routeChangeWatcher);
			});
			
			function routeChangeWatcher($event, newroute) {
				var routename = newroute.$$route.originalPath.replace(/^\//, '').replace(/\//, '-');
				if (newroute.$$route.originalPath == attrs['activeClassRoute']) {
					element.addClass(CLASS_NAME);
					element.addClass(CLASS_NAME + "-" + routename);
				} else {
					element.removeClass(CLASS_NAME);
					element.removeClass(CLASS_NAME + "-" + routename);
				}
			};
		}
	};
}
