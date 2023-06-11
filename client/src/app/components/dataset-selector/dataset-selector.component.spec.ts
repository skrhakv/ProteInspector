import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { DatasetSelectorComponent } from './dataset-selector.component';
import { BackendCommunicationService } from 'src/app/services/backend-communication.service';
import { Dataset } from 'src/app/models/dataset';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('DatasetSelectorComponent', () => {
    let component: DatasetSelectorComponent;
    let fixture: ComponentFixture<DatasetSelectorComponent>;

    class MockBackendCommunicationService {
        public SelectedDataset!: Dataset;
        selectDataset(dataset: Dataset) {
            this.SelectedDataset = dataset;
        }
    }
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DatasetSelectorComponent],
            providers: [
                { provide: BackendCommunicationService, useClass: MockBackendCommunicationService },
            ],
            imports: [
                BrowserAnimationsModule
            ]

        })
            .compileComponents();

        fixture = TestBed.createComponent(DatasetSelectorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should change selected dataset in the backend communication service', () => {
        const d: Dataset = {
            dataset_id: '1',
            dataset_name: 'test',
            dataset_description: 'test',
            protein_count: '0',
            domain_count: '0',
            domain_pair_count: '0',
            residue_count: '0',
        };
        component.selectDataset(d);
        expect(component.backendCommunicationService.SelectedDataset.dataset_name).toEqual('test');
        expect(component.backendCommunicationService.SelectedDataset.dataset_description).toEqual('test');
        expect(component.backendCommunicationService.SelectedDataset.dataset_id).toEqual('1');
    });

});
