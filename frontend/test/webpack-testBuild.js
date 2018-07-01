var jasmineRequire = require('jasmine-core/lib/jasmine-core/jasmine.js');
require('imports-loader?jasmineRequire=jasmine-core/lib/jasmine-core/jasmine.js!jasmine-core/lib/jasmine-core/jasmine-html.js');
require('imports-loader?jasmineRequire=jasmine-core/lib/jasmine-core/jasmine.js!jasmine-core/lib/jasmine-core/boot.js');
import ngapp from '../src/webpack-entry.js';
require('angular-mocks/ngMock');

// Add every *Spec.js file in this directory tree for testing
var r = require.context('./', true, /Spec\.js$/);
r.keys().forEach(r);

