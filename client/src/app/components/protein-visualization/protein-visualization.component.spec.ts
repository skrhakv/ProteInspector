import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProteinVisualizationComponent } from './protein-visualization.component';

describe('ProteinVisualizationComponent', () => {
  let component: ProteinVisualizationComponent;
  let fixture: ComponentFixture<ProteinVisualizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProteinVisualizationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProteinVisualizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
