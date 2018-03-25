import ngapp from '../../ngappmodule.js';

const COMPONENT_NAME = 'endUserComponent';

var def = {
	controller: [function () {
		
	}],
	controllerName: COMPONENT_NAME + 'Controller',
	componentDdo: {
		templateUrl: require('./end-user.html'),
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
