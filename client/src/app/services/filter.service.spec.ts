import { TestBed } from '@angular/core/testing';

import { FilterService } from './filter.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AppSettings } from '../app-settings';
import { Metric } from '../models/metric.model';
import { SortMetric } from '../models/sort-metric.model';

describe('FilterService', () => {
    let service: FilterService;
    let httpMock: HttpTestingController;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule]
        });
        service = TestBed.inject(FilterService);
        httpMock = TestBed.inject(
            HttpTestingController
        );

        // Simulating requests
        const req = httpMock.expectOne(AppSettings.API_ENDPOINT + '/biological-structures');
        expect(req.request.method).toEqual('GET');
        req.flush({
            'proteins': {
                'name': 'Proteins'
            },
            'domains': {
                'name': 'Domains'
            },
            'domainpairs': {
                'name': 'Domain Pairs'
            },
            'residues': {
                'name': 'Residues'
            }
        });
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('should load available structure type metrics', () => {
        const [q, r] = service.loadAvailableStructuralMetrics('proteins');
        r.subscribe({
            next: data => {
                expect(data['beforepdbid']['type']).toBe('string');
                expect(data['beforepdbid']['name']).toBe('Before PDB ID');
            }
        });
        const req = httpMock.expectOne(AppSettings.API_ENDPOINT + '/biological-structures/proteins');
        expect(req.request.method).toEqual('GET');
        req.flush({
            'beforepdbid': {
                'type': 'string',
                'name': 'Before PDB ID'
            },
            'beforechainid': {
                'type': 'string',
                'name': 'Before Chain ID'
            },
            'uniprotid': {
                'type': 'string',
                'name': 'Uniprot ID'
            },
            'afterpdbid': {
                'type': 'string',
                'name': 'After PDB ID'
            },
            'afterchainid': {
                'type': 'string',
                'name': 'After Chain ID'
            },
            'proteinrmsd': {
                'type': 'float',
                'name': 'Protein RMSD'
            },
            'secondarystructureidentity': {
                'type': 'float',
                'name': 'Secondary Structure Identity'
            }
        });
        httpMock.verify();
    });
    it('should build query', () => {
        const metrics: Metric[] = [{
            name: 'BeforePdbId',
            value: '5b02',
            type: 'string',
            comparator: '='
        }];
        const sortingMetric: SortMetric = {
            name: 'RMSD',
            order: 'ASC'
        };
        const query = service.buildQuery(metrics, sortingMetric);
        expect(query).toBe('SELECT * FROM undefined WHERE BeforePdbId = "5b02" ORDER BY RMSD ASC');
    });
});
