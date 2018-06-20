#!/bin/bash

echo "Make sure the packages postgresql & postgis are installed: apt/yum/dnf install postgresql postgis"

ME=`id -u`
if [ "${ME}" != "0" ]; then
	echo "Must be root to assume privileges of postgres user" 1>&2;
	exit 1
fi

DB_NAME=$1
PASSWORD=$2

if [ "${DB_NAME}" == "" ]; then
	DB_NAME="voronoi_neighbors"
fi

if [ "${PASSWORD}" == "" ]; then
	PASSWORD="voronoi"
fi

USER="${DB_NAME}"

su -l postgres -c "psql" << EOF

DROP DATABASE IF EXISTS $DB_NAME;
DROP USER IF EXISTS $USER;

CREATE DATABASE $DB_NAME;

--psql command: connect to database
\c $DB_NAME


CREATE USER $USER WITH PASSWORD '$PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME to $USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO $USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO $USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON FUNCTIONS TO $USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TYPES TO $USER;


--load PostGIS spatial extension
CREATE EXTENSION postgis;
--show postgis version:
--	SELECT postgis_full_version();
EOF
