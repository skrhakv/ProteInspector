import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProteinVisualizationComponent } from './protein-visualization.component';
import { HighlightedDomain } from 'src/app/models/highlighted-domain.model';

describe('ProteinVisualizationComponent', () => {
    let component: ProteinVisualizationComponent;
    let fixture: ComponentFixture<ProteinVisualizationComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ProteinVisualizationComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ProteinVisualizationComponent);
        component = fixture.componentInstance;

        const proteins = [
            {
                'PdbCode': '5b02',
                'ChainId': 'A',
                'LcsStart': 0,
                'FileLocation': 'http://files.rcsb.org/download/',
                'LcsLength': 343
            },
            {
                'PdbCode': '5b0i',
                'ChainId': 'A',
                'LcsStart': 0,
                'FileLocation': 'http://files.rcsb.org/download/',
                'LcsLength': 343
            }
        ];
        const domains: HighlightedDomain[] = [
            {
                'PdbId': '5b02',
                'ChainId': 'A',
                'Start': 9,
                'End': 272,
                'Highlighted': false,
                'ColorLevel': 2,
                'DomainName': '5b02A00',
                'IsResidueSpan': false,
                'ProteinIndex': 0
            },
            {
                'PdbId': '5b0i',
                'ChainId': 'A',
                'Start': 9,
                'End': 272,
                'Highlighted': false,
                'ColorLevel': 2,
                'DomainName': '5b02A00',
                'IsResidueSpan': false,
                'ProteinIndex': 1
            },
            {
                'PdbId': '5b02',
                'ChainId': 'A',
                'Start': 1,
                'End': 2,
                'Highlighted': false,
                'ColorLevel': 2,
                'DomainName': 'active',
                'IsResidueSpan': true,
                'ProteinIndex': 0
            },
            {
                'PdbId': '5b0i',
                'ChainId': 'A',
                'Start': 1,
                'End': 2,
                'Highlighted': false,
                'ColorLevel': 2,
                'DomainName': 'active',
                'IsResidueSpan': true,
                'ProteinIndex': 1
            }
        ];
        await component.ngOnInit();
        spyOn(component.superpositionService, 'GenerateMolstarVisualisation');
        component.updateVisualization(proteins, domains);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('generates visualization', () => {
        fixture.whenStable().then(() => {
            expect(component.VisualizationReady).toBeTruthy();
        });
    });

    it('shows the buttons', () => {
        fixture.whenStable().then(() => {
            expect(component.ShowHighlightButtons).toBeTruthy();
        });
    });
    it('toggles protein visibility', () => {
        fixture.whenStable().then(() => {
            spyOn(component.superpositionService, 'GenerateMolstarVisualisation');

            component.ToggleStructureVisibility(0);
            expect(component.IsProteinVisible[0]).toBeFalsy();

            component.ToggleStructureVisibility(0);
            expect(component.IsProteinVisible[0]).toBeTruthy();
        });
    });
    it('toggles chain visibility', () => {
        fixture.whenStable().then(() => {
            spyOn(component.molstarService, 'BuildRepresentation');
            spyOn(component.molstarService, 'ShowChainsOnly');

            component.ToggleChainVisibility();
            expect(component.OnlyChains).toBeTruthy();

            component.ToggleChainVisibility();
            expect(component.OnlyChains).toBeFalsy();
        });
    });

    it('toggles domain highlighting', () => {
        fixture.whenStable().then(() => {
            spyOn(component.molstarService, 'HighlightDomains');

            component.ToggleHighlighting(0);
            expect(component.highlightedDomains[0].Highlighted).toBeTruthy();
            spyOn(component.molstarService, 'HighlightDomains');

            component.ToggleHighlighting(0);
            expect(component.highlightedDomains[0].Highlighted).toBeFalsy();

        });
    });
    it('toggles representation', () => {
        fixture.whenStable().then(() => {
            spyOn(component.molstarService, 'BuildRepresentation');

            component.ChangeRepresentation(0, 'ball-and-stick');
            expect(component.ProteinRepresentation[0]).toBe('ball-and-stick');
            spyOn(component.molstarService, 'BuildRepresentation');

            component.ChangeRepresentation(0, 'cartoon');
            expect(component.ProteinRepresentation[0]).toBe('cartoon');

        });
    });
    it('toggles domain highlighting', () => {
        fixture.whenStable().then(() => {
            spyOn(component.molstarService, 'BuildRepresentation');

            component.ChangeRepresentation(0, 'ball-and-stick');
            expect(component.ProteinRepresentation[0]).toBe('ball-and-stick');
            spyOn(component.molstarService, 'BuildRepresentation');

            component.ChangeRepresentation(0, 'cartoon');
            expect(component.ProteinRepresentation[0]).toBe('cartoon');

        });
    });

});
