# Back end
Briefly, these are the main files of interest in the back end.

	db_sql
	|---*.sql
	|---run.sh
	router.py
	run.sh

## `db_sql/run.sh`
The `db_sql/` folder contains SQL scripts to create the schema (set up the tables and indices).  This run.sh bash script should be run on the database server with administrative privileges so it can.  Alternatively, you can copy-paste and run the `*.sql` scripts manually over a database connection using your database user configured for the schema.

## `router.py`
This is the main script of the back end.  It uses the python library Flask to set up a simple web server.  As the name implies, this file defines the routes of the RESTful API.
## `run.sh`
Since `router.py` takes a lot of arguments, this `run.sh` script is provided to invoke `router.py` with the default arguments.
