CREATE TABLE domain_pairs (
    domain_pair_id SERIAL PRIMARY KEY,
    domain_id1 INTEGER NOT NULL,
    domain_id2 INTEGER NOT NULL,
    FOREIGN KEY (domain_id1) REFERENCES domains(domain_id),
    FOREIGN KEY (domain_id2) REFERENCES domains(domain_id),
    CHECK (domain_id1 < domain_id2)
);