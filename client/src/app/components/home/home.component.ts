import { Component } from '@angular/core';
import { Dataset } from 'src/app/models/dataset';
import { DatasetService } from 'src/app/services/dataset.service';
import { trigger, transition, style, animate, state } from '@angular/animations';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    animations: [
        trigger('animation', [
            state('void', style({ opacity: 0, })),
            state('*', style({ opacity: 1, })),
            transition(':enter', animate(`600ms ease-out`)),
            transition(':leave', animate(`600ms ease-in`))
        ])
    ],
})
export class HomeComponent {

    showIntroduction: boolean = true;
    showDatasets: boolean = false;
    showFilters: boolean = false;
    showPicture: boolean = true;
    query: string = "";

    constructor(public datasetService: DatasetService) {
        this.showPicture = false;
        this.showIntroduction = false;
        this.showFilters = true;
    }

    selectDataset(dataset: Dataset) {
        this.datasetService.selectDataset(dataset);

        this.showDatasets = false;
        this.showPicture = false;

        setTimeout(() => {
            this.showFilters = true;
        }, 600);
    }

    clickIntroductionButton() {
        this.showIntroduction = false;

        setTimeout(() => {
            this.showDatasets = true;
        }, 600);
    }

    sendQuery() {
        this.datasetService.sendQuery(this.query);
    }
}
