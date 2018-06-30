/* This the main driver of the front-end HTTP server configuration
 * The web application is built using npm's preprocess module.
 * It allows us to have different HTML/JS/CSS sources 
 * depending on if it's a 'development' or 'production' environment.
 * 
 * Code in the "src" folder and then "build" using `npm run build` or `npm run dev-build`
 * depending on the environment you want.
 * 
 * npm.run.build.sh and npm.run.dev-build.sh have to be maintained as the codebase changes 
 * or the build won't work.
 */

var express = require("express");
var httpProxy = require('http-proxy');
var app = express();
// var bodyparser = require("body-parser");
var path = require("path");
global.app = app;

var package_json = require(path.join(__dirname, './package.json'));
var port = parseInt(package_json.ports[process.argv[2]]);

app.use(express.static(path.join(__dirname, '.bin', process.argv[2])));
app.use(require("compression")()); // TODO : doesn't yet work
var apiProxy = httpProxy.createProxyServer();
app.all("/api/*", function (req, res) {
	req.url = req.url.replace(/^\/api/, '');
	apiProxy.web(req, res, {
		target: 'http://localhost:' + package_json['ports']['backend']
	});
});
app.get(/\// /*anything that doesn't match a static file gets served the spa*/, function (req, res) {
	res.sendFile("index.html", {
		root: path.join(__dirname, '.bin', process.argv[2])
	});
});

startServer(app);
// This file is just the definition of the express-based web server.
// It just exports itself as a module - running this script alone won't do anything.
// Go to "index.js" in the main, driving module to 
// run the server and listen for connections. (cd .. && npm start)
module.exports = app;

function startServer(expressapp) {
	var server = expressapp.listen(port, function () {
		var host = server.address().address;
		var port = server.address().port;
	
		console.log("Frontend listening at http://%s:%s", host, port);
	});
	
	return server;
}
