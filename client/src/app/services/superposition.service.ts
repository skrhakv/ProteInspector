import { Injectable } from '@angular/core';
import { Asset } from 'molstar/lib/mol-util/assets';
import { BuiltInTrajectoryFormat } from 'molstar/lib/mol-plugin-state/formats/trajectory';
import { Script } from 'molstar/lib/mol-script/script';
import { MolScriptBuilder as MS } from 'molstar/lib/mol-script/language/builder';
import { QueryContext, Structure, StructureElement, StructureProperties, StructureSelection } from 'molstar/lib/mol-model/structure';
import { LociEntry } from 'molstar/lib/mol-plugin-ui/structure/superposition'
import { StructureSelectionQueries } from 'molstar/lib/mol-plugin-state/helpers/structure-selection-query';
import { PluginStateObject } from 'molstar/lib/mol-plugin-state/objects';
import { StateObjectRef } from 'molstar/lib/mol-state';
import { elementLabel, structureElementStatsLabel } from 'molstar/lib/mol-theme/label';
import { alignAndSuperpose } from 'molstar/lib/mol-model/structure/structure/util/superposition';
import { SymmetryOperator } from 'molstar/lib/mol-math/geometry';
import { Mat4 } from 'molstar/lib/mol-math/linear-algebra';
import { StateTransforms } from 'molstar/lib/mol-plugin-state/transforms';
import { stripTags } from 'molstar/lib/mol-util/string';
import { Protein } from 'src/app/models/protein.model';
import { PluginContext } from 'molstar/lib/mol-plugin/context';
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import { MolstarService } from './molstar.service';


@Injectable({
    providedIn: 'root'
})
export class SuperpositionService {

    constructor(private molstarService: MolstarService) { }

    public GenerateMolstarVisualisation(plugin: PluginUIContext, proteinsToVisualize: Protein[], callback: () => void) {
    plugin.dataTransaction(async () => {
        // load each structure
        for (const protein of proteinsToVisualize) {
            await this.loadStructure(plugin, `${protein.FileLocation}${protein.PdbCode}.cif`, 'mmcif', false);
        }

        // select residues which are going to be used for superposition
        for (const [index, protein] of proteinsToVisualize.entries()) {
            const data = plugin.managers.structure.hierarchy.current.structures[index]?.cell.obj?.data;
            if (!data) return;
            const selection = Script.getStructureSelection(Q => Q.struct.filter.first([
                Q.struct.generator.atomGroups({
                    "group-by": MS.struct.atomProperty.core.operatorName(),
                    'chain-test': Q.core.rel.eq([protein.ChainId, Q.struct.atomProperty.macromolecular.auth_asym_id()]),
                    'residue-test': Q.core.rel.inRange([Q.struct.atomProperty.macromolecular.label_seq_id(), protein.LcsStart, protein.LcsStart + protein.LcsLength]),
                    'entity-test': MS.core.rel.eq([MS.ammp('entityType'), 'polymer'])
                })]), data);
            const loci = StructureSelection.toLociWithSourceUnits(selection);

            plugin.managers.interactivity.lociSelects.selectOnly({ loci });
        }

        // apply custom color theme to each structure
        this.molstarService.ApplyUniformEntityColoring(plugin);

        // superpose selected residues
        this.superposeChains(plugin);

        // clear selection
        plugin.managers.interactivity.lociSelects.deselectAll();

        callback();
    });
}

    private async loadStructure(plugin: PluginContext, url: string, format: BuiltInTrajectoryFormat, isBinary ?: boolean) {
    try {
        const data = await plugin.builders.data.download({ url: Asset.Url(url), isBinary: isBinary });

        const trajectory = await plugin.builders.structure.parseTrajectory(data, format);
        const model = await plugin.builders.structure.createModel(trajectory);
        const structure = await plugin.builders.structure.createStructure(model, { name: 'model', params: {} });
        const polymer = await plugin.builders.structure.tryCreateComponentStatic(structure, 'polymer');
        const ligand = await plugin.builders.structure.tryCreateComponentStatic(structure, 'ligand');

        if (polymer) {
            await plugin.builders.structure.representation.addRepresentation(polymer, {
                type: 'cartoon'
            });
        }

        if (ligand) {
            await plugin.builders.structure.representation.addRepresentation(ligand, {
                type: 'ball-and-stick'
            });
        }

        await plugin.builders.structure.insertStructureProperties(structure);

        return { data, trajectory, model, structure };
    } catch (e) {
        return { structure: void 0 };
    }
}

