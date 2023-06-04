import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatasetService } from 'src/app/services/dataset.service';
import { ExternalLinkService } from 'src/app/services/external-link.service';
import { Protein } from 'src/app/models/protein.model';

import { HighlightedDomain } from 'src/app/models/highlighted-domain.model';
import * as JSZip from 'jszip';
import * as saveAs from 'file-saver';
import { ProteinVisualizationComponent } from '../protein-visualization/protein-visualization.component';

@Component({
    selector: 'app-detail-view',
    templateUrl: './detail-view.component.html',
    styleUrls: ['./detail-view.component.scss']
})
export class DetailViewComponent {
    @ViewChild(ProteinVisualizationComponent) visualization!: ProteinVisualizationComponent;

    public VisualizedProteins: Protein[] = [];
    public highlightedDomains: HighlightedDomain[] = [];

    public TableColumnNames: string[] = [];
    public ColumnOrder: string[] = [];
    public TableData!: any;
    public DataReady: boolean = false;

    public ContextTableColumnNames!: Record<string, string[]>;
    public ContextTableData!: Record<string, Record<string, string>[]>;
    public ContextColumnOrder: Record<string, string[]> = { "proteins": [], "domains": [], "domainPairs": [], "residues": [] };
    public ContextDataReady: boolean = false;
    public ContextStructureHeadingMapping: Record<string, string>[] = [
        {
            "key": "proteins",
            "name": "Proteins"
        }, {
            "key": "domains",
            "name": "Domains"
        }, {
            "key": "domainPairs",
            "name": "Domain Pairs"
        }, {
            "key": "residues",
            "name": "Residues"
        }];

    public pageTitle!: string;
    public structure: string;
    private id!: number;

    constructor(
        public datasetService: DatasetService,
        public externalLinkService: ExternalLinkService,
        private route: ActivatedRoute) {

        this.id = parseInt(this.route.snapshot.paramMap.get('id') as string);

        this.structure = this.route.snapshot.paramMap.get('structure') as string;

        if (this.structure === 'proteins') {
            this.structure = 'Proteins';
            this.pageTitle = 'Protein Transformation Details'
        }
        else if (this.structure === 'domains') {
            this.structure = 'Domains';
            this.pageTitle = 'Domain Transformation Details'
        }

        else if (this.structure === 'domainpairs') {
            this.structure = 'Domain Pairs';
            this.pageTitle = 'Domain Pair Transformation Details'
        }

        else if (this.structure === 'residues') {
            this.structure = 'Residues';
            this.pageTitle = 'Residue Transformation Details'
        }


        datasetService.getDatasetInfo().then(_ => {
            datasetService.getSpecificRow(this.id, this.structure.replace(/ /gi, '')
            ).subscribe(data => {
                this.TableColumnNames = data['columnNames'];
                this.TableData = data['results'];

                // only show columns from the this.datasetService.ColumnOrder in this order:
                for (const columnName of this.datasetService.ColumnOrder) {
                    if (this.TableColumnNames.includes(columnName)) {
                        this.ColumnOrder.push(columnName);
                    }
                }
                this.TableData = this.TableData[0];
                this.DataReady = true;
            });

            datasetService.getTransformationContext(this.id, this.structure).subscribe({
                next: (data) => {
                    let contextTableColumnNames = structuredClone(data);
                    let contextTableData = data;

                    Object.keys(contextTableColumnNames).forEach((key: any) => {
                        delete contextTableColumnNames[key]['results'];
                        contextTableColumnNames[key] = contextTableColumnNames[key]['columnNames'];
                    });

                    Object.keys(contextTableData).forEach((key: any) => {
                        delete contextTableData[key]['columnNames'];
                        contextTableData[key] = contextTableData[key]['results'];
                    });

                    this.ContextTableColumnNames = contextTableColumnNames;
                    this.ContextTableData = contextTableData;

                    // sort by BeforeSnapshot, AfterSnapshot
                    for (const index in this.ContextTableData) {
                        this.ContextTableData[index].sort((a: any, b: any) => {
                            if (a["BeforeSnapshot"] < b["BeforeSnapshot"])
                                return -1;
                            if (a["BeforeSnapshot"] > b["BeforeSnapshot"])
                                return 1;
                            if (a["AfterSnapshot"] < b["AfterSnapshot"])
                                return -1;
                            if (a["AfterSnapshot"] > b["AfterSnapshot"])
                                return 1;
                            return 0;
                        });
                    }

                    // pick data for the protein superposition and visualization
                    for (const biologicalStructure in this.ContextTableData) {
                        for (const transformation of this.ContextTableData[biologicalStructure]) {
                            if (this.VisualizedProteins.filter(
                                x =>
                                    x.PdbCode === transformation["BeforePdbID"] &&
                                    x.ChainId === transformation["BeforeChainId"]).length === 0) {
                                this.VisualizedProteins.push({
                                    PdbCode: transformation["BeforePdbID"] as string,
                                    ChainId: transformation["BeforeChainId"] as string,
                                    LcsStart: transformation["BeforeLcsStart"] as unknown as number,
                                    FileLocation: transformation["BeforeFileLocation"] as string,
                                    LcsLength: transformation["LcsLength"] as unknown as number
                                });
                            }
                            this.updateHighlightedDomains("Before", transformation, biologicalStructure);

                            if (this.VisualizedProteins.filter(
                                x =>
                                    x.PdbCode === transformation["AfterPdbID"] &&
                                    x.ChainId === transformation["AfterChainId"]).length === 0) {
                                this.VisualizedProteins.push({
                                    PdbCode: transformation["AfterPdbID"] as string,
                                    ChainId: transformation["AfterChainId"] as string,
                                    LcsStart: transformation["AfterLcsStart"] as unknown as number,
                                    FileLocation: transformation["AfterFileLocation"] as string,
                                    LcsLength: transformation["LcsLength"] as unknown as number
                                });
                            }
                            this.updateHighlightedDomains("After", transformation, biologicalStructure);
                        }
                    }
                    // Update visualization
                    this.visualization.updateVisualization(this.VisualizedProteins, this.highlightedDomains);

                    // only show columns from the this.datasetService.ColumnOrder in this order:

                    for (const biologicalStructure in this.ContextTableData) {
                        for (const columnName of this.datasetService.ColumnOrder) {
                            if (this.ContextTableColumnNames[biologicalStructure].includes(columnName)) {
                                this.ContextColumnOrder[biologicalStructure].push(columnName);
                            }
                        }
                        // manually add BeforeSnapshot, AfterSnapshot columns to the result table 
                        this.ContextColumnOrder[biologicalStructure].push("BeforeSnapshot");
                        this.ContextColumnOrder[biologicalStructure].push("AfterSnapshot");
                    }
                    this.ContextDataReady = true;
                },
                error: (error) => {
                    console.log(error);
                    this.ContextTableData = {};
                    this.ContextColumnOrder = {};
                }
            });
        });
    }

