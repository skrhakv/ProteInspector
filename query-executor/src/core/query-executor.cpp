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

std::pair<pqxx::result, std::string> QueryExecutor::GetTransformationContext(const std::string &query)
{
    NonSelectiveMetricsParser metricsParser;
    WrapperWhereClauseParser wrapperWhereClauseParser(0, 1);
    EmptyLimitClauseParser limitClauseParser;

    parser.SetWhereClauseParser(&wrapperWhereClauseParser);
    parser.SetMetricsParser(&metricsParser);
    parser.SetLimitClauseParser(&limitClauseParser);

    return ParseAndExecuteImpl(query);
}

std::pair<pqxx::result, std::string> QueryExecutor::ParseAndExecute(const std::string &query)
{
    EmptyLimitClauseParser limitClauseParser;
    SelectiveMetricsParser metricsParser;
    RegularWhereClauseParser regularWhereClauseParser(true);

    parser.SetWhereClauseParser(&regularWhereClauseParser);
    parser.SetLimitClauseParser(&limitClauseParser);
    parser.SetMetricsParser(&metricsParser);

    return ParseAndExecuteImpl(query);
}

std::pair<pqxx::result, std::string> QueryExecutor::ParseAndExecute(const std::string &query, int datasetId)
{
    EmptyLimitClauseParser limitClauseParser;
    SelectiveMetricsParser metricsParser;
    RegularWhereClauseParser regularWhereClauseParser(true, datasetId);

    parser.SetWhereClauseParser(&regularWhereClauseParser);
    parser.SetLimitClauseParser(&limitClauseParser);
    parser.SetMetricsParser(&metricsParser);

    return ParseAndExecuteImpl(query);
}

std::pair<pqxx::result, std::string> QueryExecutor::ParseAndExecute(const std::string &query, int page, int pageSize)
{
    RegularLimitClauseParser limitClauseParser(page, pageSize);
    SelectiveMetricsParser metricsParser;
    RegularWhereClauseParser regularWhereClauseParser(true);

    parser.SetWhereClauseParser(&regularWhereClauseParser);
    parser.SetLimitClauseParser(&limitClauseParser);
    parser.SetMetricsParser(&metricsParser);

    return ParseAndExecuteImpl(query);
}

std::pair<pqxx::result, std::string> QueryExecutor::ParseAndExecute(const std::string &query, int datasetId, int page, int pageSize, bool includeAllMetrics)
{
    RegularLimitClauseParser limitClauseParser(page, pageSize);
    MetricsParser *metricsParser;
    RegularWhereClauseParser regularWhereClauseParser(true, datasetId);

    if (includeAllMetrics)
        metricsParser = new NonSelectiveMetricsParser();
    else
        metricsParser = new SelectiveMetricsParser();

    parser.SetWhereClauseParser(&regularWhereClauseParser);
    parser.SetLimitClauseParser(&limitClauseParser);
    parser.SetMetricsParser(metricsParser);

    auto result = ParseAndExecuteImpl(query);

    delete metricsParser;

    return result;
}

std::pair<pqxx::result, std::string> QueryExecutor::ParseAndExecuteImpl(const std::string &query)
{
    parser.Clear();

    bool isValid = parser.Parse(query);

    if (!isValid)
    {
        return {pqxx::result(), parser.errorMessage};
    }

    return dbClient.ExecuteQuery(parser.GetConvertedQuery());
}

std::pair<pqxx::result, std::string> QueryExecutor::GetNumberOfResults(const std::string &query, int datasetId)
{
    CountMetricsParser metricsParser;
    RegularWhereClauseParser regularWhereClauseParser(false, datasetId);
    RegularLimitClauseParser limitClauseParser(0, 100);

    parser.SetMetricsParser(&metricsParser);
    parser.SetWhereClauseParser(&regularWhereClauseParser);
    parser.SetLimitClauseParser(&limitClauseParser);

    return ParseAndExecuteImpl(query);
}

std::pair<pqxx::result, std::string> QueryExecutor::GetDatasetsInfo()
{
    return dbClient.GetDatasetsInfo();
}
