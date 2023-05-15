#!/usr/bin/env bash

# load .env
export $(grep -v '^#' ../insert-data/.env | xargs)

rm "benchmark-results.txt"

echo "first benchmark ... "
BASEDIR=$(dirname "$0")

for i in $(seq 1 10);
do
    sudo PGPASSWORD=$DB_USER_PASSWD psql -U $DB_USER -h 127.0.0.1 -d $DB_NAME -a -f $BASEDIR/benchmark1.sql >> tmp1
done

grep Time tmp1 > tmp
cut -d' ' -f2 tmp > tmp1
awk '{ total += $1 } END { print total/NR }' tmp1 >> benchmark-results.txt
rm tmp tmp1
echo "second benchmark ... "

for i in $(seq 1 10);
do
    sudo PGPASSWORD=$DB_USER_PASSWD psql -U $DB_USER -h 127.0.0.1 -d $DB_NAME -a -f $BASEDIR/benchmark2.sql >> tmp1
done

grep Time tmp1 > tmp
cut -d' ' -f2 tmp > tmp1
awk '{ total += $1 } END { print total/NR }' tmp1 >> benchmark-results.txt
rm tmp tmp1
echo "third benchmark ... "

for i in $(seq 1 10);
do
    sudo PGPASSWORD=$DB_USER_PASSWD psql -U $DB_USER -h 127.0.0.1 -d $DB_NAME -a -f $BASEDIR/benchmark3.sql >> tmp1
done

grep Time tmp1 > tmp
cut -d' ' -f2 tmp > tmp1
awk '{ total += $1 } END { print total/NR }' tmp1 >> benchmark-results.txt
rm tmp tmp1