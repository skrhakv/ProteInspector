import os
import sys
from base import log_to_db


if __name__ == "__main__":
    args = sys.argv
    cur, connection = log_to_db()
    dirname = os.path.dirname(__file__)
    
    get_max_protein_transformation_id_query = "select max(protein_transformation_id) from protein_transformations;"
    cur.execute(get_max_protein_transformation_id_query)
    max_protein_transformation_id = cur.fetchone()[0]
    min_protein_transformation_id = int(args[1])
    protein_transformation_ids = list(
        range(min_protein_transformation_id, max_protein_transformation_id + 1))

    counter = 0

    for protein_transformation_id in protein_transformation_ids:
        insert_transformation_query = f"""INSERT INTO tranformations(transformation_id)
            select nextval('transformations_sequence') RETURNING transformation_id"""
        cur.execute(insert_transformation_query)
        transformation_id = cur.fetchone()[0]

        update_tranformation_id_in_protein_transformations_query = f"""UPDATE protein_transformations
            SET transformation_id = {transformation_id}
            WHERE protein_transformation_id = {protein_transformation_id}
            RETURNING before_protein_id, after_protein_id;"""
        cur.execute(update_tranformation_id_in_protein_transformations_query)
        result = cur.fetchone()
        before_protein_id = result[0]
        after_protein_id = result[1]

        update_tranformation_id_in_domain_transformations_query = f"""UPDATE domain_transformations                                                           
            SET transformation_id = {transformation_id}
            from domains as before_domains,domains as after_domains where 
            before_domains.domain_id = domain_transformations.before_domain_id and 
            after_domains.domain_id = domain_transformations.after_domain_id and 
            before_domains.protein_id = {before_protein_id} and after_domains.protein_id = {after_protein_id};"""
        cur.execute(update_tranformation_id_in_domain_transformations_query)

        update_tranformation_id_in_domain_pair_transformations_query = f"""UPDATE domain_pair_transformations                                                                     
            SET transformation_id = {transformation_id}   
            from domain_pairs as before_domain_pairs, domain_pairs as after_domain_pairs, 
            domains as before_domains,domains as after_domains where 
            before_domain_pairs.domain_pair_id = domain_pair_transformations.before_domain_pair_id and 
            after_domain_pairs.domain_pair_id = domain_pair_transformations.after_domain_pair_id and 
            before_domains.domain_id = before_domain_pairs.domain_id1 and 
            after_domains.domain_id = after_domain_pairs.domain_id1 and 
            after_domains.protein_id = {after_protein_id} and before_domains.protein_id = {before_protein_id};"""
        cur.execute(update_tranformation_id_in_domain_pair_transformations_query)

        counter += 1
        if counter == 100:
            counter = 0
            connection.commit()
            print(protein_transformation_id)

    connection.commit()
