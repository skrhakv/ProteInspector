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
            transition(':enter', animate(`600ms ease-out`)),
            transition(':leave', animate(`600ms ease-in`))
        ])
    ],
})
export class QueryInterfaceComponent {
    public query: string = "";
    public finishedQuery: string = "";
    
    public metricsOrder: string[] = []
    public isBiologicalStructureSelected: boolean = false;
    public DropdownMetricItems: Metric[] = [];
    public SortingMetric: SortMetric = new SortMetric();
    public structure!: string;
    constructor(
        public filterService: FilterService
    ) {
        let queryFromSessionStorage: string | null = sessionStorage.getItem('query');
        this.query = queryFromSessionStorage !== null ? queryFromSessionStorage : '';
    }

    updateQueryAttributes() {
        this.structure = this.getStructure();
        this.finishedQuery = this.query;
    }

    submitRegularQuery() {
        this.buildFilterQuery();
        this.updateQueryAttributes();
    }

    submitCustomQuery() {
        this.isBiologicalStructureSelected = false;
        this.DropdownMetricItems = [];
        this.metricsOrder = [];
        this.updateQueryAttributes();
    }

    private getStructure(): string {
        let tokens: string[] = this.query.toLowerCase().split(' ');
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

    selectBiologicalStructureType(event: any) {
        let biologicalStructureType = event.target.value;
        this.DropdownMetricItems = [];
        this.metricsOrder = [];
        this.isBiologicalStructureSelected = false;

        let [query, request] = this.filterService.selectBiologicalStructureType(biologicalStructureType);

        this.query = query;
        request.subscribe(data => {
            Object.keys(data).forEach(key => {
                if (data[key]["name"] === undefined || data[key]["name"] === "")
                    delete data[key];
                else
                    this.metricsOrder.push(key);
            });
            this.filterService.AvailableMetrics = data;
            this.isBiologicalStructureSelected = true;
            this.DropdownMetricItems.push(new Metric());
        });
    }

    specifyMetricName(dropdownMetricItemsIndex: number, event: any) {
        let metric = event.target.value;
        let type: string = this.filterService.AvailableMetrics[metric]["type"];

        if (dropdownMetricItemsIndex < 0 || dropdownMetricItemsIndex > this.DropdownMetricItems.length)
            throw "Index out of scope";
        this.DropdownMetricItems[dropdownMetricItemsIndex].name = metric;
        this.DropdownMetricItems[dropdownMetricItemsIndex].type = type;

        if (this.DropdownMetricItems[this.DropdownMetricItems.length - 1].name !== undefined)
            this.DropdownMetricItems.push(new Metric());

        this.buildFilterQuery();
    }

    specifySortingMetric(event: any) {
        let metric = event.target.value;
        this.SortingMetric.name = metric;

        this.buildFilterQuery();
    }

    removeMetric(index: number) {
        if (this.DropdownMetricItems[index].name !== undefined)
            this.DropdownMetricItems.splice(index, 1);

        this.buildFilterQuery();
    }

    buildFilterQuery() {
        let q = this.filterService.buildQuery(this.DropdownMetricItems, this.SortingMetric);
        this.query = q;
    }

    metricInputChanged() {
        this.buildFilterQuery();
    }

    onEnterDownInCustomQueryTextbox(event: any) {
        event.preventDefault();
        this.submitCustomQuery();
    }
}