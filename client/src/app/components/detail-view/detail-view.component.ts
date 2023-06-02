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
    @ViewChild(ProteinVisualizationComponent) visualization!:ProteinVisualizationComponent;

    public VisualizedProteins: Protein[] = [];
    public highlightedDomains: HighlightedDomain[] = [];

    public structure: string;
    public TableColumnNames: string[] = [];
    public ColumnOrder: string[] = [];
    public TableData!: any;
    public DataReady: boolean = false;

    public ContextTableColumnNames: string[] = [];
    public ContextTableData!: any;
    public ContextColumnOrder: string[] = [];
    public ContextDataReady: boolean = false;
    public pageTitle!: string;
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

            datasetService.getTransformationContext(this.id, this.structure.replace(/ /gi, '')).subscribe({
                next: (data) => {
                    this.ContextTableColumnNames = data['columnNames'];

                    // sort by BeforeSnapshot, AfterSnapshot
                    this.ContextTableData = data['results'].sort((a: any, b: any) => {
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
                    this.ContextColumnOrder = [];

                    // pick data for the protein superposition and visualization
                    for (const transformation of this.ContextTableData) {
                        if (this.VisualizedProteins.filter(
                            x =>
                                x.PdbCode === transformation["BeforePdbID"] &&
                                x.ChainId === transformation["BeforeChainId"]).length === 0) {
                            this.VisualizedProteins.push({
                                PdbCode: transformation["BeforePdbID"],
                                ChainId: transformation["BeforeChainId"],
                                LcsStart: transformation["BeforeLcsStart"],
                                FileLocation: transformation["BeforeFileLocation"],
                                LcsLength: transformation["LcsLength"]
                            });

                            this.updateHighlightedDomains("Before", transformation);
                        }
                        if (this.VisualizedProteins.filter(
                            x =>
                                x.PdbCode === transformation["AfterPdbID"] &&
                                x.ChainId === transformation["AfterChainId"]).length === 0) {
                            this.VisualizedProteins.push({
                                PdbCode: transformation["AfterPdbID"],
                                ChainId: transformation["AfterChainId"],
                                LcsStart: transformation["AfterLcsStart"],
                                FileLocation: transformation["AfterFileLocation"],
                                LcsLength: transformation["LcsLength"]
                            });

                            this.updateHighlightedDomains("After", transformation);
                        }
                    }

                    // show context only if there is any
                    if (this.ContextTableData.length <= 1) {
                        this.ContextDataReady = false;
                        return;
                    }

                    // Update visualization
                    this.visualization.updateVisualization(this.VisualizedProteins, this.highlightedDomains);

                    // only show columns from the this.datasetService.ColumnOrder in this order:
                    for (const columnName of this.datasetService.ColumnOrder) {
                        if (this.TableColumnNames.includes(columnName)) {
                            this.ContextColumnOrder.push(columnName);
                        }
                    }

                    // manually add BeforeSnapshot, AfterSnapshot columns to the result table 
                    this.ContextColumnOrder.push("BeforeSnapshot");
                    this.ContextColumnOrder.push("AfterSnapshot")
                    this.ContextDataReady = true;

                },
                error: (error) => {
                    console.log(error);
                    this.ContextTableColumnNames = [];
                    this.ContextTableData = [];
                    this.ContextColumnOrder = [];
                }
            });
        });
    }

    updateHighlightedDomains(prefix: string, transformation: Record<string, any>) {
        if (this.structure === 'Domains') {
            this.highlightedDomains.push({
                StructureIndex: this.VisualizedProteins.length - 1,
                PdbId: transformation[prefix + "PdbID"],
                ChainId: transformation[prefix + "ChainId"],
                Start: transformation[prefix + 'DomainSpanStart'],
                End: transformation[prefix + 'DomainSpanEnd'],
                Highlighted: false,
                ColorLevel: 2,
                DomainName: transformation[prefix + 'DomainCathId']
            });
        }
        else if (this.structure === 'Domain Pairs') {
            this.highlightedDomains.push({
                StructureIndex: this.VisualizedProteins.length - 1,
                PdbId: transformation[prefix + "PdbID"],
                ChainId: transformation[prefix + "ChainId"],
                Start: transformation[prefix + 'DomainSpanStart1'],
                End: transformation[prefix + 'DomainSpanEnd1'],
                Highlighted: false,
                ColorLevel: 2,
                DomainName: transformation[prefix + 'DomainCathId1']
            });
            this.highlightedDomains.push({
                StructureIndex: this.VisualizedProteins.length - 1,
                PdbId: transformation[prefix + "PdbID"],
                ChainId: transformation[prefix + "ChainId"],
                Start: transformation[prefix + 'DomainSpanStart2'],
                End: transformation[prefix + 'DomainSpanEnd2'],
                Highlighted: false,
                ColorLevel: 4,
                DomainName: transformation[prefix + 'DomainCathId2']

            });
        }
        else if (this.structure === 'Residues') {
            this.highlightedDomains.push({
                StructureIndex: this.VisualizedProteins.length - 1,
                PdbId: transformation[prefix + "PdbID"],
                ChainId: transformation[prefix + "ChainId"],
                Start: transformation[prefix + 'ResidueStart'],
                End: transformation[prefix + 'ResidueEnd'],
                Highlighted: false,
                ColorLevel: 2,
                DomainName: ''
            });
        }
    }


    ExportDetails(): void {
        // create object with all the data
        const details = {
            "details": this.TableData,
            "context": this.ContextTableData
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
