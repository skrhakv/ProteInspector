import { Component } from '@angular/core';
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
            transition(':enter', animate('600ms ease-out')),
            transition(':leave', animate('600ms ease-in'))
        ])
    ],
})
export class HomeComponent {

    constructor(private router: Router) {
    }

    clickIntroductionButton() {

        // timeout for the animation
        setTimeout(() => {
            this.router.navigate(['/search']);
        }, 600);
    }
}
