import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';

import { BackendCommunicationService } from './backend-communication.service';
import { AppSettings } from '../app-settings';

describe('DatasetInfoService', () => {
    let service: BackendCommunicationService;
    let httpMock: HttpTestingController;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule]
        });
        service = TestBed.inject(BackendCommunicationService);
        httpMock = TestBed.inject(
            HttpTestingController
        );

        // Simulating requests
        const req1 = httpMock.expectOne(AppSettings.API_ENDPOINT + '/datasets-info');
        expect(req1.request.method).toEqual('GET');
        req1.flush({
            'columnNames': [
                'dataset_id',
                'dataset_name',
                'dataset_description',
                'protein_count',
                'domain_count',
                'domain_pair_count',
                'residue_count'
            ],
            'results': [
                {
                    'dataset_id': '1',
                    'dataset_name': 'test name',
                    'dataset_description': 'test description',
                    'protein_count': '0',
                    'domain_count': '0',
                    'domain_pair_count': '0',
                    'residue_count': '0'
                }
            ]
        });

        const req2 = httpMock.expectOne(AppSettings.API_ENDPOINT + '/order');
        expect(req2.request.method).toEqual('GET');
        req2.flush([
            'UniprotId',
            'BeforePdbID',
            'BeforeChainId',
            'BeforeDomainCathId',
            'BeforeDomainSpan',
            'BeforeDomainSpanStart',
            'BeforeDomainSpanEnd',
            'BeforeDomainCathId1',
            'BeforeDomainCathId2',
            'AfterPdbID',
            'AfterChainId',
            'AfterDomainCathId',
            'AfterDomainSpan',
            'AfterDomainSpanStart',
            'AfterDomainSpanEnd',
            'AfterDomainCathId1',
            'AfterDomainCathId2',
            'ProteinRmsd',
            'DomainRmsd',
            'DomainPairRmsd',
            'SecondaryStructureIdentity',
            'HingeAngle',
            'HingeTranslationInAxis',
            'HingeTranslationOverall',
            'BeforeInterfaceBuriedArea',
            'AfterInterfaceBuriedArea',
            'Label',
            'BeforeResidueStart',
            'BeforeResidueEnd',
            'AfterResidueStart',
            'AfterResidueEnd',
            'ProteinProgressionId'
        ]);
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('should select dataset ', () => {

        service.selectDataset({
            dataset_id: '1',
            dataset_name: 'test name',
            dataset_description: 'test description',
            protein_count: '0',
            domain_count: '0',
            domain_pair_count: '0',
            residue_count: '0'
        });

        expect(service.SelectedDataset.dataset_id).toBe('1');
        expect(service.SelectedDataset.dataset_name).toBe('test name');
    });
    it('should query data', () => {
        service.selectDataset({
            dataset_id: '1',
            dataset_name: 'test name',
            dataset_description: 'test description',
            protein_count: '0',
            domain_count: '0',
            domain_pair_count: '0',
            residue_count: '0'
        });

        service.getQueryData(0, 100).subscribe({
            next: data => {
                expect(data['results'][0]['AfterChainId']).toBe('A');
                expect(data['columnNames'][0]).toBe('AfterChainId');
            }
        });

        const req = httpMock.expectOne(AppSettings.API_ENDPOINT + '/data/?page=0&pageSize=100&query=&datasetId=1');
        expect(req.request.method).toEqual('GET');
        req.flush(
            {
                'columnNames': [
                    'AfterChainId',
                    'AfterFileLocation',
                    'AfterPdbID',
                    'AfterSnapshot',
                    'BeforeChainId',
                    'BeforeFileLocation',
                    'BeforePdbID',
                    'BeforeSnapshot',
                    'DatasetId',
                    'BeforeLcsStart',
                    'AfterLcsStart',
                    'Id',
                    'LcsLength',
                    'ProteinRmsd',
                    'SecondaryStructureIdentity',
                    'TransformationId',
                    'UniprotId'
                ],
                'results': [
                    {
                        'AfterChainId': 'A',
                        'AfterFileLocation': 'http://files.rcsb.org/download/',
                        'AfterPdbID': '5b0i',
                        'AfterSnapshot': '2',
                        'BeforeChainId': 'A',
                        'BeforeFileLocation': 'http://files.rcsb.org/download/',
                        'BeforePdbID': '5b02',
                        'BeforeSnapshot': '1',
                        'DatasetId': '1',
                        'BeforeLcsStart': '0',
                        'AfterLcsStart': '0',
                        'Id': '1',
                        'LcsLength': '343',
                        'ProteinRmsd': '0.1954187092850235',
                        'SecondaryStructureIdentity': '0.9848484848484849',
                        'TransformationId': '1',
                        'UniprotId': 'A0A010'
                    },
                    {
                        'AfterChainId': 'C',
                        'AfterFileLocation': 'http://files.rcsb.org/download/',
                        'AfterPdbID': '5b0i',
                        'AfterSnapshot': '2',
                        'BeforeChainId': 'A',
                        'BeforeFileLocation': 'http://files.rcsb.org/download/',
                        'BeforePdbID': '5b02',
                        'BeforeSnapshot': '1',
                        'DatasetId': '1',
                        'BeforeLcsStart': '0',
                        'AfterLcsStart': '0',
                        'Id': '2',
                        'LcsLength': '343',
                        'ProteinRmsd': '0.998396133276634',
                        'SecondaryStructureIdentity': '0.9847328244274809',
                        'TransformationId': '2',
                        'UniprotId': 'A0A010'
                    },
                    {
                        'AfterChainId': 'C',
                        'AfterFileLocation': 'http://files.rcsb.org/download/',
                        'AfterPdbID': '5b0j',
                        'AfterSnapshot': '2',
                        'BeforeChainId': 'A',
                        'BeforeFileLocation': 'http://files.rcsb.org/download/',
                        'BeforePdbID': '5b02',
                        'BeforeSnapshot': '1',
                        'DatasetId': '1',
                        'BeforeLcsStart': '0',
                        'AfterLcsStart': '0',
                        'Id': '3',
                        'LcsLength': '343',
                        'ProteinRmsd': '1.6687999135563132',
                        'SecondaryStructureIdentity': '0.9810606060606061',
                        'TransformationId': '3',
                        'UniprotId': 'A0A010'
                    }
                ]
            });
        httpMock.verify();

    });
    it('should select dataset ', () => {

        service.selectDataset({
            dataset_id: '1',
            dataset_name: 'test name',
            dataset_description: 'test description',
            protein_count: '0',
            domain_count: '0',
            domain_pair_count: '0',
            residue_count: '0'
        });

        expect(service.SelectedDataset.dataset_id).toBe('1');
        expect(service.SelectedDataset.dataset_name).toBe('test name');
    });
    it('should get page count', () => {
        service.selectDataset({
            dataset_id: '1',
            dataset_name: 'test name',
            dataset_description: 'test description',
            protein_count: '0',
            domain_count: '0',
            domain_pair_count: '0',
            residue_count: '0'
        });

        service.getPageCount().subscribe({
            next: data => {
                expect(data).toBe(3);
            }
        });

        const req = httpMock.expectOne(AppSettings.API_ENDPOINT + '/pages/?query=&pageSize=100&datasetId=1');
        expect(req.request.method).toEqual('GET');
        req.flush(3);
        httpMock.verify();

    });

    it('should get number of results', () => {
        service.selectDataset({
            dataset_id: '1',
            dataset_name: 'test name',
            dataset_description: 'test description',
            protein_count: '0',
            domain_count: '0',
            domain_pair_count: '0',
            residue_count: '0'
        });

        service.getNumberOfResults().subscribe({
            next: data => {
                expect(data).toBe(3);
            }
        });

        const req = httpMock.expectOne(AppSettings.API_ENDPOINT + '/count/?query=&datasetId=1');
        expect(req.request.method).toEqual('GET');
        req.flush(3);
        httpMock.verify();
    });

    it('should get specific row', () => {
        service.selectDataset({
            dataset_id: '1',
            dataset_name: 'test name',
            dataset_description: 'test description',
            protein_count: '0',
            domain_count: '0',
            domain_pair_count: '0',
            residue_count: '0'
        });

        service.getSpecificRow(1, 'proteins').subscribe({
            next: data => {
                expect(data['columnNames'][0]).toBe('AfterChainId');
                expect(data['results'][0]['AfterChainId']).toBe('A');
            }
        });

        const req = httpMock.expectOne(AppSettings.API_ENDPOINT + '/data/?page=0&pageSize=100&query=SELECT%20*%20FROM%20proteins%20WHERE%20id%3D1');
        expect(req.request.method).toEqual('GET');
        req.flush({
            'columnNames': [
                'AfterChainId',
                'AfterFileLocation',
                'AfterPdbID',
                'AfterSnapshot',
                'BeforeChainId',
                'BeforeFileLocation',
                'BeforePdbID',
                'BeforeSnapshot',
                'DatasetId',
                'BeforeLcsStart',
                'AfterLcsStart',
                'Id',
                'LcsLength',
                'ProteinRmsd',
                'SecondaryStructureIdentity',
                'TransformationId',
                'UniprotId'
            ],
            'results': [
                {
                    'AfterChainId': 'A',
                    'AfterFileLocation': 'http://files.rcsb.org/download/',
                    'AfterPdbID': '5b0i',
                    'AfterSnapshot': '2',
                    'BeforeChainId': 'A',
                    'BeforeFileLocation': 'http://files.rcsb.org/download/',
                    'BeforePdbID': '5b02',
                    'BeforeSnapshot': '1',
                    'DatasetId': '1',
                    'BeforeLcsStart': '0',
                    'AfterLcsStart': '0',
                    'Id': '1',
                    'LcsLength': '343',
                    'ProteinRmsd': '0.1954187092850235',
                    'SecondaryStructureIdentity': '0.9848484848484849',
                    'TransformationId': '1',
                    'UniprotId': 'A0A010'
                }
            ]
        });
        httpMock.verify();
    });
    it('should get specific row', () => {
        service.selectDataset({
            dataset_id: '1',
            dataset_name: 'test name',
            dataset_description: 'test description',
            protein_count: '0',
            domain_count: '0',
            domain_pair_count: '0',
            residue_count: '0'
        });

        service.getSpecificRow(1, 'proteins').subscribe({
            next: data => {
                expect(data['proteins'][0]['AfterChainId']).toBe('A');
                expect(data['proteins'][0]['AfterPdbID']).toBe('5b0i');
            }
        });

        const req = httpMock.expectOne(AppSettings.API_ENDPOINT + '/data/?page=0&pageSize=100&query=SELECT%20*%20FROM%20proteins%20WHERE%20id%3D1');
        expect(req.request.method).toEqual('GET');
        req.flush(
            {
                'proteins': [
                    {
                        'AfterChainId': 'A',
                        'AfterFileLocation': 'http://files.rcsb.org/download/',
                        'AfterPdbID': '5b0i',
                        'AfterSnapshot': '2',
                        'BeforeChainId': 'A',
                        'BeforeFileLocation': 'http://files.rcsb.org/download/',
                        'BeforePdbID': '5b02',
                        'BeforeSnapshot': '1',
                        'DatasetId': '1',
                        'BeforeLcsStart': '0',
                        'AfterLcsStart': '0',
                        'Id': '1',
                        'LcsLength': '343',
                        'ProteinRmsd': '0.1954187092850235',
                        'SecondaryStructureIdentity': '0.9848484848484849',
                        'TransformationId': '1',
                        'UniprotId': 'A0A010'
                    }
                ],
                'domains': [
                    {
                        'AfterChainId': 'A',
                        'AfterDomainCathId': '5b02A00',
                        'AfterDomainSpanEnd': '272',
                        'AfterDomainSpanStart': '9',
                        'AfterFileLocation': 'http://files.rcsb.org/download/',
                        'AfterPdbID': '5b0i',
                        'AfterSnapshot': '2',
                        'BeforeChainId': 'A',
                        'BeforeDomainCathId': '5b02A00',
                        'BeforeDomainSpanEnd': '272',
                        'BeforeDomainSpanStart': '9',
                        'BeforeFileLocation': 'http://files.rcsb.org/download/',
                        'BeforePdbID': '5b02',
                        'BeforeSnapshot': '1',
                        'DatasetId': '1',
                        'DomainRmsd': '0.1954187092850235',
                        'BeforeLcsStart': '0',
                        'AfterLcsStart': '0',
                        'Id': '5',
                        'LcsLength': '343',
                        'SecondaryStructureIdentity': '0.9848484848484849',
                        'TransformationId': '1',
                        'UniprotId': 'A0A010'
                    }
                ],
                'domainPairs': [],
                'residues': [
                    {
                        'AfterChainId': 'A',
                        'AfterFileLocation': 'http://files.rcsb.org/download/',
                        'AfterPdbID': '5b0i',
                        'AfterResidueEnd': '2',
                        'AfterResidueStart': '1',
                        'AfterSnapshot': '2',
                        'BeforeChainId': 'A',
                        'BeforeFileLocation': 'http://files.rcsb.org/download/',
                        'BeforePdbID': '5b02',
                        'BeforeResidueEnd': '2',
                        'BeforeResidueStart': '1',
                        'BeforeSnapshot': '1',
                        'DatasetId': '1',
                        'BeforeLcsStart': '0',
                        'AfterLcsStart': '0',
                        'Id': '1',
                        'Label': 'active',
                        'LcsLength': '343',
                        'TransformationId': '1',
                        'UniprotId': 'A0A010'
                    },
                    {
                        'AfterChainId': 'A',
                        'AfterFileLocation': 'http://files.rcsb.org/download/',
                        'AfterPdbID': '5b0i',
                        'AfterResidueEnd': '7',
                        'AfterResidueStart': '5',
                        'AfterSnapshot': '2',
                        'BeforeChainId': 'A',
                        'BeforeFileLocation': 'http://files.rcsb.org/download/',
                        'BeforePdbID': '5b02',
                        'BeforeResidueEnd': '7',
                        'BeforeResidueStart': '5',
                        'BeforeSnapshot': '1',
                        'DatasetId': '1',
                        'BeforeLcsStart': '0',
                        'AfterLcsStart': '0',
                        'Id': '2',
                        'Label': 'active',
                        'LcsLength': '343',
                        'TransformationId': '1',
                        'UniprotId': 'A0A010'
                    }
                ]
            });
        httpMock.verify();
    });
});
