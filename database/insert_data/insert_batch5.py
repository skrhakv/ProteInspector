import json
import os
import sys
from base import log_to_db

DEBUG = False
cur = None
connection = None
counter = 0


def insert_domain_pair(record):
    global counter

    before_pdb_code1 = record['args'][0][0][0]
    before_chain_id1 = record['args'][0][0][1]
    before_cath_id1 = record['args'][0][0][2]
    before_pdb_code2 = record['args'][0][1][0]
    before_chain_id2 = record['args'][0][1][1]
    before_cath_id2 = record['args'][0][1][2]

    after_pdb_code1 = record['args'][1][0][0]
    after_chain_id1 = record['args'][1][0][1]
    after_cath_id1 = record['args'][1][0][2]
    after_pdb_code2 = record['args'][1][1][0]
    after_chain_id2 = record['args'][1][1][1]
    after_cath_id2 = record['args'][1][1][2]
    get_before_query1 = f"""select domains.domain_id from proteins left join domains on 
    proteins.protein_id = domains.protein_id where proteins.pdb_code='{before_pdb_code1}' 
    and proteins.chain_id='{before_chain_id1}' 
    and domains.cath_id = '{before_cath_id1}';"""
    get_before_query2 = f"""select domains.domain_id from proteins left join domains on 
    proteins.protein_id = domains.protein_id where proteins.pdb_code='{before_pdb_code2}' 
    and proteins.chain_id='{before_chain_id2}' 
    and domains.cath_id = '{before_cath_id2}';"""
    get_after_query1 = f"""select domains.domain_id from proteins left join domains on 
    proteins.protein_id = domains.protein_id where proteins.pdb_code='{after_pdb_code1}' 
    and proteins.chain_id='{after_chain_id1}' 
    and domains.cath_id = '{after_cath_id1}';"""
    get_after_query2 = f"""select domains.domain_id from proteins left join domains on 
    proteins.protein_id = domains.protein_id where proteins.pdb_code='{after_pdb_code2}' 
    and proteins.chain_id='{after_chain_id2}' 
    and domains.cath_id = '{after_cath_id2}';"""
    cur.execute(get_before_query1)
    before_domain_id1 = cur.fetchone()[0]
    cur.execute(get_before_query2)
    before_domain_id2 = cur.fetchone()[0]
    cur.execute(get_after_query1)
    after_domain_id1 = cur.fetchone()[0]
    cur.execute(get_after_query2)
    after_domain_id2 = cur.fetchone()[0]

    if before_domain_id1 >= before_domain_id2:
        before_domain_id1, before_domain_id2 = before_domain_id2, before_domain_id1
    insert_before_domain_pair = f"""
    insert into domain_pairs(domain_pair_id,domain_id1, domain_id2)
    VALUES (nextval('proteins_sequence'),'{before_domain_id1}', '{before_domain_id2}');"""
    cur.execute(insert_before_domain_pair)

    if after_domain_id1 >= after_domain_id2:
        after_domain_id1, after_domain_id2 = after_domain_id2, after_domain_id1
    insert_after_domain_pair = f"""
    insert into domain_pairs(domain_pair_id,domain_id1, domain_id2)
    VALUES (nextval('proteins_sequence'),'{after_domain_id1}', '{after_domain_id2}');"""
    cur.execute(insert_after_domain_pair)
    counter += 1
    if counter == 100:
        counter = 0
        connection.commit()


