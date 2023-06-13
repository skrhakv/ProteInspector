#ifndef QUERYEXECUTOR_H
#define QUERYEXECUTOR_H

#include <string>
#include "select-clause-parser.hpp"
#include "db-client.hpp"

/// @brief Converts custom query language into executable database query and obtains the results using the database query
class QueryExecutor
{
    SelectClauseParser parser;
    DbClient dbClient;
    std::pair<pqxx::result, std::string> ParseAndExecuteImpl(const std::string &query);

public:
    /// @brief Parses and executes the query
    /// @param query query
    /// @return database results
    std::pair<pqxx::result, std::string> ParseAndExecute(const std::string &query);
    /// @brief Parses and executes the query
    /// @param query query
    /// @param datasetId dataset ID
    /// @return database results
    std::pair<pqxx::result, std::string> ParseAndExecute(const std::string &query, int datasetId);
    /// @brief Parses and executes
    /// @param query query
    /// @param datasetId dataset ID
    /// @param page page number
    /// @param pageSize page size
    /// @return database results
    std::pair<pqxx::result, std::string> ParseAndExecute(const std::string &query, int page, int pageSize);
    /// @brief Parses and executes the query, 
    /// @param query query
    /// @param datasetId dataset ID
    /// @param page page number
    /// @param pageSize page size
    /// @param includeAllMetrics true if every metric should be included in the results
    /// @return database results
    std::pair<pqxx::result, std::string> ParseAndExecute(const std::string &query, int datasetId, int page, int pageSize, bool includeAllMetrics = false);
    /// @brief Obtain transformation context of the first result from the specified query 
    /// @param query 
    /// @return database results
    std::pair<pqxx::result, std::string> GetTransformationContext(const std::string &query);
    /// @brief gets number of results for the specified query
    /// @param query 
    /// @param datasetId 
    /// @return number of results
    std::pair<pqxx::result, std::string> GetNumberOfResults(const std::string &query, int datasetId);
    /// @brief Gets info about every dataset
    /// @return datasets info
    std::pair<pqxx::result, std::string> GetDatasetsInfo();
};

#endif