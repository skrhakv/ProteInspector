import { Injectable } from '@angular/core';
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import { PluginCommands } from 'molstar/lib/mol-plugin/commands';
import { ProteinThemeProvider } from '../providers/protein-theme-provider';
import { Protein } from '../models/protein.model';
import { StructureElement, StructureSelection } from 'molstar/lib/mol-model/structure';
import { StructureComponentRef } from 'molstar/lib/mol-plugin-state/manager/structure/hierarchy-state';
import { Script } from 'molstar/lib/mol-script/script';
import { StructureRepresentationPresetProvider, presetStaticComponent } from 'molstar/lib/mol-plugin-state/builder/structure/representation-preset';
import { StructureRepresentationRegistry } from 'molstar/lib/mol-repr/structure/registry';
import { StateObjectRef } from 'molstar/lib/mol-state';
import { MolScriptBuilder as MS } from 'molstar/lib/mol-script/language/builder';
import { getModelEntityOptions, getChainOptions, getOperatorOptions, getStructureOptions, getSequenceWrapper } from 'molstar/lib/mol-plugin-ui/sequence';
import { ProteinSequence } from '../models/protein-sequence.model';
import { PluginStateObject as PSO } from 'molstar/lib/mol-plugin-state/objects';
import { Structure } from 'molstar/lib/mol-model/structure';
import { setStructureOverpaint } from 'molstar/lib/mol-plugin-state/helpers/structure-overpaint';
import { setStructureTransparency } from 'molstar/lib/mol-plugin-state/helpers/structure-transparency';
import { createStructureRepresentationParams } from 'molstar/lib/mol-plugin-state/helpers/structure-representation-params';
import { StateTransforms } from 'molstar/lib/mol-plugin-state/transforms';
import { Color } from 'molstar/lib/mol-util/color';
import { Expression } from 'molstar/lib/mol-script/language/expression';

/**
 * Handles the updating of the mol* plugin, for example highlighting, coloring, visibility, etc.
 */
@Injectable({
    providedIn: 'root'
})
export class MolstarService {
    /**
 * Overpaints specified domain to highlight it
 * @param plugin molstar plugin
 * @param expr selection
 * @param color 
 * @param transparency 0 means full visiblity, 1 mean no visibility
 * @param proteinIndex 
 * @returns 
 */
    public async HighlightDomains(plugin: PluginUIContext, expr: Expression, color: Color, transparency: number, proteinIndex: number, showOriginalRepresentation: boolean) {

        const data = plugin.managers.structure.hierarchy.current.structures[proteinIndex]?.cell.obj?.data;
        if (!data) return;

        const selection = Script.getStructureSelection(Q => Q.struct.filter.first([expr]), data);

        const loci: StructureElement.Loci = StructureSelection.toLociWithSourceUnits(selection);

        const s = plugin.managers.structure.hierarchy.current.structures[proteinIndex];
        const components = s.components;

        const lociGetter = async (s: Structure) => { return loci; };

        await setStructureOverpaint(plugin, components, color, lociGetter);
        await setStructureTransparency(plugin, components, transparency, lociGetter);

        if(showOriginalRepresentation)
            this.TweakStructureSelectionTransparency(plugin, selection, 0);
        else
            this.TweakStructureSelectionTransparency(plugin, selection, 1);

    }

    /**
     * Changes transparency of structure selection
     * @param plugin 
     * @param selection 
     * @param transparency 0 means full visibility, 1 means no visibility
     */
    private async TweakStructureSelectionTransparency(plugin: PluginUIContext, selection: StructureSelection, transparency: number) {

        const struct = plugin.managers.structure.hierarchy.current.structures[0];
        const repr = struct.components[0].representations[0].cell;

        const bundle = StructureElement.Bundle.fromSelection(selection);

        const update = plugin.build();

        // if you have more than one repr to apply this to, do this for each of them
        update.to(repr).apply(StateTransforms.Representation.TransparencyStructureRepresentation3DFromBundle, {
            layers: [{ bundle, value: transparency }]
        });
        await update.commit();
    }

