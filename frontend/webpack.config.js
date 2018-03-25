/**
 * Most of this configuration has been used from https://github.com/preboot/angularjs-webpack
 * Code used with permission (MIT License) as of 2017-07-05
 *
 */

module.exports = function (env) { // webpack will invoke the exported function with env as the first argument with the properties you pass using --env.propkey='value' from the commandline
	'use strict';
	env = env || {}; // webpack-dev-server will not pass in any object

	// Modules
	var webpack = require('webpack');
//	var autoprefixer = require('autoprefixer');
	var HtmlWebpackPlugin = require('html-webpack-plugin');
	var ExtractTextPlugin = require('extract-text-webpack-plugin');
	var CopyWebpackPlugin = require('copy-webpack-plugin');
	var path = require('path');
	var package_json = require(path.join(__dirname, 'package.json'));

	/**
	 * Env
	 * Get npm lifecycle event to identify the environment
	 * this will become whatever comes after npm run-script 
	 * ex: npm run-script build  : ENV === 'build'
	 */
	var ENV = process.env.npm_lifecycle_event; // 
	var isTest = env.test == true;
	var isProd = env.production == true;
	var isDebug = env.debug == true;
	var disableSourceMap = false;

	return makeWebpackConfig();

	function makeWebpackConfig() {
		/**
		* Config
		* Reference: http://webpack.github.io/docs/configuration.html
		* This is the object where all configuration gets set
		*/
		var config = {
			entry: {
				app: './src/webpack-entry.js'
			},
			output: {
				filename: isProd ? '[name].[hash].min.js' : '[name].bundle.js',
				chunkFilename: '[id].[name].[hash].js', // filename output pattern for bundle-loader [name] is the name query parameter
				path: __dirname + (isProd ? '/dist' : '/debug'),
				publicPath: ''
			},
			module: {
				rules: []
			},
			plugins: [
				new webpack.DefinePlugin({
					'__WEBPACK__API_URL_BASE': JSON.stringify((isDebug || isProd) ? '/api' : ('//localhost:' + package_json['ports']['backend']))
				}),
				new CopyWebpackPlugin([{
					from: __dirname + '/src/webpack.copy'
				}])
			],
			devtool: !disableSourceMap ? (isDebug || isProd ? 'source-map' : 'inline-source-map') : '',
			devServer: {
				host: '0.0.0.0', // comment this out to listen on only localhost
				disableHostCheck: true, // comment this out to force localhost serving
				contentBase: 'dist/',
				port: package_json.ports.dev
			}
		};

		// Extract CSS files that are require()ed, imported or url()ed and place them in $config.output.path/css/app.css
		// [name] represents the key for the config.entry.app property
		var cssExtractPlugin = new ExtractTextPlugin({filename: 'css/[name]-[hash].css', allChunks: true});
		
		// Add ES6 support
		config.module.rules.push({
			test: /\.js$/,
			exclude: /node_modules/,
			use: 'babel-loader'
		});
		
		config.module.rules.push({
			test: /\.css$/,
			use: cssExtractPlugin.extract({
				use: [
					{loader: 'css-loader', query: {sourceMap: !disableSourceMap, minimize: isProd ? true /*{discardComments: {removeAll: true}}*/ : false}}
				],
				/* browsers load css assets with respect to location of the CSS file which is 'css/[name]-[hash].css' */
				publicPath: '../'
			})
		});
		config.module.rules.push({
			test: /\.less$/,
			use: cssExtractPlugin.extract({
				use: [
					{loader: 'css-loader', query: {sourceMap: !disableSourceMap, minimize: isProd}},
					{loader: 'less-loader', query: {sourceMap: !disableSourceMap}}
				],
				publicPath: '../'
			})
		});
		
		config.module.rules.push({
			test: /\.(html|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
			exclude: /\/src\/index\.html/,
			issuer: /\.(js|jsx|ts|scss|css|less)$/,
			use: {
				loader: 'file-loader',
				query: {name: '[path][name]-[hash].[ext]', context: 'src/'}
			}
		});
		
		if (!isTest) {	//dev or prod
			// Skip rendering index.html in test mode
			// Reference: https://github.com/ampedandwired/html-webpack-plugin
			// Render index.html
			config.plugins.push(
				new HtmlWebpackPlugin({
					template: './src/index.html',
					filename: 'index.html',
					inject: 'body'
				}),
				cssExtractPlugin
			);
		} else { // end if (!isTest)
			// Silence the css loader to not do CSS processing for a test build
			config.module.rules[1].use = 'null-loader';
			
			/**
			* Entry
			* Reference: http://webpack.github.io/docs/configuration.html#entry
			* Should be an empty object if it's generating a test build
			* Karma will set this when it's a test build
			*/
			config.entry = 0;
		}
		
		if (isProd) {
			
			config.plugins.push(
				// Reference: http://webpack.github.io/docs/list-of-plugins.html#noerrorsplugin
				// Only emit files when there are no errors
				new webpack.NoEmitOnErrorsPlugin(),
				
				// Reference: http://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
				// Minify all javascript, switch loaders to minimizing mode
				new webpack.optimize.UglifyJsPlugin({
					sourceMap: !disableSourceMap,
					minimize: true
				})
				
				// Copy assets from the public folder
				// Reference: https://github.com/kevlened/copy-webpack-plugin
				
			);
		}

		return config;
	}
};
