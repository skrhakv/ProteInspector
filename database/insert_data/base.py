import psycopg2
import os
from dotenv import load_dotenv


def log_to_db():
    load_dotenv()
    db_name = os.getenv('DB_NAME')
    db_host = os.getenv('DB_HOST')
    db_user = os.getenv('DB_USER')
    db_user_passwd = os.getenv('DB_USER_PASSWD')

    connection = psycopg2.connect(
        dbname=db_name, user=db_user, password=db_user_passwd, host=db_host)
    return connection.cursor(), connection


def check_pdb_code_and_chain_id(pdb_code, chain_id):
    if len(pdb_code) > 4 or len(chain_id) > 4:
        return False
    return True


def check_mismatches(mismatches1, mismatches2, mismatches3):
    if mismatches1 > 0 or mismatches2 > 0 or mismatches3 > 0:
        return False
    return True
