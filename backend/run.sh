#!/bin/sh

DIR=`dirname $0`
${DIR}/../environment\ setup/pythonenv/bin/python2 -uB ${DIR}/router.py --dbhost localhost --dbport 5432 --dbuser voronoi_neighbors --dbpassword voronoi --dbname voronoi_neighbors --port 8081
