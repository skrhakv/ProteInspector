import ujson
import os
import sys
from base import log_to_db, check_pdb_code_and_chain_id, check_mismatches

DEBUG = False

if __name__ == "__main__":
    cur, connection = log_to_db()

    dirname = os.path.dirname(__file__)
    # First iterate through filter_output.json* files to fill 'sequences' table and 'proteins' table
    lim = 1500  # there are files filter_output.json[000-699]
    file_endings = list(range(374, lim))
    counter = 0
    for ending in file_endings:
        print(ending)

        f = open(os.path.join(dirname, '../../data/run_analyses/input/' +
                 f'{ending:04d}' + "/pairs.json_shard"))

        data = ujson.load(f)
        for i in data:
            # load data from JSON
            pdb_code_apo = i['pdb_code_apo']
            chain_id_apo = i['chain_id_apo']
            pdb_code_holo = i['pdb_code_holo']
            chain_id_holo = i['chain_id_holo']
            lcs_length = i['lcs_result']['length']
            lcs_i1 = i['lcs_result']['i1']
            lcs_i2 = i['lcs_result']['i2']
            lcs_mismatches = i['lcs_result']['mismatches']
            lcs_leading_mismatches = i['lcs_result']['leading_mismatches']
            lcs_trailing_mismatches = i['lcs_result']['trailing_mismatches']

            # check the format of pdb_code and chain_id and mismatches
            if not check_pdb_code_and_chain_id(pdb_code_apo, chain_id_apo):
                sys.exit(
                    f"Unexpected format of pdb_code ('{pdb_code_apo}') and chain_id ('{chain_id_apo}')")
            if not check_pdb_code_and_chain_id(pdb_code_holo, chain_id_holo):
                sys.exit(
                    f"Unexpected format of pdb_code ('{pdb_code_holo}') and chain_id ('{chain_id_holo}')")
            if not check_mismatches(lcs_mismatches, lcs_leading_mismatches, lcs_trailing_mismatches):
                sys.exit(
                    f"Unexpected value of lcs_mismatches: {lcs_mismatches}, lcs_leading_mismatches: {lcs_leading_mismatches}, lcs_trailing_mismatches: {lcs_trailing_mismatches}')")

            # get apo/holo protein id
            apo_protein_query = f"select protein_id from proteins where pdb_code = '{pdb_code_apo}' and chain_id = '{chain_id_apo}';"
            holo_protein_query = f"select protein_id from proteins where pdb_code = '{pdb_code_holo}' and chain_id = '{chain_id_holo}';"

            cur.execute(apo_protein_query)
            apo_protein_result = cur.fetchone()
            if apo_protein_result == None:
                sys.exit(
                    f"Non-existing apo-protein pdb_code = '{pdb_code_apo}', chain_id = '{chain_id_apo}")

            cur.execute(holo_protein_query)
            holo_protein_result = cur.fetchone()
            if holo_protein_result == None:
                sys.exit(
                    f"Non-existing holo-protein pdb_code = '{pdb_code_holo}', chain_id = '{chain_id_holo}")

            apo_protein_id = apo_protein_result[0]
            holo_protein_id = holo_protein_result[0]
            protein_pair_id = 0

            # sanity check if the pair is not already in the DB
            exists_query = f"select protein_transformation_id from protein_transformations where before_protein_id = {apo_protein_id} and after_protein_id = {holo_protein_id};"
            cur.execute(exists_query)
            result = cur.fetchone()
            if not result:
                # insert pair into the DB

                # generate ID
                protein_pair_id_query = "select nextval('protein_transformations_sequence');"
                cur.execute(protein_pair_id_query)
                protein_pair_id = cur.fetchone()[0]

                insert_query = f"INSERT INTO protein_transformations(protein_transformation_id, before_protein_id, after_protein_id) VALUES ({protein_pair_id} ,{apo_protein_id}, {holo_protein_id});"
                cur.execute(insert_query)
            else:
                if DEBUG:
                    print(
                        f"Duplicate: apo_protein_id = {apo_protein_id} and holo_protein_id = {holo_protein_id}")
                # get the sequence ID of the duplicate, it is needed when inserting into the proteins table
                protein_pair_id = result[0]

            # insert lcs info into the protein_transformations_data table:

            # sanity check if the protein_transformations_data is not already in the DB
            exists_query = f"select exists (select 1 from protein_transformations_data where protein_transformation_id = {protein_pair_id});"
            cur.execute(exists_query)
            if not cur.fetchone()[0]:
                # insert the info into the DB
                insert_query = f"INSERT INTO protein_transformations_data(protein_transformation_id, size, i1, i2) VALUES ({protein_pair_id}, {lcs_length}, {lcs_i1}, {lcs_i2});"
                cur.execute(insert_query)
            else:
                if DEBUG:
                    print(f"Duplicate: protein_transformations_id = '{protein_pair_id}'")
            counter += 1
            if counter == 1000:
                connection.commit()
                counter = 0
        connection.commit()
        f.close()
