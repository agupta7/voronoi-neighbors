#!/bin/bash

echo "Make sure the packages postgresql & postgis are installed: apt/yum/dnf install postgresql postgis"

DB_NAME=$1

if [ "${DB_NAME}" == "" ]; then
	DB_NAME="voronoi_neighbors"
fi

sudo -u postgres psql << EOF

CREATE DATABASE $DB_NAME;

--psql command: connect to database
\c $DB_NAME

--load PostGIS spatial extension
CREATE EXTENSION postgis;
--show postgis version:
--	SELECT postgis_full_version();

CREATE TABLE POIs (id integer, name varchar, location geometry);

ALTER TABLE "pois"
ADD CONSTRAINT "pois_id" PRIMARY KEY ("id");

CREATE INDEX idx_poi_locations ON POIs using gist(location);
EOF
