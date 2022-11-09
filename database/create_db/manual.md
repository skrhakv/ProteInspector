# Create database
first create user:
```
sudo -u postgres createuser -s $YOUR_DB_USER
```
then create db:
```
sudo su - postgres -c "createdb $YOUR_DB_NAME"
```

login to the db:
```
psql -d $YOUR_DB_NAME
```

# Create tables
Script creates new empty tables:
```
psql -U $YOUR_DB_USER -h 127.0.0.1 -d $YOUR_DB_NAME -a -f database/create_db/create.sql
```

# Delete tables
Script deletes existing data:
```
psql -U $YOUR_DB_USER -h 127.0.0.1 -d $YOUR_DB_NAME -a -f database/create_db/delete.sql
```
