import express from 'express';
import { QueryExecutor } from './query-executor';

const app = express();
const cors = require('cors');
const port = 3000;

app.use(cors());

app.get('/datasets-info', (req, res) => {
    let executor: QueryExecutor = new QueryExecutor();
    let result = executor.GetDatasetsInfo();
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(result);
});

// curl -X GET -H "Content---verbose type: application/json"  "http://localhost:3000/data/?page=0&query=select%20*%20from%20proteins%20where%20afterpdbcode=%221btw%22" | json_pp -json_opt pretty,canonical
app.get('/data', (req, res) => {

    if (req.query === undefined || req.query.page === undefined) {
        res.send("Failed! Provide paramaters 'query' and 'page' in the URL.\n");
        return;
    }

    let query: string = (req.query.query as any) as string;
    let pageNumber: number = Number(req.query.page as any);
    let pageSize: number = Number(req.query.pageSize as any);

    let executor: QueryExecutor = new QueryExecutor();
    let result = executor.ParseAndExecute(query, pageNumber, pageSize);
    if (typeof result === 'string') {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).json(result);
        return;
    }
    else {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(result);
    }
});

// curl -X GET -H "Content---verbose type: application/json"  "http://localhost:3000/pages/?query=select%20*%20from%20proteins%20where%20afterpdbcode=%221btw%22"
app.get('/pages', (req, res) => {

    if (req.query === undefined) {
        res.send("Failed! Provide paramater 'query' in the URL.\n");
        return;
    }

    let query: any = (req.query.query as any) as string;
    let pageSize: number = Number(req.query.pageSize as any);

    let executor: QueryExecutor = new QueryExecutor();
    let result = executor.GetNumberOfPages(query, pageSize);
    

    if (typeof result === 'string') {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).json(result);
        return;
    }
    else {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(result);
    }
});

app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
});