def insert_to_domain_pair_transformations_data_table(record):
    is_before = False
    type = record['analysis_name']
    if type == "GetRMSD":
        before_pdb_code1 = record['args'][0][0][0]
        before_chain_id1 = record['args'][0][0][1]
        before_cath_id1 = record['args'][0][0][2]
        before_pdb_code2 = record['args'][0][1][0]
        before_chain_id2 = record['args'][0][1][1]
        before_cath_id2 = record['args'][0][1][2]

        after_pdb_code1 = record['args'][1][0][0]
        after_chain_id1 = record['args'][1][0][1]
        after_cath_id1 = record['args'][1][0][2]
        after_pdb_code2 = record['args'][1][1][0]
        after_chain_id2 = record['args'][1][1][1]
        after_cath_id2 = record['args'][1][1][2]
    elif type == "GetHingeAngle":
        before_pdb_code1 = record['args'][0][0]
        before_chain_id1 = record['args'][0][1]
        before_cath_id1 = record['args'][0][2]
        before_pdb_code2 = record['args'][1][0]
        before_chain_id2 = record['args'][1][1]
        before_cath_id2 = record['args'][1][2]

        after_pdb_code1 = record['args'][2][0]
        after_chain_id1 = record['args'][2][1]
        after_cath_id1 = record['args'][2][2]
        after_pdb_code2 = record['args'][3][0]
        after_chain_id2 = record['args'][3][1]
        after_cath_id2 = record['args'][3][2]
    elif type == "GetInterfaceBuriedArea":
        # is the 2DA apo or holo?
        if (record['args'][0][0] == record['args'][2][0][0]) and (record['args'][0][1] == record['args'][2][0][1]):
            before_pdb_code1 = before_pdb_code2 = record['args'][0][0]
            before_chain_id1 = before_chain_id2 = record['args'][0][1]
            before_cath_id1 = after_cath_id1 = record['args'][0][2]

            after_pdb_code1 = after_pdb_code2 = record['args'][2][1][0]
            after_chain_id1 = after_chain_id2 = record['args'][2][1][1]
            before_cath_id2 = after_cath_id2 = record['args'][1][2]
            is_before = True

        elif (record['args'][0][0] == record['args'][2][1][0]) and (record['args'][0][1] == record['args'][2][1][1]):
            after_pdb_code1 = after_pdb_code2 = record['args'][0][0]
            after_chain_id1 = after_chain_id2 = record['args'][0][1]
            before_cath_id1 = after_cath_id1 = record['args'][0][2]

            before_pdb_code1 = before_pdb_code2 = record['args'][2][0][0]
            before_chain_id1 = before_chain_id2 = record['args'][2][0][1]
            before_cath_id2 = after_cath_id2 = record['args'][1][2]
            is_before = False
        else:
            sys.exit(f"The pair ID is not apo/holo pair!\n\nRecord: {record}")
    
    if (before_pdb_code1 != before_pdb_code2) or before_chain_id1 != before_chain_id2:
        sys.exit(f"PDB code or Chain ID differ in two domains which are supposed to be from the same protein!\n\nRecord: {record}")

    get_before_domain_pair_query = f"""select domain_pairs.domain_pair_id from proteins as before_protein 
    left join domains as before_domain1 on before_protein.protein_id = before_domain1.protein_id 
    left join domains as before_domain2 on before_protein.protein_id = before_domain2.protein_id 
    left join domain_pairs ON ((domain_pairs.domain_id1 = before_domain1.domain_id and domain_pairs.domain_id2 = before_domain2.domain_id)
    or (domain_pairs.domain_id2 = before_domain1.domain_id and domain_pairs.domain_id1 = before_domain2.domain_id)) 
    where 
    before_protein.pdb_code='{before_pdb_code1}' and 
    before_protein.chain_id='{before_chain_id1}' and 
    before_domain1.cath_id = '{before_cath_id1}' and 
    before_domain2.cath_id = '{before_cath_id2}';"""
    cur.execute(get_before_domain_pair_query)
    result = cur.fetchone()
    if result == None:
        print(f"Missing before_domain_pair! {record}")
        return
    before_domain_pair = result[0]

    get_after_domain_pair_query = f"""select domain_pairs.domain_pair_id from proteins as after_protein 
    left join domains as after_domain1 on after_protein.protein_id = after_domain1.protein_id 
    left join domains as after_domain2 on after_protein.protein_id = after_domain2.protein_id 
    left join domain_pairs ON ((domain_pairs.domain_id1 = after_domain1.domain_id and domain_pairs.domain_id2 = after_domain2.domain_id)
    or (domain_pairs.domain_id2 = after_domain1.domain_id and domain_pairs.domain_id1 = after_domain2.domain_id)) 
    where 
    after_protein.pdb_code='{after_pdb_code1}' and 
    after_protein.chain_id='{after_chain_id1}' and 
    after_domain1.cath_id = '{after_cath_id1}' and 
    after_domain2.cath_id = '{after_cath_id2}';"""
    cur.execute(get_after_domain_pair_query)
    result = cur.fetchone()
    if result == None:
        print(f"Missing after_domain_pair! {record}")
        return
    after_domain_pair = result[0]
