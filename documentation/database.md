# Database Documentation
This file expands on the creation of the database and insertion of the dataset provided by [Adam Kral](https://github.com/adam-kral/apo-holo-protein-structure-stats).

## Database Diagram
![Database Schema](https://github.com/skrhakv/ProteInspector/blob/master/documentation/media/database-schema.png)

## Creation of the Database
The SQL scripts for the creation of the database are located in the `database/create-db` folder. The `create_batch*.sql` are scripts creating a relevant part of the database, as the insertion was done in several batches to simplify debugging (the batches are described in the following section). To facilitate debugging of the insertion process, the `delete_batch*.sql` were created in order to erase the content of the particular database tables in case of finding a bug in the insertion scripts.

Moreover, `create_test_data.sql` and `delete_test_data.sql` scripts were created to handle an artificial data of residues and multiple-state transformations for testing purposes, as this type of data was not part of the [Adam Kral](https://github.com/adam-kral/apo-holo-protein-structure-stats) dataset.

## Insertion into the Database
As it is demonstrated by the database diagram, the database has a complex structure. Therefore, the process of inserting data was split into multiple tasks, each handling a different part of the database:
1. first batch: populating `sequences` and `proteins` data table,
2. second batch: populating `protein_transformations` and `protein_lcs_data` data table,
3. third batch: populating `protein_transformations_data`, `domain_transformations` and `protein_transformations_data` data table,
4. fourth batch: populating `domain_pairs` and `domain_pairs_transformations` data table,
5. fifth batch: populating `domain_pairs_transformations_data` and `proteins` data table,
6. sixth batch: populating `transformations` and `datasets` data table.

The source code for the insertion process can be found in the `database/insert-data` folder. Each batch has its python script `insert_batch*.py`, which extracts data from the dataset of [Adam Kral](https://github.com/adam-kral/apo-holo-protein-structure-stats) and inserts it into the PostgreSQL database. To further facilitate the insertion process, the `run-batch*.sh` bash script was created to handle clearing the old data tables and creating fresh ones.

## Updating the Database
To load a new dataset, one can utilize scripts from the `database/insert-data/update-db` folder. First it is recommended to create a backup of the database to simplify a rollback. For that, the `create-db-backup.sh` bash script can be used. Consequently, new dataset needs to be loaded in the format presented in the `update-db.json` file. The `update-db.py` script can be used to load the new dataset:
```
$> python3 update-db.py name-of-the-dataset-file.json
```

If the insertion was not successful and the integrity of the database was damaged, one can use the `restore-from-db-backup.sh` script to restore the database from a `dump.sql` file