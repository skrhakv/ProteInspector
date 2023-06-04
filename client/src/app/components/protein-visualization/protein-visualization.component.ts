import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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

declare var msa: any;

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

    public VisualizationReady: boolean = false;
    public ShowHighlightButtons: boolean = false;
    public IsProteinVisible: boolean[] = [];
    public OnlyChains: [visible: boolean, buttonText: string] = [false, "Show Chains"];
    public ProteinRepresentation: StructureRepresentationRegistry.BuiltIn[] = [];

    constructor(
        private molstarService: MolstarService,
        private superpositionService: SuperpositionService
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
        let callback = () => {
            this.VisualizationReady = true;
            this.LoadMsaViewer();
        }

        this.superpositionService.GenerateMolstarVisualisation(this.plugin, this.proteins, callback);

        this.ShowHighlightButtons = true;
    }

    public onExportButtonClicked() {
        this.export.emit();
    }

    public async ToggleHighlighting(index: number) {
        this.molstarService.Highlight(this.plugin, this.highlightedDomains[index]);
        this.highlightedDomains[index].Highlighted = !this.highlightedDomains[index].Highlighted;
    }

    private async updateHighlighting() {
        for (const domain of this.highlightedDomains)
            await this.molstarService.Highlight(this.plugin, domain, false);
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
        let proteinColor = getColorHex(index);

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
            this.OnlyChains[1] = "Show Full Structures"
        }

        await this.updateHighlighting();
    }

    private UpdateChainVisibilityButtonText(): void {
        this.OnlyChains[1] = "Show Chains "
        let first: boolean = true;
        for (const protein of this.proteins) {
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

    get GetRepresentationTypes(): Record<StructureRepresentationRegistry.BuiltIn, string> {
        return AppSettings.REPRESENTATION_TYPES;
    }

    getStringSpan(domain: HighlightedDomain): string {
        return domain.Start.toString() + "-" + domain.End.toString();
    }

    private LoadMsaViewer() {
        let ProteinSequences: ProteinSequence[] = this.molstarService.GetChainSequences(this.plugin);

        // compute the size of the left branch of the sequence from the desired chain for each protein
        let leftBranchSizes: number[] = [];

        for (let i = 0; i < this.proteins.length; i++) {
            let leftBranchSize: number = 0;

            // get index of the relevant chain
            let indexOfRelevantChain: number = ProteinSequences[i].ChainSequences.findIndex(x => x.ChainId === this.proteins[i].ChainId);

            // compute how long is the left branch
            for (let ii = 0; ii < indexOfRelevantChain; ii++) {
                leftBranchSize += ProteinSequences[i].ChainSequences[ii].Sequence.length;
            }

            // add the additional alignment from the database
            leftBranchSize += Number(this.proteins[i].LcsStart);

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

        // set CSS height of the MSA viewer
        m.g.zoomer.set("alignmentHeight", 50 + (15 * labels.length));

        m.render();
    }
}
