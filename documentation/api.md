# API Documentation
The API consist of three crutial files:
1. `api/src/app.ts` - implementation of API endpoints,
2. `api/src/query-executor.ts` - definition of the interface exposed by the **Query Executor**,
3. `api/binding.gyp` - instruction for the Node-API addon for compiling the **Query Executor** library.

## API Endpoints
This section presents the overview of endpoints implemented in the `api/src/app.ts` file. The parameters of the endpoints ought to be defined in the __query string__.

* `/data`
    - Short Description: Retrieves the data for a specified query and page.
    - Parameters: Query, dataset ID, page, and page size.
    - Method: GET
    - Returns: Corresponding database results.
* `/data/transformation-context`
    - Short Description: Retrieves the context transformations of a specified single transformation. The query usually uses the ID metric to retrieve 51 the context of a particular transformation.
    - Parameters: Query, dataset ID, page, and page size.
    - Method: GET
    - Returns: Corresponding database results.
* `/count`
    - Short Description: Retrieves the count of the results of a specified query.
    - Parameters: Query, dataset ID.
    - Method: GET
    - Returns: Count.
* `/export`
    - Short Description: Exports the corresponding result of a specified query into a file with the specified format.
    - Parameters: Query, dataset ID, and format.
    - Method: GET
    - Returns: Result file.
* `/datasets-info`
    - Short Description: Returns characteristics of each dataset including their name, statistics, and short description.
    - Parameters: -
    - Method: GET
    - Returns: Dataset description.
* `/order`
    - Short Description: Gets the optimal ordering of the result columns. The ordering is loaded from the `metrics.json` file.
    - Parameters: -
    - Method: GET
    - Returns: Optimal column ordering.
* `/biological-structures`
    - Short Description: Retrieves a list of supported biological structures from the metrics.json file.
    - Parameters: -
    - Method: GET
    - Returns: Biological structures.

* `/biological-structures/:biological-structure`
    - Short Description: Retrieves a list of supported metrics of the specified biological structure, loading the data from the metrics.json file.
    - Parameters: Biological structure (defined in the path, not in the query string).
    - Method: GET
    - Returns: Metrics