import { Injectable } from '@angular/core';
import { AppSettings } from '../app-settings';

@Injectable({
    providedIn: 'root'
})
export class ExternalLinkService {


    private linkMapping: Record<string, LinkMappingFunction>;
    constructor() {
        this.linkMapping = {
            "UniprotId": this.getUniprotLink,
            "BeforePdbCode": this.getPdbLink,
            "BeforeDomainCathId": this.getCathLink,
            "BeforeDomainCathId1": this.getCathLink,
            "BeforeDomainCathId2": this.getCathLink,
            "AfterPdbCode": this.getPdbLink,
            "AfterDomainCathId": this.getCathLink,
            "AfterDomainCathId1": this.getCathLink,
            "AfterDomainCathId2": this.getCathLink,
        }
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

    public HasExternalLink(metric: string): boolean {
        return metric in this.linkMapping;
    }

    public GetExternalLink(metric: string, identificator: string): string {
        if (metric in this.linkMapping)
            return this.linkMapping[metric](identificator);
        return ""
    }

}

type LinkMappingFunction = (uniprotId: string) => string;
