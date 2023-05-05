import { Injectable } from '@angular/core';
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import { PluginCommands } from 'molstar/lib/mol-plugin/commands';
import { ProteinThemeProvider } from '../providers/protein-theme-provider';
import { Protein } from '../models/protein.model';
import { StructureSelection } from 'molstar/lib/mol-model/structure';
import { StructureComponentRef, StructureRef } from 'molstar/lib/mol-plugin-state/manager/structure/hierarchy-state';
import { Script } from 'molstar/lib/mol-script/script';
import { StructureRepresentationPresetProvider, presetStaticComponent } from 'molstar/lib/mol-plugin-state/builder/structure/representation-preset';
import { StructureRepresentationRegistry } from 'molstar/lib/mol-repr/structure/registry';
import { StateObjectRef } from 'molstar/lib/mol-state';
import { MolScriptBuilder as MS } from 'molstar/lib/mol-script/language/builder';
import { getModelEntityOptions, getChainOptions, getOperatorOptions, getStructureOptions, getSequenceWrapper } from 'molstar/lib/mol-plugin-ui/sequence'
import { ProteinSequence } from '../models/protein-sequence.model';
import { PluginStateObject as PSO } from 'molstar/lib/mol-plugin-state/objects';
import { Structure } from 'molstar/lib/mol-model/structure';

@Injectable({
    providedIn: 'root'
})
export class MolstarService {

    constructor() { }

    public GetChainSequences(plugin: PluginUIContext): ProteinSequence[] {
        let ProteinSequences: ProteinSequence[] = [];
        // get the sequences from Mol*
        const structureOptions = getStructureOptions(plugin.state.data);

        // get sequence of each chain for each visualized structure 
        for (const [index, structureRef] of structureOptions.options.entries()) {
            let proteinSequence: ProteinSequence = {
                ProteinIndex: index,
                ChainSequences: []
            };

            // get the sequence for each chain 
            const structure = this.getStructure(structureRef[0], plugin);
            let modelEntityId = getModelEntityOptions(structure);
            let chainGroupIds = getChainOptions(structure, modelEntityId[0][0]);
            for (const chainGroupId of chainGroupIds) {
                let chainId: string = this.parseChainId(chainGroupId[1]);

                let operatorKey = getOperatorOptions(structure, modelEntityId[0][0], chainGroupId[0]);
                let sequence: string = this.ArrayLikeToString((getSequenceWrapper({
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
    
    public async CameraReset(plugin: PluginUIContext) {
        await new Promise(res => requestAnimationFrame(res));
        PluginCommands.Camera.Reset(plugin);
    }

    public async ApplyUniformEntityColoring(plugin: PluginUIContext) {
        for (const [index, structure] of plugin.managers.structure.hierarchy.current.structures.entries()) {
            await plugin.managers.structure.component.updateRepresentationsTheme(structure.components, {
                color: ProteinThemeProvider.name as any, colorParams: { value: index }
            });
        }
    }

    public async BuildRepresentation(plugin: PluginUIContext, index: number, structureRepresentationType: StructureRepresentationRegistry.BuiltIn) {
        // remove previous representation
        await plugin.managers.structure.component.removeRepresentations(plugin.managers.structure.hierarchy.current.structures[index].components);

        let { update, builder, typeParams } = StructureRepresentationPresetProvider.reprBuilder(plugin, {});
        builder = plugin.builders.structure.representation;
        let atomicType: StructureRepresentationRegistry.BuiltIn = structureRepresentationType;

        // get reference of the coresponding structure
        const structureCell = StateObjectRef.resolveAndCheck(plugin.state.data, plugin.managers.structure.hierarchy.current.structures[index].cell.transform.ref);
        if (!structureCell) return;
        // select only polymer (omit water molecules etc.)
        const ref = await presetStaticComponent(plugin, structureCell, 'polymer');

        // build & commit the representation
        builder.buildRepresentation(update, ref, { type: atomicType });
        await update.commit({ revertOnError: true });

        // apply coloring
        this.ApplyUniformEntityColoring(plugin);

        this.CameraReset(plugin);

    }

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

    public async Highlight(plugin: PluginUIContext, pdbCode: string, chainId: string, start: number, end: number, maxIndex: number) {
        let structureIndex = 0;
        for (let i = 0; i < maxIndex; i++) {
            if (plugin.managers.structure.hierarchy.current.structures[i]?.cell.obj?.data.units[0].model.entryId.toLowerCase() === pdbCode)
                structureIndex = i;

        }
        const data = plugin.managers.structure.hierarchy.current.structures[structureIndex]?.cell.obj?.data;
        if (!data) return;
        const selection = Script.getStructureSelection(Q => Q.struct.filter.first([
            Q.struct.generator.atomGroups({
                "group-by": MS.struct.atomProperty.core.operatorName(),
                'chain-test': Q.core.rel.eq([chainId, Q.struct.atomProperty.macromolecular.auth_asym_id()]),
                'residue-test': Q.core.rel.inRange([Q.struct.atomProperty.macromolecular.label_seq_id(), start, end]),
                'entity-test': MS.core.rel.eq([MS.ammp('entityType'), 'polymer'])
            })]), data);
        const loci = StructureSelection.toLociWithSourceUnits(selection);

        plugin.managers.interactivity.lociHighlights.highlight({ loci });
    }


    private getStructure(ref: string, plugin: PluginUIContext) {
        const state = plugin.state.data;
        const cell = state.select(ref)[0];
        if (!ref || !cell || !cell.obj) return Structure.Empty;
        return (cell.obj as PSO.Molecule.Structure).data;
    }

    private ArrayLikeToString(sequence: ArrayLike<string>): string {
        let sequenceToString: string = "";
        for (let i = 0; i < sequence.length; i++) {
            sequenceToString += sequence[i];
        }
        return sequenceToString
    }

    private parseChainId(auth_asym_id_label_asym_id_combined: string): string {
        // sometimes the chain ID is in the format of "X [auth Y]", we want to retrieve the "Y" only

        // 'auth_asym_id_label_asym_id_combined': snake case because that is used globally in the mmcif files

        let index: number = auth_asym_id_label_asym_id_combined.indexOf("[");
        if (index === -1) return auth_asym_id_label_asym_id_combined;

        let indexEnd: number = auth_asym_id_label_asym_id_combined.indexOf("]");
        let authSubstring: string = auth_asym_id_label_asym_id_combined.substring(index + 1, indexEnd);
        let tokens: string[] = authSubstring.split(' ');
        if (tokens[0] === "auth")
            return tokens[1]
        else {
            console.error("Unknown format of chain id: ", auth_asym_id_label_asym_id_combined);
            return auth_asym_id_label_asym_id_combined;
        }
    }

}
