# Spatial Query Integrity with Voronoi Neighbors

This project aims to illustrate the concepts described in the IEEE paper [Spatial Query Integrity with Voronoi Neighbors](http://ieeexplore.ieee.org/abstract/document/6109262/).  There are two main components:

 - The back end that runs the web service, interfacing with the database and serving data to clients over a RESTful API using JSON.  Although it has some extra end points like key management for the purposes of the demo, the main purpose of the back end is to implement the role of the service provider.  Read the README.md in the [backend/](../../tree/master/backend/) folder for more details.
 - The front end is the web client of the demo.  It is a monolithic web application that contains tabs showing all three stake holders: the dataowner, the service provider, and the end-user.  This is only to make it easy to see everything in one place for the demo - in a real world application, each of the three roles would probably be broken out into separate web or mobile applications.  See the README.md in the [frontend/](../../tree/master/frontend) folder for the implementation details.

Before you can run the code, make sure you have the following things installed:
 - Nodejs (v0.10 or above) - for building the front end.
 - NPM, the node package manager (v3.10.8 or above) - for installing the node dependencies of the front end.
 - Python 2.x (tested with 2.7) - for running the back end.
 - Postgresql (9.4 or above) - for hosting the database.
 - Postgis (2.1  or above) - the geographic extensions that support location objects and queries in Postgresql.

The preferred environment is Linux, and the packages can be easily installed with your distribution's package manager.  After installing the above programs, check [environment setup/](../../tree/master/environment%20setup) for some setup steps.  All these steps should also work on Windows or a Mac but will have to adapted.

 1. Look through the [environment setup/01-postgres.txt](environment%20setup/01-postgres.txt) file for some suggested configuration changes for Postgresql.
 2. Run [02-ddl.sql.sh](environment%20setup/02-ddl.sql.sh) using sudo with `db_name db_password` as the arguments on the machine where Postgresql is installed to setup the database.  You need administrative privileges to run `psql`  as the `postgres` database superuser to create a new database.
 3. Run the [03-pipinstall.sh](environment%20setup/03-pipinstall.sh) script to install the required python packages:
	  - flask
	  - psycopg2-binary
	  - shapely
