# ProteInspector
This repository contains code for the application ProteInspector, which is developed as part of my Master Thesis at Faculty of Math and Physics, Charles University.

`ProteInspector` is a bioinformatics tool, which contains information about protein transformations, and can be used to analyze and mine data to deepen our understanding of proteins and changes in their conformation. This work loosely follows up the work of Adam Král (see https://github.com/adam-kral/apo-holo-protein-structure-stats).

## Quick Start
To start the application, simply run
```
docker-compose up
```
to build and run the application using `Docker`.

## Full Installation

### Required packages
```
sudo apt install build-essential
sudo apt install nodejs npm
sudo npm install -g node-gyp
npm install -g @angular/cli
sudo apt-get -y install nlohmann-json3-dev
sudo apt install postgresql
```
### Download sql dump
Download database dump from this [link](http://proteinspector.projekty.ms.mff.cuni.cz/data/dump.sql).

### Upload SQL dump to Postgres
Relog as postgres and create new user and new database:
```
su - postgres
createuser apo_holo_db
createdb apo_holo_db
exit
```

Run psql:
```
psql -U postgres
```

Change password for the new user and grant privileges:
```
alter user apo_holo_db with encrypted password 'YOUR-PASSWORD';
grant all privileges on database apo_holo_db to apo_holo_db;
\q
```

Load the database from SQL dump:
```
psql -U apo_holo_db -d apo_holo_db < dump.sql
```

### Download and install library `pq`
Fedora:
```
sudo dnf install libpq-devel
```

Ubuntu:
```
sudo apt-get install libpq-dev
```
### Download and install library `pqxx`
1. Download the respective library source code from github (https://github.com/jtv/libpqxx) - we used version 7.7.1. (the most recent version 7.7.4. was not working with the `--enable-shared` from the step 2.)
```
wget -O pqxx.zip https://github.com/jtv/libpqxx/archive/refs/tags/7.7.1.zip 
```
2. unzip the file:
```
unzip pqxx.zip
```
3. run:
```
./configure --enable-shared
make && make install
```

### Download and install library `hyrise/sql-parser`
Clone the repository and build the library:
```
git clone https://github.com/hyrise/sql-parser.git
cd sql-parser
make
make install
```

## Launch both services:
1. Go to `/api` folder and run:
```
npm run build
npm run start
```
to build and launch the backend service.

2. Go to `/client` folder and run:
```
npm install
ng serve
```
to build and launch the frontend service.
