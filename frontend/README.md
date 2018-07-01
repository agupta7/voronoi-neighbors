# Front end
The front end is packaged as a Node.js Webpack application.  Thus, the first thing you should for running the front end code after cloning the repository is change directory to `frontend` and then run `npm install`.  This will install all the required dependencies for building the web application.  The main entry points of the front end are:

	package.json
	webpack.config.js
	express-spa.js
	src
	|---webpack-entry.js
	|---index.html
	|---ngapp
	|---|---ngappmodule.js
	|---|---ngroute-definitions.js


## Quickstart

 1. Make sure you ran `npm install` after changing to `frontend` directory to install NodeJS dependencies.
 2. Execute `npm run start` to build and serve the front-end assets.
 3. Refer to `backend/README.md` to see how to start back-end.

## Test
Execute `npm run test` to execute automated test cases.  You may have to change the browser to one installed on your system in the file `frontend/test/karma.conf.js`.

## `package.json`
This file describes the Node.js package.  Most NPM commands you run will refer to this file.  For example, running `npm install` will install all packages listed in the package.json-\>`devDependencies` and package.json-\>`dependencies` arrays.

After installing, run `npm run build` to convert the source code into a deployable static website written to the `frontend/dist` folder.  This deployable code can then be copied to Apache's /var/www directory.  Alternatively, you can run `npm start` to build the code and start a temporary web server on port 8080.

See the package.json-\>`scripts` object for all the npm scripts defined.  You can adjust the ports in the JSON object package.json-\>`ports`.

## `webpack.config.js`
This file describes the Webpack configuration. Please refer to the comments in the file. 

## `express-spa.js`
This is an HTTP server in NodeJS that can serve the static files emitted by Webpack and proxy requests to the back end server.  This server is not meant to be used in a big production deployment under heavy load.  In that case, a proper web server like Apache would be more appropriate.

## `src/webpack-entry.js`
This is the main entry point of the webpack application.  When you execute scripts like `npm run build`, Webpack reads the config from `webpack.config.js` and starts collecting depedencies as defined in this file.  The final result is emitted as `app.*.js` in the output directory.
Following the `import`s and `require()`s from this file will give you an exhaustive list of all the Javascript and CSS assets used.  The only other entry point is `src/index.html` discussed next.

## `src/index.html`
In adding to `src/webpack-entry.js` the `HtmlWebpackPlugin` defined in webpack.config.js refers to this file to emit an HTML document.  This is the only HTML file sourced directly in the webpack config.  The other HTML files for the various pages get included because they are all `require()`ed in the Javascript assets.

## `src/ngapp/ngappmodule.js`
This is the definition of the main ngapp module of the front-end.  It is sourced in `src/webpack-entry.js`.

## `src/ngapp/ngroute-definitions.js`
This file defines the routes of the front-end.  Routes are what define which view component will be loaded when the user navigates to different tabs in the navigation bar.
