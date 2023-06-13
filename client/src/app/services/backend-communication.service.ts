import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppSettings } from '../app-settings';
import { Dataset } from '../models/dataset';
import { firstValueFrom } from 'rxjs';

/**
 * Facilitates communication with backend and can be used to get data from the backend
 */
@Injectable({
    providedIn: 'root'
})
export class BackendCommunicationService {
    /**
     * available datasets
     */
    public datasets: Dataset[] = [];
    /**
     * dataset selected by the user
     */
    public SelectedDataset!: Dataset;
    /**
     * optimal column/metric ordering
     */
    public ColumnOrder: string[] = [];
    /**
     * current query
     */
    public currentQuery = '';

    constructor(private http: HttpClient) {
        this.getDatasetInfo();
        this.getOrderInfo();
    }

    /**
     * Get ideal column/metric ordering
     */
    getOrderInfo() {
        const headers = new HttpHeaders({
            'Access-Control-Allow-Origin': AppSettings.API_ENDPOINT
        });
        const options = {
            headers
        };
        this.http.get<any>(AppSettings.API_ENDPOINT + '/order', options).subscribe(data => {
            this.ColumnOrder = data;
        });
    }

    /**
     * get available datasets
     */
    async getDatasetInfo() {
        const headers = new HttpHeaders({
            'Access-Control-Allow-Origin': AppSettings.API_ENDPOINT
        });
        const options = {
            headers
        };
        const datasetsResult = await firstValueFrom(this.http.get<any>(AppSettings.API_ENDPOINT + '/datasets-info', options));
        this.datasets = datasetsResult['results'];

        if (this.datasets.length > 0) {
            const datasetId: string | null = sessionStorage.getItem('dataset-id');
            if (datasetId) {
                const dataset = this.datasets.find(x => x.dataset_id === datasetId);
                if (dataset !== undefined)
                    this.SelectedDataset = dataset;
                else
                    this.SelectedDataset = this.datasets[0];
            }
            else
                this.SelectedDataset = this.datasets[0];

        }
        else
            console.error('No datasets returned by the server');
    }

    /**
     * select dataset
     * @param dataset specified dataset
     */
    selectDataset(dataset: Dataset) {
        this.SelectedDataset = dataset;
        sessionStorage.setItem('dataset-id', this.SelectedDataset.dataset_id);
    }

    /**
     * Get data from the particular page
     * @param page page number
     * @returns subscription
     */
    getQueryData(page: number) {
        const headers = new HttpHeaders({
            'Access-Control-Allow-Origin': AppSettings.API_ENDPOINT
        });
        const options = {
            headers
        };
        return this.http.get<any>(AppSettings.API_ENDPOINT + '/data/?page=' + page +
            '&pageSize=' + AppSettings.PAGE_SIZE + '&query=' + encodeURIComponent(this.currentQuery) +
            '&datasetId=' + this.SelectedDataset.dataset_id, options);
    }

    /**
     * Get all the data from the backend to export
     * @param format JSON or CSV
     * @returns subscription
     */
    getExportedFile(format: string) {
        const headers = new HttpHeaders({
            'Access-Control-Allow-Origin': AppSettings.API_ENDPOINT
        });

        const options = {
            headers: headers,
            responseType: 'blob' as 'json'
        };

        return this.http.get<any>(AppSettings.API_ENDPOINT + '/export/?query=' +
            encodeURIComponent(this.currentQuery) + '&datasetId=' + this.SelectedDataset.dataset_id +
            '&format=' + format, options);
    }

    /**
     * get number of pages for particular 
     * @returns 
     */
    getPageCount() {
        const headers = new HttpHeaders({
            'Access-Control-Allow-Origin': AppSettings.API_ENDPOINT
        });
        const options = {
            headers
        };
        return this.http.get<any>(AppSettings.API_ENDPOINT + '/pages/?query=' + encodeURIComponent(this.currentQuery) +
            '&pageSize=' + AppSettings.PAGE_SIZE + '&datasetId=' + this.SelectedDataset.dataset_id, options);

    }

    /**
     * get overall number of results, not considering pagination
     * @returns subscription
     */
    getNumberOfResults() {
        const headers = new HttpHeaders({
            'Access-Control-Allow-Origin': AppSettings.API_ENDPOINT
        });
        const options = {
            headers
        };
        return this.http.get<any>(AppSettings.API_ENDPOINT + '/count/?query=' + encodeURIComponent(this.currentQuery) +
            '&datasetId=' + this.SelectedDataset.dataset_id, options);


    }

    /**
     * Get data of specific row in the table results
     * @param id row id
     * @param structure structure - proteins, domains, domainpairs or residues
     * @returns subscription
     */
    getSpecificRow(id: number, structure: string) {
        const headers = new HttpHeaders({
            'Access-Control-Allow-Origin': AppSettings.API_ENDPOINT
        });
        const options = {
            headers
        };
        return this.http.get<any>(AppSettings.API_ENDPOINT + '/data/?page=' + 0 +
            '&pageSize=' + 100 + '&query=' + encodeURIComponent('SELECT * FROM ' + structure + ' WHERE id=' + id)
            , options);
    }

    /**
     * Get context transformation data of a specific row in the table results
     * @param id row id
     * @param structure structure - proteins, domains, domainpairs or residues
     * @returns subscription
     */
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
