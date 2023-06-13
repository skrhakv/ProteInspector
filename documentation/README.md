# Documentation
This folder contains documentation for the `ProteInspector` framework. The files of this folder provide the overview of each module.

## Folder Overview
The codebase is split into four main folders:
* `database/` - SQL scripts for creating the database structure, python scripts for inserting the dataset of [Adam Kral](https://github.com/adam-kral/apo-holo-protein-structure-stats),
* `query-executor/` - specialized library for executing the custom query language written in C++,
* `api/` - Express.js server for serving the data using the aforementioned library,
* `client/` - Angular web application.

The documentation is following a similar separation:
* `documentation/database.md` describes the code in the `database/` folder 
* `documentation/query-executor.md` describes the code in the `query-executor/` folder 
* `documentation/api.md` describes the code in the `api/` folder 
* `documentation/client.md` describes the code in the `client/` folder


## Installation Instructions
The instructions for installing the **ProteInspector** are available in the `/README.md` file located in the root folder.
