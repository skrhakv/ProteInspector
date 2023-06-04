export class HighlightedDomain {
    PdbId!: string;
    ChainId!: string;
    Start!: number;
    End!: number;
    Highlighted: boolean = false;
    ColorLevel: number = 0;
    DomainName: string = '';
    IsResidueSpan!: boolean;
    ProteinIndex!: number;
}
