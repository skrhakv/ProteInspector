#ifndef QUERYEXECUTOR_H
#define QUERYEXECUTOR_H

#include <string>
#include "query-parser.hpp"
#include "db-client.hpp"

class QueryExecutor
{
    QueryParser parser;
    DbClient dbClient;

public:
    std::pair<pqxx::result, std::string> ParseAndExecute(const std::string &query, int page);
    std::pair<pqxx::result, std::string> GetNumberOfPages(const std::string &query);
};

#endif