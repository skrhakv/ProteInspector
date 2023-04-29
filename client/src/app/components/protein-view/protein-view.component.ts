import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatasetService } from 'src/app/services/dataset.service';
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import { DefaultPluginUISpec } from 'molstar/lib/mol-plugin-ui/spec';
import { createPluginUI } from 'molstar/lib/mol-plugin-ui/react18';
import { ProteinThemeProvider } from 'src/app/providers/protein-theme-provider';
import { ExternalLinkService } from 'src/app/services/external-link.service';
import { Protein } from 'src/app/models/protein.model';
import { SuperpositionService } from 'src/app/services/superposition.service';

@Component({
    selector: 'app-protein-view',
    templateUrl: './protein-view.component.html',
    styleUrls: ['./protein-view.component.scss']
})
export class ProteinViewComponent implements OnInit {
    private plugin!: PluginUIContext;
    public TableColumnNames: string[] = [];
    public ColumnOrder: string[] = [];
    public TableData!: any;
    public DataReady: boolean = false;

    public ContextTableColumnNames: string[] = [];
    public ContextTableData!: any;
    public ContextColumnOrder: string[] = [];
    public ContextDataReady: boolean = false;

    private row!: number;
    constructor(
        public datasetService: DatasetService,
        public externalLinkService: ExternalLinkService,
        public superpositionService: SuperpositionService, 
        private route: ActivatedRoute) {

        this.row = parseInt(this.route.snapshot.paramMap.get('id') as string);
        datasetService.currentQuery = decodeURIComponent(this.route.snapshot.paramMap.get('query') as string);

        datasetService.getDatasetInfo().then(_ => {
            datasetService.getSpecificRow(this.row).subscribe(data => {

                this.TableColumnNames = data['columnNames'];
                this.TableData = data['results'];

                // only show columns from the this.datasetService.ColumnOrder in this order:
                for (const columnName of this.datasetService.ColumnOrder) {
                    if (this.TableColumnNames.includes(columnName)) {
                        this.ColumnOrder.push(columnName);
                    }
                }
                this.TableData = this.TableData[0];
                this.DataReady = true;
            });

            datasetService.getTransformationContext(this.row).subscribe(data => {
                this.ContextTableColumnNames = data['columnNames'];

                // sort by BeforeSnapshot, AfterSnapshot
                this.ContextTableData = data['results'].sort((a: any, b: any) => {
                    if (a["BeforeSnapshot"] < b["BeforeSnapshot"])
                        return -1;
                    if (a["BeforeSnapshot"] > b["BeforeSnapshot"])
                        return 1;
                    if (a["AfterSnapshot"] < b["AfterSnapshot"])
                        return -1;
                    if (a["AfterSnapshot"] > b["AfterSnapshot"])
                        return 1;
                    return 0;
                });
                this.ContextColumnOrder = [];

                // pick data for the protein superposition and visualization
                let proteinsToVisualize: Protein[] = [];
                let lcsLength: number = this.ContextTableData[0]["LcsLength"]

                for (const transformation of this.ContextTableData) {
                    if (lcsLength !== transformation["LcsLength"]) {
                        console.error(`Incosistent data: each LCS length needs to be the same. Found: ${lcsLength}, ${transformation["LcsLength"]}`);
                    }

                    if (proteinsToVisualize.filter(
                        x =>
                            x.PdbCode === transformation["BeforePdbCode"] &&
                            x.ChainId === transformation["BeforeChainId"]).length === 0)
                        proteinsToVisualize.push({ PdbCode: transformation["BeforePdbCode"], ChainId: transformation["BeforeChainId"], LcsStart: transformation["BeforeLcsStart"] })

                    if (proteinsToVisualize.filter(
                        x =>
                            x.PdbCode === transformation["AfterPdbCode"] &&
                            x.ChainId === transformation["AfterChainId"]).length === 0)
                        proteinsToVisualize.push({ PdbCode: transformation["AfterPdbCode"], ChainId: transformation["AfterChainId"], LcsStart: transformation["AfterLcsStart"] })
                }

                this.superpositionService.GenerateMolstarVisualisation(this.plugin, proteinsToVisualize, lcsLength);

                // show context only if there is any
                if (this.ContextTableData.length <= 1) {
                    this.ContextDataReady = false;
                    return;
                }

                // only show columns from the this.datasetService.ColumnOrder in this order:
                for (const columnName of this.datasetService.ColumnOrder) {
                    if (this.TableColumnNames.includes(columnName)) {
                        this.ContextColumnOrder.push(columnName);
                    }
                }

                // manually add BeforeSnapshot, AfterSnapshot columns to the result table 
                this.ContextColumnOrder.push("BeforeSnapshot");
                this.ContextColumnOrder.push("AfterSnapshot")
                this.ContextDataReady = true;
            },
                error => {
                    this.ContextTableColumnNames = [];
                    this.ContextTableData = [];
                    this.ContextColumnOrder = [];
                });
        });
    }

    async ngOnInit(): Promise<void> {
        // init Mol* plugin
        this.plugin = await createPluginUI(document.getElementById('molstar-viewer') as HTMLElement, {
            ...DefaultPluginUISpec(),
            layout: {
                initial: {
                    isExpanded: false,
                    showControls: false
                }
            },
            components: {
            }
        });

        // add custom color theme 
        this.plugin.representation.structure.themes.colorThemeRegistry.add(ProteinThemeProvider);
    }
}

