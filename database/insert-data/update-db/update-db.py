import ujson
import os
import sys

inserted_sequences = []
inserted_proteins = []
inserted_protein_transformations = []
inserted_transformations = []
inserted_domains = []
inserted_domain_transformations = []
inserted_domain_pairs = []
inserted_residue_labels = []

cur, connection = None, None

def get_sequence_id(uniprot_id):
    sequence_id = 0
    exists_query = f"select exists (select 1 from sequences where uniprot_id = '{uniprot_id}');"

    cur.execute(exists_query)
    if not cur.fetchone()[0]:
        sequence_id_query = "select nextval('sequences_sequence');"
        cur.execute(sequence_id_query)
        sequence_id = cur.fetchone()[0]

        insert_query = f"INSERT INTO sequences(sequence_id, uniprot_id) VALUES ({sequence_id}, '{uniprot_id}');"
        cur.execute(insert_query, (uniprot_id))

        inserted_sequences.append(sequence_id)

    else:
        sequence_id_query = f"select sequence_id from sequences where uniprot_id = '{uniprot_id}';"
        cur.execute(sequence_id_query)
        sequence_id = cur.fetchone()[0]

    return sequence_id

def get_protein_id(pdb_code, chain_id, sequence_id):
    if not check_pdb_code_and_chain_id(pdb_code, chain_id):
        sys.exit(
            f"Unexpected format of pdb_code ('{pdb_code}') and chain_id ('{chain_id}')")

    exists_query = f"select exists (select 1 from proteins where pdb_code = '{pdb_code}' and chain_id = '{chain_id}');"
    protein_id = 0
    
    # check if the protein is not already in the DB
    cur.execute(exists_query)
    if not cur.fetchone()[0]:
        protein_id_query = "select nextval('proteins_sequence');"
        cur.execute(protein_id_query)
        protein_id = cur.fetchone()[0]

        insert_query = f"INSERT INTO proteins(protein_id, pdb_code, chain_id, is_holo, sequence_id) VALUES ({protein_id},'{pdb_code}', '{chain_id}', false, {sequence_id} );"
        cur.execute(insert_query)

        inserted_proteins.append(protein_id)

    else:
        protein_id_query = f"select protein_id from proteins where pdb_code = '{pdb_code}' and chain_id = '{chain_id}';"
        cur.execute(protein_id_query)
        protein_id = cur.fetchone()[0]
    
    return protein_id

def get_domain_id(cath_id, protein_id, span_start, span_end):
    exists_query = f"select exists (select 1 from domains where cath_id = '{cath_id}' and protein_id = '{protein_id}');"
    domain_id = 0
    
    # check if the domain is not already in the DB
    cur.execute(exists_query)
    if not cur.fetchone()[0]:
        domain_id_query = "select nextval('domains_sequence');"
        cur.execute(domain_id_query)
        domain_id = cur.fetchone()[0]

        insert_query = f"INSERT INTO domains(domain_id, cath_id, protein_id, domain_span) VALUES ({domain_id},'{cath_id}', {protein_id}, '({span_start}, {span_end})' );"
        cur.execute(insert_query)

        inserted_domains.append(domain_id)

    else:
        domain_id_query = f"select domain_id from domains where cath_id = '{cath_id}' and protein_id = '{protein_id}';"
        cur.execute(domain_id_query)
        domain_id = cur.fetchone()[0]
    
    return domain_id

def get_domain_pair_id(domain_id1, domain_id2):
    exists_query = f"select exists (select 1 from domain_pairs where (domain_id1 = '{domain_id1}' and domain_id2 = '{domain_id2}') or (domain_id1 = '{domain_id2}' and domain_id2 = '{domain_id1}'));"
    domain_pair_id = 0
    
    # check if the domain is not already in the DB
    cur.execute(exists_query)
    if not cur.fetchone()[0]:
        domain_pair_id_query = "select nextval('domain_pairs_sequence');"
        cur.execute(domain_pair_id_query)
        domain_pair_id = cur.fetchone()[0]

        insert_query = f"INSERT INTO domain_pairs(domain_pair_id, domain_id1, domain_id2) VALUES ({domain_pair_id},'{domain_id1}', {domain_id2} );"
        cur.execute(insert_query)

        inserted_domain_pairs.append(domain_pair_id)

    else:
        domain_pair_id_query = f"select domain_pair_id from domain_pairs where (domain_id1 = '{domain_id1}' and domain_id2 = '{domain_id2}') or (domain_id1 = '{domain_id2}' and domain_id2 = '{domain_id1}');"
        cur.execute(domain_pair_id_query)
        domain_pair_id = cur.fetchone()[0]
    return domain_pair_id

