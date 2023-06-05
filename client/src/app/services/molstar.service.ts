import { Injectable } from '@angular/core';
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import { PluginCommands } from 'molstar/lib/mol-plugin/commands';
import { ProteinThemeProvider, getLighterColor } from '../providers/protein-theme-provider';
import { Protein } from '../models/protein.model';
import { StructureElement, StructureSelection } from 'molstar/lib/mol-model/structure';
import { StructureComponentRef } from 'molstar/lib/mol-plugin-state/manager/structure/hierarchy-state';
import { Script } from 'molstar/lib/mol-script/script';
import { StructureRepresentationPresetProvider, presetStaticComponent } from 'molstar/lib/mol-plugin-state/builder/structure/representation-preset';
import { StructureRepresentationRegistry } from 'molstar/lib/mol-repr/structure/registry';
import { StateObjectRef } from 'molstar/lib/mol-state';
import { MolScriptBuilder as MS } from 'molstar/lib/mol-script/language/builder';
import { getModelEntityOptions, getChainOptions, getOperatorOptions, getStructureOptions, getSequenceWrapper } from 'molstar/lib/mol-plugin-ui/sequence'
import { ProteinSequence } from '../models/protein-sequence.model';
import { PluginStateObject as PSO } from 'molstar/lib/mol-plugin-state/objects';
import { Structure } from 'molstar/lib/mol-model/structure';
import { setStructureOverpaint } from 'molstar/lib/mol-plugin-state/helpers/structure-overpaint';
import { HighlightedDomain } from '../models/highlighted-domain.model';


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

    public HighlightResidue(plugin: PluginUIContext, proteinSequence: ProteinSequence, chainID: string, position: number) {
        const data = plugin.managers.structure.hierarchy.current.structures[proteinSequence.ProteinIndex]?.cell.obj?.data;
        if (!data) return;

        const selection = Script.getStructureSelection(Q => Q.struct.filter.first([
            Q.struct.generator.atomGroups({
                "group-by": MS.struct.atomProperty.core.operatorName(),
                'chain-test': Q.core.rel.eq([chainID, Q.struct.atomProperty.macromolecular.auth_asym_id()]),
                'residue-test': Q.core.rel.eq([Q.struct.atomProperty.macromolecular.label_seq_id(), position + 1, position + 1]),
                'entity-test': MS.core.rel.eq([MS.ammp('entityType'), 'polymer'])
            })]), data);

        let loci: StructureElement.Loci = StructureSelection.toLociWithSourceUnits(selection);

        plugin.managers.interactivity.lociHighlights.highlightOnly({ loci });
    }

    public ClearResidueHighlighting(plugin: PluginUIContext) {
        plugin.managers.interactivity.lociHighlights.clearHighlights();
    }

    public async HighlightDomains(plugin: PluginUIContext, domain: HighlightedDomain, ToggleHighlighting = true) {

        const data = plugin.managers.structure.hierarchy.current.structures[domain.ProteinIndex]?.cell.obj?.data;
        if (!data) return;

        const selection = Script.getStructureSelection(Q => Q.struct.filter.first([
            Q.struct.generator.atomGroups({
                "group-by": MS.struct.atomProperty.core.operatorName(),
                'chain-test': Q.core.rel.eq([domain.ChainId, Q.struct.atomProperty.macromolecular.auth_asym_id()]),
                'residue-test': Q.core.rel.inRange([Q.struct.atomProperty.macromolecular.label_seq_id(), domain.Start, domain.End]),
                'entity-test': MS.core.rel.eq([MS.ammp('entityType'), 'polymer'])
            })]), data);

        let loci: StructureElement.Loci = StructureSelection.toLociWithSourceUnits(selection);

        const s = plugin.managers.structure.hierarchy.current.structures[domain.ProteinIndex];
        const components = s.components;

        let colorLevel: number;
        if (domain.Highlighted != ToggleHighlighting)
            colorLevel = domain.ColorLevel;
        else colorLevel = 0;

        const lociGetter = async (s: Structure) => { return loci; }

        await setStructureOverpaint(plugin, components, getLighterColor(domain.ProteinIndex, colorLevel), lociGetter);
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

    private parseChainId(authAsymIdLabelAsymIdCombined: string): string {
        // sometimes the chain ID is in the format of "X [auth Y]", we want to retrieve the "Y" only

        let index: number = authAsymIdLabelAsymIdCombined.indexOf("[");
        if (index === -1) return authAsymIdLabelAsymIdCombined;

        let indexEnd: number = authAsymIdLabelAsymIdCombined.indexOf("]");
        let authSubstring: string = authAsymIdLabelAsymIdCombined.substring(index + 1, indexEnd);
        let tokens: string[] = authSubstring.split(' ');
        if (tokens[0] === "auth")
            return tokens[1]
        else {
            console.error("Unknown format of chain id: ", authAsymIdLabelAsymIdCombined);
            return authAsymIdLabelAsymIdCombined;
        }
    }

}
