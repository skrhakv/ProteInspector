import { Component, OnInit } from '@angular/core';
import { DatasetService } from 'src/app/services/dataset.service';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { AppSettings } from 'src/app/app-settings';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FilterService } from 'src/app/services/filter.service';
import { Metric } from 'src/app/models/metric.model';

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
    public DataReady: boolean = true;
    public emptyResult: boolean = false;

    public isBiologicalStructureSelected: boolean = false;
    public DropdownMetricItems: Metric[] = [];

    constructor(
        public datasetService: DatasetService,
        public filterService: FilterService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.pageSize = AppSettings.PAGE_SIZE;

        this.route.queryParams.subscribe(params => {
            let query = params['query'];
            let page = parseInt(params['page']);
            if (query !== null && query !== undefined && page !== null && page !== undefined) {
                datasetService.getDatasetInfo().then(_ => {
                    this.query = decodeURIComponent(query);
                    if (this.makeRequest)
                        this.sendQuery(false, page);
                });
            }
        });
    }

    sendManualQuery() {
        this.isBiologicalStructureSelected = false;
        this.DropdownMetricItems = [];

        this.sendQuery();
    }

    sendQuery(setQueryIntoRoute: boolean = true, pageNum: number = 0) {
        if (setQueryIntoRoute) {
            this.router.navigate([], {
                relativeTo: this.route,
                queryParams: {
                    query: this.encodeUri(this.query),
                    page: pageNum
                },
                queryParamsHandling: 'merge',
            });
        }

        this.makeRequest = false;
        this.DataReady = false;
        this.pageNumber = pageNum;
        this.datasetService.currentQuery = this.query;
        this.getDataFromPage(this.pageNumber);
        this.datasetService.getNumberOfPages().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
            this.numberOfPages = data;
        });
    }

    getDataFromPage(page: number) {
        this.ngUnsubscribe.next();
        this.emptyResult = false;

        this.datasetService.getQueryData(page).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
            this.TableColumnNames = data['columnNames'];
            this.TableData = data['results'];
            this.ColumnOrder = [];

            if(this.TableData.length === 0)
                this.emptyResult = true;

            for (const columnName of this.datasetService.ColumnOrder) {
                if (this.TableColumnNames.includes(columnName)) {
                    this.ColumnOrder.push(columnName);
                }
            }

            this.DataReady = true;
        },
            error => {
                this.TableColumnNames = [];
                this.TableData = [];
                this.ColumnOrder = [];
            });
    }


    changePage(page: number) {
        if (page >= this.numberOfPages || page < 0)
            return;

        this.DataReady = false;
        this.pageNumber = page;
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
                page: page
            },
            queryParamsHandling: 'merge',
        });
        this.getDataFromPage(this.pageNumber);
    }

    encodeUri(query: string): string {
        return encodeURIComponent(query);
    }

    selectBiologicalStructureType(biologicalStructureType: string) {
        this.DropdownMetricItems = [];
        this.isBiologicalStructureSelected = false;

        let [query, request] = this.filterService.selectBiologicalStructureType(biologicalStructureType);

        this.query = query;
        request.subscribe(data => {
            this.filterService.AvailableMetrics = data;
            this.isBiologicalStructureSelected = true;
            this.DropdownMetricItems.push(new Metric());
        });
    }

    specifyMetricName(index: number, metric: string, type: string) {
        if (index < 0 || index > this.DropdownMetricItems.length)
            throw "Index out of scope";
        this.DropdownMetricItems[index].name = metric;
        this.DropdownMetricItems[index].type = type;

        if (this.DropdownMetricItems[this.DropdownMetricItems.length - 1].name !== undefined)
            this.DropdownMetricItems.push(new Metric());

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
        let q = this.filterService.buildQuery(this.DropdownMetricItems);
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