#include <string>
#include "query-executor.hpp"

using namespace std;

std::pair<pqxx::result, std::string> QueryExecutor::ParseAndExecute(const std::string &query, int datasetId, int page, int pageSize, bool includeAllMetrics)
{
    parser.Clear();

    bool isValid = parser.ConvertQuery(query, false, datasetId, page, pageSize, includeAllMetrics);

    if (!isValid)
    {
        return {pqxx::result(), parser.errorMessage};
    }
    return dbClient.ExecuteQuery(parser.GetConvertedQuery());
}

std::pair<pqxx::result, std::string> QueryExecutor::GetNumberOfPages(const std::string &query, int datasetId)
{
    parser.Clear();

    bool isValid = parser.ConvertQuery(query, true, datasetId);

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
