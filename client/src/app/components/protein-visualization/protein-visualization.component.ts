import { Component, EventEmitter, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { HighlightedDomain } from 'src/app/models/highlighted-domain.model';
import { Protein } from 'src/app/models/protein.model';
import { MolstarService } from 'src/app/services/molstar.service';
import { StructureRepresentationRegistry } from 'molstar/lib/mol-repr/structure/registry';
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import { DefaultPluginUISpec } from 'molstar/lib/mol-plugin-ui/spec';
import { createPluginUI } from 'molstar/lib/mol-plugin-ui/react18';
import { ProteinThemeProvider, getColorHexFromIndex } from 'src/app/providers/protein-theme-provider';
import { ProteinSequence } from 'src/app/models/protein-sequence.model';
import { SuperpositionService } from 'src/app/services/superposition.service';
import { RcsbFv, RcsbFvDisplayConfigInterface, RcsbFvDisplayTypes, RcsbFvTrackDataElementInterface } from '@rcsb/rcsb-saguaro';
import { Expression } from 'molstar/lib/mol-script/language/expression';
import { MolScriptBuilder as MS } from 'molstar/lib/mol-script/language/builder';
import { DetailViewButtonGroupComponent } from '../detail-view-button-group/detail-view-button-group.component';
import { SetUtils } from 'molstar/lib/mol-util/set';
import { AminoAcidNamesL, RnaBaseNames, DnaBaseNames, WaterNames } from 'molstar/lib/mol-model/structure/model/types';
import { Script } from 'molstar/lib/mol-script/script';
import { StructureSelection } from 'molstar/lib/mol-model/structure/query';
@Component({
    selector: 'app-protein-visualization',
    templateUrl: './protein-visualization.component.html',
    styleUrls: ['./protein-visualization.component.scss']
})
export class ProteinVisualizationComponent implements OnInit {
    @Output() export = new EventEmitter<void>();

    /**
     * container for every DetailViewButtonGroupComponent
     */
    @ViewChildren(DetailViewButtonGroupComponent) allHighlightButtons!: QueryList<DetailViewButtonGroupComponent>;

    /**
     * Instance of Molstar plugin
     */
    public plugin!: PluginUIContext;
    /**
     * Instance of RCSB 1D Viewer plugin
     */
    private rcsbViewer!: RcsbFv;
    /**
     * Storage for all the visualized proteins
     */
    public proteins: Protein[] = [];
    /**
     * Storage for all the visualized substructures
     */
    public highlightedDomains: HighlightedDomain[] = [];

    /**
    * Storage for all the visualized substructures
    */
    public onlyDomains: HighlightedDomain[] = [];

    /**
    * Storage for all the visualized substructures
    */
    public onlyResidues: HighlightedDomain[] = [];

    /**
     * true if visualization is ready
     */
    public VisualizationReady = false;
    /**
     * Show buttons only when data is ready
     */
    public ShowHighlightButtons = false;
    /**
     * true if protein is visible, indexes match the 'proteins' array
     */
    public IsProteinVisible: boolean[] = [];
    /**
     * [true if only chains are visible; text of the button in HTML]
     */
    public OnlyChains: [visible: boolean, buttonText: string] = [false, 'Show Chains'];
    /**
     * Visual representation of the protein, indexes match the 'proteins' array
     */
    public ProteinRepresentation: StructureRepresentationRegistry.BuiltIn[] = [];

    /**
     * MSA data, indexes match the 'proteins' array
     */
    private ProteinSequences: ProteinSequence[] = [];
    /**
     * How far shift the sequence to make a correct alignment, indexes match the 'proteins' array
     */
    private leftAlignmentShifts: number[] = [];
    /**
     * true if at least one of the protein structures has ligands defined 
     */
    public proteinsWithLigands: { index: number, protein: Protein }[] = [];

    constructor(
        public molstarService: MolstarService,
        public superpositionService: SuperpositionService
    ) { }

    /**
     * Visualize specified proteins and their domains
     * @param proteins Proteins to visualize
     * @param highlightedDomains Domains defitions inside of the proteins
     */
    public updateVisualization(proteins: Protein[], highlightedDomains: HighlightedDomain[]) {
        this.plugin.clear();
        if (this.rcsbViewer)
            this.rcsbViewer.reset();

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
            for (let i = 0; i < proteins.length; i++) {
                if (this.existLigand(i))
                    this.proteinsWithLigands.push({ index: i, protein: proteins[i] });
            }
        };

        this.superpositionService.GenerateMolstarVisualisation(this.plugin, this.proteins, callback);

        this.ShowHighlightButtons = true;

        this.onlyDomains = highlightedDomains.filter(domain => !domain.IsResidueSpan);
        this.onlyResidues = highlightedDomains.filter(domain => domain.IsResidueSpan);
    }

    /**
     * generates molstar selection expression for a highlighting button
     * @param domain domain
     */
    generateMolstarExpression(domain: HighlightedDomain): Expression {
        return MS.struct.generator.atomGroups({
            'group-by': MS.struct.atomProperty.core.operatorName(),
            'chain-test': MS.core.rel.eq([domain.ChainId, MS.struct.atomProperty.macromolecular.auth_asym_id()]),
            'residue-test': MS.core.rel.inRange([MS.struct.atomProperty.macromolecular.label_seq_id(), domain.Start, domain.End]),
            'entity-test': MS.core.rel.eq([MS.ammp('entityType'), 'polymer'])
        });
    }

    /**
     * generates molstar selection expression for a whole protein to be used in a highlighting button
     */
    generateMolstarExpressionForWholeProtein(): Expression {
        return MS.struct.generator.atomGroups({
            'group-by': MS.struct.atomProperty.core.operatorName(),
            'entity-test': MS.core.rel.eq([MS.ammp('entityType'), 'polymer'])
        });
    }

    /**
     * Definition for distinguishing between residues and ligands
     */
    private StandardResidues = SetUtils.unionMany(
        AminoAcidNamesL, RnaBaseNames, DnaBaseNames, WaterNames
    );

    /**
     * decides whether ligands are defined for a particular protein
     * @param proteinIndex index of the protein
     * @returns true if ligands are defined
     */
    existLigand(proteinIndex: number): boolean {
        const data = this.plugin.managers.structure.hierarchy.current.structures[proteinIndex]?.cell.obj?.data;
        if (!data) return false;
        const selection = Script.getStructureSelection(Q => MS.struct.generator.atomGroups({
            'group-by': MS.struct.atomProperty.core.operatorName(),
            'residue-test': MS.core.logic.not([MS.core.set.has([MS.set(...SetUtils.toArray(this.StandardResidues)), MS.ammp('label_comp_id')])]),
        }), data);
        return !StructureSelection.isEmpty(selection);
    }


    generateLigandMolstarExpression() {
        return MS.struct.generator.atomGroups({
            'group-by': MS.struct.atomProperty.core.operatorName(),
            'residue-test': MS.core.logic.not([MS.core.set.has([MS.set(...SetUtils.toArray(this.StandardResidues)), MS.ammp('label_comp_id')])]),
        });
    }

    /**
     * generates description text for a highlighting button
     */
    getDescriptionText(structure: HighlightedDomain) {
        let result = structure.DomainName;
        if (structure.IsResidueSpan)
            result += ' ' + structure.Start + '-' + structure.End;
        return result + ' (' + structure.PdbId + structure.ChainId + ')';
    }

    /**
     * generates description text for a highlighting button
     */
    getLigandDescriptionText(protein: Protein) {
        return `${protein.PdbCode} Ligands`;
    }
    /**
     * Trigger export event
     */
    public onExportButtonClicked() {
        this.export.emit();
    }

    /**
     * update highlighting according to the saved data (for example after changed representation, etc.)
     */
    public async updateAllStructures() {
        // rebuild highlighting in each DetailViewButtonGroupComponent
        for (const b of this.allHighlightButtons)
            b.updateStructure();
    }

    public async removeAllStructures() {
        for (const b of this.allHighlightButtons)
            b.removeStructure();
    }

    public async showWholeProteins() {
        for (const b of this.allHighlightButtons) {
            if (b.isWholeProtein) {
                b.visible = true;
                b.rebuildStructure();
            }
            else {
                if (b.visible)
                    b.ToggleVisibility();
            }
        }
    }

    /**
     * Gets hex color of the protein
     * @param index protein index
     */
    getHexColor(index: number): string {
        return getColorHexFromIndex(index);
    }

    private selectors: any[] = [];
    /**
     * toggle between showing only chains or the whole structures
     */
    public async ToggleChainVisibility() {
        // check whether show the whole structure or only the chains
        if (this.OnlyChains[0]) {

            for (const selector of this.selectors) {
                if (selector)
                    await this.molstarService.RemoveObject(this.plugin, this.superpositionService.model.state, selector);
            }

            await this.showWholeProteins();

            // reset camera and update buttons
            this.OnlyChains[0] = false;
            this.UpdateChainVisibilityButtonText();
        }
        else {
            this.selectors = [];
            
            this.removeAllStructures();

            for (const b of this.allHighlightButtons) {
                if (b.isWholeProtein) {
                    let s = await b.ShowChainsOnly(this.proteins[b.proteinIndex]);
                    this.selectors.push(s);
                }
            }
            //  update buttons
            this.OnlyChains[0] = true;
            this.OnlyChains[1] = 'Show Full Structures';
        }
        await this.molstarService.CameraReset(this.plugin);
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

    /**
     * initiate molstar plugin
     */
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

                // append the chain data 
                chains.push({
                    displayType: RcsbFvDisplayTypes.SEQUENCE,
                    displayColor: '#000000',
                    displayId: 'compositeSeqeunce' + begin,
                    displayData: [{
                        begin: begin,
                        value: ChainSequence.Sequence,
                        description: [`Chain ID: ${ChainSequence.ChainId}`]
                    }]
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

        // add residue spans and domains
        this.loadSpansToMsaViewer(rcsbInput);

        const boardConfigData = {
            length: maxLength,
            rowTitleWidth: 100,
            trackWidth: 1096,
            includeAxis: true,
            includeTooltip: true,
            highlightHoverElement: true,
            hideRowGlow: false,
            elementLeaveCallBack: (() => { this.clearResidueHighlighting(); }),
            highlightHoverCallback: ((n: RcsbFvTrackDataElementInterface[]) => {
                this.clearResidueHighlighting();
                if (n.length > 0) {
                    // position in the MSA viewer (zero-based)
                    const position = n[0].begin;

                    // if single residue was highlighted
                    if (n[0].end === undefined) {
                        // check that we are in the span of the sequence
                        if (position > 0 && position < maxLength) {

                            for (let i = 0; i < this.leftAlignmentShifts.length; i++) {
                                // where is the start of the sequence in the MSA viewer (as the sequence might be shifted)
                                const begin: number = longestLeftBranch - this.leftAlignmentShifts[i];
                                // position of the residue inside of the whole sequence
                                let residuePosition: number = position - begin;

                                if (residuePosition < 0)
                                    continue;

                                // loop over the chains to determine in which chain the residue lies
                                for (const chain of this.ProteinSequences[i].ChainSequences) {

                                    if (residuePosition - chain.Sequence.length < 0) {
                                        this.highlightResidue(this.ProteinSequences[i], chain.ChainId, residuePosition);
                                        break;
                                    }
                                    else
                                        residuePosition -= chain.Sequence.length;
                                }
                            }
                        }
                    }
                    else {
                        // end position of the region in the MSA viewer
                        const end = n[0].end;
                        for (let i = 0; i < this.leftAlignmentShifts.length; i++) {
                            // where is the start of the sequence in the MSA viewer (as the sequence might be shifted)
                            const begin: number = longestLeftBranch - this.leftAlignmentShifts[i];
                            // position of the residue inside of the whole sequence
                            let residuePositionStart: number = position - begin;
                            let residuePositionEnd: number = end - begin;
                            if (residuePositionStart < 0)
                                continue;

                            // loop over the chains to determine in which chain the residue lies
                            for (const chain of this.ProteinSequences[i].ChainSequences) {

                                if (residuePositionStart - chain.Sequence.length < 0) {
                                    if (residuePositionEnd <= chain.Sequence.length) {
                                        this.highlightResidue(this.ProteinSequences[i], chain.ChainId, residuePositionStart, residuePositionEnd);
                                        console.log(residuePositionStart, residuePositionEnd);
                                        break;
                                    }
                                    else {
                                        this.highlightResidue(this.ProteinSequences[i], chain.ChainId, residuePositionStart, residuePositionEnd);
                                        console.log(residuePositionStart, residuePositionEnd);

                                        residuePositionStart = 0;
                                        residuePositionEnd -= chain.Sequence.length;
                                    }
                                }
                                else {
                                    residuePositionStart -= chain.Sequence.length;
                                    residuePositionEnd -= chain.Sequence.length;
                                }
                            }
                        }
                    }
                }
            }),
            highlightHoverPosition: true
        };

        const elementId = 'pfv';
        this.rcsbViewer = new RcsbFv({
            rowConfigData: rcsbInput,
            boardConfigData: boardConfigData,
            elementId
        });
    }

    highlightResidue(proteinSequence: ProteinSequence, chainID: string, position: number, end?: number): void {
        this.molstarService.HighlightResidue(this.plugin, proteinSequence, chainID, position, end);
    }

    clearResidueHighlighting(): void {
        this.molstarService.ClearResidueHighlighting(this.plugin);
    }

    /**
     * loads domain/residue spans to the RCSB Vieewer array
     * @param rcsbInput array for inputing the spans
     */
    loadSpansToMsaViewer(rcsbInput: Array<any>) {
        const longestLeftBranch = Math.max(...this.leftAlignmentShifts);

        // first add the domains
        for (const span of this.highlightedDomains.filter(x => !x.IsResidueSpan)) {
            const proteinSequence = this.ProteinSequences.filter(x => x.ProteinIndex === span.ProteinIndex).at(0);

            if (!proteinSequence)
                continue;

            let begin: number = longestLeftBranch - this.leftAlignmentShifts[span.ProteinIndex];

            for (const chain of proteinSequence.ChainSequences) {
                if (chain.ChainId === span.ChainId) {
                    begin += span.Start;
                    const end = begin + span.End;

                    rcsbInput.push({
                        trackId: 'blockTrack',
                        trackHeight: 20,
                        trackColor: '#FFFFFF',
                        displayType: 'block',
                        displayColor: '#563C5C',
                        rowTitle: `${span.DomainName} (${span.PdbId})`,
                        trackData: [{
                            begin: begin,
                            end: end
                        }]
                    });
                    break;
                }

                begin += chain.Sequence.length;
            }
        }

        // now focus on the residue spans

        // get unique [PDB ID + RESIDUE LABEL] pairs to merge the spans of the unique residue labels
        const labelPerProteinWithSpans: Record<string,
            [{ ChainId: string, Start: number, End: number, ProteinIndex: number }]
        > = {};
        Array.from(this.highlightedDomains.filter(x => x.IsResidueSpan), x => {
            return {
                name: `${x.DomainName} (${x.PdbId})`,
                chain: {
                    ChainId: x.ChainId,
                    Start: x.Start,
                    End: x.End,
                    ProteinIndex: x.ProteinIndex
                }
            };
        }).map(x => {
            if (x.name in labelPerProteinWithSpans)
                labelPerProteinWithSpans[x.name].push(x.chain);
            else
                labelPerProteinWithSpans[x.name] = [x.chain];
        });

        // add each unique [PDB ID + RESIDUE LABEL] pair to the RCSB viewer
        for (const [name, chains] of Object.entries(labelPerProteinWithSpans)) {
            if (chains.length < 1)
                continue;

            const proteinIndex = chains[0].ProteinIndex;

            // get appropriate protein sequence data
            const proteinSequence = this.ProteinSequences.filter(x => x.ProteinIndex === proteinIndex).at(0);

            if (!proteinSequence)
                continue;

            let begin: number = longestLeftBranch - this.leftAlignmentShifts[proteinIndex];

            // container for all the track data
            const trackData: Array<{ begin: number, end: number }> = [];

            // for each chain sequence add residue spans
            for (const chain of proteinSequence.ChainSequences) {
                // get spans of current chain
                const currentChainSpans = chains.filter(x => x.ChainId === chain.ChainId);

                // add each span to the trackData 
                for (const span of currentChainSpans) {
                    trackData.push({ begin: begin + span.Start, end: begin + span.End });
                }

                // shift the variable to the start of the next chain
                begin += chain.Sequence.length;
            }

            // add all data into the viewer array
            rcsbInput.push({
                trackId: 'blockTrack',
                trackHeight: 20,
                trackColor: '#FFFFFF',
                displayType: 'block',
                displayColor: '#FF8C00',
                rowTitle: `${name}`,
                trackData: trackData
            });
        }
    }
}