def get_domain_pair_transformation_id(before_domain_pair_id, after_domain_pair_id, before_snapshot, after_snapshot, transformation_id):
    domain_pair_transformation_id_query = "select nextval('domain_pair_transformations_sequence');"
    cur.execute(domain_pair_transformation_id_query)
    domain_pair_transformation_id = cur.fetchone()[0]

    insert_query = f"INSERT INTO domain_pair_transformations(domain_pair_transformation_id, before_domain_pair_id, after_domain_pair_id, before_snapshot, after_snapshot, transformation_id) VALUES ({domain_pair_transformation_id} ,{before_domain_pair_id}, {after_domain_pair_id}, {before_snapshot}, {after_snapshot}, {transformation_id});"
    cur.execute(insert_query)

    inserted_domain_transformations.append(domain_pair_transformation_id)

    return domain_pair_transformation_id

def get_domain_transformation_id(before_domain_id, after_domain_id, before_snapshot, after_snapshot, transformation_id):
    domain_transformation_id_query = "select nextval('domain_transformations_sequence');"
    cur.execute(domain_transformation_id_query)
    domain_transformation_id = cur.fetchone()[0]

    insert_query = f"INSERT INTO domain_transformations(domain_transformation_id, before_domain_id, after_domain_id, before_snapshot, after_snapshot, transformation_id) VALUES ({domain_transformation_id} ,{before_domain_id}, {after_domain_id}, {before_snapshot}, {after_snapshot}, {transformation_id});"
    cur.execute(insert_query)

    inserted_domain_transformations.append(domain_transformation_id)

    return domain_transformation_id


def get_protein_transformation_id(before_protein_id, after_protein_id, before_snapshot, after_snapshot, transformation_id):
    protein_transformation_id_query = "select nextval('protein_transformations_sequence');"
    cur.execute(protein_transformation_id_query)
    protein_transformation_id = cur.fetchone()[0]

    insert_query = f"INSERT INTO protein_transformations(protein_transformation_id, before_protein_id, after_protein_id, before_snapshot, after_snapshot, transformation_id) VALUES ({protein_transformation_id} ,{before_protein_id}, {after_protein_id}, {before_snapshot}, {after_snapshot}, {transformation_id});"
    cur.execute(insert_query)

    inserted_protein_transformations.append(protein_transformation_id)

    return protein_transformation_id

def get_transformation_id(transformation_length, dataset_id):

    transformation_id_query = "select nextval('transformations_sequence');"
    cur.execute(transformation_id_query)
    transformation_id = cur.fetchone()[0]

    insert_transformation_query = f"INSERT INTO transformations(transformation_id, transformation_length, dataset_id) VALUES ({transformation_id} ,{transformation_length}, {dataset_id});"
    cur.execute(insert_transformation_query)

    return transformation_id

def insert_protein_data(protein_transformation_id, rmsd, compare_secondary_structure):
    insert_transformation_query = f"INSERT INTO protein_transformations_data(protein_transformation_id, rmsd, compare_secondary_structure) VALUES ({protein_transformation_id} ,{rmsd}, {compare_secondary_structure});"
    cur.execute(insert_transformation_query)

def insert_domain_data(domain_transformation_id, rmsd, compare_secondary_structure):
    insert_transformation_query = f"INSERT INTO domain_transformations_data(domain_transformation_id, rmsd, compare_secondary_structure) VALUES ({domain_transformation_id} ,{rmsd}, {compare_secondary_structure});"
    cur.execute(insert_transformation_query)

def insert_domain_pair_data(domain_pair_transformation_id, rmsd, hinge_angle, hinge_translation_in_axis, hinge_translation_overall, before_interface_buried_area, after_interface_buried_area):
    insert_transformation_query = f"INSERT INTO domain_pair_transformations_data(domain_pair_transformation_id, rmsd, hinge_angle, hinge_translation_in_axis, hinge_translation_overall, before_interface_buried_area, after_interface_buried_area) VALUES ({domain_pair_transformation_id} ,{rmsd}, {hinge_angle}, {hinge_translation_in_axis}, {hinge_translation_overall}, {before_interface_buried_area}, {after_interface_buried_area});"
    cur.execute(insert_transformation_query)

def insert_residue_data(label, protein_transformation_id, before_residue_start, before_residue_end, after_residue_start, after_residue_end):
    residue_id_query = "select nextval('residue_labels_label_id_seq');"
    cur.execute(residue_id_query)
    label_id = cur.fetchone()[0]
    insert_label_query = f"INSERT INTO residue_labels(label_id, label, protein_transformation_id, before_residue_start, before_residue_end, after_residue_start, after_residue_end) VALUES ({label_id} ,'{label}', {protein_transformation_id}, {before_residue_start}, {before_residue_end}, {after_residue_start}, {after_residue_end});"
    cur.execute(insert_label_query)

    inserted_residue_labels.append(label_id)

