# Create database
first create user:
```
sudo -u postgres createuser -s apo_holo_db
```
then create db:
```
sudo su - postgres -c "createdb apo_holo_db"
```

login to the db:
```
psql -d apo_holo_db
```

# Create tables
Script deletes all old tables in the database and creates new empty tables:
```
psql -U apo_holo_db -h 127.0.0.1 -d apo_holo_db -a -f database/create_db/create.sql
```