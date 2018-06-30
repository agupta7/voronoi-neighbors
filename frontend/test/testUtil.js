module.exports = {
	'strip': function (str) {
		if (str && typeof str === "string") {
			return str.replace(/^\s*|\s*$/g, '');
		}
		else
			return str;
	}
};