def insert_lcs_data(protein_transformation_id, i1, i2, lcs_length):
    insert_transformation_query = f"INSERT INTO protein_lcs_data(protein_transformation_id, size, i1, i2) VALUES ({protein_transformation_id} ,{lcs_length}, {i1}, {i2});"
    cur.execute(insert_transformation_query)

def parse_protein_info(data):
    return [data["before_pdb_code"], data["after_pdb_code"], data["before_chain_id"], data["after_chain_id"], data["uniprot_id"]]

def parse_dataset_id(data):
    return data["dataset_id"]

def parse_cath_id(data, index = ""):
    return [data["before_cath_id" + index], data["after_cath_id" + index]]

def parse_snapshots(data):
    return [data["before_snapshot"], data["after_snapshot"]]

def parse_rmsd(data):
    return data["rmsd"]

def parse_compare_secondary_structure(data):
    return data["compare_secondary_structure"]

def parse_lcs(data):
    return [data["i1"], data["i2"], data["lcs_length"]]  

def parse_domain_span(data):
    return [data[0], data[1]]

def parse_hinge_info(data):
    return [data["hinge_angle"], data["hinge_translation_in_axis"], data["hinge_translation_overall"]]

def parse_interface_buried_area(data):
    return [data["before_interface_buried_area"], data["after_interface_buried_area"]]

def parse_label(data):
    return data["label"]

def parse_and_insert_protein_transformation(transformation, transformation_id):
    [before_pdb_code, after_pdb_code, before_chain_id, after_chain_id, uniprot_id] = parse_protein_info(transformation)
    [before_snapshot, after_snapshot] = parse_snapshots(transformation)
    
    sequence_id = get_sequence_id(uniprot_id)
    before_protein_id = get_protein_id(before_pdb_code, before_chain_id, sequence_id)
    after_protein_id = get_protein_id(after_pdb_code, after_chain_id, sequence_id)

    i = transformation['protein_transformation']
    rmsd = parse_rmsd(i)
    compare_secondary_structure = parse_compare_secondary_structure(i)
    [i1, i2, lcs_length] = parse_lcs(i)

    protein_transformation_id = get_protein_transformation_id(before_protein_id, after_protein_id, before_snapshot, after_snapshot, transformation_id)
    
    insert_protein_data(protein_transformation_id, rmsd, compare_secondary_structure)
    insert_lcs_data(protein_transformation_id, i1, i2, lcs_length)

    return protein_transformation_id


def parse_and_insert_domain_transformation(transformation, transformation_id):
    [before_pdb_code, after_pdb_code, before_chain_id, after_chain_id, uniprot_id] = parse_protein_info(transformation)
    [before_snapshot, after_snapshot] = parse_snapshots(transformation)
    
    sequence_id = get_sequence_id(uniprot_id)
    before_protein_id = get_protein_id(before_pdb_code, before_chain_id, sequence_id)
    after_protein_id = get_protein_id(after_pdb_code, after_chain_id, sequence_id)

    for i in transformation['domain_transformation']:
        print(i['before_cath_id'])
        [before_cath_id, after_cath_id] = parse_cath_id(i)
        [before_domain_span_start, before_domain_span_end] = parse_domain_span(i['before_domain_span'])
        [after_domain_span_start, after_domain_span_end] = parse_domain_span(i['after_domain_span'])

        rmsd = parse_rmsd(i)
        compare_secondary_structure = parse_compare_secondary_structure(i)

        before_domain_id = get_domain_id(before_cath_id, before_protein_id, before_domain_span_start, before_domain_span_end)
        after_domain_id = get_domain_id(after_cath_id, after_protein_id, after_domain_span_start, after_domain_span_end)
        
        domain_transformation_id = get_domain_transformation_id(before_domain_id, after_domain_id, before_snapshot, after_snapshot, transformation_id)

        insert_domain_data(domain_transformation_id, rmsd, compare_secondary_structure)


