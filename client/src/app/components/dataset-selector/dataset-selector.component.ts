import { Component } from '@angular/core';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { BackendCommunicationService } from 'src/app/services/backend-communication.service';
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
    constructor(public backendCommunicationService: BackendCommunicationService, private router: Router) {
    }
    selectDataset(dataset: Dataset) {
        this.backendCommunicationService.selectDataset(dataset);
        setTimeout(() => {
            this.router.navigate(["/search"]);
        }, 600);
    }

}
