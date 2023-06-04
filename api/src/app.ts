#!/usr/bin/env node
import express from 'express';
import { QueryExecutor } from './query-executor';

const app = express();
let converter = require('json-2-csv');
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


app.get('/data/transformation-context', async (req, res) => {
    if (req.query === undefined || req.query.id === undefined || req.query.datasetId === undefined
        || req.query.biologicalStructure === undefined) {
        res.status(400).send("Failed! Provide paramaters 'id', 'biologicalStructure' and 'datasetId' in the URL.\n");
        return;
    }

    let id: string = req.query.id as string;
    let biologicalStructure: string = req.query.biologicalStructure as string;
    let datasetId: number = Number(req.query.datasetId as any);

    // get the transformation ID from the database
    let transformationId = executor.ParseAndExecute(
        `SELECT TransformationId FROM ${biologicalStructure} WHERE id=${id}`,
        datasetId)['results'][0]['TransformationId'];

    let getQuery: (structure: string) => string = (structure: string) => `SELECT * FROM ${structure} WHERE TransformationId=${transformationId}`

    // run query to the database for the transformation context from each biological structure
    let [proteins, domains, domainPairs, residues] = await Promise.all([
        executor.GetTransformationContext(getQuery("proteins"), datasetId),
        executor.GetTransformationContext(getQuery("domains"), datasetId),
        executor.GetTransformationContext(getQuery("domainPairs"), datasetId),
        executor.GetTransformationContext(getQuery("residues"), datasetId)]);

    let result = {
        "proteins": proteins,
        "domains": domains,
        "domainPairs": domainPairs,
        "residues": residues
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(result);
});

// curl -X GET -H "Content---verbose type: application/json"  "http://localhost:3000/data/?page=0&query=select%20*%20from%20proteins%20where%20afterpdbcode=%221btw%22&pageSize=100&datasetId=1" | json_pp -json_opt pretty,canonical
app.get('/data', (req, res) => {

    if (req.query === undefined || req.query.page === undefined || req.query.query === undefined
        || req.query.pageSize === undefined || req.query.datasetId === undefined) {
        res.status(400).send("Failed! Provide paramaters 'query', 'pageSize', 'datasetId' and 'page' in the URL.\n");
        return;
    }

    let query: string = req.query.query as string;
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

    let query: string = req.query.query as string;
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

// curl -X GET -H "Content---verbose type: application/json"  "http://localhost:3000/pages/?query=select%20*%20from%20proteins%20where%20afterpdbcode=%221btw%22&datasetId=1"
app.get('/count', (req, res) => {

    if (req.query === undefined || req.query.query === undefined || req.query.datasetId === undefined) {
        res.status(400).send("Failed! Provide paramaters 'query' and 'datasetId' in the URL.\n");
        return;
    }

    let query: string = req.query.query as string;
    let datasetId: number = Number(req.query.datasetId as any);

    let result = executor.GetResultCount(query, datasetId);

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

app.get('/export', async (req, res) => {
    if (req.query === undefined || req.query.query === undefined || req.query.datasetId === undefined ||
        req.query.format === undefined) {
        res.status(400).send("Failed! Provide paramaters 'query', 'format' and 'datasetId' in the URL.\n");
        return;
    }

    let query: string = req.query.query as string;
    let datasetId: number = Number(req.query.datasetId as any);
    let format: string = req.query.format as string;

    let result = executor.ParseAndExecute(query, datasetId);

    if (format === 'json') {
        var json = JSON.stringify(result['results']);
        var filename = 'results.json';
        var mimetype = 'application/json';
        res.setHeader('Content-Type', mimetype);
        res.setHeader('Content-disposition', 'attachment; filename=' + filename);
        res.send(json);
    }
    else if (format === 'csv') {
        const csv = await converter.json2csv(result['results']);
        var filename = 'results.csv';
        var mimetype = 'text/csv';
        res.setHeader('Content-Type', mimetype);
        res.setHeader('Content-disposition', 'attachment; filename=' + filename);
        res.send(csv);
    }
    else
        res.status(400).send("Failed! Unsupported format: " + format);

});


app.get('/biological-structures/:biologicalStructure', (req, res) => {

    let result = structuredClone(metrics["forward-metrics-mapping"][req.params.biologicalStructure]["data"]);
    Object.keys(result).forEach(key => delete result[key]["database-destination"]);

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(result);

});

app.get('/biological-structures', (req, res) => {

    let result = structuredClone(metrics["forward-metrics-mapping"]);
    Object.keys(result).forEach(key => delete result[key]["data"]);

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(result);

});

app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
});