    updateHighlightedDomains(prefix: string, transformation: Record<string, any>, structure: string) {
        const index: number = this.VisualizedProteins.findIndex(
            protein => 
            protein.PdbCode === transformation[prefix + "PdbID"] &&
            protein.ChainId === transformation[prefix + "ChainId"]);
        
        if (this.highlightedDomains.filter(
            x =>
                x.PdbId === transformation[prefix + "PdbID"] &&
                x.ChainId === transformation[prefix + "ChainId"] &&
                x.Start === transformation[prefix + 'DomainSpanStart'] &&
                x.End === transformation[prefix + 'DomainSpanEnd']).length !== 0)
                return;
        
        if (structure === 'domains') {
            this.highlightedDomains.push({
                PdbId: transformation[prefix + "PdbID"],
                ChainId: transformation[prefix + "ChainId"],
                Start: transformation[prefix + 'DomainSpanStart'],
                End: transformation[prefix + 'DomainSpanEnd'],
                Highlighted: false,
                ColorLevel: 2,
                DomainName: transformation[prefix + 'DomainCathId'],
                IsResidueSpan: false,
                ProteinIndex: index
            });
        }
        else if (structure === 'domainPairs') {
            this.highlightedDomains.push({
                PdbId: transformation[prefix + "PdbID"],
                ChainId: transformation[prefix + "ChainId"],
                Start: transformation[prefix + 'DomainSpanStart1'],
                End: transformation[prefix + 'DomainSpanEnd1'],
                Highlighted: false,
                ColorLevel: 2,
                DomainName: transformation[prefix + 'DomainCathId1'],
                IsResidueSpan: false,
                ProteinIndex: index
            });
            this.highlightedDomains.push({
                PdbId: transformation[prefix + "PdbID"],
                ChainId: transformation[prefix + "ChainId"],
                Start: transformation[prefix + 'DomainSpanStart2'],
                End: transformation[prefix + 'DomainSpanEnd2'],
                Highlighted: false,
                ColorLevel: 4,
                DomainName: transformation[prefix + 'DomainCathId2'],
                IsResidueSpan: false,
                ProteinIndex: index

            });
        }
        else if (structure === 'residues') {
            this.highlightedDomains.push({
                PdbId: transformation[prefix + "PdbID"],
                ChainId: transformation[prefix + "ChainId"],
                Start: transformation[prefix + 'ResidueStart'],
                End: transformation[prefix + 'ResidueEnd'],
                Highlighted: false,
                ColorLevel: 2,
                DomainName: '',
                IsResidueSpan: true,
                ProteinIndex: index
            });
        }
    }


    ExportDetails(): void {
        // create object with all the data
        const details = {
            "details": structuredClone(this.TableData),
            "context": structuredClone(this.ContextTableData)
        }

        // update the file location to its full path
        details["details"]["BeforeFileLocation"] += details["details"]["BeforePdbID"] + ".cif";
        details["details"]["AfterFileLocation"] += details["details"]["AfterPdbID"] + ".cif";

        for (let biologicalStructure in details["context"]) {
            for (let transformation of details["context"][biologicalStructure]) {
                transformation["BeforeFileLocation"] += transformation["BeforePdbID"] + ".cif";
                transformation["AfterFileLocation"] += transformation["AfterPdbID"] + ".cif";
            }
        }

        // add json with all the data to the zip
        const jszip = new JSZip();
        jszip.file('details.json', JSON.stringify(details));

        // generate zip
        jszip.generateAsync({ type: 'blob' }).then(function (content: any) {
            saveAs(content, 'details.zip');
        });
    }
}
