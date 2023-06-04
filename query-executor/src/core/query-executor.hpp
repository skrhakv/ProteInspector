#ifndef QUERYEXECUTOR_H
#define QUERYEXECUTOR_H

#include <string>
#include "select-clause-parser.hpp"
#include "db-client.hpp"

class QueryExecutor
{
    SelectClauseParser parser;
    DbClient dbClient;

public:
    std::pair<pqxx::result, std::string> ParseAndExecute(const std::string &query, int datasetId, int page = 0, int pageSize = 0, bool includeAllMetrics = false);
    std::pair<pqxx::result, std::string> GetTransformationContext(const std::string &query, int datasetId);
    std::pair<pqxx::result, std::string> GetNumberOfResults(const std::string &query, int datasetId);
    std::pair<pqxx::result, std::string> GetDatasetsInfo();
};

#endif