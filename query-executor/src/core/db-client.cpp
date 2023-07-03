#include <pqxx/pqxx>
#include "db-client.hpp"
#include "json-reader.hpp"
#include <iostream>

using namespace std;

DbClient::~DbClient()
{
    connnection->close();
    delete connnection;
}

DbClient::DbClient()
{
    configData = JsonReader::GetJsonData("config.json")["database"];
    string connectionString = "user=";
    connectionString += configData["user"];
    connectionString += " host=";
    connectionString += configData["host"];
    connectionString += " password=";
    connectionString += configData["password"];
    connectionString += " dbname=";
    connectionString += configData["dbname"];
    try
    {
        connnection = new pqxx::connection(connectionString);
    }
    catch (const std::exception &e)
    {
        cerr << e.what() << std::endl;
    }
}

std::pair<pqxx::result, std::string> DbClient::ExecuteQuery(const std::string &parsedQuery)
{
    pqxx::result res;
    pqxx::work tx{*connnection};
    try
    {
        res = tx.exec(parsedQuery);
        tx.commit();
    }
    catch (const exception &e)
    {
        tx.abort();
        string errorMessage = e.what();
        return {res, errorMessage};
    }
    return {res, std::string()};
}

std::pair<pqxx::result, std::string> DbClient::GetDatasetsInfo()
{
    pqxx::result res;
    pqxx::work tx{*connnection};
    try
    {
        res = tx.exec("select datasets.dataset_id, datasets.dataset_name, datasets.dataset_description, protein_stats.protein_count, domain_stats.domain_count, domain_pair_stats.domain_pair_count, residue_stats.residue_count from datasets left join (SELECT dataset_id,count(*) as protein_count FROM protein_transformations inner join transformations on transformations.transformation_id = protein_transformations.transformation_id group by transformations.dataset_id) as protein_stats on protein_stats.dataset_id = datasets.dataset_id left join (SELECT dataset_id,count(*) as domain_count FROM domain_transformations inner join transformations on transformations.transformation_id = domain_transformations.transformation_id group by transformations.dataset_id) as domain_stats on domain_stats.dataset_id = datasets.dataset_id left join (SELECT dataset_id,count(*) as domain_pair_count FROM domain_pair_transformations inner join transformations on transformations.transformation_id = domain_pair_transformations.transformation_id group by transformations.dataset_id) as domain_pair_stats on domain_pair_stats.dataset_id = datasets.dataset_id left join (SELECT dataset_id,count(*) as residue_count FROM residue_labels inner join protein_transformations on protein_transformations.protein_transformation_id = residue_labels.protein_transformation_id inner join transformations on transformations.transformation_id = protein_transformations.transformation_id group by transformations.dataset_id) as residue_stats on residue_stats.dataset_id = datasets.dataset_id order by datasets.dataset_id;");
        tx.commit();
    }
    catch (const exception &e)
    {
        tx.abort();
        string errorMessage = e.what();
        return {res, errorMessage};
    }
    return {res, std::string()};
}
