#include <string>
#include "query-executor.hpp"

using namespace std;

std::pair<pqxx::result, std::string> QueryExecutor::ParseAndExecute(const std::string& query)
{
    pqxx::result res;
    bool isValid = parser.ConvertQuery(query);
    if (!isValid)
    {
        return {pqxx::result(), parser.errorMessage};
    }
    return dbClient.ExecuteQuery(parser.GetConvertedQuery());
}
