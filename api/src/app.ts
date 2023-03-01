import express from 'express';
import { QueryExecutor } from './query-executor';

const app = express();
const port = 3000;

app.get('/data', (req, res) => {

    if (req.query === undefined || req.query.page === undefined) {
        res.send("Failed! Provide paramaters 'query' and 'page' in the URL.\n");
        return;
    }

    let query: string = (req.query.query as any) as string;
    let pageNumber: number = Number(req.query.page as any);

    let executor: QueryExecutor = new QueryExecutor();
    let result = executor.ParseAndExecute(query, pageNumber);

    res.setHeader('Content-Type', 'application/json');
    res.json(result);
});
app.get('/pages', (req, res) => {

    if (req.query === undefined) {
        res.send("Failed! Provide paramater 'query' in the URL.\n");
        return;
    }

    let query: any = (req.query.query as any) as string;

    let executor: QueryExecutor = new QueryExecutor();
    let result = executor.GetNumberOfPages(query);

    res.setHeader('Content-Type', 'application/json');
    res.json(result);
});

app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
});