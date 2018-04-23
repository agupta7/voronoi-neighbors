#!/bin/bash

echo "Make sure the packages postgresql & postgis are installed: apt/yum/dnf install postgresql postgis"

DB_NAME=$1
PASSWORD=$2

if [ "${DB_NAME}" == "" ]; then
	DB_NAME="voronoi_neighbors"
fi

if [ "${PASSWORD}" == "" ]; then
	PASSWORD="voronoi"
fi

USER="${DB_NAME}"

sudo -u postgres psql << EOF

DROP USER IF EXISTS $USER;
DROP DATABASE IF EXISTS $DB_NAME;

CREATE DATABASE $DB_NAME;

--psql command: connect to database
\c $DB_NAME

--load PostGIS spatial extension
CREATE EXTENSION postgis;
--show postgis version:
--	SELECT postgis_full_version();

CREATE USER $USER WITH PASSWORD '$PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME to $USER
EOF
