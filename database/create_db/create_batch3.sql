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

CREATE SEQUENCE pairs_of_domain_pairs_sequence start 1 increment 1;

CREATE TABLE pairs_of_domain_pairs (
    pair_of_domain_pairs_id SERIAL PRIMARY KEY,
    domain_pair_id1 INTEGER NOT NULL,
    domain_pair_id2 INTEGER NOT NULL,
    FOREIGN KEY (domain_pair_id1) REFERENCES domain_pairs(domain_pair_id),
    FOREIGN KEY (domain_pair_id2) REFERENCES domain_pairs(domain_pair_id)
);