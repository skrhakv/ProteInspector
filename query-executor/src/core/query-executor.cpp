#include <string>
#include "query-executor.hpp"

using namespace std;

std::pair<pqxx::result, std::string> QueryExecutor::ParseAndExecute(const std::string &query, int page, int pageSize)
{
    parser.Clear();

    bool isValid = parser.ConvertQuery(query, false, page, pageSize);

    if (!isValid)
    {
        return {pqxx::result(), parser.errorMessage};
    }
    return dbClient.ExecuteQuery(parser.GetConvertedQuery());
}

std::pair<pqxx::result, std::string> QueryExecutor::GetNumberOfPages(const std::string &query)
{
    parser.Clear();

    bool isValid = parser.ConvertQuery(query, true);

    if (!isValid)
    {
        return {pqxx::result(), parser.errorMessage};
    }
    return dbClient.ExecuteQuery(parser.GetConvertedQuery());
}

std::pair<pqxx::result, std::string> QueryExecutor::GetDatasetsInfo() 
{
    return dbClient.GetDatasetsInfo();
}
