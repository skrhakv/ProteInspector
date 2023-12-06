import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AppSettings } from 'src/app/app-settings';
import { BackendCommunicationService } from 'src/app/services/backend-communication.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { saveAs } from 'file-saver';

@Component({
    selector: 'app-result-table',
    templateUrl: './result-table.component.html',
    styleUrls: ['./result-table.component.scss']
})
export class ResultTableComponent implements OnInit, OnChanges {
    /**
     * cancels previous requests (we don't want to spam the backend)
     */
    protected ngUnsubscribe: Subject<void> = new Subject<void>();

    /**
     * don't make any requests before the constructor terminates 
     */ 
    private makeRequests = false;
    /**
     * query inputed by the user
     */
    @Input() query!: string;
    @Input() structure!: string;

    /**
     * true if user was empty
     */
    public emptyResult = false;
    public showLoader = false;

    public pageSize: number;

    /**
     * Storage for all the column names returned by the backend
     */
    public TableColumnNames: string[] = [];
    /**
     * Storage for all the data returned by the backend
     */
    public TableData: any[] = [];
    /**
     * Ideal ordering of the columns
     */
    public ColumnOrder: string[] = [];

    public pageNumber = 0;
    public pageCount = 0;

    /**
     * Number of results overall, not considering pagination
     */
    public resultCount = 0;
    /**
     * True if valid transformation data was received from the backend
     */
    public DataReady = true;
    /**
     * guard spamming the backend with requests
     */
    public exportDisabled = false;

    constructor(
        private backendCommunicationService: BackendCommunicationService
    ) {
        this.pageSize = AppSettings.PAGE_SIZE;

        const query: string | null = sessionStorage.getItem('query');
        const page: string | null = sessionStorage.getItem('page');

        if (query !== null && page !== null && page !== undefined) {
            const parsedpage: number = parseInt(page);
            backendCommunicationService.getDatasetInfo().then(_ => {
                
                // typescript complains if I don't double-check O.o
                this.query = query !== null ? query : '';
                if (query !== '')
                    this.sendQuery(false, parsedpage);

                this.makeRequests = true;
            });
        }
        else this.makeRequests = true;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.makeRequests)
            this.sendQuery();
    }

    /**
     * Sends query to the backend and retrieves results
     * @param setQueryIntoSession if we want to put the query into the session storage
     * @param pageNum page number
     */
    sendQuery(setQueryIntoSession = true, pageNum = 0) {
        if (setQueryIntoSession) {
            sessionStorage.setItem('query', this.query);
            sessionStorage.setItem('page', pageNum.toString());
        }

        this.resultCount = 0;
        this.DataReady = false;
        this.pageNumber = pageNum;
        this.backendCommunicationService.currentQuery = this.query;
        this.getDataFromPage(this.pageNumber);
        this.backendCommunicationService.getNumberOfResults().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
            this.resultCount = data;
        });
        this.backendCommunicationService.getPageCount().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
            this.pageCount = data;
        });

    }

    /**
     * Trigger result export
     * @param format 'JSON' or 'CSV'
     */
    ExportResults(format: string): void {
        // Export all the results, not just the page

        let filename: string;
        this.exportDisabled = true;

        if (format === 'JSON')
            filename = 'results.json';

        else if (format === 'CSV')
            filename = 'results.csv';
        else
            throw 'Unknown format, valid formats are: JSON, CSV';

        this.backendCommunicationService.getExportedFile(format.toLowerCase()).subscribe({
            next: (blob) => {
                saveAs(blob, filename);
                this.exportDisabled = false;
            },
            error: (e) => {
                console.error('Error downloading file: ', e);
                this.exportDisabled = false;
            }
        });
    }

    /**
     * triggers changing page
     * @param page page number
     */
    onPaginationChanged(page: number) {
        if (page >= this.pageCount || page < 0)
            return;

        this.DataReady = false;
        this.pageNumber = page;
        sessionStorage.setItem('page', page.toString());
        this.getDataFromPage(this.pageNumber);
    }

    /**
     * Get data for particular page
     * @param page page number
     */
    getDataFromPage(page: number) {
        this.ngUnsubscribe.next();
        this.emptyResult = false;
        this.showLoader = true;
        this.backendCommunicationService.getQueryData(page).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
            next: (data: any) => {
                this.TableColumnNames = data['columnNames'];
                this.TableData = data['results'];
                this.ColumnOrder = [];

                if (this.TableData.length === 0)
                    this.emptyResult = true;

                for (const columnName of this.backendCommunicationService.ColumnOrder) {
                    if (this.TableColumnNames.includes(columnName)) {
                        this.ColumnOrder.push(columnName);
                    }
                }

                this.DataReady = true;
                this.showLoader = false;
            },
            error: (e) => {
                console.error(e);
                this.TableColumnNames = [];
                this.TableData = [];
                this.ColumnOrder = [];
                this.showLoader = false;
            }
        });
    }

    public ngOnInit(): void {
        const element: HTMLElement = <HTMLElement>document.getElementById('fixed-thead');
        if (element !== null) {
            const parentElement: HTMLElement = <HTMLElement>element.parentElement;
            window.addEventListener('scroll', () => {
                const coordinates = parentElement.getBoundingClientRect();
                if (coordinates.y < 0) {
                    element.style.transform = 'translate3d(0, ' + (-coordinates.y) + 'px, 0)';
                } else {
                    element.style.transform = 'translate3d(0,0,0)';
                }
            });
        }
    }

}
