CREATE TABLE transformations (
    transformation_id SERIAL PRIMARY KEY,
    dataset_id INTEGER DEFAULT 1,
    transformation_length INTEGER DEFAULT 2
);

ALTER TABLE
    protein_transformations
ADD
    COLUMN transformation_id INTEGER REFERENCES transformations(transformation_id);

ALTER TABLE
    domain_transformations
ADD
    COLUMN transformation_id INTEGER REFERENCES transformations(transformation_id);

ALTER TABLE
    domain_pair_transformations
ADD
    COLUMN transformation_id INTEGER REFERENCES transformations(transformation_id);

CREATE SEQUENCE transformations_sequence start 1 increment 1;