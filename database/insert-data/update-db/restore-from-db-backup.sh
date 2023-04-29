#!/usr/bin/env bash

psql -U postgres -c "drop database apo_holo_db"
psql -U postgres -c "create database apo_holo_db"
psql -U apo_holo_db -d apo_holo_db -f dump.sql 