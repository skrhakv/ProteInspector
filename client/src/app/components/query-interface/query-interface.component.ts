import { Component } from '@angular/core';
import { DatasetService } from 'src/app/services/dataset.service';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { AppSettings } from 'src/app/app-settings';

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
    public pageSize;

    public TableColumnNames: string[] = [];
    public TableData: any[] = [];
    public pageNumber: number = 0;
    public numberOfPages: number = 0;

    constructor(public datasetService: DatasetService) {
        this.pageSize = AppSettings.PAGE_SIZE;
    }

    sendQuery() {
        this.pageNumber = 0;
        this.datasetService.currentQuery = this.query;
        this.getDataFromPage(this.pageNumber);
        this.datasetService.getNumberOfPages().subscribe(data => {
            this.numberOfPages = data;
        });
    }

    getDataFromPage(page: number) {
        this.datasetService.getQueryData(page).subscribe(data => {
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
        });
    }

    changePage(page: number) {
        if (page >= this.numberOfPages || page < 0)
            return;

        this.pageNumber = page;
        this.getDataFromPage(this.pageNumber);
    }
}