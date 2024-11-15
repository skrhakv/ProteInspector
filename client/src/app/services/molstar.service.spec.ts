import { TestBed } from '@angular/core/testing';

import { MolstarService } from './molstar.service';

describe('MolstarService', () => {
    let service: MolstarService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MolstarService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('should extract authAsymId', () => {
        const authAsymId = service['parseChainId']('X [auth Y]');
        expect(authAsymId).toBe('Y');
    });
});