def parse_and_insert_domain_pair_transformation(transformation, transformation_id):
    [before_pdb_code, after_pdb_code, before_chain_id, after_chain_id, uniprot_id] = parse_protein_info(transformation)
    [before_snapshot, after_snapshot] = parse_snapshots(transformation)
    
    sequence_id = get_sequence_id(uniprot_id)
    before_protein_id = get_protein_id(before_pdb_code, before_chain_id, sequence_id)
    after_protein_id = get_protein_id(after_pdb_code, after_chain_id, sequence_id)

    for i in transformation['domain_pair_transformation']:
        [before_cath_id1, after_cath_id1] = parse_cath_id(i, '1')
        [before_cath_id2, after_cath_id2] = parse_cath_id(i, '2')

        [before_domain_span_start1, before_domain_span_end1] = parse_domain_span(i['before_domain_span1'])
        [before_domain_span_start2, before_domain_span_end2] = parse_domain_span(i['before_domain_span2'])
        [after_domain_span_start1, after_domain_span_end1] = parse_domain_span(i['after_domain_span1'])
        [after_domain_span_start2, after_domain_span_end2] = parse_domain_span(i['after_domain_span2'])
        [before_interface_buried_area, after_interface_buried_area] = parse_interface_buried_area(i)
        [hinge_angle, hinge_translation_in_axis, hinge_translation_overall] = parse_hinge_info(i)

        rmsd = parse_rmsd(i)

        before_domain_id1 = get_domain_id(before_cath_id1, before_protein_id, before_domain_span_start1, before_domain_span_end1)
        before_domain_id2 = get_domain_id(before_cath_id2, before_protein_id, before_domain_span_start2, before_domain_span_end2)
        after_domain_id1 = get_domain_id(after_cath_id1, after_protein_id, after_domain_span_start1, after_domain_span_end1)
        after_domain_id2 = get_domain_id(after_cath_id2, after_protein_id, after_domain_span_start2, after_domain_span_end2)

        before_domain_pair_id = get_domain_pair_id(before_domain_id1, before_domain_id2)
        after_domain_pair_id = get_domain_pair_id(after_domain_id1, after_domain_id2)
        
        domain_pair_transformation_id = get_domain_pair_transformation_id(before_domain_pair_id, after_domain_pair_id, before_snapshot, after_snapshot, transformation_id)
        insert_domain_pair_data(domain_pair_transformation_id, rmsd, hinge_angle, hinge_translation_in_axis, hinge_translation_overall, before_interface_buried_area, after_interface_buried_area)

def parse_and_insert_residue_transformation(transformation, transformation_id, protein_transformation_id = -1):
    if protein_transformation_id == -1:
        [before_pdb_code, after_pdb_code, before_chain_id, after_chain_id, uniprot_id] = parse_protein_info(transformation)
        [before_snapshot, after_snapshot] = parse_snapshots(transformation)

        sequence_id = get_sequence_id(uniprot_id)
        before_protein_id = get_protein_id(before_pdb_code, before_chain_id, sequence_id)
        after_protein_id = get_protein_id(after_pdb_code, after_chain_id, sequence_id)

        protein_transformation_id = get_protein_transformation_id(before_protein_id, after_protein_id, before_snapshot, after_snapshot, transformation_id)
    
    for i in transformation['residue_transformation']:
        [before_residue_start, before_residue_end] = [i["before_residue_span"][0], i["before_residue_span"][1]]
        [after_residue_start, after_residue_end] = [i["after_residue_span"][0], i["after_residue_span"][1]]
        label = parse_label(i)

        insert_residue_data(label, protein_transformation_id, before_residue_start, before_residue_end, after_residue_start, after_residue_end)

if __name__ == "__main__":
    sys.path.insert(0, '..')

    from base import log_to_db, check_pdb_code_and_chain_id

    cur, connection = log_to_db()

    if(len(sys.argv) < 2):
        sys.exit("JSON file as parameter expected!")

    file_name = sys.argv[1]
    dirname = os.path.dirname(__file__)

    # Opening JSON file
    f = open(os.path.join(dirname, file_name))

    data = ujson.load(f)

    for transformation_sequence in data:
        if len(transformation_sequence) > 0:
            protein_transformation_id = -1
            transformation_id = get_transformation_id(len(transformation_sequence), parse_dataset_id(transformation_sequence[0]))
            for transformation in transformation_sequence:
                    if "protein_transformation" in transformation:
                        protein_transformation_id = parse_and_insert_protein_transformation(transformation, transformation_id)
                    if "domain_transformation" in transformation:
                        parse_and_insert_domain_transformation(transformation, transformation_id)
                    if "domain_pair_transformation" in transformation:
                        parse_and_insert_domain_pair_transformation(transformation, transformation_id)
                    if "residue_transformation" in transformation:
                        if protein_transformation_id != -1:
                            parse_and_insert_residue_transformation(transformation, transformation_id, protein_transformation_id)
                        else:
                            parse_and_insert_residue_transformation(transformation, transformation_id)
            inserted_transformations.append(transformation_id)
    connection.commit()
    with open('inserted-data.json', 'w') as f:
        inserted_rows = {
            "inserted_sequences": inserted_sequences,
            "inserted_proteins": inserted_proteins,
            "inserted_protein_transformations":inserted_proteins,
            "inserted_transformations": inserted_transformations,
            "inserted_domains": inserted_domains,
            "inserted_domain_transformations": inserted_domain_transformations,
            "inserted_domain_pairs": inserted_domain_pairs,
            "inserted_residue_labels": inserted_residue_labels
        }
        ujson.dump(inserted_rows, f)

