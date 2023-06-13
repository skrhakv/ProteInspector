import { Injectable } from '@angular/core';
import { AppSettings } from '../app-settings';
/**
 * Handles creation of links to external databases
 */
@Injectable({
    providedIn: 'root'
})
export class ExternalLinkService {


    private linkMapping: Record<string, LinkMappingFunction>;
    constructor() {
        this.linkMapping = {
            'UniprotId': this.getUniprotLink,
            'BeforePdbID': this.getPdbLink,
            'BeforeDomainCathId': this.getCathLink,
            'BeforeDomainCathId1': this.getCathLink,
            'BeforeDomainCathId2': this.getCathLink,
            'AfterPdbID': this.getPdbLink,
            'AfterDomainCathId': this.getCathLink,
            'AfterDomainCathId1': this.getCathLink,
            'AfterDomainCathId2': this.getCathLink,
        };
    }

    private getUniprotLink(uniprotId: string): string {
        return AppSettings.UNIPROT_DATABASE_URL + uniprotId;
    }

    private getPdbLink(pdbCode: string): string {
        return AppSettings.PDB_DATABASE_URL + pdbCode;
    }

    private getCathLink(cathId: string): string {
        return AppSettings.CATH_DATABASE_URL + cathId;
    }

    /**
     * True if metric has external link
     * @param metric 
     * @returns 
     */
    public HasExternalLink(metric: string): boolean {
        return metric in this.linkMapping;
    }
    /**
     * generates link to an external database
     * @param metric metric name
     * @param identificator database identificator (PDB ID for proteins, Uniprot ID for sequences, etc.)
     * @returns 
     */
    public GetExternalLink(metric: string, identificator: string): string {
        if (metric in this.linkMapping)
            return this.linkMapping[metric](identificator);
        return '';
    }

}

type LinkMappingFunction = (uniprotId: string) => string;
