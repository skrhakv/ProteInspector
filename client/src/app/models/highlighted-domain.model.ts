export class HighlightedDomain {
    PdbId!: string;
    ChainId!: string;
    Start!: number;
    End!: number;
    DomainName = '';
    IsResidueSpan!: boolean;
    ProteinIndex!: number;
}
