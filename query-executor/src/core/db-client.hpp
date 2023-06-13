#ifndef DBCLIENT_H
#define DBCLIENT_H

#include <string>
#include <pqxx/pqxx>
#include <nlohmann/json.hpp>
/// @brief Provides the connection to the database
class DbClient
{
    nlohmann::json configData;
    pqxx::connection *connnection;

public:
    DbClient();
    ~DbClient();
    /// @brief Executes specified query
    /// @param parsedQuery database query
    /// @return query results
    std::pair<pqxx::result, std::string> ExecuteQuery(const std::string& parsedQuery);
    /// @brief Retrieves info about every dataset in the database
    /// @return dataset infos
    std::pair<pqxx::result, std::string> GetDatasetsInfo();
};

#endif