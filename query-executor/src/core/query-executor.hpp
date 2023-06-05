#ifndef QUERYEXECUTOR_H
#define QUERYEXECUTOR_H

#include <string>
#include "select-clause-parser.hpp"
#include "db-client.hpp"

class QueryExecutor
{
    SelectClauseParser parser;
    DbClient dbClient;
    std::pair<pqxx::result, std::string> ParseAndExecuteImpl(const std::string &query);

public:
    std::pair<pqxx::result, std::string> ParseAndExecute(const std::string &query);
    std::pair<pqxx::result, std::string> ParseAndExecute(const std::string &query, int datasetId);
    std::pair<pqxx::result, std::string> ParseAndExecute(const std::string &query, int page, int pageSize);
    std::pair<pqxx::result, std::string> ParseAndExecute(const std::string &query, int datasetId, int page, int pageSize, bool includeAllMetrics = false);
    std::pair<pqxx::result, std::string> GetTransformationContext(const std::string &query);
    std::pair<pqxx::result, std::string> GetNumberOfResults(const std::string &query, int datasetId);
    std::pair<pqxx::result, std::string> GetDatasetsInfo();
};

#endif