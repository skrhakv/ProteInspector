CREATE TYPE SPAN AS (span_start INTEGER, span_end INTEGER);

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

CREATE SEQUENCE protein_pairs_sequence start 1 increment 1;

CREATE TABLE protein_pairs (
    protein_pair_id SERIAL PRIMARY KEY,
    apo_protein_id INTEGER NOT NULL,
    holo_protein_id INTEGER NOT NULL,
    FOREIGN KEY (apo_protein_id) REFERENCES proteins(protein_id),
    FOREIGN KEY (holo_protein_id) REFERENCES proteins(protein_id)
);

CREATE TABLE lcs_info (
    protein_pair_id INTEGER PRIMARY KEY,
    size INTEGER NOT NULL,
    i1 INTEGER NOT NULL,
    i2 INTEGER NOT NULL,
    FOREIGN KEY(protein_pair_id) REFERENCES protein_pairs (protein_pair_id)
);

CREATE TABLE protein_pairs_data (
    protein_pair_id INTEGER PRIMARY KEY,
    rmsd DOUBLE PRECISION,
    compare_secondary_structure DOUBLE PRECISION,
    FOREIGN KEY (protein_pair_id) REFERENCES protein_pairs(protein_pair_id)
);

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

CREATE SEQUENCE pairs_of_domain_pairs_sequence start 1 increment 1;

CREATE TABLE pairs_of_domain_pairs (
    pair_of_domain_pairs_id SERIAL PRIMARY KEY,
    domain_pair_id1 INTEGER NOT NULL,
    domain_pair_id2 INTEGER NOT NULL,
    FOREIGN KEY (domain_pair_id1) REFERENCES domain_pairs(domain_pair_id),
    FOREIGN KEY (domain_pair_id2) REFERENCES domain_pairs(domain_pair_id)
);

CREATE TABLE pairs_of_domain_pairs_data (
    pair_of_domain_pairs_id INTEGER PRIMARY KEY,
    rmsd DOUBLE PRECISION,
    compare_secondary_structure DOUBLE PRECISION,
    hinge_angle DOUBLE PRECISION,
    hinge_translation_in_axis DOUBLE PRECISION,
    hinge_translation_overall DOUBLE PRECISION,
    apo_interface_buried_area DOUBLE PRECISION,
    holo_interface_buried_area DOUBLE PRECISION,
    FOREIGN KEY (pair_of_domain_pairs_id) REFERENCES pairs_of_domain_pairs(pair_of_domain_pairs_id)
);