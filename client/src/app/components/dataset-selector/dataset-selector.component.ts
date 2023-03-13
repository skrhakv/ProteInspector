import { Component } from '@angular/core';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { DatasetService } from 'src/app/services/dataset.service';
import { Dataset } from 'src/app/models/dataset';
import { Router } from '@angular/router';

@Component({
    selector: 'app-dataset-selector',
    templateUrl: './dataset-selector.component.html',
    styleUrls: ['./dataset-selector.component.scss'], animations: [
        trigger('animation', [
            state('void', style({ opacity: 0, })),
            state('*', style({ opacity: 1, })),
            transition(':enter', animate(`600ms ease-out`)),
            transition(':leave', animate(`600ms ease-in`))
        ])
    ],
})
export class DatasetSelectorComponent {
    constructor(public datasetService: DatasetService, private router: Router) {
    }
    selectDataset(dataset: Dataset) {
        this.datasetService.selectDataset(dataset);
        setTimeout(() => {
            this.router.navigate(["/search"]);
        }, 600);
    }

}
