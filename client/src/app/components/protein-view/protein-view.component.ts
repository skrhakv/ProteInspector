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

import { setSubtreeVisibility } from 'molstar/lib/mol-plugin/behavior/static/state';
import { Task } from 'molstar/lib/mol-task/task';
import { MolstarService } from 'src/app/services/molstar.service';
import { StructureRepresentationRegistry } from 'molstar/lib/mol-repr/structure/registry';
import { AppSettings } from 'src/app/app-settings';
import { ProteinSequence } from 'src/app/models/protein-sequence.model';

declare var msa: any;
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
    public IsProteinVisible: boolean[] = [];
    public ProteinRepresentation: StructureRepresentationRegistry.BuiltIn[] = [];
    public VisualizationReady: boolean = false;
    public ShowHighlightButton: boolean = false;

    public ContextTableColumnNames: string[] = [];
    public ContextTableData!: any;
    public ContextColumnOrder: string[] = [];
    public ContextDataReady: boolean = false;
    public OnlyChains: [visible: boolean, buttonText: string] = [false, "Show only chains"];
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

                const firstRow = this.ContextTableData[0];

                // Show highlight button if there is a span to highlight
                if ('BeforeDomainSpanStart' in firstRow || 'BeforeDomainSpanStart1' in firstRow || 'BeforeResidueStart' in firstRow)
                    this.ShowHighlightButton = true;

                // pick data for the protein superposition and visualization
                let lcsLength: number = firstRow["LcsLength"]
                for (const transformation of this.ContextTableData) {
                    if (lcsLength !== transformation["LcsLength"]) {
                        console.error(`Incosistent data: each LCS length needs to be the same. Found: ${lcsLength}, ${transformation["LcsLength"]}`);
                    }

                    if (this.VisualizedProteins.filter(
                        x =>
                            x.PdbCode === transformation["BeforePdbCode"] &&
                            x.ChainId === transformation["BeforeChainId"]).length === 0)
                        this.VisualizedProteins.push({ PdbCode: transformation["BeforePdbCode"], ChainId: transformation["BeforeChainId"], LcsStart: transformation["BeforeLcsStart"], FileLocation: transformation["BeforeFileLocation"] })

                    if (this.VisualizedProteins.filter(
                        x =>
                            x.PdbCode === transformation["AfterPdbCode"] &&
                            x.ChainId === transformation["AfterChainId"]).length === 0)
                        this.VisualizedProteins.push({ PdbCode: transformation["AfterPdbCode"], ChainId: transformation["AfterChainId"], LcsStart: transformation["AfterLcsStart"], FileLocation: transformation["AfterFileLocation"] })
                }

                this.UpdateChainVisibilityButtonText();

                // set corresponding length and values for the 'IsProteinVisible' array and for the 'ProteinRepresentation' array
                this.IsProteinVisible = new Array<boolean>(this.VisualizedProteins.length);
                this.IsProteinVisible.fill(true);

                this.ProteinRepresentation = new Array<StructureRepresentationRegistry.BuiltIn>(this.VisualizedProteins.length);
                this.ProteinRepresentation.fill('cartoon');

                // disable the buttons until the visualization is ready using callback
                let callback = () => {
                    this.VisualizationReady = true;
                    this.LoadMsaViewer();
                }

                this.superpositionService.GenerateMolstarVisualisation(this.plugin, this.VisualizedProteins, lcsLength, callback);

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

    get GetRepresentationTypes(): Record<StructureRepresentationRegistry.BuiltIn, string> {
        return AppSettings.REPRESENTATION_TYPES;
    }

    public async ToggleHighlighting() {
        let transformation = this.TableData;
        if ('BeforeDomainSpanStart' in transformation) {
            this.molstarService.Highlight(this.plugin, transformation['BeforePdbCode'], transformation['BeforeChainId'], transformation['BeforeDomainSpanStart'], transformation['BeforeDomainSpanEnd'], this.VisualizedProteins.length);
            this.molstarService.Highlight(this.plugin, transformation['AfterPdbCode'], transformation['AfterChainId'], transformation['AfterDomainSpanStart'], transformation['AfterDomainSpanEnd'], this.VisualizedProteins.length);
        }
        if ('BeforeDomainSpanStart1' in transformation) {
            this.molstarService.Highlight(this.plugin, transformation['BeforePdbCode'], transformation['BeforeChainId'], transformation['BeforeDomainSpanStart1'], transformation['BeforeDomainSpanEnd1'], this.VisualizedProteins.length);
            this.molstarService.Highlight(this.plugin, transformation['AfterPdbCode'], transformation['AfterChainId'], transformation['AfterDomainSpanStart1'], transformation['AfterDomainSpanEnd1'], this.VisualizedProteins.length);
        }
        if ('BeforeDomainSpanStart2' in transformation) {
            this.molstarService.Highlight(this.plugin, transformation['BeforePdbCode'], transformation['BeforeChainId'], transformation['BeforeDomainSpanStart2'], transformation['BeforeDomainSpanEnd2'], this.VisualizedProteins.length);
            this.molstarService.Highlight(this.plugin, transformation['AfterPdbCode'], transformation['AfterChainId'], transformation['AfterDomainSpanStart2'], transformation['AfterDomainSpanEnd2'], this.VisualizedProteins.length);

        }
        if ('BeforeResidueStart' in transformation) {
            this.molstarService.Highlight(this.plugin, transformation['BeforePdbCode'], transformation['BeforeChainId'], transformation['BeforeResidueStart'], transformation['BeforeResidueEnd'], this.VisualizedProteins.length);
            this.molstarService.Highlight(this.plugin, transformation['AfterPdbCode'], transformation['AfterChainId'], transformation['AfterResidueStart'], transformation['AfterResidueEnd'], this.VisualizedProteins.length);
        }
    }

    public async ChangeRepresentation(index: number, structureRepresentationType: string) {
        await this.molstarService.BuildRepresentation(this.plugin, index, structureRepresentationType as StructureRepresentationRegistry.BuiltIn);

        if (!this.IsProteinVisible[index])
            setSubtreeVisibility(this.plugin.state.data, this.plugin.managers.structure.hierarchy.current.structures[index].cell.transform.ref, !this.IsProteinVisible[index]);


        if (this.OnlyChains[0]) {
            this.molstarService.ShowChainsOnly(this.plugin, this.VisualizedProteins);
        }

        this.ProteinRepresentation[index] = structureRepresentationType as StructureRepresentationRegistry.BuiltIn;
    }

    public async ToggleStructureVisibility(index: number) {
        if (this.IsProteinVisible[index])
            this.IsProteinVisible[index] = false;

        else
            this.IsProteinVisible[index] = true;

        setSubtreeVisibility(this.plugin.state.data, this.plugin.managers.structure.hierarchy.current.structures[index].cell.transform.ref, !this.IsProteinVisible[index]);
    }

    public async ToggleChainVisibility() {
        // check whether show the whole structure or only the chains
        if (this.OnlyChains[0]) {
            for (let i = 0; i < this.ProteinRepresentation.length; i++) {
                await this.molstarService.BuildRepresentation(this.plugin, i, this.ProteinRepresentation[i]);
                setSubtreeVisibility(this.plugin.state.data, this.plugin.managers.structure.hierarchy.current.structures[i].cell.transform.ref, !this.IsProteinVisible[i]);
            }

            // reset camera and update buttons
            this.OnlyChains[0] = false;
            this.UpdateChainVisibilityButtonText();
            this.molstarService.CameraReset(this.plugin);

        }
        else {
            this.molstarService.ShowChainsOnly(this.plugin, this.VisualizedProteins);

            //  update buttons
            this.OnlyChains[0] = true;
            this.OnlyChains[1] = "Show Full Structures"
        }
    }

    private UpdateChainVisibilityButtonText(): void {
        this.OnlyChains[1] = "Show Only Chains "
        let first: boolean = true;
        for (const protein of this.VisualizedProteins) {
            if (first)
                first = false;
            else
                this.OnlyChains[1] += ", ";

            this.OnlyChains[1] += protein.PdbCode + protein.ChainId;

        }
    }

    async ngOnInit(): Promise<void> {
        // init Mol* plugin
        this.plugin = await createPluginUI(document.getElementById('molstar-viewer') as HTMLElement, {
            ...DefaultPluginUISpec(),
            layout: {
                initial: {
                    isExpanded: false,
                    showControls: false,
                    controlsDisplay: "reactive",
                }
            },
            components: {
                remoteState: 'none'
            }
        });

        // add custom color theme 
        this.plugin.representation.structure.themes.colorThemeRegistry.add(ProteinThemeProvider);
    }

    private LoadMsaViewer() {
        let ProteinSequences: ProteinSequence[] = this.molstarService.GetChainSequences(this.plugin);

        // compute the size of the left branch of the sequence from the desired chain for each protein
        let leftBranchSizes: number[] = [];

        for (let i = 0; i < this.VisualizedProteins.length; i++) {
            let leftBranchSize: number = 0;

            // get index of the relevant chain
            let indexOfRelevantChain: number = ProteinSequences[i].ChainSequences.findIndex(x => x.ChainId === this.VisualizedProteins[i].ChainId);

            // compute how long is the left branch
            for (let ii = 0; ii < indexOfRelevantChain; ii++) {
                leftBranchSize += ProteinSequences[i].ChainSequences[ii].Sequence.length;
            }

            // add the additional alignment from the database
            leftBranchSize += Number(this.VisualizedProteins[i].LcsStart);

            leftBranchSizes.push(leftBranchSize);
        }

        // get labels of the structures
        let labels: string[] = [];

        for (let structure of this.plugin.managers.structure.hierarchy.current.structures) {
            let label: string = "", entryId: string = "";

            if (!structure.cell.obj?.data.units)
                return;

            for (let unit of structure.cell.obj?.data.units) {
                label = unit.model.label;
                entryId = unit.model.entryId;
            }

            if (label === "")
                label = entryId;

            labels.push(label);
        }

        let longestLeftBranch = Math.max(...leftBranchSizes);
        let fasta: string = "";

        for (let i = 0; i < ProteinSequences.length; i++) {

            let shift = longestLeftBranch - leftBranchSizes[i];

            // add label and appropriate shift
            fasta += ">" + labels[i] + "\n" + (" ".repeat(shift));

            // after the shifting add the sequences 
            for (const ChainSequence of ProteinSequences[i].ChainSequences) {
                fasta += ChainSequence.Sequence;
            }
            fasta += "\n";
        }

        var opts = {
            el: document.getElementById("msa-viewer"),
            seqs: msa.io.fasta.parse(fasta),
            vis: {
                conserv: false,
                overviewbox: false,
                labelId: false
            }
        };

        var m = msa(opts);
        m.render();
    }
}
