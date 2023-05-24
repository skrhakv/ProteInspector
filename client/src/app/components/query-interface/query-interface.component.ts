import { Component, OnInit } from '@angular/core';
import { DatasetService } from 'src/app/services/dataset.service';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { AppSettings } from 'src/app/app-settings';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FilterService } from 'src/app/services/filter.service';
import { Metric } from 'src/app/models/metric.model';
import { SortMetric } from 'src/app/models/sort-metric.model';
import { saveAs } from "file-saver";

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
export class QueryInterfaceComponent implements OnInit {
    // cancels previous requests (we don't want to spam the backend)
    protected ngUnsubscribe: Subject<void> = new Subject<void>();
    // when we change the URL query, the constructor is called; this guard prevents to call another sendQuery(), so the request won't be called twice
    private makeRequest: boolean = true;

    public query: string = "";
    public pageSize;

    public TableColumnNames: string[] = [];
    public TableData: any[] = [];
    public ColumnOrder: string[] = [];

    public pageNumber: number = 0;
    public numberOfPages: number = 0;
    public resultCount: number = 0;
    public DataReady: boolean = true;
    public emptyResult: boolean = false;
    public metricsOrder: string[] = []
    public exportDisabled: boolean = false;

    public isBiologicalStructureSelected: boolean = false;
    public DropdownMetricItems: Metric[] = [];
    public SortingMetric: SortMetric = new SortMetric();
    public structure!: string;
    constructor(
        public datasetService: DatasetService,
        public filterService: FilterService
    ) {
        this.pageSize = AppSettings.PAGE_SIZE;

        let query: string | null = sessionStorage.getItem('query');
        let page: string | null = sessionStorage.getItem('page');
        if (query !== null && page !== null && page !== undefined) {
            let parsedpage: number = parseInt(page);
            datasetService.getDatasetInfo().then(_ => {
                this.query = query !== null ? query : '';
                if (this.makeRequest)
                    this.sendQuery(false, parsedpage);

            });
        }
    }

    sendManualQuery() {
        this.isBiologicalStructureSelected = false;
        this.DropdownMetricItems = [];
        this.metricsOrder = [];

        this.sendQuery();
    }

    sendQuery(setQueryIntoRoute: boolean = true, pageNum: number = 0) {
        if (setQueryIntoRoute) {
            sessionStorage.setItem('query', this.query);
            sessionStorage.setItem('page', pageNum.toString());
        }

        this.resultCount = 0;
        this.makeRequest = false;
        this.DataReady = false;
        this.pageNumber = pageNum;
        this.datasetService.currentQuery = this.query;
        this.structure = this.getStructure();
        this.getDataFromPage(this.pageNumber);
        this.datasetService.getNumberOfResults().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
            this.resultCount = data;
        });
        this.datasetService.getNumberOfPages().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
            this.numberOfPages = data;
        });

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

    getDataFromPage(page: number) {
        this.ngUnsubscribe.next();
        this.emptyResult = false;

        this.datasetService.getQueryData(page, AppSettings.PAGE_SIZE).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
            next: data => {
                this.TableColumnNames = data['columnNames'];
                this.TableData = data['results'];
                this.ColumnOrder = [];

                if (this.TableData.length === 0)
                    this.emptyResult = true;

                for (const columnName of this.datasetService.ColumnOrder) {
                    if (this.TableColumnNames.includes(columnName)) {
                        this.ColumnOrder.push(columnName);
                    }
                }

                this.DataReady = true;
            },
            error: (e) => {
                console.error(e);
                this.TableColumnNames = [];
                this.TableData = [];
                this.ColumnOrder = [];
            }
        });
    }

    ExportResults(format: string): void {
        // Get all the results, not just the page

        let filename: string;
        this.exportDisabled = true;

        if (format === 'JSON')
            filename = 'results.json';

        else if (format === 'CSV')
            filename = 'results.csv'
        else
            throw "Unknown format, valid formats are: JSON, CSV";

        this.datasetService.getExportedFile(format.toLowerCase()).subscribe({
            next: (blob) => {
                saveAs(blob, filename);
                this.exportDisabled = false;
            },
            error: (e) => {
                console.error("Error downloading file: ", e);
                this.exportDisabled = false;
            }
        });
    }

    changePage(page: number) {
        if (page >= this.numberOfPages || page < 0)
            return;

        this.DataReady = false;
        this.pageNumber = page;
        sessionStorage.setItem('page', page.toString())
        this.getDataFromPage(this.pageNumber);
    }

    encodeUri(query: string): string {
        return encodeURIComponent(query);
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

    submitFilterQuery() {
        this.buildFilterQuery();
        this.sendQuery();
    }

    buildFilterQuery() {
        let q = this.filterService.buildQuery(this.DropdownMetricItems, this.SortingMetric);
        this.query = q;
    }

    metricInputChanged() {
        this.buildFilterQuery();
    }

    onEnterDownInTextArea(event: any) {
        event.preventDefault();
        this.sendManualQuery();
    }

    public ngOnInit(): void {
        var element: HTMLElement = <HTMLElement>document.getElementById("fixed-thead");
        if (element !== null) {
            var parentElement: HTMLElement = <HTMLElement>element.parentElement;
            window.addEventListener('scroll', () => {
                var coordinates = parentElement.getBoundingClientRect();
                if (coordinates.y < 0) {
                    element.style.transform = 'translate3d(0, ' + (-coordinates.y) + 'px, 0)';
                } else {
                    element.style.transform = 'translate3d(0,0,0)';
                }
            });
        }
    }
}