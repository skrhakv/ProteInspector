import { Component } from '@angular/core';
import { Dataset } from 'src/app/models/dataset';
import { DatasetInfoService } from 'src/app/services/dataset-info.service';

@Component({
	selector: 'app-navbar-layout',
	templateUrl: './navbar-layout.component.html',
	styleUrls: ['./navbar-layout.component.scss']
})
export class NavbarLayoutComponent {
    public datasets: Dataset[] = [];
    
    constructor(private datasetInfoService: DatasetInfoService)
    {
        this.datasetInfoService.getDatasetInfo().subscribe((datasetsResult) => {
            this.datasets = datasetsResult['results'];
            console.log(this.datasets);
            console.log(datasetsResult);
          });
    }
}
