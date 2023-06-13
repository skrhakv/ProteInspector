import { Component } from '@angular/core';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { FilterService } from 'src/app/services/filter.service';
import { Metric } from 'src/app/models/metric.model';
import { SortMetric } from 'src/app/models/sort-metric.model';

@Component({
    selector: 'app-query-interface',
    templateUrl: './query-interface.component.html',
    styleUrls: ['./query-interface.component.scss'],
    animations: [
        trigger('animation', [
            state('void', style({ opacity: 0, })),
            state('*', style({ opacity: 1, })),
            transition(':enter', animate('600ms ease-out')),
            transition(':leave', animate('600ms ease-in'))
        ])
    ],
})
export class QueryInterfaceComponent {
    /**
     * query connected with the textbox
     */
    public query = '';
    /**
     * query which is sent to the result table only when the query is finished 
     */
    public finishedQuery = '';
    
    /**
     * Ideal ordering of the metrics in the dropdown menu
     */
    public metricsOrder: string[] = [];
    /**
     * true if user selected a biological structure in the dropdown
     */
    public isBiologicalStructureSelected = false;
    /**
     * selected metrics for building the 'WHERE' clause
     */
    public DropdownMetricItems: Metric[] = [];
    /**
     * selected metrics for building 'ORDER BY' clause
     */
    public SortingMetric: SortMetric = new SortMetric();
    public structure!: string;
    constructor(
        public filterService: FilterService
    ) {
        const queryFromSessionStorage: string | null = sessionStorage.getItem('query');
        this.query = queryFromSessionStorage !== null ? queryFromSessionStorage : '';
        this.structure = this.getStructure();
    }

    updateQueryAttributes() {
        this.structure = this.getStructure();
        this.finishedQuery = this.query;
    }

    /**
     * submit query using dropdown menus
     */
    submitRegularQuery() {
        this.buildFilterQuery();
        this.updateQueryAttributes();
    }

    /**
     * submit query using the textbox
     */
    submitCustomQuery() {
        this.isBiologicalStructureSelected = false;
        this.DropdownMetricItems = [];
        this.metricsOrder = [];
        this.updateQueryAttributes();
    }

    private getStructure(): string {
        const tokens: string[] = this.query.toLowerCase().split(' ');
        if (tokens.includes('proteins'))
            return 'proteins';
        if (tokens.includes('domains'))
            return 'domains';
        if (tokens.includes('domainpairs'))
            return 'domainpairs';
        if (tokens.includes('residues'))
            return 'residues';
        else return '';
    }

    /**
     * User specified the biological structure using the dropdown menu
     * @param event event
     */
    selectBiologicalStructureType(event: any) {
        const biologicalStructureType = event.target.value;
        this.DropdownMetricItems = [];
        this.metricsOrder = [];
        this.isBiologicalStructureSelected = false;

        const [query, request] = this.filterService.loadAvailableStructuralMetrics(biologicalStructureType);

        this.query = query;
        request.subscribe(data => {
            Object.keys(data).forEach(key => {
                if (data[key]['name'] === undefined || data[key]['name'] === '')
                    delete data[key];
                else
                    this.metricsOrder.push(key);
            });
            this.filterService.AvailableMetrics = data;
            this.isBiologicalStructureSelected = true;
            this.DropdownMetricItems.push(new Metric());
        });
    }

    /**
     * User specified a metric using the dropdown menu
     * @param dropdownMetricItemsIndex Which metric is being updated/added
     * @param event event
     */
    specifyMetricName(dropdownMetricItemsIndex: number, event: any) {
        const metric = event.target.value;
        const type: string = this.filterService.AvailableMetrics[metric]['type'];

        if (dropdownMetricItemsIndex < 0 || dropdownMetricItemsIndex > this.DropdownMetricItems.length)
            throw 'Index out of scope';
        this.DropdownMetricItems[dropdownMetricItemsIndex].name = metric;
        this.DropdownMetricItems[dropdownMetricItemsIndex].type = type;

        if (this.DropdownMetricItems[this.DropdownMetricItems.length - 1].name !== undefined)
            this.DropdownMetricItems.push(new Metric());

        this.buildFilterQuery();
    }

    /**
     * User specified a sorting metric using the dropdown menu
     * @param event 
     */
    specifySortingMetric(event: any) {
        const metric = event.target.value;
        this.SortingMetric.name = metric;

        this.buildFilterQuery();
    }

    /**
     * User deleted a metric in the dropdown menu
     * @param event 
     */
    removeMetric(index: number) {
        if (this.DropdownMetricItems[index].name !== undefined)
            this.DropdownMetricItems.splice(index, 1);

        this.buildFilterQuery();
    }

    /**
     * delegates building the query to the filter service
     */
    buildFilterQuery() {
        const buildedQuery = this.filterService.buildQuery(this.DropdownMetricItems, this.SortingMetric);
        this.query = buildedQuery;
    }

    metricInputChanged() {
        this.buildFilterQuery();
    }

    onEnterDownInCustomQueryTextbox(event: any) {
        event.preventDefault();
        this.submitCustomQuery();
    }
}