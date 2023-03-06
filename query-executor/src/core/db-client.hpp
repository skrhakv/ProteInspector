#ifndef DBCLIENT_H
#define DBCLIENT_H

#include <string>
#include <pqxx/pqxx>
#include <nlohmann/json.hpp>

class DbClient
{
    nlohmann::json configData;
    pqxx::connection *connnection;

public:
    DbClient();
    ~DbClient();
    std::pair<pqxx::result, std::string> ExecuteQuery(const std::string& parsedQuery);
    std::pair<pqxx::result, std::string> GetDatasetsInfo();
};

#endif