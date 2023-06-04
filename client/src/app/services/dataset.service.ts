import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppSettings } from '../app-settings';
import { Dataset } from '../models/dataset';
import { firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DatasetService {
    public datasets: Dataset[] = [];
    public SelectedDataset!: Dataset;
    public ColumnOrder: string[] = [];
    public currentQuery = "";

    constructor(private http: HttpClient) {
        this.getDatasetInfo();
        this.getOrderInfo();
    }

    getOrderInfo() {
        const headers = new HttpHeaders({
            'Access-Control-Allow-Origin': AppSettings.API_ENDPOINT
        });
        const options = {
            headers
        };
        this.http.get<any>(AppSettings.API_ENDPOINT + `/order`, options).subscribe(data => {
            this.ColumnOrder = data;
        });
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

        if (this.datasets.length > 0) {
            let datasetId: string | null = sessionStorage.getItem('dataset-id');
            if (datasetId) {
                let dataset = this.datasets.find(x => x.dataset_id === datasetId);
                if (dataset !== undefined)
                    this.SelectedDataset = dataset;
                else
                    this.SelectedDataset = this.datasets[0];
            }
            else
                this.SelectedDataset = this.datasets[0];

        }
        else
            console.error("No datasets returned by the server");
    }

    selectDataset(dataset: Dataset) {
        this.SelectedDataset = dataset;
        sessionStorage.setItem("dataset-id", this.SelectedDataset.dataset_id);
    }

    getQueryData(page: number, pageSize: number) {
        const headers = new HttpHeaders({
            'Access-Control-Allow-Origin': AppSettings.API_ENDPOINT
        });
        const options = {
            headers
        };
        return this.http.get<any>(AppSettings.API_ENDPOINT + `/data/?page=` + page +
            "&pageSize=" + pageSize + "&query=" + encodeURIComponent(this.currentQuery) +
            "&datasetId=" + this.SelectedDataset.dataset_id, options);
    }

    getExportedFile(format: string) {
        const headers = new HttpHeaders({
            'Access-Control-Allow-Origin': AppSettings.API_ENDPOINT
        });

        const options = {
            headers: headers,
            responseType: 'blob' as 'json'
        }

        return this.http.get<any>(AppSettings.API_ENDPOINT + `/export/?query=` +
            encodeURIComponent(this.currentQuery) + "&datasetId=" + this.SelectedDataset.dataset_id +
            "&format=" + format, options);
    }

    getPageCount() {
        const headers = new HttpHeaders({
            'Access-Control-Allow-Origin': AppSettings.API_ENDPOINT
        });
        const options = {
            headers
        };
        return this.http.get<any>(AppSettings.API_ENDPOINT + `/pages/?query=` + encodeURIComponent(this.currentQuery) +
            "&pageSize=" + AppSettings.PAGE_SIZE + "&datasetId=" + this.SelectedDataset.dataset_id, options);

    }

    getNumberOfResults() {
        const headers = new HttpHeaders({
            'Access-Control-Allow-Origin': AppSettings.API_ENDPOINT
        });
        const options = {
            headers
        };
        return this.http.get<any>(AppSettings.API_ENDPOINT + `/count/?query=` + encodeURIComponent(this.currentQuery) +
            "&datasetId=" + this.SelectedDataset.dataset_id, options);


    }

    getSpecificRow(id: number, structure: string) {
        const headers = new HttpHeaders({
            'Access-Control-Allow-Origin': AppSettings.API_ENDPOINT
        });
        const options = {
            headers
        };
        return this.http.get<any>(AppSettings.API_ENDPOINT + `/data/?page=` + 0 +
            "&pageSize=" + 100 + "&query=" + encodeURIComponent(`SELECT * FROM ` + structure + ` WHERE id=` + id) +
            "&datasetId=" + this.SelectedDataset.dataset_id, options);
    }

    getTransformationContext(id: number, biologicalStructure: string) {
        const headers = new HttpHeaders({
            'Access-Control-Allow-Origin': AppSettings.API_ENDPOINT
        });
        const options = {
            headers
        };
        return this.http.get<any>(AppSettings.API_ENDPOINT +
            `/data/transformation-context/?id=${id}&biologicalStructure=${biologicalStructure}&datasetId=${this.SelectedDataset.dataset_id}`
            , options);
    }
}
