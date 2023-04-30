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
import { StructureComponentRef } from 'molstar/lib/mol-plugin-state/manager/structure/hierarchy-state';


import { Injectable } from '@angular/core';
import { Asset } from 'molstar/lib/mol-util/assets';
import { BuiltInTrajectoryFormat } from 'molstar/lib/mol-plugin-state/formats/trajectory';
import { Script } from 'molstar/lib/mol-script/script';
import { MolScriptBuilder as MS } from 'molstar/lib/mol-script/language/builder';
import { QueryContext, Structure, StructureElement, StructureProperties, StructureSelection } from 'molstar/lib/mol-model/structure';
import { LociEntry } from 'molstar/lib/mol-plugin-ui/structure/superposition'
import { StructureSelectionQueries } from 'molstar/lib/mol-plugin-state/helpers/structure-selection-query';
import { PluginStateObject } from 'molstar/lib/mol-plugin-state/objects';
import { StateObjectRef } from 'molstar/lib/mol-state';
import { elementLabel, structureElementStatsLabel } from 'molstar/lib/mol-theme/label';
import { alignAndSuperpose } from 'molstar/lib/mol-model/structure/structure/util/superposition';
import { SymmetryOperator } from 'molstar/lib/mol-math/geometry';
import { Mat4 } from 'molstar/lib/mol-math/linear-algebra';
import { StateTransforms } from 'molstar/lib/mol-plugin-state/transforms';
import { stripTags } from 'molstar/lib/mol-util/string';
import { PluginCommands } from 'molstar/lib/mol-plugin/commands';
import { PluginContext } from 'molstar/lib/mol-plugin/context';
import { Task } from 'molstar/lib/mol-task/task';
import { MolstarService } from 'src/app/services/molstar.service';
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
    public VisualizedProteins: Protein[] = [];

    public ContextTableColumnNames: string[] = [];
    public ContextTableData!: any;
    public ContextColumnOrder: string[] = [];
    public ContextDataReady: boolean = false;
    public OnlyChains: [visible: boolean, buttonText: string] = [false, "Show chains only"];
    public HiddenChainTasks: Task<void>[] = [];

    private row!: number;
    constructor(
        public datasetService: DatasetService,
        public externalLinkService: ExternalLinkService,
        private superpositionService: SuperpositionService,
        private molstarService: MolstarService,
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
                let lcsLength: number = this.ContextTableData[0]["LcsLength"]

                for (const transformation of this.ContextTableData) {
                    if (lcsLength !== transformation["LcsLength"]) {
                        console.error(`Incosistent data: each LCS length needs to be the same. Found: ${lcsLength}, ${transformation["LcsLength"]}`);
                    }

                    if (this.VisualizedProteins.filter(
                        x =>
                            x.PdbCode === transformation["BeforePdbCode"] &&
                            x.ChainId === transformation["BeforeChainId"]).length === 0)
                        this.VisualizedProteins.push({ PdbCode: transformation["BeforePdbCode"], ChainId: transformation["BeforeChainId"], LcsStart: transformation["BeforeLcsStart"] })

                    if (this.VisualizedProteins.filter(
                        x =>
                            x.PdbCode === transformation["AfterPdbCode"] &&
                            x.ChainId === transformation["AfterChainId"]).length === 0)
                        this.VisualizedProteins.push({ PdbCode: transformation["AfterPdbCode"], ChainId: transformation["AfterChainId"], LcsStart: transformation["AfterLcsStart"] })
                }

                this.superpositionService.GenerateMolstarVisualisation(this.plugin, this.VisualizedProteins, lcsLength);

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

    public async ToggleChainVisibility() {
        if (this.OnlyChains[0]) {
            let numberOfUndoTasks = this.HiddenChainTasks.length;
            for (let i = 0; i < numberOfUndoTasks; i++) {
                const task = this.HiddenChainTasks.pop();
                if (task) await this.plugin.runTask(task);
            }
            this.OnlyChains[0] = false;
            this.OnlyChains[1] = "Show chains only";
            this.molstarService.cameraReset(this.plugin);

        }
        else {
            for (const [index, protein] of this.VisualizedProteins.entries()) {
                const data = this.plugin.managers.structure.hierarchy.current.structures[index]?.cell.obj?.data;
                if (!data) return;
                const selection = Script.getStructureSelection(Q =>
                    Q.struct.generator.atomGroups({
                        'chain-test': Q.core.rel.neq([protein.ChainId, Q.struct.atomProperty.macromolecular.auth_asym_id()]),
                    }), data);
                const loci = StructureSelection.toLociWithSourceUnits(selection);

                this.plugin.managers.interactivity.lociSelects.selectOnly({ loci });

                const sel = this.plugin.managers.structure.hierarchy.getStructuresWithSelection();
                const componentsToDelete: StructureComponentRef[] = [];
                for (const s of sel) componentsToDelete.push(...s.components);
                await this.plugin.managers.structure.component.modifyByCurrentSelection(componentsToDelete, 'subtract');
                this.plugin.managers.interactivity.lociSelects.deselectAll();
                this.HiddenChainTasks.push(this.plugin.state.data.undo());
            }
            this.molstarService.cameraReset(this.plugin);
            this.OnlyChains[0] = true;
            this.OnlyChains[1] = "Show whole structures"
        }
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

