
CREATE SEQUENCE protein_transformations_sequence start 1 increment 1;

CREATE TABLE protein_transformations (
    protein_transformation_id SERIAL PRIMARY KEY,
    before_protein_id INTEGER NOT NULL,
    after_protein_id INTEGER NOT NULL,
    FOREIGN KEY (before_protein_id) REFERENCES proteins(protein_id),
    FOREIGN KEY (after_protein_id) REFERENCES proteins(protein_id)
);

CREATE TABLE protein_lcs_data (
    protein_transformation_id INTEGER PRIMARY KEY,
    size INTEGER NOT NULL,
    i1 INTEGER NOT NULL,
    i2 INTEGER NOT NULL,
    FOREIGN KEY(protein_transformation_id) REFERENCES protein_transformations (protein_transformation_id)
);
