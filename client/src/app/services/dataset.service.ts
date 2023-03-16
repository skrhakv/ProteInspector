import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppSettings } from '../app-settings';
import { Dataset } from '../models/dataset';
import { firstValueFrom, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DatasetService {
    public datasets: Dataset[] = [];
    public SelectedDataset!: Dataset;
    public currentQuery = "";

    constructor(private http: HttpClient) {
        this.getDatasetInfo();
    }

    async getDatasetInfo() {
        const headers = new HttpHeaders({
            'Access-Control-Allow-Origin': AppSettings.API_ENDPOINT
        });
        const options = {
            headers
        };
        let datasetsResult = await firstValueFrom(this.http.get<any>(AppSettings.API_ENDPOINT + `/datasets-info`, options));
        this.datasets = datasetsResult['results'];
        if (this.datasets.length > 0)
            this.SelectedDataset = this.datasets[0];
        else
            console.error("No datasets returned by the server");
    }

    selectDataset(dataset: Dataset) {
        this.SelectedDataset = dataset;
    }

    getQueryData(page: number) {
        const headers = new HttpHeaders({
            'Access-Control-Allow-Origin': AppSettings.API_ENDPOINT
        });
        const options = {
            headers
        };
        return this.http.get<any>(AppSettings.API_ENDPOINT + `/data/?page=` + page +
            "&pageSize=" + AppSettings.PAGE_SIZE + "&query=" + encodeURIComponent(this.currentQuery) +
            "&datasetId=" + this.SelectedDataset.dataset_id, options);
    }

    getNumberOfPages() {
        const headers = new HttpHeaders({
            'Access-Control-Allow-Origin': AppSettings.API_ENDPOINT
        });
        const options = {
            headers
        };
        return this.http.get<any>(AppSettings.API_ENDPOINT + `/pages/?query=` + encodeURIComponent(this.currentQuery) +
            "&pageSize=" + AppSettings.PAGE_SIZE + "&datasetId=" + this.SelectedDataset.dataset_id, options);

    }
    getSpecificRow(row: number) {
        const headers = new HttpHeaders({
            'Access-Control-Allow-Origin': AppSettings.API_ENDPOINT
        });
        const options = {
            headers
        };

        return this.http.get<any>(AppSettings.API_ENDPOINT + `/data/specific-row/?row=` + row
            + "&query=" + encodeURIComponent(this.currentQuery) + "&datasetId=" + this.SelectedDataset.dataset_id, options);
    }
}
