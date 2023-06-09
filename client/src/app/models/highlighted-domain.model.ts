export class HighlightedDomain {
    PdbId!: string;
    ChainId!: string;
    Start!: number;
    End!: number;
    Highlighted = false;
    ColorLevel = 0;
    DomainName = '';
    IsResidueSpan!: boolean;
    ProteinIndex!: number;
}
