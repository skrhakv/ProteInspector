CREATE TABLE sequences (uniprot_id TEXT PRIMARY KEY);

CREATE TYPE PROTEIN_ID AS (pdb_code VARCHAR (4), chain_id VARCHAR (2));

CREATE TABLE proteins (
    protein_id PROTEIN_ID PRIMARY KEY,
    is_holo BOOLEAN NOT NULL,
    uniprot_id TEXT NOT NULL,
    FOREIGN KEY (uniprot_id) REFERENCES sequences (uniprot_id)
);

CREATE TYPE SPAN AS (span_start INTEGER, span_end INTEGER);

CREATE TYPE DOMAIN_ID AS (
    cath_id VARCHAR (8),
    protein_id PROTEIN_ID
);

CREATE TABLE domains (
    span SPAN NOT NULL,
    domain_id DOMAIN_ID PRIMARY KEY,
    FOREIGN KEY (domain_id) REFERENCES proteins (protein_id)
);

CREATE TYPE PROTEIN_PAIR AS (
    protein_id1 PROTEIN_ID,
    protein_id2 PROTEIN_ID
);

CREATE TYPE DOMAIN_PAIR AS (
    domain_id1 DOMAIN_ID,
    domain_id2 DOMAIN_ID
);

CREATE TYPE PAIR_OF_DOMAIN_PAIRS AS (
    domain_pair_id1 DOMAIN_PAIR,
    domain_pair_id2 DOMAIN_PAIR
);

CREATE TABLE protein_pairs (
    pair PROTEIN_PAIR PRIMARY KEY,
    FOREIGN KEY (pair) REFERENCES proteins(protein_id)
);

CREATE TABLE domain_pairs (
    pair DOMAIN_PAIR PRIMARY KEY,
    FOREIGN KEY (pair) REFERENCES domains(domain_id)
);

CREATE TABLE pairs_of_domain_pairs (
    pair PAIR_OF_DOMAIN_PAIRS PRIMARY KEY,
    FOREIGN KEY (pair) REFERENCES domain_pairs(pair)
);