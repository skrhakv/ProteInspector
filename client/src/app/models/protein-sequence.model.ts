export class ProteinSequence {
    ProteinIndex!: number;
    ChainSequences!: {
        ChainId: string, Sequence: string
    }[];
}
