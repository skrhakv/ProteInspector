import { Injectable } from '@angular/core';
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import { PluginCommands } from 'molstar/lib/mol-plugin/commands';
import { ProteinThemeProvider } from '../providers/protein-theme-provider';
import { Protein } from '../models/protein.model';
import { StructureSelection } from 'molstar/lib/mol-model/structure';
import { StructureComponentRef } from 'molstar/lib/mol-plugin-state/manager/structure/hierarchy-state';
import { Script } from 'molstar/lib/mol-script/script';
import { StructureRepresentationPresetProvider, presetStaticComponent } from 'molstar/lib/mol-plugin-state/builder/structure/representation-preset';
import { StructureRepresentationRegistry } from 'molstar/lib/mol-repr/structure/registry';
import { StateObjectRef } from 'molstar/lib/mol-state';

@Injectable({
    providedIn: 'root'
})
export class MolstarService {

    constructor() { }

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
}
