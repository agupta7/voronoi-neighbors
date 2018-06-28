#!/bin/bash

DIR=`dirname $0`
virtualenv ${DIR}/pythonenv
# Need the following packages whether using virtualenv or normal python:
#     flask
#     psycopg2-binary
#     shapely
${DIR}/pythonenv/bin/pip2 install flask psycopg2-binary shapely
