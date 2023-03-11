#include <pqxx/pqxx>
#include "db-client.hpp"
#include "json-reader.hpp"

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

    connnection = new pqxx::connection(connectionString);
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
        res = tx.exec("SELECT * FROM datasets;");
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
