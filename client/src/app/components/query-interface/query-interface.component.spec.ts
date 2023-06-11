import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryInterfaceComponent } from './query-interface.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ResultTableComponent } from '../result-table/result-table.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs/internal/Observable';
import { FilterService } from 'src/app/services/filter.service';
import { Metric } from 'src/app/models/metric.model';
import { SortMetric } from 'src/app/models/sort-metric.model';

describe('QueryInterfaceComponent', () => {
    let component: QueryInterfaceComponent;
    let fixture: ComponentFixture<QueryInterfaceComponent>;

    class MockFilterService {
        public AvailableMetrics!: Record<string, Record<string, string>>;

        loadAvailableStructuralMetrics(biologicalStructureType: string) {
            const response = {
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
            };
            const obs = new Observable((subscriber) => {

                subscriber.next(response);
                subscriber.complete();
            });

            return ['', obs];
        }
        buildQuery(metrics: Metric[], sortingMetric: SortMetric): string {
            return 'SELECT * FROM PROTEINS';
        }
    }
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [QueryInterfaceComponent, ResultTableComponent, PaginationComponent],

            imports: [
                BrowserAnimationsModule, HttpClientModule, FormsModule
            ],
            providers: [HttpClient,
                { provide: FilterService, useClass: MockFilterService },
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(QueryInterfaceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('selecting structure should load metrics', () => {
        const obj = {
            target: {
                event: 'proteins'
            }
        };
        component.selectBiologicalStructureType(obj);
        expect(component.isBiologicalStructureSelected).toBeTruthy();
        expect(component.filterService.AvailableMetrics['beforepdbid']['name']).toBe('Before PDB ID');
    });
    it('builds filter query', () => {
        
        component.buildFilterQuery();
        expect(component.query).toBe('SELECT * FROM PROTEINS');
    });
});
