CREATE TYPE SPAN AS (span_start INTEGER, span_end INTEGER);

CREATE SEQUENCE domains_sequence start 1 increment 1;

CREATE TABLE domains (
    domain_id SERIAL PRIMARY KEY,
    cath_id VARCHAR (8) NOT NULL,
    protein_id INTEGER NOT NULL,
    FOREIGN KEY (protein_id) REFERENCES proteins (protein_id)
);

CREATE SEQUENCE domain_pairs_sequence start 1 increment 1;

CREATE TABLE domain_pairs (
    domain_pair_id SERIAL PRIMARY KEY,
    apo_domain_id INTEGER NOT NULL,
    holo_domain_id INTEGER NOT NULL,
    FOREIGN KEY (apo_domain_id) REFERENCES domains(domain_id),
    FOREIGN KEY (holo_domain_id) REFERENCES domains(domain_id)
);

CREATE TABLE domain_pairs_data (
    domain_pair_id INTEGER PRIMARY KEY,
    domain_span SPAN,
    rmsd DOUBLE PRECISION,
    compare_secondary_structure DOUBLE PRECISION,
    FOREIGN KEY (domain_pair_id) REFERENCES domain_pairs(domain_pair_id)
);

CREATE TABLE protein_pairs_data (
    protein_pair_id INTEGER PRIMARY KEY,
    rmsd DOUBLE PRECISION,
    compare_secondary_structure DOUBLE PRECISION,
    FOREIGN KEY (protein_pair_id) REFERENCES protein_pairs(protein_pair_id)
);