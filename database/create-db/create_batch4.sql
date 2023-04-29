CREATE TABLE domain_pairs (
    domain_pair_id SERIAL PRIMARY KEY,
    domain_id1 INTEGER NOT NULL,
    domain_id2 INTEGER NOT NULL,
    FOREIGN KEY (domain_id1) REFERENCES domains(domain_id),
    FOREIGN KEY (domain_id2) REFERENCES domains(domain_id),
    CHECK (domain_id1 < domain_id2)
);

CREATE TABLE domain_pair_transformations (
    domain_pair_transformation_id SERIAL PRIMARY KEY,
    before_domain_pair_id INTEGER NOT NULL,
    after_domain_pair_id INTEGER NOT NULL,
    before_snapshot INTEGER DEFAULT 1,
    after_snapshot INTEGER DEFAULT 2,
    FOREIGN KEY (before_domain_pair_id) REFERENCES domain_pairs(domain_pair_id),
    FOREIGN KEY (after_domain_pair_id) REFERENCES domain_pairs(domain_pair_id)
);

CREATE SEQUENCE domain_pairs_sequence start 1 increment 1;

CREATE SEQUENCE domain_pair_transformations_sequence start 1 increment 1;
