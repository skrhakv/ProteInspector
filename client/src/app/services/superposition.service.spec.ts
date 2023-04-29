import { TestBed } from '@angular/core/testing';

import { SuperpositionService } from './superposition.service';

describe('SuperpositionService', () => {
  let service: SuperpositionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SuperpositionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
