#include <string>
#include "query-executor.hpp"
#include "metrics-parsers/count-metrics-parser.hpp"
#include "metrics-parsers/nonselective-metrics-parser.hpp"
#include "metrics-parsers/selective-metrics-parser.hpp"
#include "metrics-parsers/transformation-metrics-parser.hpp"
#include "where-clause-parsers/regular-where-clause-parser.hpp"
#include "where-clause-parsers/wrapper-where-clause-parser.hpp"

using namespace std;

std::pair<pqxx::result, std::string> QueryExecutor::GetTransformationContext(const std::string &query, int datasetId, int page, int pageSize)
{
    NonSelectiveMetricsParser metricsParser;
    WrapperWhereClauseParser wrapperWhereClauseParser(page, pageSize);

    parser.SetWhereClauseParser(&wrapperWhereClauseParser);
    parser.SetMetricsParser(&metricsParser);
    
    parser.Clear();

    bool isValid = parser.Parse(query, datasetId, page, pageSize);

    if (!isValid)
    {
        return {pqxx::result(), parser.errorMessage};
    }

    return dbClient.ExecuteQuery(parser.GetConvertedQuery());
}

std::pair<pqxx::result, std::string> QueryExecutor::ParseAndExecute(const std::string &query, int datasetId, int page, int pageSize, bool includeAllMetrics)
{
    MetricsParser *metricsParser;
    RegularWhereClauseParser regularWhereClauseParser(true);

    parser.SetWhereClauseParser(&regularWhereClauseParser);

    if (includeAllMetrics)
    {
        metricsParser = new NonSelectiveMetricsParser();
        parser.SetMetricsParser(metricsParser);
    }
    else
    {
        metricsParser = new SelectiveMetricsParser();
        parser.SetMetricsParser(metricsParser);
    }
    parser.Clear();

    bool isValid = parser.Parse(query, datasetId, page, pageSize);
    delete metricsParser;
    if (!isValid)
    {
        return {pqxx::result(), parser.errorMessage};
    }

    return dbClient.ExecuteQuery(parser.GetConvertedQuery());
}

std::pair<pqxx::result, std::string> QueryExecutor::GetNumberOfPages(const std::string &query, int datasetId)
{
    CountMetricsParser metricsParser;
    parser.SetMetricsParser(&metricsParser);

    RegularWhereClauseParser regularWhereClauseParser(false);
    parser.SetWhereClauseParser(&regularWhereClauseParser);

    parser.Clear();

    bool isValid = parser.Parse(query, datasetId);

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
