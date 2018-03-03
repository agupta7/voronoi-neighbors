#!/bin/bash

# /etc/postgres/pg_hba.conf contains the postgres config for logins
# dy default, local logins over UNIX sockets use the identity of the calling process's user
# the 'postgres' user is the superuser for the db
sudo su -u postgres psql
#CREATE USER voronoi_neighbors WITH PASSWORD 'voronoi';
#CREATE DATABASE voronoi_neighbors;
#GRANT ALL PRIVILEGES ON DATABASE voronoi_neighbors to voronoi_neighbors;