    /**
     * Renders new selection with specified parameters
     * @param plugin molstar plugin
     * @param structure structure from loading process
     * @param state state from loading process
     * @param selector selector for deleting the previous selection
     * @param selection definition of the selection
     * @param visible true if the selection should be visible
     * @param color color of the new selection structure
     * @param opacity opacity of the new selection structure
     * @param representation representation of the new selection structure
     * @returns selector for deleting this selection in the future call
     */
    async BuildSelection(plugin: PluginUIContext, structure: any, state: any, selector: any, selection: Expression,
        visible: boolean, color: Color, opacity: number, representation: StructureRepresentationRegistry.BuiltIn) {

        // remove previous selection
        if (selector)
            await PluginCommands.State.RemoveObject(plugin, { state: state.state, ref: selector });

        if (!visible)
            return;

        const update = plugin.build();

        const a = update.to(structure)
            .apply(StateTransforms.Model.StructureSelectionFromExpression, { label: 'myLabel', expression: selection });
        a.apply(StateTransforms.Representation.StructureRepresentation3D, createStructureRepresentationParams(plugin, structure.data, {
            type: representation,
            color: 'uniform',
            colorParams: { value: color },
            typeParams: { alpha: opacity },

        }));

        await update.commit();
        return a.selector;
    }
    /**
     * Extracts visualized protein sequences from the molstar plugin
     * @param plugin molstar plugin
     * @returns protein sequence array
     */
    public GetChainSequences(plugin: PluginUIContext): ProteinSequence[] {
        const ProteinSequences: ProteinSequence[] = [];

        const structureOptions = getStructureOptions(plugin.state.data);

        // get sequence of each chain for each visualized structure 
        for (const [index, structureRef] of structureOptions.options.entries()) {
            const proteinSequence: ProteinSequence = {
                ProteinIndex: index,
                ChainSequences: []
            };

            // get the sequence for each chain 
            const structure = this.getStructure(structureRef[0], plugin);
            const modelEntityId = getModelEntityOptions(structure);
            const chainGroupIds = getChainOptions(structure, modelEntityId[0][0]);
            for (const chainGroupId of chainGroupIds) {
                const chainId: string = this.parseChainId(chainGroupId[1]);

                const operatorKey = getOperatorOptions(structure, modelEntityId[0][0], chainGroupId[0]);
                const sequence: string = this.ArrayLikeToString((getSequenceWrapper({
                    structure,
                    modelEntityId: modelEntityId[0][0],
                    chainGroupId: chainGroupId[0],
                    operatorKey: operatorKey[0][0]
                }, plugin.managers.structure.selection) as any).sequence.label.toArray());
                proteinSequence.ChainSequences.push({
                    ChainId: chainId, Sequence: sequence
                });
            }
            // save chain sequences for particular protein
            ProteinSequences.push(proteinSequence);
        }
        return ProteinSequences;
    }

    /**
     * Reset the camera in the plugin
     * @param plugin molstar plugin
     */
    public async CameraReset(plugin: PluginUIContext) {
        await new Promise(res => requestAnimationFrame(res));
        PluginCommands.Camera.Reset(plugin);
    }

    /**
     * Color the proteins, each protein structure with a uniform color
     * @param plugin molstar plugin
     */
    public async ApplyUniformEntityColoring(plugin: PluginUIContext) {
        for (const [index, structure] of plugin.managers.structure.hierarchy.current.structures.entries()) {
            await plugin.managers.structure.component.updateRepresentationsTheme(structure.components, {
                color: ProteinThemeProvider.name as any, colorParams: { value: index }
            });
        }
    }

    /**
     * Change visual representation of a protein 
     * @param plugin molstar plugin
     * @param index protein index
     * @param structureRepresentationType representation type
     */
    public async BuildRepresentation(plugin: PluginUIContext, index: number, structureRepresentationType: StructureRepresentationRegistry.BuiltIn) {
        // remove previous representation
        await plugin.managers.structure.component.removeRepresentations(plugin.managers.structure.hierarchy.current.structures[index].components);

        const { update, builder, typeParams } = StructureRepresentationPresetProvider.reprBuilder(plugin, {});
        const nbuilder = plugin.builders.structure.representation;
        const atomicType: StructureRepresentationRegistry.BuiltIn = structureRepresentationType;

        // get reference of the coresponding structure
        const structureCell = StateObjectRef.resolveAndCheck(plugin.state.data, plugin.managers.structure.hierarchy.current.structures[index].cell.transform.ref);
        if (!structureCell) return;
        // select only polymer (omit water molecules etc.)
        const ref = await presetStaticComponent(plugin, structureCell, 'polymer');

        // build & commit the representation
        nbuilder.buildRepresentation(update, ref, { type: atomicType });
        await update.commit({ revertOnError: true });

        const ligand = await plugin.builders.structure.tryCreateComponentStatic(structureCell, 'ligand');
        if (ligand) {
            await plugin.builders.structure.representation.addRepresentation(ligand, {
                type: 'ball-and-stick'
            });
        }

        // apply coloring
        this.ApplyUniformEntityColoring(plugin);

        this.CameraReset(plugin);
    }

