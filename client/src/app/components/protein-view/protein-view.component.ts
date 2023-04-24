import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatasetService } from 'src/app/services/dataset.service';
import { PluginContext } from 'molstar/lib/mol-plugin/context';
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import { DefaultPluginUISpec } from 'molstar/lib/mol-plugin-ui/spec';
import { createPluginUI } from 'molstar/lib/mol-plugin-ui/react18';

import { Asset } from 'molstar/lib/mol-util/assets';
import { BuiltInTrajectoryFormat } from 'molstar/lib/mol-plugin-state/formats/trajectory';
import { ProteinThemeProvider } from 'src/app/providers/protein-theme-provider';
import { ExternalLinkService } from 'src/app/services/external-link.service';

@Component({
    selector: 'app-protein-view',
    templateUrl: './protein-view.component.html',
    styleUrls: ['./protein-view.component.scss']
})
export class ProteinViewComponent implements OnInit {
    // private SuperpositionTag: string = 'SuperpositionTransform';
    private plugin!: PluginUIContext;
    public TableColumnNames: string[] = [];
    public ColumnOrder: string[] = [];
    public TableData!: any;
    public DataReady: boolean = false;
    private row!: number;
    constructor(
        public datasetService: DatasetService,
        public externalLinkService: ExternalLinkService,
        private route: ActivatedRoute) {

        this.row = parseInt(this.route.snapshot.paramMap.get('id') as string);
        datasetService.currentQuery = decodeURIComponent(this.route.snapshot.paramMap.get('query') as string);

        datasetService.getDatasetInfo().then(_ => {
            datasetService.getSpecificRow(this.row).subscribe(data => {

                this.TableColumnNames = data['columnNames'];
                this.TableData = data['results'];

                for (const columnName of this.datasetService.ColumnOrder) {
                    if (this.TableColumnNames.includes(columnName)) {
                        this.ColumnOrder.push(columnName);
                    }
                }
                this.TableData = this.TableData[0];
                this.DataReady = true;

                let pdbCodes: string[] = [];

                if ('AfterPdbCode' in this.TableData) {
                    pdbCodes.push(this.TableData['AfterPdbCode'] as string);
                }

                if ('BeforePdbCode' in this.TableData) {
                    pdbCodes.push(this.TableData['BeforePdbCode'] as string);
                }

                this.GenerateMolstarVisualisation(pdbCodes);
            });
        });
    }
    GenerateMolstarVisualisation(pdbCodes: string[]) {
        this.plugin.dataTransaction(async () => {
            for (const s of pdbCodes) {
                await this.loadStructure(this.plugin, `https://www.ebi.ac.uk/pdbe/static/entry/${s}_updated.cif`, 'mmcif');
            }

            // select whole protein
            // const data = this.plugin.managers.structure.hierarchy.current.structures[1]?.cell.obj?.data;
            // if (!data) return;
            // const selection = Script.getStructureSelection(Q => Q.struct.generator.atomGroups({
            //     'entity-test': MS.core.rel.eq([MS.ammp('entityType'), 'polymer'])
            // }), data);
            // const loci = StructureSelection.toLociWithSourceUnits(selection);
            // this.plugin.managers.interactivity.lociHighlights.highlightOnly({ loci });

            for (const [index, structure] of this.plugin.managers.structure.hierarchy.current.structures.entries()) {
                await this.plugin.managers.structure.component.updateRepresentationsTheme(structure.components, {
                    color: ProteinThemeProvider.name as any, colorParams: { value: index }
                });
            }
        });
    }


    async loadStructure(plugin: PluginContext, url: string, format: BuiltInTrajectoryFormat, assemblyId?: string) {
        const data = await plugin.builders.data.download({ url: Asset.Url(url) });
        const trajectory = await this.plugin.builders.structure.parseTrajectory(data, format);
        const model = await this.plugin.builders.structure.createModel(trajectory);
        const structure = await this.plugin.builders.structure.createStructure(model);
        const preset = await plugin.builders.structure.representation.applyPreset(structure, 'polymer-and-ligand');
    }

    async ngOnInit(): Promise<void> {
        this.plugin = await createPluginUI(document.getElementById('molstar-viewer') as HTMLElement, {
            ...DefaultPluginUISpec(),
            layout: {
                initial: {
                    isExpanded: false,
                    showControls: false
                }
            },
            components: {
                remoteState: 'none'
            }
        });
        this.plugin.representation.structure.themes.colorThemeRegistry.add(ProteinThemeProvider);
    }
}

