import { Component, Input, OnInit } from '@angular/core';
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import { StructureRepresentationRegistry } from 'molstar/lib/mol-repr/structure/registry';
import { Expression } from 'molstar/lib/mol-script/language/expression';
import { Color } from 'molstar/lib/mol-util/color';
import { AppSettings } from 'src/app/app-settings';
import { getLighterColorFromHex } from 'src/app/providers/protein-theme-provider';
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
    @Input() colorHex!: string;

    /**
     * selected representation of the substructure
     */
    public representation: StructureRepresentationRegistry.BuiltIn = 'cartoon';
    /**
     * selected visibility of the substructure
     */
    public visible = false;
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
    constructor(
        private molstarService: MolstarService,
        private superpositionService: SuperpositionService) { }

    get GetRepresentationTypes(): Record<StructureRepresentationRegistry.BuiltIn, string> {
        return AppSettings.REPRESENTATION_TYPES;
    }

    /**
     * Change structure representation
     * @param representation 
     */
    ChangeRepresentation(representation: string) {
        this.representation = representation as StructureRepresentationRegistry.BuiltIn;

        if (this.visible)
            this.rebuildStructure();
    }
    /**
     * toggles visibility of the whole structure
     */
    ToggleVisibility() {
        this.visible = !this.visible;

        this.rebuildStructure();
    }
    /**
     * toggles opacity of the structure
     */
    ToggleOpacity(event: any) {
        this.opacity = event.target.value / 100;

        if (this.visible)
            this.rebuildStructure();
    }

    /**
     * Color in color picker changed
     */
    ColorChanged(event: any) {
        this.color = Color.fromHexStyle(event.target.value);

        if (this.visible)
            this.rebuildStructure();
    }
    /**
     * Pallete button clicked
     */
    OnClickPalleteButton() {
        const elem = document.getElementById('exampleColorInput');

        if (!elem)
            return;
        const evt = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });

        elem.dispatchEvent(evt);

    }

    /**
     * Updates the highlighting according to the saved data
     */
    async rebuildStructure() {
        this.selector = await this.molstarService.BuildSelection(this.plugin, this.superpositionService.structure[this.proteinIndex],
            this.superpositionService.model, this.selector, this.molstarSelection, this.visible, this.color, this.opacity,
            this.representation);

        await this.molstarService.ClearDomainHighlighting(this.plugin, this.proteinIndex);
        
        if(this.visible)
            await this.molstarService.HighlightDomains(this.plugin, this.molstarSelection, this.color, 1 - this.opacity, this.proteinIndex);
    }

    /**
     * get CSS styles to get suitable colors 
     * @param index protein index
     * @returns CSS styles
     */
    getCssColor(): Record<string, string> {
        return Utils.getCssColor(this.colorHex);
    }

    ngOnInit() {
        // get initial color of the substructure
        this.color = getLighterColorFromHex(this.colorHex, 2);
    }
}