import { TestBed } from '@angular/core/testing';

import { ExternalLinkService } from './external-link.service';

describe('ExternalLinkService', () => {
    let service: ExternalLinkService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ExternalLinkService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('should approve metric for external link', () => {
        expect(service.HasExternalLink('UniprotId')).toBeTruthy();
    });
    it('should not approve metric for external link', () => {
        expect(service.HasExternalLink('RMSD')).toBeFalsy();
    });
    it('should create external Uniprot link', () => {
        expect(service.GetExternalLink('UniprotId', 'A0A010')).toBe('https://www.uniprot.org/uniprotkb/A0A010');
    });
    it('should create external Pdb link', () => {
        expect(service.GetExternalLink('BeforePdbID', '5b0i')).toBe('https://www.rcsb.org/structure/5b0i');
    });
    it('should create external Cath link', () => {
        expect(service.GetExternalLink('BeforeDomainCathId', '5b02A00')).toBe('https://www.cathdb.info/domain/5b02A00');
    });
});
