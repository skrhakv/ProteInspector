CREATE TABLE transformations (
    transformation_id SERIAL PRIMARY KEY,
    dataset_id INTEGER DEFAULT 1,
    transformation_length INTEGER DEFAULT 2,
    FOREIGN KEY (dataset_id) REFERENCES datasets(dataset_id)
);

CREATE TABLE datasets (
    dataset_id SERIAL PRIMARY KEY,
    dataset_name TEXT,
    dataset_description TEXT
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

INSERT INTO datasets(dataset_id, dataset_name, dataset_description) VALUES(1, 'Apo-Holo dataset', 'Dataset contains apo-holo protein pairs and their transformations');
INSERT INTO datasets(dataset_id, dataset_name, dataset_description) VALUES(2, 'test dataset', 'dataset for testing');
