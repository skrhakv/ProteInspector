import express from 'express';
import { QueryExecutor } from './query-executor';

const app = express();
const cors = require('cors');
var metrics = require('../metrics.json');
const port = 3000;
const executor: QueryExecutor = new QueryExecutor();

app.use(cors());

app.get('/datasets-info', (req, res) => {
    let result = executor.GetDatasetsInfo();
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(result);
});

app.get('/data/specific-row', (req, res) => {
    if (req.query === undefined || req.query.row === undefined || req.query.query === undefined || req.query.datasetId === undefined) {
        res.status(400).send("Failed! Provide paramaters 'query', 'datasetId' and 'row' in the URL.\n");
        return;
    }

    let query: string = (req.query.query as any) as string;
    let row: number = Number(req.query.row as any);
    let datasetId: number = Number(req.query.datasetId as any);

    let result = executor.ParseAndExecuteWithAllMetrics(query, datasetId, row, 1);

    if (typeof result === 'string') {
        res.setHeader('Content-Type', 'application/json');
        console.error(result);
        res.status(400).json(result);
        return;
    }
    else {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(result);
    }
});

// curl -X GET -H "Content---verbose type: application/json"  "http://localhost:3000/data/?page=0&query=select%20*%20from%20proteins%20where%20afterpdbcode=%221btw%22&pageSize=100" | json_pp -json_opt pretty,canonical
app.get('/data', (req, res) => {

    if (req.query === undefined || req.query.page === undefined || req.query.query === undefined
        || req.query.pageSize === undefined || req.query.datasetId === undefined) {
        res.status(400).send("Failed! Provide paramaters 'query', 'pageSize', 'datasetId' and 'page' in the URL.\n");
        return;
    }

    let query: string = (req.query.query as any) as string;
    let pageNumber: number = Number(req.query.page as any);
    let pageSize: number = Number(req.query.pageSize as any);
    let datasetId: number = Number(req.query.datasetId as any);

    let result = executor.ParseAndExecute(query, datasetId, pageNumber, pageSize);

    if (typeof result === 'string') {
        res.setHeader('Content-Type', 'application/json');
        console.error(result);
        res.status(400).json(result);
        return;
    }
    else {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(result);
    }
});

// curl -X GET -H "Content---verbose type: application/json"  "http://localhost:3000/pages/?query=select%20*%20from%20proteins%20where%20afterpdbcode=%221btw%22&pageSize=100"
app.get('/pages', (req, res) => {

    if (req.query === undefined || req.query.query === undefined || req.query.pageSize === undefined || req.query.datasetId === undefined) {
        res.status(400).send("Failed! Provide paramaters 'query', 'datasetId' and 'pageSize' in the URL.\n");
        return;
    }

    let query: any = (req.query.query as any) as string;
    let pageSize: number = Number(req.query.pageSize as any);
    let datasetId: number = Number(req.query.datasetId as any);

    let result = executor.GetNumberOfPages(query, datasetId, pageSize);

    if (typeof result === 'string') {
        res.setHeader('Content-Type', 'application/json');
        console.error(result);
        res.status(400).json(result);
        return;
    }
    else {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(result);
    }
});

app.get('/order', (req, res) => {

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(metrics["order"]);

});

app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
});