import json
import os
import sys
from base import log_to_db, check_pdb_code_and_chain_id

DEBUG = False

if __name__ == "__main__":

    cur, connection = log_to_db()

    dirname = os.path.dirname(__file__)

    # First iterate through filter_output.json* files to fill 'sequences' table and 'proteins' table
    lim = 700  # there are files filter_output.json[000-699]
    file_endings = list(range(0, lim))

    for ending in file_endings:
        # Opening JSON file
        f = open(os.path.join(dirname, '../../data/filter/filter_output.json.d/filter_output.json' +
                 f'{ending:04d}' + '/pairs.json_shard'))

        print(ending)
        data = json.load(f)

        for i in data:
            # add data to 'sequences' table
            uniprot_id = i['uniprotkb_id']
            sequence_id = 0
            exists_query = f"select exists (select 1 from sequences where uniprot_id = '{uniprot_id}');"

            # sanity check if the sequence is not already in the DB
            cur.execute(exists_query)
            if not cur.fetchone()[0]:
                sequence_id_query = "select nextval('sequences_sequence');"
                cur.execute(sequence_id_query)
                sequence_id = cur.fetchone()[0]

                insert_query = f"INSERT INTO sequences(sequence_id, uniprot_id) VALUES ({sequence_id}, '{uniprot_id}');"
                cur.execute(insert_query, (uniprot_id))
                connection.commit()
            else:
                if DEBUG:
                    print(f"Duplicate! uniprot_id = {uniprot_id}")

                # get the sequence ID of the duplicate, it is needed when inserting into the proteins table
                sequence_id_query = f"select sequence_id from sequences where uniprot_id = '{uniprot_id}';"
                cur.execute(sequence_id_query)
                sequence_id = cur.fetchone()[0]

            # add data to 'sequences' table
            pdb_code = i['pdb_code']
            is_holo = i['is_holo']
            chain_id = i['chain_id']

            if not check_pdb_code_and_chain_id(pdb_code, chain_id):
                sys.exit(
                    f"Unexpected format of pdb_code ('{pdb_code}') and chain_id ('{chain_id}')")

            exists_query = f"select exists (select 1 from proteins where pdb_code = '{pdb_code}' and chain_id = '{chain_id}');"

            # sanity check if the protein is not already in the DB
            cur.execute(exists_query)
            if not cur.fetchone()[0]:
                insert_query = f"INSERT INTO proteins(protein_id, pdb_code, chain_id, is_holo, sequence_id) VALUES (nextval('proteins_sequence'),'{pdb_code}', '{chain_id}', {is_holo}, {sequence_id} );"
                cur.execute(insert_query)
                connection.commit()
            else:
                if DEBUG:
                    print(
                        f"Duplicate! pdb_code = '{pdb_code}', chain_id = '{chain_id}")

        f.close()
