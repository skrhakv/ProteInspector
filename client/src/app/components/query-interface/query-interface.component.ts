import { Component, OnInit } from '@angular/core';
import { DatasetService } from 'src/app/services/dataset.service';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { AppSettings } from 'src/app/app-settings';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

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
    protected ngUnsubscribe: Subject<void> = new Subject<void>();

    public query: string = "";
    public pageSize;

    public TableColumnNames: string[] = [];
    public TableData: any[] = [];
    public pageNumber: number = 0;
    public numberOfPages: number = 0;
    public DataReady: boolean = false;

    constructor(public datasetService: DatasetService, private route: ActivatedRoute, private router: Router) {
        this.pageSize = AppSettings.PAGE_SIZE;

        this.route.queryParams.subscribe(params => {
            let query = params['query'];
            let page = parseInt(params['page']);
            if (query !== null && query !== undefined && page !== null && page !== undefined) {
                datasetService.getDatasetInfo().then(_ => {
                    this.query = decodeURIComponent(query);
                    this.sendQuery(false, page);
                });
            }
        });
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

        this.datasetService.getQueryData(page).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
            this.TableColumnNames = data['columnNames'].sort();
            this.TableData = data['results'];
            this.TableData.forEach((element: any) => {
                Object.keys(element).sort().reduce(
                    (obj: any, key: any) => {
                        obj[key] = element[key];
                        return obj;
                    },
                    {}
                );
            });
            this.DataReady = true;
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