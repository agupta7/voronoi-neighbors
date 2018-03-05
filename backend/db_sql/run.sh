#!/bin/bash

if [ "$1" == "" ]; then
	echo "Must pass name of database as first argument." 1>&2;
	exit 2
fi
DB_NAME=$1
ME=`id -u`
if [ "${ME}" != "0" ]; then
	echo "Must be root to assume privileges of postgres user" 1>&2;
	exit 1
fi

cat *.sql | sudo -u postgres psql -U postgres -d $DB_NAME
# cat - concatenate all sqls together
# use the db superuser postgres
# psql command line
# -d connect to database name from input
