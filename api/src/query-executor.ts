export interface QueryExecutor {
    /**
     * Parses and executes the query
     * @param query query
     * @param page page number
     * @param pageSize page size
     * @param datasetId dataset ID
     */
    ParseAndExecute(query: string, page: number, pageSize: number, datasetId: number);
    /**
     * Parses and executes the query
     * @param query query
     * @param page page number
     * @param pageSize page size
     */
    ParseAndExecute(query: string, page: number, pageSize: number);
    /**
     * Parses and executes the query
     * @param query query
     * @param datasetId dataset ID
     */
    ParseAndExecute(query: string, datasetId: number);
    /**
     * Parses and executes the query
     * @param query query
     */
    ParseAndExecute(query: string);
    /**
     * Parses and executes the query returning every column
     * @param query query
     * @param page page number
     * @param pageSize page size
     * @param datasetId dataset ID
     */
    ParseAndExecuteWithAllMetrics(query: string, datasetId: number, page: number, pageSize: number);
    /**
     * Gets number of pages
     * @param query specified query
     * @param datasetId dataset ID
     * @param pageSize size of the pages
     */
    GetNumberOfPages(query: string, datasetId: number, pageSize: number);
    /**
     * Retrieves information about every dataset
     */
    GetDatasetsInfo(): Array<Array<string>>;
    /**
     * Retrieves result count for specified query
     * @param query specified query
     * @param datasetId Dataset ID
     */
    GetResultCount(query: string, datasetId: number);
    /**
     * Retrieve context transformation data for specified query
     * @param query specified query
     */
    GetTransformationContext(query: string);
}

var qExecutor = require('./../build/Release/query-executor.node')

export var QueryExecutor: {
    new(): QueryExecutor
} = qExecutor.QueryExecutorNapi
