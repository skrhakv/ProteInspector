-- these are only mock data for development purposes
-- these data will be replaced with real data when the real data will be available
CREATE TABLE protein_labels (
    label_id SERIAL PRIMARY KEY,
    label TEXT NOT NULL,
    protein_id INTEGER NOT NULL,
    structure_definition INTEGER ARRAY NOT NULL,
    FOREIGN KEY (protein_id) REFERENCES proteins (protein_id)
);

-- structure_definition works like this:
-- array has an even number of integers, each double represents a start and the end of the certain part of structure
-- for example:
-- ARRAY[1, 2, 5, 7] means, that the label holds for a section <1,2> and <5,7> 
-- ARRAY[4, 4] means, that the label hold only for the section <4,4>
-- add label on structures
INSERT INTO
    protein_labels (
        label_id,
        label,
        protein_id,
        structure_definition
    )
VALUES
    (1, 'active', 1, ARRAY [1, 2, 5, 7]);

INSERT INTO
    protein_labels (
        label_id,
        label,
        protein_id,
        structure_definition
    )
VALUES
    (2, 'inactive', 2, ARRAY [4, 5, 7, 8]);

INSERT INTO
    protein_labels (
        label_id,
        label,
        protein_id,
        structure_definition
    )
VALUES
    (4, 'active', 4, ARRAY [1, 2, 5, 6]);

INSERT INTO
    protein_labels (
        label_id,
        label,
        protein_id,
        structure_definition
    )
VALUES
    (5, 'inactive', 5, ARRAY [4, 5, 7, 8]);

-- add label on a single residuum
INSERT INTO
    protein_labels (
        label_id,
        label,
        protein_id,
        structure_definition
    )
VALUES
    (6, 'inactive', 6, ARRAY [4, 4]);


INSERT INTO
    protein_labels (
        label_id,
        label,
        protein_id,
        structure_definition
    )
VALUES
    (3, 'active', 3, ARRAY [5, 5]);

-- add protein simulation of length 4
-- simulates transformation from protein with protein_id=1 to protein_id=2 to protein_id=3 to protein_id=4
INSERT INTO
    transformations (transformation_id, transformation_length)
VALUES
    (1000000000, 4);

INSERT INTO
    protein_transformations (
        protein_transformation_id,
        before_protein_id,
        after_protein_id,
        transformation_id,
        before_snapshot,
        after_snapshot
    )
VALUES
    (1000000000, 1, 2, 1000000000, 1, 2);

INSERT INTO
    protein_transformations (
        protein_transformation_id,
        before_protein_id,
        after_protein_id,
        transformation_id,
        before_snapshot,
        after_snapshot
    )
VALUES
    (1000000001, 1, 3, 1000000000, 1, 3);

INSERT INTO
    protein_transformations (
        protein_transformation_id,
        before_protein_id,
        after_protein_id,
        transformation_id,
        before_snapshot,
        after_snapshot
    )
VALUES
    (1000000002, 1, 4, 1000000000, 1, 4);

INSERT INTO
    protein_transformations (
        protein_transformation_id,
        before_protein_id,
        after_protein_id,
        transformation_id,
        before_snapshot,
        after_snapshot
    )
VALUES
    (1000000003, 2, 3, 1000000000, 2, 3);

INSERT INTO
    protein_transformations (
        protein_transformation_id,
        before_protein_id,
        after_protein_id,
        transformation_id,
        before_snapshot,
        after_snapshot
    )
VALUES
    (1000000004, 2, 4, 1000000000, 2, 4);

INSERT INTO
    protein_transformations (
        protein_transformation_id,
        before_protein_id,
        after_protein_id,
        transformation_id,
        before_snapshot,
        after_snapshot
    )
VALUES
    (1000000005, 3, 4, 1000000000, 3, 4);