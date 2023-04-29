#!/usr/bin/env bash

echo "Process PID:"
echo $$
# load .env
export $(grep -v '^#' .env | xargs)

BASEDIR=$(dirname "$0")
python3 $BASEDIR/insert_batch7.py 0 1500