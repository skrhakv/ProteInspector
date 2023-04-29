DROP TABLE residue_labels;

DELETE FROM
    protein_transformations
WHERE
    transformation_id = 1000000000;

DELETE FROM
    transformations
WHERE
    transformation_id = 1000000000;