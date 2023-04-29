ALTER TABLE
    protein_transformations
DROP
    COLUMN transformation_id;

ALTER TABLE
    domain_transformations
DROP
    COLUMN transformation_id;

ALTER TABLE
    domain_pair_transformations
DROP
    COLUMN transformation_id;

DROP TABLE tranformations;

DROP TABLE datasets;

DROP SEQUENCE transformations_sequence;