    /**
     * Show only chains, not the whole structure
     * @param plugin molstar plugin
     * @param VisualizedProteins visualized proteins in the molstar plugin
     */
    public async ShowChainsOnly(plugin: PluginUIContext, VisualizedProteins: Protein[]) {
        for (const [index, protein] of VisualizedProteins.entries()) {
            const data = plugin.managers.structure.hierarchy.current.structures[index]?.cell.obj?.data;
            if (!data) return;

            // select the chains
            const selection = Script.getStructureSelection(Q =>
                Q.struct.generator.atomGroups({
                    'chain-test': Q.core.rel.neq([protein.ChainId, Q.struct.atomProperty.macromolecular.auth_asym_id()]),
                }), data);
            const loci = StructureSelection.toLociWithSourceUnits(selection);

            plugin.managers.interactivity.lociSelects.selectOnly({ loci });
            const sel = plugin.managers.structure.hierarchy.getStructuresWithSelection();

            const componentsToDelete: StructureComponentRef[] = [];
            for (const s of sel) componentsToDelete.push(...s.components);

            // delete everything except for the selected chains
            await plugin.managers.structure.component.modifyByCurrentSelection(componentsToDelete, 'subtract');
            plugin.managers.interactivity.lociSelects.deselectAll();
        }
        this.CameraReset(plugin);
    }

    /**
     * Highlight specified residue
     * @param plugin molstar plugin
     * @param proteinSequence
     * @param chainID auth_asym_id
     * @param position label_seq_id
     */
    public HighlightResidue(plugin: PluginUIContext, proteinSequence: ProteinSequence, chainID: string, position: number) {
        const data = plugin.managers.structure.hierarchy.current.structures[proteinSequence.ProteinIndex]?.cell.obj?.data;
        if (!data) return;

        const selection = Script.getStructureSelection(Q => Q.struct.filter.first([
            Q.struct.generator.atomGroups({
                'group-by': MS.struct.atomProperty.core.operatorName(),
                'chain-test': Q.core.rel.eq([chainID, Q.struct.atomProperty.macromolecular.auth_asym_id()]),
                'residue-test': Q.core.rel.eq([Q.struct.atomProperty.macromolecular.label_seq_id(), position + 1, position + 1]),
                'entity-test': MS.core.rel.eq([MS.ammp('entityType'), 'polymer'])
            })]), data);

        const loci: StructureElement.Loci = StructureSelection.toLociWithSourceUnits(selection);

        plugin.managers.interactivity.lociHighlights.highlightOnly({ loci });
    }

    /**
     * clear residue highlighting
     * @param plugin molstar plugin
     */
    public ClearResidueHighlighting(plugin: PluginUIContext) {
        plugin.managers.interactivity.lociHighlights.clearHighlights();
    }

    private getStructure(ref: string, plugin: PluginUIContext) {
        const state = plugin.state.data;
        const cell = state.select(ref)[0];
        if (!ref || !cell || !cell.obj) return Structure.Empty;
        return (cell.obj as PSO.Molecule.Structure).data;
    }

    private ArrayLikeToString(sequence: ArrayLike<string>): string {
        let sequenceToString = '';
        for (let i = 0; i < sequence.length; i++) {
            sequenceToString += sequence[i];
        }
        return sequenceToString;
    }

    /**
     * From string "X [auth Y]" extract the Y only
     * @param authAsymIdLabelAsymIdCombined 
     * @returns auth_asym_id
     */
    private parseChainId(authAsymIdLabelAsymIdCombined: string): string {
        // sometimes the chain ID is in the format of "X [auth Y]", we want to retrieve the "Y" only

        const index: number = authAsymIdLabelAsymIdCombined.indexOf('[');
        if (index === -1) return authAsymIdLabelAsymIdCombined;

        const indexEnd: number = authAsymIdLabelAsymIdCombined.indexOf(']');
        const authSubstring: string = authAsymIdLabelAsymIdCombined.substring(index + 1, indexEnd);
        const tokens: string[] = authSubstring.split(' ');
        if (tokens[0] === 'auth')
            return tokens[1];
        else {
            console.error('Unknown format of chain id: ', authAsymIdLabelAsymIdCombined);
            return authAsymIdLabelAsymIdCombined;
        }
    }

}