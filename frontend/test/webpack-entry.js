import ngapp from '../src/webpack-entry.js';
//var ngapp = require('../testBuild/app.bundle.js');

require('angular-mocks/ngMock');

beforeEach(angular.mock.module(ngapp.toString()));

var r = require.context('./', true, /Spec\.js$/);
r.keys().forEach(r);

