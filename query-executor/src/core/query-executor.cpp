#include <string>
#include "query-executor.hpp"
#include "metrics-parsers/count-metrics-parser.hpp"
#include "metrics-parsers/nonselective-metrics-parser.hpp"
#include "metrics-parsers/selective-metrics-parser.hpp"
#include "metrics-parsers/transformation-metrics-parser.hpp"
#include "where-clause-parsers/regular-where-clause-parser.hpp"
#include "where-clause-parsers/wrapper-where-clause-parser.hpp"
#include "limit-clause-parsers/empty-limit-clause-parser.hpp"
#include "limit-clause-parsers/regular-limit-clause-parser.hpp"

using namespace std;

std::pair<pqxx::result, std::string> QueryExecutor::GetTransformationContext(const std::string &query, int datasetId)
{
    NonSelectiveMetricsParser metricsParser;
    WrapperWhereClauseParser wrapperWhereClauseParser(0, 1);
    EmptyLimitClauseParser limitClauseParser;

    parser.SetWhereClauseParser(&wrapperWhereClauseParser);
    parser.SetMetricsParser(&metricsParser);
    parser.SetLimitClauseParser(&limitClauseParser);

    parser.Clear();

    bool isValid = parser.Parse(query, datasetId);

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
    LimitClauseParser *limitClauseParser;

    if (page == 0 && pageSize == 0)
        limitClauseParser = new EmptyLimitClauseParser();
    else
        limitClauseParser = new RegularLimitClauseParser(page, pageSize);

    if (includeAllMetrics)
        metricsParser = new NonSelectiveMetricsParser();
    else
        metricsParser = new SelectiveMetricsParser();

    parser.SetWhereClauseParser(&regularWhereClauseParser);
    parser.SetLimitClauseParser(limitClauseParser);
    parser.SetMetricsParser(metricsParser);

    parser.Clear();

    bool isValid = parser.Parse(query, datasetId);

    delete limitClauseParser;
    delete metricsParser;

    if (!isValid)
    {
        return {pqxx::result(), parser.errorMessage};
    }

    return dbClient.ExecuteQuery(parser.GetConvertedQuery());
}

std::pair<pqxx::result, std::string> QueryExecutor::GetNumberOfResults(const std::string &query, int datasetId)
{
    CountMetricsParser metricsParser;
    RegularWhereClauseParser regularWhereClauseParser(false);
    RegularLimitClauseParser limitClauseParser(0, 100);

    parser.SetMetricsParser(&metricsParser);
    parser.SetWhereClauseParser(&regularWhereClauseParser);
    parser.SetLimitClauseParser(&limitClauseParser);

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
