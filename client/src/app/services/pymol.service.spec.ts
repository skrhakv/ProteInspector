import { TestBed } from '@angular/core/testing';

import { PymolService } from './pymol.service';

describe('PymolService', () => {
  let service: PymolService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PymolService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
