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
import 'ng-dialog/css/ngDialog.css';
import 'ng-dialog/css/ngDialog-theme-default.css';
//import './styles/main.css';

import ngapp from './ngapp/ngappmodule.js';
// from DefinePlugin in webpack.config.json)
ngapp._value('API_URL_BASE', __WEBPACK__API_URL_BASE); 

// Directives that can be used anywhere in HTML
import {delayCompileDirective}  from './ngapp/ngroute-definitions.js';
import gmap from './ngapp/views/gmap/gmap.js';
import rsaKeyDirective from './ngapp/views/rsaKey/rsaKeyDirective.js';
import poiRowDirective from './ngapp/views/poiRow/poiRowDirective.js';
// Filters can also be used anywhere in HTML
import hexFilter from './ngapp/services/hexFilter.js';

/**
 * These don't need to be imported here because they are automatically included by the node dependency system whereever imported within the ngapp
 * Listing them here, commented, so they're in one place
 * 
 * import dataService from './ngapp/services/data.js';
 * import debouceService from './ngapp/services/debounce.js';
 * import util from './ngapp/services/util.js';
 * import crypto from './ngapp/services/crypto.js';
 */

//
