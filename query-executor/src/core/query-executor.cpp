#include <string>
#include "query-executor.hpp"
#include "metric-generators/count-metric-generator.hpp"
#include "metric-generators/nonselective-metric-generator.hpp"
#include "metric-generators/selective-metric-generator.hpp"
#include "end-query-generators/regular-query-generator.hpp"
#include "end-query-generators/inner-query-generator.hpp"

using namespace std;

#include <iostream>

std::pair<pqxx::result, std::string> QueryExecutor::ParseAndExecute(const std::string &query, int datasetId, int page, int pageSize, bool includeAllMetrics)
{
    MetricGenerator *metricGenerator;
    RegularQueryGenerator endQueryGenerator;

    parser.SetEndQueryGenerator(&endQueryGenerator);

    if (includeAllMetrics)
    {
        metricGenerator = new NonSelectiveMetricGenerator(false);
        parser.SetMetricGenerator(metricGenerator);
    }
    else
    {
        metricGenerator = new SelectiveMetricGenerator(false);
        parser.SetMetricGenerator(metricGenerator);
    }
    parser.Clear();

    bool isValid = parser.ConvertQuery(query, datasetId, page, pageSize);
    delete metricGenerator;
    if (!isValid)
    {
        return {pqxx::result(), parser.errorMessage};
    }
        cout << parser.GetConvertedQuery() << endl;

    return dbClient.ExecuteQuery(parser.GetConvertedQuery());
}

std::pair<pqxx::result, std::string> QueryExecutor::GetNumberOfPages(const std::string &query, int datasetId)
{
    CountMetricGenerator metricGenerator;
    parser.SetMetricGenerator(&metricGenerator);

    InnerQueryGenerator endQueryGenerator;
    parser.SetEndQueryGenerator(&endQueryGenerator);

    parser.Clear();

    bool isValid = parser.ConvertQuery(query, datasetId);

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
