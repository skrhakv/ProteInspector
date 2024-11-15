import { Component } from '@angular/core';
import { BackendCommunicationService } from 'src/app/services/backend-communication.service';

@Component({
    selector: 'app-navbar-layout',
    templateUrl: './navbar-layout.component.html',
    styleUrls: ['./navbar-layout.component.scss']
})
export class NavbarLayoutComponent {

    constructor(public backendCommunicationService: BackendCommunicationService) { }
}
