import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { AppSettings } from 'src/app/app-settings';
import { DatasetService } from 'src/app/services/dataset.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { saveAs } from "file-saver";

@Component({
    selector: 'app-result-table',
    templateUrl: './result-table.component.html',
    styleUrls: ['./result-table.component.scss']
})
export class ResultTableComponent implements OnInit {
    // cancels previous requests (we don't want to spam the backend)
    protected ngUnsubscribe: Subject<void> = new Subject<void>();

    // don't make any requests before the constructor terminates
    private makeRequests: boolean = false;

    @Input() query!: string;
    @Input() structure!: string;

    public emptyResult: boolean = false;
    public pageSize: number;

    public TableColumnNames: string[] = [];
    public TableData: any[] = [];
    public ColumnOrder: string[] = [];

    public pageNumber: number = 0;
    public pageCount: number = 0;
    public resultCount: number = 0;
    public DataReady: boolean = true;
    public exportDisabled: boolean = false;

    constructor(
        private datasetService: DatasetService
    ) {        
        this.pageSize = AppSettings.PAGE_SIZE;

        let query: string | null = sessionStorage.getItem('query');
        let page: string | null = sessionStorage.getItem('page');

        if (query !== null && page !== null && page !== undefined) {
            let parsedpage: number = parseInt(page);
            datasetService.getDatasetInfo().then(_ => {
                
                // typescript complains if I don't double-check O.o
                this.query = query !== null ? query : '';
                if(query !== '')
                    this.sendQuery(false, parsedpage);

                this.makeRequests = true;
            });
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.makeRequests)
            this.sendQuery();
    }

    sendQuery(setQueryIntoSession: boolean = true, pageNum: number = 0) {
        if (setQueryIntoSession) {
            sessionStorage.setItem('query', this.query);
            sessionStorage.setItem('page', pageNum.toString());
        }

        this.resultCount = 0;
        this.DataReady = false;
        this.pageNumber = pageNum;
        this.datasetService.currentQuery = this.query;
        this.getDataFromPage(this.pageNumber);
        this.datasetService.getNumberOfResults().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
            this.resultCount = data;
        });
        this.datasetService.getPageCount().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
            this.pageCount = data;
        });

    }

    ExportResults(format: string): void {
        // Export all the results, not just the page

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

    onPaginationChanged(page: number) {
        if (page >= this.pageCount || page < 0)
            return;

        this.DataReady = false;
        this.pageNumber = page;
        sessionStorage.setItem('page', page.toString())
        this.getDataFromPage(this.pageNumber);
    }

    getDataFromPage(page: number) {
        this.ngUnsubscribe.next();
        this.emptyResult = false;

        this.datasetService.getQueryData(page, AppSettings.PAGE_SIZE).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
            next: (data: any) => {
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
