export interface QueryExecutor {
    ParseAndExecute(query: string, page: number, pageSize: number): Array<Array<string>>;
    GetNumberOfPages(query: string, pageSize: number): number;
    GetDatasetsInfo(): Array<Array<string>>;
}

var qExecutor = require('./../build/Release/query-executor.node')

export var QueryExecutor: {
    new(): QueryExecutor
} = qExecutor.QueryExecutorNapi
