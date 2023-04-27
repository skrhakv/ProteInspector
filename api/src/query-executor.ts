export interface QueryExecutor {
    ParseAndExecute(query: string, datasetId: number, page: number, pageSize: number): Array<Array<string>>;
    ParseAndExecuteWithAllMetrics(query: string, datasetId: number, page: number, pageSize: number): Array<Array<string>>;
    GetNumberOfPages(query: string, datasetId: number, pageSize: number): number;
    GetDatasetsInfo(): Array<Array<string>>;
    GetResultCount(query: string, datasetId: number): number;
    GetTransformationContext(query: string, datasetId: number, row: number): Array<Array<string>>;
}

var qExecutor = require('./../build/Release/query-executor.node')

export var QueryExecutor: {
    new(): QueryExecutor
} = qExecutor.QueryExecutorNapi
