import { Component } from '@angular/core';
import { DatasetService } from 'src/app/services/dataset.service';
import { trigger, transition, style, animate, state } from '@angular/animations';

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
    private currentQuery = "";

    public TableColumnNames: string[] = [];
    public TableData: any[] = [];
    public pageNumber: number = 0;
    public numberOfPages: number = 0;

    constructor(public datasetService: DatasetService) {
        // TODO: delete this
        this.sendQuery();
    }

    sendQuery() {
        this.pageNumber = 0;
        this.currentQuery = this.query;
        this.getDataFromPage(this.pageNumber, this.currentQuery);
        this.datasetService.getNumberOfPages(this.query).subscribe(data => {
            this.numberOfPages = data;
        });
    }

    getDataFromPage(page: number, query: string) {
        this.datasetService.getQueryData(query, page).subscribe(data => {
            this.TableColumnNames = data['columnNames'];
            this.TableData = data['results'];
        });
    }

    changePage(page: number) {
        if (page >= this.numberOfPages || page < 0)
            return;

        this.pageNumber = page;
        this.getDataFromPage(this.pageNumber, this.currentQuery);
    }
}
