import { Component, ElementRef, Input, OnInit } from '@angular/core';
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
    @Input() isWholeProtein: boolean = false;
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
    ChangeRepresentation(representation: string) {
        this.representation = representation as StructureRepresentationRegistry.BuiltIn;
        this.visible = true;
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

        this.visible = true;
        this.rebuildStructure();
    }

    /**
     * Color in color picker changed
     */
    ColorChanged(event: any) {
        let colorHex: string = event.target.value;
        this.color = Color.fromHexStyle(colorHex);
        this.buttonColorStyles = Utils.getCssColor(colorHex);

        this.visible = true;
        this.rebuildStructure();
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

    /**
     * Updates the highlighting according to the saved data
     */
    async rebuildStructure() {
        this.selector = await this.molstarService.BuildSelection(this.plugin, this.superpositionService.structure[this.proteinIndex],
            this.superpositionService.model, this.selector, this.molstarSelection, this.visible, this.color, this.opacity,
            this.representation);

        // if the highlighting should be visible, then use the specified color and transparency
        if (this.visible) {
            await this.molstarService.HighlightDomains(this.plugin, this.molstarSelection, this.color, 1 - this.opacity, this.proteinIndex, false);
        }

        // if not, then "overpaint" the domain with the color of the protein and no transparency, resulting in unified surface with the rest of the protein
        else {
            if (this.isWholeProtein)
                await this.molstarService.HighlightDomains(this.plugin, this.molstarSelection, Color.fromHexStyle(this.proteinColorHex), 0, this.proteinIndex, false);
            else
                await this.molstarService.HighlightDomains(this.plugin, this.molstarSelection, Color.fromHexStyle(this.proteinColorHex), 0, this.proteinIndex, true);
        }
    }

    ngOnInit(): void {
        // get initial color of the substructure
        if (this.isWholeProtein)
            this.color = getLighterColorFromHex(this.proteinColorHex, 0);
        else
            this.color = getLighterColorFromHex(this.proteinColorHex, 2);

        this.buttonColorStyles = Utils.getCssColor(this.proteinColorHex);
        if (this.isWholeProtein)
            this.rebuildStructure();
    }

}