import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultTableComponent } from './result-table.component';
import { BackendCommunicationService } from 'src/app/services/backend-communication.service';
import { Observable } from 'rxjs/internal/Observable';
import { PaginationComponent } from '../pagination/pagination.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('ResultTableComponent', () => {
    let component: ResultTableComponent;
    let fixture: ComponentFixture<ResultTableComponent>;
    class MockBackendCommunicationService {
        public ColumnOrder: string[] = ['AfterChainId'];
        getNumberOfResults() {
            const response = 3;
            const obs = new Observable((subscriber) => {

                subscriber.next(response);
                subscriber.complete();
            });

            return obs;
        }
        getPageCount() {
            const obs = new Observable((subscriber) => {
                const response = 1;
                subscriber.next(response);
                subscriber.complete();
            });

            return obs;
        }
        getQueryData() {
            const response =
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
            };
            const obs = new Observable((subscriber) => {

                subscriber.next(response);
                subscriber.complete();
            });

            return obs;
        }
        async getDatasetInfo() {
            return 'empty';
        }
    }
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ResultTableComponent, PaginationComponent],
            providers: [
                { provide: BackendCommunicationService, useClass: MockBackendCommunicationService },
            ],
            imports: [RouterTestingModule]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ResultTableComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('send query should update table column names', () => {
        component.sendQuery();
        expect(component.TableColumnNames[0]).toBe('AfterChainId');
    });

    it('send query should update table data', () => {
        component.sendQuery();
        expect(component.TableData[0]['AfterChainId']).toBe('A');
    });

    it('should display data table', () => {
        component.sendQuery();

        fixture.detectChanges();

        fixture.whenStable().then(async () => {
            const compiled = fixture.nativeElement as HTMLElement;
            expect(compiled.querySelectorAll('th')[1].textContent).toContain('AfterChainId');
            expect(compiled.querySelectorAll('tr')[1].textContent).toContain('A');
        });
    });

    it('should display number of results', () => {
        component.sendQuery();

        fixture.detectChanges();

        fixture.whenStable().then(async () => {
            const compiled = fixture.nativeElement as HTMLElement;
            expect(compiled.querySelector('.col-3')?.textContent).toContain('Number of Results: 3');
        });
    });
});
