export interface QueryExecutor {
    ParseAndExecute(query: string, page: number): Array<Array<string>>;
    GetNumberOfPages(query: string): number;
    GetDatasetsInfo(): Array<Array<string>>;
}

var qExecutor = require('./../build/Release/query-executor.node')

export var QueryExecutor: {
    new(): QueryExecutor
} = qExecutor.QueryExecutorNapi
