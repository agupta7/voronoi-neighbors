import ngapp from '../../ngappmodule.js';
import crypto from '../../services/crypto.js';

const DIRECTIVE_NAME = 'rsaKey';

var rsaKeyDdoFactory = [crypto.toString(), function (crypto) {
	return {
		require: ['ngModel'],
		link: {
			'pre': function (scope, element, attrs, ctrls) {
				var $ngModelController = ctrls[0];
				$ngModelController.$parsers.push(function rsaKeyParser(text) {
					if (text) {
						var keyObj = crypto.readPEM(text);
						if (rsaTextCanonicalForm(keyObj.toString()) != rsaTextCanonicalForm(text))
							return undefined;
						return keyObj;
					} else
						return null;
				});
			},
			'post': function (scope, element, attrs, ctrls) {
				var $ngModelController = ctrls[0];
				scope.$watch(attrs['ngModel'], function (newvalue, oldvalue) {
					if (newvalue !== oldvalue) {
						$ngModelController.$rollbackViewValue();
					}
				});
			}
		}
	};
}];

function rsaTextCanonicalForm(rsaPKCS5PEMText) {
	if (!rsaPKCS5PEMText)
		return '';
	return String(rsaPKCS5PEMText).replace(/\s/g, '').match(/^(?:-----.*-----)(.*)(?:-----.*-----)|(.*)$/)[1] || '';
}

rsaKeyDdoFactory['toString'] = function () {
	return DIRECTIVE_NAME;
};

export default (function doit(defintion) {
	ngapp._directive(DIRECTIVE_NAME, defintion);
	return defintion;
})(rsaKeyDdoFactory);

