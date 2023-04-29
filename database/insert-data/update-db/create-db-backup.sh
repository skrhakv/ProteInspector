#!/usr/bin/env bash

echo "Creating backup for apo_holo_db database ..."
pg_dump -U apo_holo_db -d apo_holo_db > dump.sql