#!/bin/bash

ME=`id -u`
if [ "${ME}" != "0" ]; then
	echo "Must be root to assume privileges of postgres user" 1>&2;
	exit 1
fi

DB_NAME=$1
if [ "${DB_NAME}" == "" ]; then
	DB_NAME="voronoi_neighbors"
fi

DIR=`dirname $0`
cat ${DIR}/*.sql | sudo -u postgres psql -U postgres -d $DB_NAME
# cat - concatenate all sqls together
# use the db superuser postgres
# psql command line
# -d connect to database name from input
