import json
import os
import sys
from base import log_to_db


if __name__ == "__main__":
    args = sys.argv
    cur, connection = log_to_db()
    dirname = os.path.dirname(__file__)

    file_endings = list(range(int(args[1]), int(args[2])))

    for ending in file_endings:
        print(ending)

        path_to_JSON = os.path.join(
            dirname, '../../data/run_analyses/output/' + f'{ending:04d}')
        
        # get a filename in the data folder starting with "output_domains_info_"
        files = [filename for filename in os.listdir(
            path_to_JSON) if filename.startswith("output_domains_info_")]

        filepath = os.path.join(path_to_JSON, files[0])
        f = open(filepath)

        data = json.load(f)

        for i in data:
            if len(i["spans"]) > 1 and len(i["spans"][0]) > 2:
                sys.exit(
                    f"Unexpected array length: {i}.\nFile: {filepath}")

            start = i["spans"][0][0]
            end = i["spans"][0][1]
            pdb_code = i["pdb_code"]
            chain_id = i["chain_id"]
            cath_id = i["domain_id"]

            if 'spans_auth_seq_id' in i:
                if len(i["spans_auth_seq_id"]) > 1 and len(i["spans_auth_seq_id"][0]) > 2:
                    sys.exit(
                        f"Unexpected array length: {i}.\nFile: {filepath}")
                start_auth = i["spans_auth_seq_id"][0][0]
                end_auth = i["spans_auth_seq_id"][0][1]

                update_spans_query = f"""UPDATE domains 
                SET domain_span = '({start}, {end})', spans_auth_seq_id = '({start_auth}, {end_auth})'
                from proteins where 
                proteins.protein_id = domains.protein_id and 
                domains.cath_id = '{cath_id}' and
                proteins.chain_id = '{chain_id}' and 
                proteins.pdb_code = '{pdb_code}';"""
   
            else:
                update_spans_query = f"""UPDATE domains 
                SET domain_span = '({start}, {end})'
                from proteins where 
                proteins.protein_id = domains.protein_id and 
                domains.cath_id = '{cath_id}' and
                proteins.chain_id = '{chain_id}' and 
                proteins.pdb_code = '{pdb_code}';"""
            
            cur.execute(update_spans_query)
        connection.commit()



