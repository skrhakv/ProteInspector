import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppSettings } from '../app-settings';
import { Metric } from '../models/metric.model';

@Injectable({
    providedIn: 'root'
})
export class FilterService {
    public BiologicalStructureTypes!: Record<string, Record<string, string>>;
    public AvailableMetrics!: Record<string, Record<string, string>>;

    private selectedBiologicalStructureType!: string;

    constructor(private http: HttpClient) {
        this.getBiologicalStructureTypes().subscribe(data => {
            this.BiologicalStructureTypes = data;
        });
    }

    getBiologicalStructureTypes() {
        const headers = new HttpHeaders({
            'Access-Control-Allow-Origin': AppSettings.API_ENDPOINT
        });
        const options = {
            headers
        };
        return this.http.get<any>(AppSettings.API_ENDPOINT + `/biological-structures`, options);
    }

    selectBiologicalStructureType(biologicalStructureType: string): [string, Observable<any>] {
        this.selectedBiologicalStructureType = biologicalStructureType;
        let query: string = this.buildSelectStatement();

        const headers = new HttpHeaders({
            'Access-Control-Allow-Origin': AppSettings.API_ENDPOINT
        });
        const options = {
            headers
        };

        let request = this.http.get<any>(AppSettings.API_ENDPOINT + `/biological-structures/` + biologicalStructureType, options);

        return [query, request];
    }

    buildQuery(metrics: Metric[]): string {
        let query: string = this.buildSelectStatement();
        let error: string;
        if (metrics.length === 0)
            return query;

        let first: boolean = true;

        for (let metric of metrics) {
            if (!this.validString(metric.name))
                continue;

            if (!this.validString(metric.value)) {
                continue;
            }

            if (!first)
                query += " AND ";
            
            else {
                query += " WHERE ";
                first = false;
            }

            if (metric.type === 'string')
                query += metric.name + " " + metric.comparator + " \"" + metric.value + "\"";

            else
                query += metric.name + " " + metric.comparator + " " + metric.value;
        }
        return query;
    }

    private validString(s: string): boolean {
        return (s !== undefined && s !== null && s !== "");
    }

    private buildSelectStatement(): string {
        return "SELECT * FROM " + this.selectedBiologicalStructureType;
    }
}
