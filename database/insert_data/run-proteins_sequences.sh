#!/usr/bin/env bash

BASEDIR=$(dirname "$0")
sudo PGPASSWORD=apo_holo_db psql -U apo_holo_db -h 127.0.0.1 -d apo_holo_db -a -f $BASEDIR/../create_db/delete_proteins_sequences.sql
sudo PGPASSWORD=apo_holo_db psql -U apo_holo_db -h 127.0.0.1 -d apo_holo_db -a -f $BASEDIR/../create_db/create_proteins_sequences.sql
python3 $BASEDIR/insert_proteins_sequences.py