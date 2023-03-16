import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatasetService } from 'src/app/services/dataset.service';
import { DefaultPluginSpec, PluginSpec } from 'molstar/lib/mol-plugin/spec';
import { PluginContext } from 'molstar/lib/mol-plugin/context';
import { PluginConfig } from 'molstar/lib/mol-plugin/config';
import { AppSettings } from 'src/app/app-settings';
const MySpec: PluginSpec = {
    ...DefaultPluginSpec(),
    config: [
        [PluginConfig.VolumeStreaming.Enabled, false]
    ]
}


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
        datasetService.currentQuery = decodeURIComponent(this.route.snapshot.paramMap.get('query') as string);
        
        // if refreshed then datasets are not loaded yet so we would get an error: selectedDataset is undefined
        datasetService.getDatasetInfo().then(_ => {
            datasetService.getSpecificRow(this.row).subscribe(data => {

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
                this.TableData = this.TableData[0];

                if ('BeforePdbCode' in this.TableData) {
                    const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('before-molstar-canvas');
                    const parent: HTMLDivElement = <HTMLDivElement>document.getElementById('before-molstar-parent');

                    this.GenerateMolstarVisualisation(canvas, parent, this.TableData['BeforePdbCode'] as string);
                }

                if ('AfterPdbCode' in this.TableData) {
                    const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('after-molstar-canvas');
                    const parent: HTMLDivElement = <HTMLDivElement>document.getElementById('after-molstar-parent');

                    this.GenerateMolstarVisualisation(canvas, parent, this.TableData['AfterPdbCode'] as string);
                }
            });
        });
    }

    async GenerateMolstarVisualisation(canvas: HTMLCanvasElement, parent: HTMLDivElement, pdbCode: string) {
        const plugin = new PluginContext(MySpec);
        await plugin.init();

        if (!plugin.initViewer(canvas, parent)) {
            console.error('Failed to init Mol*');
            return;
        }

        const data = await plugin.builders.data.download({ url: AppSettings.PDB_URL_LOCATION + pdbCode + ".pdb" },
            { state: { isGhost: true } }
        );

        if (data === undefined) {
            let error: string = "PDB code " + pdbCode + " doesn't exists in the " + AppSettings.PDB_URL_LOCATION + " location.";
            console.error(error);
            parent.parentElement!.innerHTML +=
                '<div class="row align-items-center justify-content-center d-flex"><div class="row mt-5 alert alert-warning col-6 text-center" role="alert">' + error + '</div></div>';
            return;
        }

        const trajectory = await plugin.builders.structure.parseTrajectory(data, "pdb");
        await plugin.builders.structure.hierarchy.applyPreset(trajectory, 'default');

    }
}
