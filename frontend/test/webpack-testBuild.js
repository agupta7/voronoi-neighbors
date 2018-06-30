import ngapp from '../src/webpack-entry.js';

// Add every *Spec.js file in this directory tree for testing
var r = require.context('./', true, /Spec\.js$/);
r.keys().forEach(r);

