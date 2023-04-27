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
import { Script } from 'molstar/lib/mol-script/script';
import { MolScriptBuilder as MS } from 'molstar/lib/mol-script/language/builder';
import { StructureSelection } from 'molstar/lib/mol-model/structure';

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

    public ContextTableColumnNames: string[] = [];
    public ContextTableData!: any;
    public ContextColumnOrder: string[] = [];
    public ContextDataReady: boolean = false;

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

                this.GenerateMolstarVisualisation(['1pts', '1vwm']);
            });

            datasetService.getTransformationContext(this.row).subscribe(data => {
                this.ContextTableColumnNames = data['columnNames'];
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

                console.log(data);
                console.log(this.ContextTableColumnNames);
                console.log(this.ContextTableData);

                if (this.TableData.length > 1) {
                    this.ContextDataReady = false;
                    return;
                }

                for (const columnName of this.datasetService.ColumnOrder) {
                    if (this.TableColumnNames.includes(columnName)) {
                        this.ContextColumnOrder.push(columnName);
                    }
                }

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
    GenerateMolstarVisualisation(pdbCodes: string[]) {
        this.plugin.dataTransaction(async () => {
            for (const s of pdbCodes) {
                await this.loadStructure(this.plugin, `https://www.ebi.ac.uk/pdbe/static/entry/${s}_updated.cif`, 'mmcif');
            }

            // select whole protein
            let data = this.plugin.managers.structure.hierarchy.current.structures[1]?.cell.obj?.data;
            if (!data) return;
            let selection = Script.getStructureSelection(Q => Q.struct.generator.atomGroups({
                'chain-test': Q.core.rel.eq(['B', Q.ammp('auth_asym_id')]),
                'residue-test': MS.core.rel.inRange([MS.ammp('label_seq_id'), 0, 123])
            }), data);
            let loci = StructureSelection.toLociWithSourceUnits(selection);

            this.plugin.managers.interactivity.lociSelects.selectOnly({ loci });

            // this.plugin.managers.interactivity.lociHighlights.highlightOnly({ loci });

            // let data = this.plugin.managers.structure.hierarchy.current.structures[1]?.cell.obj?.data;
            // if (!data) return;
            // let selection = Script.getStructureSelection(Q => Q.struct.generator.atomGroups({
            //     'chain-test': Q.core.rel.eq(['B', Q.ammp('auth_asym_id')]),
            //     'residue-test': MS.core.rel.inRange([MS.ammp('label_seq_id'), 0, 0 + 123]),
            //     'group-by': MS.struct.atomProperty.macromolecular.label_seq_id()
            // 
            //     // 'residue-test': MS.core.set.has([MS.set(...Utils.range(123, 0)), MS.ammp('label_seq_id')]),
            // }), data);
            // 
            // let loci = StructureSelection.toLociWithSourceUnits(selection);
            // this.plugin.managers.interactivity.lociHighlights.highlightOnly({ loci });
            // this.plugin.managers.interactivity.lociSelects.selectOnly({ loci });

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

