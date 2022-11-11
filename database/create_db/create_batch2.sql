
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
