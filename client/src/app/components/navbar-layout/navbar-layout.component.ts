import { Component } from '@angular/core';
import { Dataset } from 'src/app/models/dataset';
import { DatasetService } from 'src/app/services/dataset.service';

@Component({
	selector: 'app-navbar-layout',
	templateUrl: './navbar-layout.component.html',
	styleUrls: ['./navbar-layout.component.scss']
})
export class NavbarLayoutComponent {
    
    constructor(public datasetService: DatasetService)
    {

    }

    selectDataset(dataset: Dataset) 
    {
        this.datasetService.selectDataset(dataset);
    }
}
