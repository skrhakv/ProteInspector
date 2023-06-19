import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailViewButtonGroupComponent } from './detail-view-button-group.component';
import { Expression } from '@angular/compiler';
import { Color } from 'd3';
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import { StructureRepresentationRegistry } from 'molstar/lib/mol-repr/structure/registry';
import { MolstarService } from 'src/app/services/molstar.service';

describe('DetailViewButtonGroupComponent', () => {
    let component: DetailViewButtonGroupComponent;
    let fixture: ComponentFixture<DetailViewButtonGroupComponent>;
    class MockMolstarService {
        async BuildSelection(plugin: PluginUIContext, structure: any, state: any, selector: any, selection: Expression,
            visible: boolean, color: Color, opacity: number, representation: StructureRepresentationRegistry.BuiltIn) {
            return;
        }
        public async ClearDomainHighlighting(plugin: PluginUIContext, proteinIndex: number) {
            return;
        }
        public async HighlightDomains(plugin: PluginUIContext, expr: Expression, color: Color, transparency: number, proteinIndex: number) {
            return;
        }
    }
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DetailViewButtonGroupComponent],
            providers: [{ provide: MolstarService, useClass: MockMolstarService }],
        })
            .compileComponents();

        fixture = TestBed.createComponent(DetailViewButtonGroupComponent);
        component = fixture.componentInstance;
        component.proteinColorHex = '0000FF';
        component.disabled = false;
        component.description = '5b0i01';
        component.visible = true;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should change representation', () => {
        const representation = 'ball-and-stick';
        component.ChangeRepresentation(representation);
        expect(component.representation).toBe(representation);
    });
    it('should change color', () => {
        const event = {
            target: {
                value: '0000FF'
            }
        };
        component.ColorChanged(event);
        expect(component.proteinColorHex).toBe(event.target.value);
    });

    it('should change opacity', () => {
        const event = {
            target: {
                value: 80
            }
        };
        component.ToggleOpacity(event);
        expect(component['opacity']).toBe(event.target.value / 100);
    });
    it('should change visibility', () => {

        component.ToggleVisibility();
        expect(component.visible).toBe(false);
    });
});
