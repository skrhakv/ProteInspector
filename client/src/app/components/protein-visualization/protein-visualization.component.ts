import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { HighlightedDomain } from 'src/app/models/highlighted-domain.model';
import { Protein } from 'src/app/models/protein.model';
import { MolstarService } from 'src/app/services/molstar.service';
import { setSubtreeVisibility } from 'molstar/lib/mol-plugin/behavior/static/state';
import { StructureRepresentationRegistry } from 'molstar/lib/mol-repr/structure/registry';
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import { DefaultPluginUISpec } from 'molstar/lib/mol-plugin-ui/spec';
import { createPluginUI } from 'molstar/lib/mol-plugin-ui/react18';
import { ProteinThemeProvider, getColorHex } from 'src/app/providers/protein-theme-provider';
import { AppSettings } from 'src/app/app-settings';
import { ProteinSequence } from 'src/app/models/protein-sequence.model';
import { SuperpositionService } from 'src/app/services/superposition.service';
import { RcsbFv, RcsbFvDisplayConfigInterface, RcsbFvDisplayTypes, RcsbFvTrackDataElementInterface } from '@rcsb/rcsb-saguaro';

@Component({
    selector: 'app-protein-visualization',
    templateUrl: './protein-visualization.component.html',
    styleUrls: ['./protein-visualization.component.scss']
})
export class ProteinVisualizationComponent implements OnInit {
    @Output() export = new EventEmitter<void>();

    private plugin!: PluginUIContext;
    public proteins: Protein[] = [];
    public highlightedDomains: HighlightedDomain[] = [];

    public VisualizationReady = false;
    public ShowHighlightButtons = false;
    public IsProteinVisible: boolean[] = [];
    public OnlyChains: [visible: boolean, buttonText: string] = [false, 'Show Chains'];
    public ProteinRepresentation: StructureRepresentationRegistry.BuiltIn[] = [];

    // MSA data
    private ProteinSequences: ProteinSequence[] = [];
    private leftAlignmentShifts: number[] = [];

    constructor(
        public molstarService: MolstarService,
        public superpositionService: SuperpositionService
    ) { }

    public updateVisualization(proteins: Protein[], highlightedDomains: HighlightedDomain[]) {

        this.proteins = proteins;
        this.highlightedDomains = highlightedDomains;

        this.UpdateChainVisibilityButtonText();

        // set corresponding length and values for the 'IsProteinVisible' array and for the 'ProteinRepresentation' array
        this.IsProteinVisible = new Array<boolean>(this.proteins.length);
        this.IsProteinVisible.fill(true);

        this.ProteinRepresentation = new Array<StructureRepresentationRegistry.BuiltIn>(this.proteins.length);
        this.ProteinRepresentation.fill('cartoon');

        // disable the buttons until the visualization is ready using callback
        const callback = () => {
            this.VisualizationReady = true;
            this.LoadMsaViewer();
        };

        this.superpositionService.GenerateMolstarVisualisation(this.plugin, this.proteins, callback);

        this.ShowHighlightButtons = true;
    }

    public onExportButtonClicked() {
        this.export.emit();
    }

    public async ToggleHighlighting(index: number) {
        this.molstarService.HighlightDomains(this.plugin, this.highlightedDomains[index]);
        this.highlightedDomains[index].Highlighted = !this.highlightedDomains[index].Highlighted;
    }

    private async updateHighlighting() {
        for (const domain of this.highlightedDomains)
            await this.molstarService.HighlightDomains(this.plugin, domain, false);
    }

    public async ChangeRepresentation(index: number, structureRepresentationType: string) {
        await this.molstarService.BuildRepresentation(this.plugin, index, structureRepresentationType as StructureRepresentationRegistry.BuiltIn);

        if (!this.IsProteinVisible[index])
            setSubtreeVisibility(this.plugin.state.data, this.plugin.managers.structure.hierarchy.current.structures[index].cell.transform.ref, !this.IsProteinVisible[index]);


        if (this.OnlyChains[0]) {
            await this.molstarService.ShowChainsOnly(this.plugin, this.proteins);
        }

        this.ProteinRepresentation[index] = structureRepresentationType as StructureRepresentationRegistry.BuiltIn;

        await this.updateHighlighting();
    }

    getButtonStyles(index: number): Record<string, string> {
        const proteinColor = getColorHex(index);

        return {
            '--register-button--color': 'white',
            '--register-button--background-color': proteinColor,
            '--register-button--hover-color': proteinColor,
            '--register-button--hover-background-color': 'white',
        };
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
            await this.molstarService.ShowChainsOnly(this.plugin, this.proteins);

            //  update buttons
            this.OnlyChains[0] = true;
            this.OnlyChains[1] = 'Show Full Structures';
        }