    private getRootStructure(s: Structure, plugin: PluginUIContext) {
    const parent = plugin.helpers.substructureParent.get(s)!;
    
    return plugin.state.data.selectQ(q => q.byValue(parent).rootOfType(PluginStateObject.Molecule.Structure))[0].obj?.data!;
}

getChainEntries(plugin: PluginUIContext) {
    const location = StructureElement.Location.create();
    const entries: LociEntry[] = [];
    plugin.managers.structure.selection.entries.forEach(({ selection }, ref) => {
        const cell = StateObjectRef.resolveAndCheck(plugin.state.data, ref);
        if (!cell || StructureElement.Loci.isEmpty(selection)) return;

        // only single polymer chain selections
        const l = StructureElement.Loci.getFirstLocation(selection, location)!;
        if (selection.elements.length > 1 || StructureProperties.entity.type(l) !== 'polymer') return;

        const stats = StructureElement.Stats.ofLoci(selection);
        const counts = structureElementStatsLabel(stats, { countsOnly: true });
        const chain = elementLabel(l, { reverse: true, granularity: 'chain' }).split('|');
        const label = `${counts} | ${chain[0]} | ${chain[chain.length - 1]}`;
        entries.push({ loci: selection, label, cell });
    });
    return entries;
}

    async superposeChains(plugin: PluginUIContext) {
    const { query } = StructureSelectionQueries.trace;
    const entries = this.getChainEntries(plugin);

    const locis = entries.map((e: any) => {
        const s = StructureElement.Loci.toStructure(e.loci);
        const loci = StructureSelection.toLociWithSourceUnits(query(new QueryContext(s)));
        return StructureElement.Loci.remap(loci, this.getRootStructure(e.loci.structure, plugin));
    });

    const pivot = plugin.managers.structure.hierarchy.findStructure(locis[0]?.structure);
    const coordinateSystem = pivot?.transform?.cell.obj?.data.coordinateSystem;

    const transforms = alignAndSuperpose(locis);

    const eA = entries[0];
    for (let i = 1, il = locis.length; i < il; ++i) {
        const eB = entries[i];
        const { bTransform, rmsd } = transforms[i - 1];
        await this.transform(plugin, eB.cell, bTransform, coordinateSystem);
        const labelA = stripTags(eA.label);
        const labelB = stripTags(eB.label);
        plugin.log.info(`Superposed [${labelA}] and [${labelB}] with RMSD ${rmsd.toFixed(2)}.`);
    }
    await this.molstarService.CameraReset(plugin);
}

    async transform(plugin: PluginUIContext, s: StateObjectRef<PluginStateObject.Molecule.Structure>, matrix: Mat4, coordinateSystem ?: SymmetryOperator) {
    const r = StateObjectRef.resolveAndCheck(plugin.state.data, s);
    if (!r) return;
    const o = plugin.state.data.selectQ(q => q.byRef(r.transform.ref).subtree().withTransformer(StateTransforms.Model.TransformStructureConformation))[0];

    const transform = coordinateSystem && !Mat4.isIdentity(coordinateSystem.matrix)
        ? Mat4.mul(Mat4(), coordinateSystem.matrix, matrix)
        : matrix;

    const params = {
        transform: {
            name: 'matrix' as const,
            params: { data: transform, transpose: false }
        }
    };
    const b = o
        ? plugin.state.data.build().to(o).update(params)
        : plugin.state.data.build().to(s)
            .insert(StateTransforms.Model.TransformStructureConformation, params, { tags: 'SuperpositionTransform' });
    await plugin.runTask(plugin.state.data.updateTree(b));
}

}
