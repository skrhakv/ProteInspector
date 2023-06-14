import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarLayoutComponent } from './navbar-layout.component';
import { BackendCommunicationService } from 'src/app/services/backend-communication.service';
import { Dataset } from 'src/app/models/dataset';
import { RouterTestingModule } from '@angular/router/testing';

describe('NavbarLayoutComponent', () => {
    class MockBackendCommunicationService {
        public SelectedDataset!: Dataset;
        selectDataset(dataset: Dataset) {
            this.SelectedDataset = dataset;
        }
    }
    let component: NavbarLayoutComponent;
    let fixture: ComponentFixture<NavbarLayoutComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [NavbarLayoutComponent],
            providers: [
                { provide: BackendCommunicationService, useClass: MockBackendCommunicationService }
            ],
            imports: [
                RouterTestingModule
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(NavbarLayoutComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should change selected dataset in the navbar', () => {
        const d: Dataset = {
            dataset_id: '1',
            dataset_name: 'test_name',
            dataset_description: 'test',
            protein_count: '0',
            domain_count: '0',
            domain_pair_count: '0',
            residue_count: '0',
        };

        component.backendCommunicationService.selectDataset(d);
        fixture.detectChanges();

        fixture.whenStable().then(() => {

            expect(component.backendCommunicationService.SelectedDataset).toBeTruthy();
            
            const compiled = fixture.nativeElement as HTMLElement;

            expect(compiled.querySelector('.navbar > div > div')?.textContent).toContain('test_name');
        });
    });
});
