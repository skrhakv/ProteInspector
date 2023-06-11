import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.scss'],
    animations: [
        trigger('animation', [
            state('void', style({ opacity: 0, })),
            state('*', style({ opacity: 1, })),
            transition(':enter', animate('600ms ease-out')),
            transition(':leave', animate('600ms ease-in'))
        ])
    ],
})
export class AboutComponent {
    constructor(private router: Router) {
    }

    clickIntroductionButton() {
        setTimeout(() => {
            this.router.navigate(['/search']);
        }, 600);
    }
}
