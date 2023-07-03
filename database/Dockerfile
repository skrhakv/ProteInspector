FROM postgres:latest

# set environment variables
ENV POSTGRES_USER apo_holo_db
ENV POSTGRES_PASSWORD apo_holo_db
ENV POSTGRES_DB apo_holo_db

# every .sql file in the /docker-entrypoint-initdb.d folder is runned by default, so copy the init.sql there
COPY init.sql /docker-entrypoint-initdb.d/

# run wget here to retrieve the SQL dump from the server
RUN apt-get update && apt-get install wget -y
RUN wget http://proteinspector.projekty.ms.mff.cuni.cz/data/dump.sql

# load the DB from the dump.sql
RUN cp dump.sql /docker-entrypoint-initdb.d/
EXPOSE 5432