CREATE SEQUENCE sequences_sequence start 1 increment 1;

CREATE TABLE sequences (
    sequence_id SERIAL PRIMARY KEY,
    uniprot_id TEXT
);

CREATE SEQUENCE proteins_sequence start 1 increment 1;

CREATE TABLE proteins (
    protein_id SERIAL PRIMARY KEY,
    pdb_code VARCHAR (4) NOT NULL,
    chain_id VARCHAR (4) NOT NULL,
    is_holo BOOLEAN NOT NULL,
    sequence_id INTEGER NOT NULL,
    FOREIGN KEY (sequence_id) REFERENCES sequences (sequence_id)
);