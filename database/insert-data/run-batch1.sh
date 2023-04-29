#!/usr/bin/env bash

# load .env
export $(grep -v '^#' .env | xargs)

BASEDIR=$(dirname "$0")
sudo PGPASSWORD=$DB_USER_PASSWD psql -U $DB_USER -h 127.0.0.1 -d $DB_NAME -a -f $BASEDIR/../create-db/delete_batch1.sql
sudo PGPASSWORD=$DB_USER_PASSWD psql -U $DB_USER -h 127.0.0.1 -d $DB_NAME -a -f $BASEDIR/../create-db/create_batch1.sql
python3 $BASEDIR/insert_batch1.py