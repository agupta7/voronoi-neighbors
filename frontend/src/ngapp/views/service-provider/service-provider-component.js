import ngapp from '../../ngappmodule.js';

const COMPONENT_NAME = 'serviceProviderComponent';

var def = {
	controller: [function () {
		var $ctrl = this;
	}],
	controllerName: COMPONENT_NAME + 'Controller',
	componentDdo: {
		templateUrl: require('./service-provider.html'),
		controller: COMPONENT_NAME + 'Controller',
		controllerAs: '$ctrl',
		scope: {

		}
	},
	componentName: COMPONENT_NAME
};

function doit() {
	ngapp._controller(def.controllerName, def.controller);
	ngapp._component(def.componentName, def.componentDdo);
	return def;
}

export default doit();