# select domain_pair_transformation_id from domain_pair_transformations where before_domain_pair_id = 63 and after_domain_pair_id = 64;

    get_domain_pair_tranformation_query = f"""
    SELECT domain_pair_transformation_id FROM domain_pair_transformations WHERE
    before_domain_pair_id = '{before_domain_pair}' AND
    after_domain_pair_id = '{after_domain_pair}';
    """
    cur.execute(get_domain_pair_tranformation_query)
    result = cur.fetchone()
    if result == None:
        print(f"Missing domain_pair_transformation_id! {record}")
        return
    domain_pair_tranformation = result[0]

    if type == "GetRMSD":
        result = record['result']
        if result != result:
            result = "NULL"
        insert_data_query = f"""INSERT INTO domain_pair_transformations_data
            (domain_pair_transformation_id, rmsd, hinge_angle, hinge_translation_in_axis,
            hinge_translation_overall, before_interface_buried_area, after_interface_buried_area)
            VALUES ({domain_pair_tranformation}, {result}, NULL, NULL, NULL, NULL, NULL)
            ON CONFLICT(domain_pair_transformation_id) DO UPDATE SET rmsd = {result}"""

    elif type == "GetHingeAngle":
        angle = record['result']['angle']
        if angle != angle:
            angle = "NULL"
        translation_in_axis = record['result']['translation_in_axis']
        if translation_in_axis != translation_in_axis:
            translation_in_axis = "NULL"
        translation_overall = record['result']['translation_overall']
        if translation_overall != translation_overall:
            translation_overall = "NULL"
        insert_data_query = f"""INSERT INTO domain_pair_transformations_data
            (domain_pair_transformation_id, rmsd, hinge_angle, hinge_translation_in_axis,
            hinge_translation_overall, before_interface_buried_area, after_interface_buried_area)
            VALUES ({domain_pair_tranformation}, NULL, {angle}, {
                    translation_in_axis}, {translation_overall}, NULL, NULL)
            ON CONFLICT(domain_pair_transformation_id) DO UPDATE SET hinge_angle = {angle}, hinge_translation_in_axis  =
            {translation_in_axis}, hinge_translation_overall = {translation_overall}"""

    elif type == "GetInterfaceBuriedArea":
        result = record['result']
        if result != result:
            result = "NULL"
        if is_before:
            insert_data_query = f"""INSERT INTO domain_pair_transformations_data
                (domain_pair_transformation_id, rmsd, hinge_angle, hinge_translation_in_axis,
                hinge_translation_overall, before_interface_buried_area, after_interface_buried_area)
                VALUES ({domain_pair_tranformation}, NULL, NULL, NULL, NULL, {result}, NULL)
                ON CONFLICT(domain_pair_transformation_id) DO UPDATE SET before_interface_buried_area = {result}"""
        else:
            insert_data_query = f"""INSERT INTO domain_pair_transformations_data
                (domain_pair_transformation_id, rmsd, hinge_angle, hinge_translation_in_axis,
                hinge_translation_overall, before_interface_buried_area, after_interface_buried_area)
                VALUES ({domain_pair_tranformation}, NULL, NULL, NULL, NULL, NULL, {result})
                ON CONFLICT(domain_pair_transformation_id) DO UPDATE SET after_interface_buried_area = {result}"""

    cur.execute(insert_data_query)
    connection.commit()


def process_RMSD(record):
    if record['level_tag'] == 'chain2chain':
        return  # done in the previous batch
    elif record['level_tag'] == 'domain2domain':
        return  # done in the previous batch
    elif record['level_tag'] == 'chain2DA2chain2DA':
        insert_to_domain_pair_transformations_data_table(record)
    else:
        sys.exit(f"Unexpected RMSD level_tag = {record['level_tag']}.")


def process_hinge_angle(record):
    if record['level_tag'] == 'chain2DA2chain2DA':
        insert_to_domain_pair_transformations_data_table(record)
    else:
        sys.exit(f"Unexpected HingeAngle level_tag = {record['level_tag']}.")


def process_interface_buried_area(record):
    if record['level_tag'] == '2DA':
        insert_to_domain_pair_transformations_data_table(record)
    else:
        sys.exit(
            f"Unexpected InterfaceBuriedArea level_tag = {record['level_tag']}.")


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

        data = json.load(f)

        for i in data:
            if i['analysis_name'] == "GetRMSD":
                process_RMSD(i)
            elif i['analysis_name'] == "CompareSecondaryStructure":
                continue  # done in the previous batch
            elif i['analysis_name'] == "GetHingeAngle":
                process_hinge_angle(i)
            elif i['analysis_name'] == "GetInterfaceBuriedArea":
                process_interface_buried_area(i)
            else:
                sys.exit(
                    f"Unexpected analysis_name = {i['analysis_name']}.\nFile: {filepath}")

    connection.commit()
