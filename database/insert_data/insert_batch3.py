import ujson
import os
import sys
from base import log_to_db, check_pdb_code_and_chain_id, check_pdb_code_and_chain_id_and_cath_id

DEBUG = False
cur = None
connection = None


def insert_to_protein_transformations_data_table(record):
    type = record['analysis_name']
    apo_pdb_code = record['args'][0][0]
    apo_chain_id = record['args'][0][1]
    holo_pdb_code = record['args'][1][0]
    holo_chain_id = record['args'][1][1]
    result = record['result']
    if result != result:
        result = "NULL"

    if not check_pdb_code_and_chain_id(apo_pdb_code, apo_chain_id):
        sys.exit(
            f"Unexpected format of pdb_code ('{apo_pdb_code}') and chain_id ('{apo_chain_id}')")
    if not check_pdb_code_and_chain_id(holo_pdb_code, holo_chain_id):
        sys.exit(
            f"Unexpected format of pdb_code ('{holo_pdb_code}') and chain_id ('{holo_chain_id}')")

    # get protein_transformation_id from the protein_transformations table
    get_protein_transformation_id_query = f"""select protein_transformation_id from protein_transformations
    where before_protein_id = (select protein_id from proteins where pdb_code = '{apo_pdb_code}'
    and chain_id = '{apo_chain_id}') and after_protein_id = (select protein_id from proteins
    where pdb_code = '{holo_pdb_code}' and chain_id = '{holo_chain_id}');"""

    cur.execute(get_protein_transformation_id_query)
    protein_transformation_id = cur.fetchone()[0]

    # insert the data into the protein_transformations_data table
    if type == "GetRMSD":
        insert_query = f"""INSERT INTO protein_transformations_data (protein_transformation_id, rmsd, compare_secondary_structure)
        VALUES ({protein_transformation_id}, {result}, 0) ON CONFLICT(protein_transformation_id) DO UPDATE SET rmsd = {result}"""

    elif type == "CompareSecondaryStructure":
        insert_query = f"""INSERT INTO protein_transformations_data (protein_transformation_id, rmsd, compare_secondary_structure)
        VALUES ({protein_transformation_id}, 0, {result}) ON CONFLICT(protein_transformation_id) DO UPDATE SET compare_secondary_structure = {result}"""

    cur.execute(insert_query)


