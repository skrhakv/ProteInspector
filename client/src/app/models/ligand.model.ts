import { Expression } from "molstar/lib/mol-script/language/expression"

export class Ligand {
    ProteinIndex!: number;
    MolstarExpression!: Expression;
    Label!: string;
    ChainId!: string;
}
