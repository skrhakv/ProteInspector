#!/usr/bin/env bash

echo "Process PID:"
echo $$
# load .env
export $(grep -v '^#' .env | xargs)

BASEDIR=$(dirname "$0")
sudo PGPASSWORD=$DB_USER_PASSWD psql -U $DB_USER -h 127.0.0.1 -d $DB_NAME -a -f $BASEDIR/../create-db/delete_batch6.sql & wait
sudo PGPASSWORD=$DB_USER_PASSWD psql -U $DB_USER -h 127.0.0.1 -d $DB_NAME -a -f $BASEDIR/../create-db/create_batch6.sql & wait
time (python3 $BASEDIR/insert_batch6.py 1 & wait)