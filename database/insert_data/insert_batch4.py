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
    select nextval('domain_pairs_sequence'), '{before_domain_id1}', {before_domain_id2} WHERE NOT EXISTS (
    SELECT 1 FROM domain_pairs WHERE domain_id1='{before_domain_id1}' and domain_id2 = {before_domain_id2})
    returning domain_pair_id"""
    cur.execute(insert_before_domain_pair)
    before_domain_pair_id = cur.fetchone()

    # if the domain already existed in the table
    if before_domain_pair_id == None:
        cur.execute(f"""select domain_pair_id from domain_pairs
        where domain_id1='{before_domain_id1}' and domain_id2='{before_domain_id2}'""")
        before_domain_pair_id = cur.fetchone()
    before_domain_pair_id = before_domain_pair_id[0]


    if after_domain_id1 >= after_domain_id2:
        after_domain_id1, after_domain_id2 = after_domain_id2, after_domain_id1
    insert_after_domain_pair = f"""
    insert into domain_pairs(domain_pair_id,domain_id1, domain_id2)
    select nextval('domain_pairs_sequence'), '{after_domain_id1}', {after_domain_id2} WHERE NOT EXISTS (
    SELECT 1 FROM domain_pairs WHERE domain_id1='{after_domain_id1}' and domain_id2 = {after_domain_id2})
    returning domain_pair_id"""
    cur.execute(insert_after_domain_pair)
    after_domain_pair_id = cur.fetchone()

    # if the domain already existed in the table
    if after_domain_pair_id == None:
        cur.execute(f"""select domain_pair_id from domain_pairs
        where domain_id1='{after_domain_id1}' and domain_id2='{after_domain_id2}'""")
        after_domain_pair_id = cur.fetchone()
    after_domain_pair_id = after_domain_pair_id[0]


    insert_domain_pair_transformation = f"""
    insert into domain_pair_transformations(domain_pair_transformation_id,before_domain_pair_id, after_domain_pair_id)
    VALUES (nextval('domain_pair_transformations_sequence'),'{before_domain_pair_id}', '{after_domain_pair_id}');"""
    cur.execute(insert_domain_pair_transformation)

    counter += 1
    if counter == 100:
        counter = 0
        connection.commit()


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
            if i['analysis_name'] == "GetRMSD" and i['level_tag'] == 'chain2DA2chain2DA':
                insert_domain_pair(i)
    connection.commit()
