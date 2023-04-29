CREATE TYPE SPAN AS (span_start INTEGER, span_end INTEGER);

CREATE SEQUENCE domains_sequence start 1 increment 1;

CREATE TABLE domains (
    domain_id SERIAL PRIMARY KEY,
    cath_id VARCHAR (8) NOT NULL,
    protein_id INTEGER NOT NULL,
    domain_span SPAN,
    spans_auth_seq_id SPAN,
    FOREIGN KEY (protein_id) REFERENCES proteins (protein_id)
);

CREATE SEQUENCE domain_transformations_sequence start 1 increment 1;

CREATE TABLE domain_transformations (
    domain_transformation_id SERIAL PRIMARY KEY,
    before_domain_id INTEGER NOT NULL,
    after_domain_id INTEGER NOT NULL,
    before_snapshot INTEGER DEFAULT 1,
    after_snapshot INTEGER DEFAULT 2,
    FOREIGN KEY (before_domain_id) REFERENCES domains(domain_id),
    FOREIGN KEY (after_domain_id) REFERENCES domains(domain_id)
);

CREATE TABLE domain_transformations_data (
    domain_transformation_id INTEGER PRIMARY KEY,
    rmsd DOUBLE PRECISION,
    compare_secondary_structure DOUBLE PRECISION,
    FOREIGN KEY (domain_transformation_id) REFERENCES domain_transformations(domain_transformation_id)
);

CREATE TABLE protein_transformations_data (
    protein_transformation_id INTEGER PRIMARY KEY,
    rmsd DOUBLE PRECISION,
    compare_secondary_structure DOUBLE PRECISION,
    FOREIGN KEY (protein_transformation_id) REFERENCES protein_transformations(protein_transformation_id)
);