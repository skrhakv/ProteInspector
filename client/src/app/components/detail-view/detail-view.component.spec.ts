import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DetailViewComponent } from './detail-view.component';
import { Observable } from 'rxjs/internal/Observable';
import { BackendCommunicationService } from 'src/app/services/backend-communication.service';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { Component } from '@angular/core';

describe('DetailViewComponent', () => {
    let component: DetailViewComponent;
    let fixture: ComponentFixture<DetailViewComponent>;

    class MockBackendCommunicationService {
        getSpecificRow(id: number, structure: string) {

            const response = JSON.parse(`
            {
                "columnNames": [
                  "AfterChainId",
                  "AfterFileLocation",
                  "AfterPdbID",
                  "AfterSnapshot",
                  "BeforeChainId",
                  "BeforeFileLocation",
                  "BeforePdbID",
                  "BeforeSnapshot",
                  "DatasetId",
                  "BeforeLcsStart",
                  "AfterLcsStart",
                  "Id",
                  "LcsLength",
                  "ProteinRmsd",
                  "SecondaryStructureIdentity",
                  "TransformationId",
                  "UniprotId"
                ],
                "results": [
                  {
                    "AfterChainId": "A",
                    "AfterFileLocation": "http://files.rcsb.org/download/",
                    "AfterPdbID": "5b0i",
                    "AfterSnapshot": "2",
                    "BeforeChainId": "A",
                    "BeforeFileLocation": "http://files.rcsb.org/download/",
                    "BeforePdbID": "5b02",
                    "BeforeSnapshot": "1",
                    "DatasetId": "1",
                    "BeforeLcsStart": "0",
                    "AfterLcsStart": "0",
                    "Id": "1",
                    "LcsLength": "343",
                    "ProteinRmsd": "0.1954187092850235",
                    "SecondaryStructureIdentity": "0.9848484848484849",
                    "TransformationId": "1",
                    "UniprotId": "A0A010"
                  }
                ]
              }
            `);

            const obs = new Observable((subscriber) => {

                subscriber.next(response);
                subscriber.complete();

            });

            return obs;
        }
        getTransformationContext() {
            const response = JSON.parse(`
            {
                "proteins": {
                  "columnNames": [
                    "AfterChainId",
                    "AfterFileLocation",
                    "AfterPdbID",
                    "AfterSnapshot",
                    "BeforeChainId",
                    "BeforeFileLocation",
                    "BeforePdbID",
                    "BeforeSnapshot",
                    "DatasetId",
                    "BeforeLcsStart",
                    "AfterLcsStart",
                    "Id",
                    "LcsLength",
                    "ProteinRmsd",
                    "SecondaryStructureIdentity",
                    "TransformationId",
                    "UniprotId"
                  ],
                  "results": [
                    {
                      "AfterChainId": "A",
                      "AfterFileLocation": "http://files.rcsb.org/download/",
                      "AfterPdbID": "5b0i",
                      "AfterSnapshot": "2",
                      "BeforeChainId": "A",
                      "BeforeFileLocation": "http://files.rcsb.org/download/",
                      "BeforePdbID": "5b02",
                      "BeforeSnapshot": "1",
                      "DatasetId": "1",
                      "BeforeLcsStart": "0",
                      "AfterLcsStart": "0",
                      "Id": "1",
                      "LcsLength": "343",
                      "ProteinRmsd": "0.1954187092850235",
                      "SecondaryStructureIdentity": "0.9848484848484849",
                      "TransformationId": "1",
                      "UniprotId": "A0A010"
                    }
                  ]
                },
                "domains": {
                  "columnNames": [
                    "AfterChainId",
                    "AfterDomainCathId",
                    "AfterDomainSpanEnd",
                    "AfterDomainSpanStart",
                    "AfterFileLocation",
                    "AfterPdbID",
                    "AfterSnapshot",
                    "BeforeChainId",
                    "BeforeDomainCathId",
                    "BeforeDomainSpanEnd",
                    "BeforeDomainSpanStart",
                    "BeforeFileLocation",
                    "BeforePdbID",
                    "BeforeSnapshot",
                    "DatasetId",
                    "DomainRmsd",
                    "BeforeLcsStart",
                    "AfterLcsStart",
                    "Id",
                    "LcsLength",
                    "SecondaryStructureIdentity",
                    "TransformationId",
                    "UniprotId"
                  ],
                  "results": [
                    {
                      "AfterChainId": "A",
                      "AfterDomainCathId": "5b02A00",
                      "AfterDomainSpanEnd": "272",
                      "AfterDomainSpanStart": "9",
                      "AfterFileLocation": "http://files.rcsb.org/download/",
                      "AfterPdbID": "5b0i",
                      "AfterSnapshot": "2",
                      "BeforeChainId": "A",
                      "BeforeDomainCathId": "5b02A00",
                      "BeforeDomainSpanEnd": "272",
                      "BeforeDomainSpanStart": "9",
                      "BeforeFileLocation": "http://files.rcsb.org/download/",
                      "BeforePdbID": "5b02",
                      "BeforeSnapshot": "1",
                      "DatasetId": "1",
                      "DomainRmsd": "0.1954187092850235",
                      "BeforeLcsStart": "0",
                      "AfterLcsStart": "0",
                      "Id": "5",
                      "LcsLength": "343",
                      "SecondaryStructureIdentity": "0.9848484848484849",
                      "TransformationId": "1",
                      "UniprotId": "A0A010"
                    }
                  ]
                },
                "domainPairs": {
                  "columnNames": [
                    "AfterChainId",
                    "AfterDomainCathId1",
                    "AfterDomainCathId2",
                    "AfterDomainSpanEnd1",
                    "AfterDomainSpanEnd2",
                    "AfterDomainSpanStart1",
                    "AfterDomainSpanStart2",
                    "AfterFileLocation",
                    "AfterInterfaceBuriedArea",
                    "AfterPdbID",
                    "AfterSnapshot",
                    "BeforeChainId",
                    "BeforeDomainCathId1",
                    "BeforeDomainCathId2",
                    "BeforeDomainSpanEnd1",
                    "BeforeDomainSpanEnd2",
                    "BeforeDomainSpanStart1",
                    "BeforeDomainSpanStart2",
                    "BeforeFileLocation",
                    "BeforeInterfaceBuriedArea",
                    "BeforePdbID",
                    "BeforeSnapshot",
                    "DatasetId",
                    "DomainPairRmsd",
                    "HingeAngle",
                    "HingeTranslationInAxis",
                    "HingeTranslationOverall",
                    "BeforeLcsStart",
                    "AfterLcsStart",
                    "Id",
                    "LcsLength",
                    "TransformationId",
                    "UniprotId"
                  ],
                  "results": []
                },
                "residues": {
                  "columnNames": [
                    "AfterChainId",
                    "AfterFileLocation",
                    "AfterPdbID",
                    "AfterResidueEnd",
                    "AfterResidueStart",
                    "AfterSnapshot",
                    "BeforeChainId",
                    "BeforeFileLocation",
                    "BeforePdbID",
                    "BeforeResidueEnd",
                    "BeforeResidueStart",
                    "BeforeSnapshot",
                    "DatasetId",
                    "BeforeLcsStart",
                    "AfterLcsStart",
                    "Id",
                    "Label",
                    "LcsLength",
                    "TransformationId",
                    "UniprotId"
                  ],
                  "results": [
                    {
                      "AfterChainId": "A",
                      "AfterFileLocation": "http://files.rcsb.org/download/",
                      "AfterPdbID": "5b0i",
                      "AfterResidueEnd": "2",
                      "AfterResidueStart": "1",
                      "AfterSnapshot": "2",
                      "BeforeChainId": "A",
                      "BeforeFileLocation": "http://files.rcsb.org/download/",
                      "BeforePdbID": "5b02",
                      "BeforeResidueEnd": "2",
                      "BeforeResidueStart": "1",
                      "BeforeSnapshot": "1",
                      "DatasetId": "1",
                      "BeforeLcsStart": "0",
                      "AfterLcsStart": "0",
                      "Id": "1",
                      "Label": "active",
                      "LcsLength": "343",
                      "TransformationId": "1",
                      "UniprotId": "A0A010"
                    },
                    {
                      "AfterChainId": "A",
                      "AfterFileLocation": "http://files.rcsb.org/download/",
                      "AfterPdbID": "5b0i",
                      "AfterResidueEnd": "7",
                      "AfterResidueStart": "5",
                      "AfterSnapshot": "2",
                      "BeforeChainId": "A",
                      "BeforeFileLocation": "http://files.rcsb.org/download/",
                      "BeforePdbID": "5b02",
                      "BeforeResidueEnd": "7",
                      "BeforeResidueStart": "5",
                      "BeforeSnapshot": "1",
                      "DatasetId": "1",
                      "BeforeLcsStart": "0",
                      "AfterLcsStart": "0",
                      "Id": "2",
                      "Label": "active",
                      "LcsLength": "343",
                      "TransformationId": "1",
                      "UniprotId": "A0A010"
                    }
                  ]
                }
              }`);
            const obs = new Observable((subscriber) => {

                subscriber.next(response);
                subscriber.complete();
            });

            return obs;
        }
        async getDatasetInfo() {
            return 'empty';
        }
        public ColumnOrder: string[] = [];
    }
    @Component({
        selector: 'app-protein-visualization',
        template: ''
    })
    class MockProteinVisualizationComponent {
        updateVisualization() {
            return;
        }
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DetailViewComponent, MockProteinVisualizationComponent],
            providers: [
                { provide: BackendCommunicationService, useClass: MockBackendCommunicationService },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            paramMap: convertToParamMap({
                                id: '1',
                                structure: 'proteins',
                            })
                        }
                    }
                },
            ],
            imports: [
                RouterTestingModule
            ]

        })
            .compileComponents();

        fixture = TestBed.createComponent(DetailViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should load table data', waitForAsync(async () => {
        fixture.whenStable().then(() => {
            expect(component.TableData['AfterChainId']).toBe('A');
            expect(component.TableData['AfterPdbID']).toBe('5b0i');
            expect(component.TableData['BeforeChainId']).toBe('A');
            expect(component.TableData['BeforePdbID']).toBe('5b02');
            expect(component.TableData['AfterChainId']).toBe('A');
        });
    }));
    it('should load context table data', waitForAsync(async () => {
        fixture.whenStable().then(() => {
            expect(component.ContextTableData['proteins'][0]['AfterChainId']).toBe('A');
            expect(component.ContextTableData['proteins'][0]['AfterPdbID']).toBe('5b0i');
            expect(component.ContextTableData['proteins'][0]['BeforeChainId']).toBe('A');
            expect(component.ContextTableData['proteins'][0]['BeforePdbID']).toBe('5b02');
            expect(component.ContextTableData['proteins'][0]['AfterChainId']).toBe('A');
        });
    }));
    it('should check data readiness', waitForAsync(async () => {
        fixture.whenStable().then(() => {
            expect(component.DataReady).toBe(true);
        });
    }));
    it('should check domain data', waitForAsync(async () => {
        fixture.whenStable().then(() => {
            const domains = component.highlightedDomains.filter(d => !d.IsResidueSpan);
            expect(domains.length).toBe(2);
            expect(domains[0].DomainName).toBe('5b02A00');
        });
    }));
    it('should check residue data', waitForAsync(async () => {
        fixture.whenStable().then(() => {
            const residues = component.highlightedDomains.filter(d => d.IsResidueSpan);
            expect(residues.length).toBe(4);
            expect(residues[0].DomainName).toBe('active');
        });
    }));
    it('should render page title', waitForAsync(async () => {
        fixture.whenStable().then(() => {
            const compiled = fixture.nativeElement as HTMLElement;
            expect(compiled.querySelector('.container .row .col-8 h1')?.textContent).toContain('Protein Transformation Details');

        });
    }));
});
