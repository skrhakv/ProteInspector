export interface QueryExecutor {
    ParseAndExecute(query: string, datasetId: number, page: number, pageSize: number);
    ParseAndExecute(query: string, datasetId: number);
    ParseAndExecuteWithAllMetrics(query: string, datasetId: number, page: number, pageSize: number);
    GetNumberOfPages(query: string, datasetId: number, pageSize: number);
    GetDatasetsInfo(): Array<Array<string>>;
    GetResultCount(query: string, datasetId: number);
    GetTransformationContext(query: string, datasetId: number);
}

var qExecutor = require('./../build/Release/query-executor.node')

export var QueryExecutor: {
    new(): QueryExecutor
} = qExecutor.QueryExecutorNapi
