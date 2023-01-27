CREATE TABLE tranformations (
    transformation_id SERIAL PRIMARY KEY,
    transformation_length INTEGER DEFAULT 2
);

ALTER TABLE
    protein_transformations
ADD
    COLUMN transformation_id INTEGER REFERENCES tranformations(transformation_id);

ALTER TABLE
    domain_transformations
ADD
    COLUMN transformation_id INTEGER REFERENCES tranformations(transformation_id);

ALTER TABLE
    domain_pair_transformations
ADD
    COLUMN transformation_id INTEGER REFERENCES tranformations(transformation_id);

CREATE SEQUENCE transformations_sequence start 1 increment 1;