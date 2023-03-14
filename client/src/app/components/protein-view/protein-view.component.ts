import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatasetService } from 'src/app/services/dataset.service';

@Component({
    selector: 'app-protein-view',
    templateUrl: './protein-view.component.html',
    styleUrls: ['./protein-view.component.scss']
})
export class ProteinViewComponent {

    public TableColumnNames: string[] = [];
    public TableData: any[] = [];

    private row!: number;
    constructor(public datasetService: DatasetService, private route: ActivatedRoute) {
        this.row = parseInt(this.route.snapshot.paramMap.get('id') as string);

        datasetService.getSpecificRow(this.row).subscribe(data => {
            console.log(data);
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
        });;
    }
}
