/* https://github.com/neelbommisetty/Angular-Webpack-Boilerplate/blob/master/README.md good place to pick up some formatting cues */
# angularjs-webpack-boilerplate.

A boilerplate project for AngularJS 1.x based websites (SP    A) using webpack to manage workflow.  It supports ES6 using babel-loader.  Can support JSX and TypeScript via other loaders.  It concatenates and minifies all javascript assets into one file so there's only one HTTP request (AngularJS patterns in general require all JS assets to be loaded up front anyway).  Maintain and code the project in separate small components and retain efficiency when loading in the browser.

<p>Currently CSS is only contatenated and minified.  Can add LESS support via loaders.</p>
<br />

```

├── ./ - This is the directory where you've checked out this repo.  It your working directory.
├── express-spa.js - Contains a little server that serves files out of dist/ or debug/ depending on the port defined in package.json['ports']
├── LICENSE
├── package.json - NPM package definition.  Use 'npm install' from the working directory. Then use 'npm start' to build and serve the project.  Check package.json['scripts'] for more scripts.
├── webpack.config.js - Entire npm project is based in webpack.  This contains the webpack config.
├── src
│   ├── fonts - Fonts directory for web fonts
│   │   ├── droid-sans.woff
│   │   ├── glyphicons... 
│   │   ├── opensans.woff
│   │   ├─
│   │   ├─
│   │   └─
│   ├── index.html - Contains the SPA skeleton that gets sent when browsing to the site.  Everything else happens due to the CSS and js that gets injected into this file by webpack upon 'npm run build'.
│   ├── ngapp
│   │   ├── ngappmodule.js - Defines the angular module and configures it.  Exports the return value of angular.module('name', [deps])
│   │   ├── ngroute-definitions.js - Uses the exported angular module and adds routes to it.  Routes are based on the component pattern to ease upgrading to Angular 2.  If a component is required()ed through the bundle-loader, the JS & HTML will be loaded only when the user visits that route.  Otherwise the component's 
│   │   └── views
│   │       ├── home
│   │       │   ├── home-component.js - Defines the component directive and the controller.  Also specifies the template and/or the templateURL as a part of the component definition that will be loaded in.
│   │       │   └── home.html
│   │       └── ondemand
│   │           ├── ondemand-component.js
│   │           └── ondemand.html
│   ├── styles - No matter how these styles are included, webpack concatenates and minifies into one file called css/app-[hash].css in the dist/ directory.
│   │   ├── app.css - imported by webpack-entry.js
│   │   ├── reset.css - imported by webpack-entry.js
│   │   └── webfonts.css - It's a CSS @import parameter in app.css
│   ├── webpack.copy - Files inside this folder are copied as-is into the dist/ or debug/ directory
│   └── webpack-entry.js - Main entry point of the webpack project that imports all the required CSS and JS files to make the AngularJS app work. Stuff imported here is contactenated and output as dist/app.[hash].min.js
└── README.md - This file
