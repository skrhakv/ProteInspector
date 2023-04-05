import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatasetService } from 'src/app/services/dataset.service';
import { PluginContext } from 'molstar/lib/mol-plugin/context';
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import { DefaultPluginUISpec } from 'molstar/lib/mol-plugin-ui/spec';
import { createPluginUI } from 'molstar/lib/mol-plugin-ui/react18';

import { Asset } from 'molstar/lib/mol-util/assets';
import { StateObjectRef } from 'molstar/lib/mol-state';
import { BuiltInTrajectoryFormat } from 'molstar/lib/mol-plugin-state/formats/trajectory';
import { Mat4 } from 'molstar/lib/mol-math/linear-algebra';
import { StateTransforms } from 'molstar/lib/mol-plugin-state/transforms';
import { alignAndSuperposeWithSIFTSMapping } from 'molstar/lib/mol-model/structure/structure/util/superposition-sifts-mapping';
import { SymmetryOperator } from 'molstar/lib/mol-math/geometry';
import { PluginCommands } from 'molstar/lib/mol-plugin/commands';
import { PluginStateObject } from 'molstar/lib/mol-plugin-state/objects';


@Component({
    selector: 'app-protein-view',
    templateUrl: './protein-view.component.html',
    styleUrls: ['./protein-view.component.scss']
})
export class ProteinViewComponent implements OnInit {
    private SuperpositionTag: string = 'SuperpositionTransform';
    private plugin!: PluginUIContext;
    public TableColumnNames: string[] = [];
    public ColumnOrder: string[] = [];
    public TableData!: any;
    public DataReady: boolean = false;
    private row!: number;
    constructor(public datasetService: DatasetService, private route: ActivatedRoute) {

        this.row = parseInt(this.route.snapshot.paramMap.get('id') as string);
        datasetService.currentQuery = decodeURIComponent(this.route.snapshot.paramMap.get('query') as string);

        datasetService.getDatasetInfo().then(_ => {
            datasetService.getSpecificRow(this.row).subscribe(data => {

                this.TableColumnNames = data['columnNames'];
                this.TableData = data['results'];

                for (const columnName of this.datasetService.ColumnOrder) {
                    if (this.TableColumnNames.includes(columnName)) {
                        this.ColumnOrder.push(columnName);
                    }
                }
                this.TableData = this.TableData[0];
                this.DataReady = true;

                let pdbCodes: string[] = [];

                if ('AfterPdbCode' in this.TableData) {
                    pdbCodes.push(this.TableData['AfterPdbCode'] as string);
                }

                if ('BeforePdbCode' in this.TableData) {
                    pdbCodes.push(this.TableData['BeforePdbCode'] as string);
                }

                console.log("my pdb codes: ");
                console.log(pdbCodes);
                this.GenerateMolstarVisualisation(pdbCodes);
            });
        });
    }

    GenerateMolstarVisualisation(pdbCodes: string[]) {
        this.plugin.dataTransaction(async () => {

            for (const s of pdbCodes) {
                await this.loadStructure(this.plugin, `https://www.ebi.ac.uk/pdbe/static/entry/${s}_updated.cif`, 'mmcif');
            }
        }).then(async () => {
            const input = this.plugin.managers.structure.hierarchy.behaviors.selection.value.structures;
            const traceOnly = true;

            const structures = input.map(s => s.cell.obj?.data!);
            const { entries, failedPairs, zeroOverlapPairs } = alignAndSuperposeWithSIFTSMapping(structures, { traceOnly });

            const coordinateSystem = input[0]?.transform?.cell.obj?.data.coordinateSystem;

            let rmsd = 0;

            for (const xform of entries) {
                await this.transform(input[xform.other].cell, xform.transform.bTransform, coordinateSystem);
                rmsd += xform.transform.rmsd;
            }

            rmsd /= Math.max(entries.length - 1, 1);

            const formatPairs = (pairs: [number, number][]) => {
                return `[${pairs.map(([i, j]) => `(${structures[i].models[0].entryId}, ${structures[j].models[0].entryId})`).join(', ')}]`;
            };

            if (zeroOverlapPairs.length) {
                this.plugin.log.warn(`Superposition: No UNIPROT mapping overlap between structures ${formatPairs(zeroOverlapPairs)}.`);
            }

            if (failedPairs.length) {
                this.plugin.log.error(`Superposition: Failed to superpose structures ${formatPairs(failedPairs)}.`);
            }

            if (entries.length) {
                this.plugin.log.info(`Superposed ${entries.length + 1} structures with avg. RMSD ${rmsd.toFixed(2)} Å.`);
                await this.cameraReset();
            }
        });
    }

    async cameraReset() {
        await new Promise(res => requestAnimationFrame(res));
        PluginCommands.Camera.Reset(this.plugin);
    }

    async transform(s: StateObjectRef<PluginStateObject.Molecule.Structure>, matrix: Mat4, coordinateSystem?: SymmetryOperator) {
        const r = StateObjectRef.resolveAndCheck(this.plugin.state.data, s);
        if (!r) return;
        const o = this.plugin.state.data.selectQ(q => q.byRef(r.transform.ref).subtree().withTransformer(StateTransforms.Model.TransformStructureConformation))[0];

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
            ? this.plugin.state.data.build().to(o).update(params)
            : this.plugin.state.data.build().to(s)
                .insert(StateTransforms.Model.TransformStructureConformation, params, { tags: this.SuperpositionTag });
        await this.plugin.runTask(this.plugin.state.data.updateTree(b));
    }

    async loadStructure(plugin: PluginContext, url: string, format: BuiltInTrajectoryFormat, assemblyId?: string) {
        const data = await plugin.builders.data.download({ url: Asset.Url(url) });
        const trajectory = await plugin.builders.structure.parseTrajectory(data, format);
        await plugin.builders.structure.hierarchy.applyPreset(trajectory, 'default');
    }

    async ngOnInit(): Promise<void> {
        this.plugin = await createPluginUI(document.getElementById('molstar-viewer') as HTMLElement, {
            ...DefaultPluginUISpec(),
            layout: {
                initial: {
                    isExpanded: false,
                    showControls: false
                }
            },
            components: {
                remoteState: 'none'
            }
        });
    }
}
