\timing on
select
    *
from
    protein_transformations
    inner join protein_lcs_data on protein_transformations.protein_transformation_id = protein_lcs_data.protein_transformation_id
    inner join protein_transformations_data on protein_transformations.protein_transformation_id = protein_transformations_data.protein_transformation_id
    inner join transformations on protein_transformations.transformation_id = transformations.transformation_id
    inner join proteins as before_proteins on before_proteins.protein_id = protein_transformations.before_protein_id
    inner join proteins as after_proteins on after_proteins.protein_id = protein_transformations.after_protein_id
    inner join sequences on sequences.sequence_id = before_proteins.sequence_id
where
    before_proteins.pdb_code = '5b02';

select
    *
from
    protein_transformations
    inner join protein_lcs_data on protein_transformations.protein_transformation_id = protein_lcs_data.protein_transformation_id
    inner join protein_transformations_data on protein_transformations.protein_transformation_id = protein_transformations_data.protein_transformation_id
    inner join transformations on protein_transformations.transformation_id = transformations.transformation_id
    inner join proteins as before_proteins on before_proteins.protein_id = protein_transformations.before_protein_id
    inner join proteins as after_proteins on after_proteins.protein_id = protein_transformations.after_protein_id
    inner join sequences on sequences.sequence_id = before_proteins.sequence_id
where
    before_proteins.pdb_code = '5gww';

select
    *
from
    protein_transformations
    inner join protein_lcs_data on protein_transformations.protein_transformation_id = protein_lcs_data.protein_transformation_id
    inner join protein_transformations_data on protein_transformations.protein_transformation_id = protein_transformations_data.protein_transformation_id
    inner join transformations on protein_transformations.transformation_id = transformations.transformation_id
    inner join proteins as before_proteins on before_proteins.protein_id = protein_transformations.before_protein_id
    inner join proteins as after_proteins on after_proteins.protein_id = protein_transformations.after_protein_id
    inner join sequences on sequences.sequence_id = before_proteins.sequence_id
where
    before_proteins.pdb_code = '5lbv';
