import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppSettings } from '../app-settings';
import { Metric } from '../models/metric.model';
import { SortMetric } from '../models/sort-metric.model';
/**
 * Handles building of the query from the specified metrics
 */
@Injectable({
    providedIn: 'root'
})
export class FilterService {
    /**
     * Available biological structures
     */
    public BiologicalStructureTypes!: Record<string, Record<string, string>>;
    /**
     * Available metrics for each biological structure
     */
    public AvailableMetrics!: Record<string, Record<string, string>>;

    private selectedBiologicalStructureType!: string;

    constructor(private http: HttpClient) {
        this.getBiologicalStructureTypes().subscribe(data => {
            this.BiologicalStructureTypes = data;
        });
    }

    /**
     * Loads available biological structures
     * @returns subscription
     */
    getBiologicalStructureTypes() {
        const headers = new HttpHeaders({
            'Access-Control-Allow-Origin': AppSettings.API_ENDPOINT
        });
        const options = {
            headers
        };
        return this.http.get<any>(AppSettings.API_ENDPOINT + '/biological-structures', options);
    }

    /**
     * Loads available metrics for each biological structure
     * @param biologicalStructureType biological structure - proteins, domains, domainpairs, residues
     * @returns subscription
     */
    loadAvailableStructuralMetrics(biologicalStructureType: string): [string, Observable<any>] {
        this.selectedBiologicalStructureType = biologicalStructureType;
        const query: string = this.buildSelectStatement();

        const headers = new HttpHeaders({
            'Access-Control-Allow-Origin': AppSettings.API_ENDPOINT
        });
        const options = {
            headers
        };

        const request = this.http.get<any>(AppSettings.API_ENDPOINT + '/biological-structures/' + biologicalStructureType, options);
        
        return [query, request];
    }

    /**
     * Builds the query
     * @param metrics specified metrics for WHERE clause
     * @param sortingMetric specified metrics for ORDER BY clause
     * @returns query
     */
    buildQuery(metrics: Metric[], sortingMetric: SortMetric): string {
        let query: string = this.buildSelectStatement();
        if (metrics.length === 0)
            return query;

        let first = true;

        for (const metric of metrics) {
            if (!this.validString(metric.name))
                continue;

            if (!this.validString(metric.value)) {
                continue;
            }

            if (!first)
                query += ' AND ';

            else {
                query += ' WHERE ';
                first = false;
            }

            if (metric.type === 'string')
                query += metric.name + ' ' + metric.comparator + ' "' + metric.value + '"';

            else
                query += metric.name + ' ' + metric.comparator + ' ' + metric.value;
        }

        if (sortingMetric.name !== undefined) {
            query += ' ORDER BY ' + sortingMetric.name + ' ' + sortingMetric.order;
        }

        return query;
    }

    private validString(s: string): boolean {
        return (s !== undefined && s !== null && s !== '');
    }

    private buildSelectStatement(): string {
        return 'SELECT * FROM ' + this.selectedBiologicalStructureType;
    }
}
