#!/usr/bin/env bash

# load .env
export $(grep -v '^#' .env | xargs)

BASEDIR=$(dirname "$0")
sudo PGPASSWORD=$DB_USER_PASSWD psql -U $DB_USER -h 127.0.0.1 -d $DB_NAME -a -f $BASEDIR/../create-db/delete_batch3.sql
sudo PGPASSWORD=$DB_USER_PASSWD psql -U $DB_USER -h 127.0.0.1 -d $DB_NAME -a -f $BASEDIR/../create-db/create_batch3.sql
time (python3 $BASEDIR/insert_batch3.py 0 1500) # & python3 $BASEDIR/insert_batch3.py 200 400 & python3 $BASEDIR/insert_batch3.py 440 600 & python3 $BASEDIR/insert_batch3.py 667 800 &  python3 $BASEDIR/insert_batch3.py 828 1000 &  python3 $BASEDIR/insert_batch3.py 1039 1200 &  python3 $BASEDIR/insert_batch3.py 1248 1400 &  python3 $BASEDIR/insert_batch3.py 1446 1500 & wait) 