        await this.updateHighlighting();
    }

    private UpdateChainVisibilityButtonText(): void {
        this.OnlyChains[1] = 'Show Chains ';
        let first = true;
        for (const protein of this.proteins) {
            if (first)
                first = false;
            else
                this.OnlyChains[1] += ', ';

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
                    controlsDisplay: 'reactive',
                }
            },
            components: {
                remoteState: 'none'
            }
        });

        // add custom color theme 
        this.plugin.representation.structure.themes.colorThemeRegistry.add(ProteinThemeProvider);
    }

    get GetRepresentationTypes(): Record<StructureRepresentationRegistry.BuiltIn, string> {
        return AppSettings.REPRESENTATION_TYPES;
    }

    getStringSpan(domain: HighlightedDomain): string {
        return domain.Start.toString() + '-' + domain.End.toString();
    }

    private LoadMsaViewer() {
        this.ProteinSequences = this.molstarService.GetChainSequences(this.plugin);

        // compute the size of the left shift of the sequence for each protein
        for (let i = 0; i < this.proteins.length; i++) {
            let leftBranchSize = 0;

            // get index of the relevant chain
            const indexOfRelevantChain: number = this.ProteinSequences[i].ChainSequences.findIndex(x => x.ChainId === this.proteins[i].ChainId);

            // compute how long is the left branch
            for (let ii = 0; ii < indexOfRelevantChain; ii++) {
                leftBranchSize += this.ProteinSequences[i].ChainSequences[ii].Sequence.length;
            }

            // add the additional alignment from the database
            leftBranchSize += Number(this.proteins[i].LcsStart);

            this.leftAlignmentShifts.push(leftBranchSize);
        }

        // get labels of the structures
        const labels: string[] = [];

        for (const structure of this.plugin.managers.structure.hierarchy.current.structures) {
            let label = '', entryId = '';

            if (!structure.cell.obj || !structure.cell.obj.data.units)
                return;

            for (const unit of structure.cell.obj.data.units) {
                label = unit.model.label;
                entryId = unit.model.entryId;
            }

            if (label === '')
                label = entryId;

            labels.push(label);
        }

        const longestLeftBranch = Math.max(...this.leftAlignmentShifts);

        // define data for the MSA browser
        const proteinsData: RcsbFvDisplayConfigInterface[][] = [];
        let maxLength = 0;

        for (let i = 0; i < this.ProteinSequences.length; i++) {

            // where the chain begins (index position in the sequence)
            let length: number = longestLeftBranch - this.leftAlignmentShifts[i];
            const chains: RcsbFvDisplayConfigInterface[] = [];

            //  add the individual sequences to the fasta data 
            for (const ChainSequence of this.ProteinSequences[i].ChainSequences) {

                const begin = length;

                //define data for callback
                const proteinSequence:ProteinSequence = this.ProteinSequences[i];
                const chainId = ChainSequence.ChainId;
                
                // append the chain data 
                chains.push({
                    displayType: RcsbFvDisplayTypes.SEQUENCE,
                    displayColor: '#000000',
                    displayId: 'compositeSeqeunce' + begin,
                    displayData: [{
                        begin: begin,
                        value: ChainSequence.Sequence,
                        description: [`Chain ID: ${ChainSequence.ChainId}`]
                    }],
                    elementEnterCallBack: ((d?: RcsbFvTrackDataElementInterface) => 
                    { 
                        if (!d) return;
                        const position = d?.begin - begin;
                        this.highlightResidue(proteinSequence, chainId, position); }),
                });

                // move the index for the next chain
                length += ChainSequence.Sequence.length;
            }

            // add the data
            proteinsData.push(chains);

            // looking for the longest sequence (needed later when defining the MSA browser)
            maxLength = maxLength > (longestLeftBranch - this.leftAlignmentShifts[i] + length)
                ? maxLength
                : (longestLeftBranch - this.leftAlignmentShifts[i] + length);

        }

        // define each row in the MSA browser
        const rcsbInput: Array<any> = [];

        for (let i = 0; i < this.ProteinSequences.length; i++) {
            rcsbInput[i] = {
                trackId: 'compositeSequence' + i,
                trackHeight: 30,
                trackColor: '#F9F9F9',
                displayType: 'composite',
                rowTitle: labels[i],
                displayConfig: proteinsData[i]
            };
        }

        // define and add the 'SUPERPOSITION ALIGNMENT' row to the MSA browser
        if (this.proteins.length > 0) {
            rcsbInput.push({
                trackId: 'blockTrack',
                trackHeight: 20,
                trackColor: '#F9F9F9',
                displayType: 'block',
                displayColor: '#FF0000',
                rowTitle: 'SUPERPOSITION ALIGNMENT',
                trackData: [{
                    begin: longestLeftBranch,
                    end: longestLeftBranch + this.proteins[0].LcsLength
                }]
            });
        }

        const boardConfigData = {
            length: maxLength,
            trackWidth: 1300,
            includeAxis: true,
            includeTooltip: true,
            highlightHoverElement: true,
            hideInnerBorder: true,
            hideRowGlow: false,
            elementLeaveCallBack: (() => { this.clearResidueHighlighting(); })
        };

        const elementId = 'pfv';
        new RcsbFv({
            rowConfigData: rcsbInput,
            boardConfigData: boardConfigData,
            elementId
        });
    }

    highlightResidue(proteinSequence: ProteinSequence, chainID: string, position: number): void {
        this.molstarService.HighlightResidue(this.plugin, proteinSequence, chainID, position);
    }

    clearResidueHighlighting(): void {
        this.molstarService.ClearResidueHighlighting(this.plugin);
    }
}
