export class HighlightedDomain {
    StructureIndex!: number;
    PdbId!: string;
    ChainId!: string;
    Start!: number;
    End!: number;
    Highlighted: boolean = false;
    ColorLevel: number = 0;
    DomainName: string = '';
}