def insert_to_domains_transformations_data_table(record):
    type = record['analysis_name']
    apo_pdb_code = record['args'][0][0]
    apo_chain_id = record['args'][0][1]
    apo_cath_id = record['args'][0][2]
    holo_pdb_code = record['args'][1][0]
    holo_chain_id = record['args'][1][1]
    holo_cath_id = record['args'][1][2]

    result = record['result']
    if result != result:
        result = "NULL"

    if not check_pdb_code_and_chain_id_and_cath_id(apo_pdb_code, apo_chain_id, apo_cath_id):
        sys.exit(
            f"Unexpected format of pdb_code ('{apo_pdb_code}') and chain_id ('{apo_chain_id}'), cath_id ('{apo_cath_id}')")
    if not check_pdb_code_and_chain_id_and_cath_id(holo_pdb_code, holo_chain_id, apo_cath_id):
        sys.exit(
            f"Unexpected format of pdb_code ('{holo_pdb_code}'), chain_id ('{holo_chain_id}'), cath_id ('{holo_cath_id}')")

    # insert domains if they are not in the table:
    # insert apo domain
    apo_protein_id_query = f"""select protein_id from proteins
    where pdb_code='{apo_pdb_code}' and chain_id='{apo_chain_id}'"""
    cur.execute(apo_protein_id_query)
    apo_protein_id = cur.fetchone()[0]

    insert_apo_domain_query = f"""
    insert into domains(domain_id,cath_id, protein_id)
    select nextval('domains_sequence'), '{apo_cath_id}', {apo_protein_id} WHERE NOT EXISTS (
    SELECT 1 FROM domains WHERE cath_id='{apo_cath_id}' and protein_id = {apo_protein_id})
    returning domain_id;"""

    cur.execute(insert_apo_domain_query)
    before_domain_id = cur.fetchone()

    # if the domain already existed in the table
    if before_domain_id == None:
        cur.execute(f"""select domain_id from domains
        where protein_id='{apo_protein_id}' and cath_id='{apo_cath_id}'""")
        before_domain_id = cur.fetchone()

    before_domain_id = before_domain_id[0]

    # insert holo domain
    holo_protein_id_query = f"""select protein_id from proteins
    where pdb_code='{holo_pdb_code}' and chain_id='{holo_chain_id}'"""
    cur.execute(holo_protein_id_query)
    holo_protein_id = cur.fetchone()[0]

    insert_holo_domain_query = f"""
    insert into domains(domain_id,cath_id, protein_id)
    select nextval('domains_sequence'), '{holo_cath_id}', {holo_protein_id} WHERE NOT EXISTS (
    SELECT 1 FROM domains WHERE cath_id='{holo_cath_id}' and protein_id = {holo_protein_id})
    returning domain_id;"""

    cur.execute(insert_holo_domain_query)
    after_domain_id = cur.fetchone()

    # if the domain already existed in the table
    if after_domain_id == None:
        cur.execute(f"""select domain_id from domains where
        protein_id='{holo_protein_id}' and cath_id='{holo_cath_id}'""")
        after_domain_id = cur.fetchone()

    after_domain_id = after_domain_id[0]

    # insert domain_transformations
    insert_domain_pair_query = f"""
    insert into domain_transformations(domain_transformation_id,before_domain_id, after_domain_id)
    select nextval('domain_transformations_sequence'), '{before_domain_id}', {after_domain_id} WHERE NOT EXISTS (
    SELECT 1 FROM domain_transformations WHERE before_domain_id='{before_domain_id}' and after_domain_id = {after_domain_id})
    returning domain_transformation_id;"""

    cur.execute(insert_domain_pair_query)
    domain_transformation_id = cur.fetchone()

    # if the domain already existed in the table
    if domain_transformation_id == None:
        cur.execute(f"""select domain_transformation_id FROM domain_transformations
        WHERE before_domain_id={before_domain_id} and after_domain_id = {after_domain_id}""")
        domain_transformation_id = cur.fetchone()

    domain_transformation_id = domain_transformation_id[0]

    # insert domain_pair data
    if type == "GetRMSD":
        insert_domain_pair_data_query = f"""INSERT INTO domain_transformations_data
        (domain_transformation_id, rmsd, compare_secondary_structure) VALUES ({domain_transformation_id}, {result}, 0)
        ON CONFLICT(domain_transformation_id) DO UPDATE SET rmsd = {result}"""
    elif type == "CompareSecondaryStructure":
        insert_domain_pair_data_query = f"""INSERT INTO domain_transformations_data
        (domain_transformation_id, rmsd, compare_secondary_structure) VALUES ({domain_transformation_id}, 0, {result})
        ON CONFLICT(domain_transformation_id) DO UPDATE SET compare_secondary_structure = {result}"""
    cur.execute(insert_domain_pair_data_query)
    connection.commit()


def process_chain2chain_RMSD(record):
    insert_to_protein_transformations_data_table(record)


def process_chain2chain_secondary_structure(record):
    insert_to_protein_transformations_data_table(record)


def process_domain2domain_RMSD(record):
    insert_to_domains_transformations_data_table(record)


def process_domain2domain_secondary_structure(record):
    insert_to_domains_transformations_data_table(record)


def process_RMSD(record):
    if record['level_tag'] == 'chain2chain':
        process_chain2chain_RMSD(record)
    elif record['level_tag'] == 'domain2domain':
        process_domain2domain_RMSD(record)
    elif record['level_tag'] == 'chain2DA2chain2DA':
        return  # deal with that in the next batch
    else:
        sys.exit(f"Unexpected RMSD level_tag = {record['level_tag']}.")


def process_secondary_structure(record):
    if record['level_tag'] == 'chain2chain':
        process_chain2chain_secondary_structure(record)
    elif record['level_tag'] == 'domain2domain':
        process_domain2domain_secondary_structure(record)


if __name__ == "__main__":
    args = sys.argv
    cur, connection = log_to_db()
    dirname = os.path.dirname(__file__)

    file_endings = list(range(int(args[1]), int(args[2])))

    for ending in file_endings:
        print(ending)

        path_to_JSON = os.path.join(
            dirname, '../../data/run_analyses/output/' + f'{ending:04d}')

        # get a filename in the data folder starting with "output_apo_holo_"
        files = [filename for filename in os.listdir(
            path_to_JSON) if filename.startswith("output_apo_holo_")]

        filepath = os.path.join(path_to_JSON, files[0])
        f = open(filepath)

        data = ujson.load(f)

        for i in data:
            if i['analysis_name'] == "GetRMSD":
                process_RMSD(i)
            elif i['analysis_name'] == "CompareSecondaryStructure":
                process_secondary_structure(i)
            elif i['analysis_name'] == "GetHingeAngle":
                continue  # deal with that in the next batch
            elif i['analysis_name'] == "GetInterfaceBuriedArea":
                continue  # deal with that in the next batch
            else:
                sys.exit(
                    f"Unexpected analysis_name = {i['analysis_name']}.\nFile: {filepath}")
    connection.commit()
