import ngapp from '../../ngappmodule.js';

const DIRECTIVE_NAME = 'poiRow';

var poiRowDirectiveFactory = ['$compile', function poiRowDirectiveDdo($compile) {
	var insertTemplate = require('!raw-loader!./poiRow.html');
	return {
		'restrict': 'EA',
		'compile': function compile(tElement, tAttrs, transclude) {
			return postLink;
		}
	};

	function postLink(scope, element, attrs) {
		var linked = $compile(insertTemplate)(scope);

		
		var jql = element.find('input');
		[].push.apply(jql, linked.find('input'));
		[].push.apply(jql, linked.find('label'));
		[].push.apply(jql, linked.find('button'));
		jql.on('click', function (event) {
			event.stopPropagation();
		});
		
		element.after(linked);
		element.on('$destroy', function (event) {
			linked.remove();
		});
	}
}];

poiRowDirectiveFactory['toString'] = function () {
	return DIRECTIVE_NAME;
};



export default (function doit(definition) {
	ngapp._directive(DIRECTIVE_NAME, definition);
	return definition;
})(poiRowDirectiveFactory);
