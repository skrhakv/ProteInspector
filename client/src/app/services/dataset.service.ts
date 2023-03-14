import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppSettings } from '../app-settings';
import { Dataset } from '../models/dataset';
import { of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DatasetService {
    public datasets: Dataset[] = [];
    public SelectedDataset!: Dataset;
    constructor(private http: HttpClient) {
        this.getDatasetInfo();
    }

    getDatasetInfo() {
        const headers = new HttpHeaders({
            'Access-Control-Allow-Origin': AppSettings.API_ENDPOINT
        });
        const options = {
            headers
        };
        return this.http.get<any>(AppSettings.API_ENDPOINT + `/datasets-info`, options).subscribe((datasetsResult) => {
            this.datasets = datasetsResult['results'];
        });
    }

    selectDataset(dataset: Dataset) {
        this.SelectedDataset = dataset;
    }

    getQueryData(query: string, page: number) {
        const headers = new HttpHeaders({
            'Access-Control-Allow-Origin': AppSettings.API_ENDPOINT
        });
        const options = {
            headers
        };
        return this.http.get<any>(AppSettings.API_ENDPOINT + `/data/?page=` + page + "&pageSize=" + AppSettings.PAGE_SIZE + "&query=" + encodeURIComponent(query), options);
    }

    getNumberOfPages(query: string) {
        const headers = new HttpHeaders({
            'Access-Control-Allow-Origin': AppSettings.API_ENDPOINT
        });
        const options = {
            headers
        };
        return this.http.get<any>(AppSettings.API_ENDPOINT + `/pages/?query=` + encodeURIComponent(query) + "&pageSize=" + AppSettings.PAGE_SIZE, options);

    }
}
