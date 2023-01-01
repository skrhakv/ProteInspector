CREATE TABLE domain_pair_transformations_data (
    domain_pair_transformation_id INTEGER PRIMARY KEY,
    rmsd DOUBLE PRECISION,
    hinge_angle DOUBLE PRECISION,
    hinge_translation_in_axis DOUBLE PRECISION,
    hinge_translation_overall DOUBLE PRECISION,
    before_interface_buried_area DOUBLE PRECISION,
    after_interface_buried_area DOUBLE PRECISION,
    FOREIGN KEY (domain_pair_transformation_id) REFERENCES domain_pair_transformations(domain_pair_transformation_id)
);