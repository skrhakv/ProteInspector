-- these are only mock data for development purposes
-- these data will be replaced with real data when the real data will be available
CREATE TABLE residue_labels (
    label_id SERIAL PRIMARY KEY,
    label TEXT NOT NULL,
    protein_transformation_id INTEGER NOT NULL,
    residue_start INTEGER NOT NULL,
    residue_end INTEGER NOT NULL,
    FOREIGN KEY (protein_transformation_id) REFERENCES protein_transformations (protein_transformation_id)
);

-- add label on structures
INSERT INTO
    residue_labels (
        label_id,
        label,
        protein_transformation_id,
        residue_start,
        residue_end
    )
VALUES
    (1, 'active', 1, 1, 2);

INSERT INTO
    residue_labels (
        label_id,
        label,
        protein_transformation_id,
        residue_start,
        residue_end
    )
VALUES
    (2, 'active', 1, 5, 7);

INSERT INTO
    residue_labels (
        label_id,
        label,
        protein_transformation_id,
        residue_start,
        residue_end
    )
VALUES
    (3, 'inactive', 2, 4, 5);

INSERT INTO
    residue_labels (
        label_id,
        label,
        protein_transformation_id,
        residue_start,
        residue_end
    )
VALUES
    (4, 'inactive', 2, 7, 8);

INSERT INTO
    residue_labels (
        label_id,
        label,
        protein_transformation_id,
        residue_start,
        residue_end
    )
VALUES
    (5, 'active', 4, 1, 3);

INSERT INTO
    residue_labels (
        label_id,
        label,
        protein_transformation_id,
        residue_start,
        residue_end
    )
VALUES
    (6, 'active', 4, 5, 6);

INSERT INTO
    residue_labels (
        label_id,
        label,
        protein_transformation_id,
        residue_start,
        residue_end
    )
VALUES
    (7, 'inactive', 5, 4, 5);

INSERT INTO
    residue_labels (
        label_id,
        label,
        protein_transformation_id,
        residue_start,
        residue_end
    )
VALUES
    (8, 'inactive', 5, 7, 8);

-- add label on a single residuum
INSERT INTO
    residue_labels (
        label_id,
        label,
        protein_transformation_id,
        residue_start,
        residue_end
    )
VALUES
    (9, 'inactive', 6, 4, 4);

INSERT INTO
    residue_labels (
        label_id,
        label,
        protein_transformation_id,
        residue_start,
        residue_end
    )
VALUES
    (10, 'active', 3, 5, 5);

-- add protein simulation of length 4
-- simulates transformation from protein with protein_id=1 to protein_id=2 to protein_id=3 to protein_id=4
INSERT INTO
    transformations (
        transformation_id,
        transformation_length,
        dataset_id
    )
VALUES
    (1000000000, 4, 2);

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
    (1000000006, 1, 95570, 1000000000, 1, 5);

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
    (1000000007, 2, 95570, 1000000000, 2, 5);

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
    (1000000008, 3, 95570, 1000000000, 3, 5);

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
    (1000000009, 4, 95570, 1000000000, 4, 5);