/*
 * Angularjs forcefully adds a window.angular object (as of 1.6.x)
 * so the expose-loader doesn't really matter.
 * However, in the future it may not - it may only 'export' the angular object
 * expose-loader?angular will take the exported object and put it as 'angular' in the global namespace
 * import ng will mean it's also a local variable 'ng'
 */
import ng from 'expose-loader?angular!angular';

import './styles/reset.css';
import 'milligram';
import './styles/app.css';
//import './styles/main.css';

import ngapp from './ngapp/ngappmodule.js';
// from DefinePlugin in webpack.config.json)
ngapp._value('API_URL_BASE', __WEBPACK__API_URL_BASE); 

import {delayCompileDirective}  from './ngapp/ngroute-definitions.js';

import gmap from './ngapp/views/gmap/gmap.js';
import dataService from './ngapp/services/data.js';
