import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import { StructureRepresentationRegistry } from 'molstar/lib/mol-repr/structure/registry';
import { Expression } from 'molstar/lib/mol-script/language/expression';
import { Color } from 'molstar/lib/mol-util/color';
import { AppSettings } from 'src/app/app-settings';
import { Protein } from 'src/app/models/protein.model';
import { colors, getLighterColorFromHex } from 'src/app/providers/protein-theme-provider';
import { MolstarService } from 'src/app/services/molstar.service';
import { SuperpositionService } from 'src/app/services/superposition.service';
import { Utils } from 'src/app/utils';

/**
 * Handles atributes for particular structures (i.e. visibility/representation for domains/residues/ligands) 
 */
@Component({
    selector: 'app-detail-view-button-group',
    templateUrl: './detail-view-button-group.component.html',
    styleUrls: ['./detail-view-button-group.component.scss']
})
export class DetailViewButtonGroupComponent implements OnInit {
    @Input() plugin!: PluginUIContext;
    /**
     * Molstar expression for selecting the substructure
     */
    @Input() molstarSelection!: Expression;
    /**
     *  protein index where the substructure belongs
     */
    @Input() proteinIndex!: number;
    /**
     * true if buttons should be disabled (for example, molstar is still loading)
     */
    @Input() disabled!: boolean;
    /**
     * button description text
     */
    @Input() description!: string;
    /**
     * hex color in format: "FFFFFF"
     */
    @Input() proteinColorHex!: string;

    /**
     * selected representation of the substructure
     */
    @Input() representation: StructureRepresentationRegistry.BuiltIn = 'cartoon';
    /**
     * selected visibility of the substructure
     */
    @Input() visible = false;

    /**
     * true if button handles a whole protein
     */
    @Input() isWholeProtein = false;

    /**
     * event for triggering updating other structures outside of the scope of this button component
     */
    @Output() updateOtherStructures = new EventEmitter<void>();

    /**
     * Making sure the change is not applied twice
     */
    private updateTriggeredHere: boolean  = false;

    triggerOtherStructuresUpdate(): void {
        this.updateTriggeredHere = true;
        this.updateOtherStructures.emit();
    }

    /**
     * selected color of the substructure
     */
    private color!: Color;
    /**
     * selected opacity of the substructure
     *  */
    private opacity = 1;
    /**
     * molstar selector for handling re-structuring 
     */
    private selector!: any;

    private molstarLabel!: string;

    private static globalDomainID: number = 0;

    public buttonColorStyles!: Record<string, string>;

    constructor(
        private molstarService: MolstarService,
        private superpositionService: SuperpositionService,
        private elementRef: ElementRef
    ) { }

    get GetRepresentationTypes(): Record<StructureRepresentationRegistry.BuiltIn, string> {
        return AppSettings.REPRESENTATION_TYPES;
    }

    /**
     * Change structure representation
     * @param representation 
     */
    async ChangeRepresentation(representation: string) {
        this.representation = representation as StructureRepresentationRegistry.BuiltIn;
        this.visible = true;
        this.rebuildAndUpdateOtherStructures();
    }
    /**
     * toggles visibility of the whole structure
     */
    async ToggleVisibility() {
        this.visible = !this.visible;

        this.rebuildAndUpdateOtherStructures();
    }

    private rebuildAndUpdateOtherStructures() {
        this.triggerOtherStructuresUpdate();

        this.rebuildStructure();
    }

    /**
     * toggles opacity of the structure
     */
    async ToggleOpacity(event: any) {
        this.opacity = event.target.value / 100;

        this.visible = true;

        this.rebuildAndUpdateOtherStructures();
    }

    /**
     * Color in color picker changed
     */
    async ColorChanged(event: any) {
        const colorHex: string = event.target.value;
        this.color = Color.fromHexStyle(colorHex);
        this.buttonColorStyles = Utils.getCssColor(colorHex);

        if (this.isWholeProtein) {
            colors[this.proteinIndex] = this.color;
        }

        this.visible = true;
        this.rebuildAndUpdateOtherStructures();
    }
    /**
     * Pallete button clicked
     */
    OnClickPalleteButton() {
        const elem = this.elementRef.nativeElement.getElementsByTagName('input')[1];

        if (!elem)
            return;
        const evt = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });

        elem.dispatchEvent(evt);
    }

    updateStructure() {
        if (!this.isWholeProtein && !this.updateTriggeredHere)
            this.rebuildStructure();
        else this.updateTriggeredHere = false;
    }

    async removeStructure() {
        if (this.selector)
            await this.molstarService.RemoveObject(this.plugin, this.superpositionService.model.state, this.selector);

        if (this.visible)
            this.ToggleVisibility();
    }

    async ShowChainsOnly(protein: Protein) {
        return this.molstarService.ShowChainsOnly(this.plugin, protein, this.superpositionService.structure[this.proteinIndex], this.color, this.representation);
    }

    /**
     * Updates the highlighting according to the saved data
     */
    async rebuildStructure() {
        this.selector = await this.molstarService.BuildSelection(this.plugin, this.superpositionService.structure[this.proteinIndex],
            this.superpositionService.model, this.selector, this.molstarSelection, this.visible, this.color, this.opacity,
            this.representation, this.molstarLabel);

        // if the highlighting should be visible, then use the specified color and transparency
        if (this.visible) {
            await this.molstarService.HighlightDomains(this.plugin, this.molstarSelection, this.color, 1 - this.opacity, this.proteinIndex, this.isWholeProtein ? true : false);
        }

        // if not, then "overpaint" the domain with the color of the protein and no transparency, resulting in unified surface with the rest of the protein
        else {
            if (this.isWholeProtein)
                await this.molstarService.HighlightDomains(this.plugin, this.molstarSelection, this.GetProteinHexColor(), 0, this.proteinIndex, false);
            else
                await this.molstarService.HighlightDomains(this.plugin, this.molstarSelection, this.GetProteinHexColor(), 0, this.proteinIndex, true);
        }
    }

    GetProteinHexColor(): Color {
        return colors[this.proteinIndex];
    }

    ngOnInit(): void {
        // get initial color of the substructure
        if (this.isWholeProtein)
            this.color = getLighterColorFromHex(this.proteinColorHex, 0);
        else
            this.color = getLighterColorFromHex(this.proteinColorHex, 2);

        this.buttonColorStyles = Utils.getCssColor(this.proteinColorHex);

        if(this.isWholeProtein)
            this.molstarLabel = 'Protein-' + this.proteinIndex;
        else
            this.molstarLabel = 'Domain-' + DetailViewButtonGroupComponent.globalDomainID++;

        if (this.isWholeProtein)
            this.rebuildStructure();
    }

}