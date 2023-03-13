import { Component } from '@angular/core';
import { Dataset } from 'src/app/models/dataset';
import { DatasetService } from 'src/app/services/dataset.service';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { Router } from '@angular/router';

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

    constructor(public datasetService: DatasetService, private router: Router) {
    }

    clickIntroductionButton() {
        setTimeout(() => {
            this.router.navigate(["/search"]);
        }, 600);
    }
}
