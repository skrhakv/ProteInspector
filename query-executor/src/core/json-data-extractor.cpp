#include "json-data-extractor.hpp"
#include "utils.hpp"
#include "json-reader.hpp"

using namespace std;

JsonDataExtractor::JsonDataExtractor()
{
    metricsData = JsonReader::GetJsonData("metrics.json");
}

bool JsonDataExtractor::ValidBiologicalStructure(string biologicalStructure)
{
    if (metricsData["forward-metrics-mapping"][biologicalStructure]["data"].is_null())
        return false;
    return true;
}

bool JsonDataExtractor::ParseValue(const hsql::Expr *expression, const string biologicalStructure, string &result)
{
    if (expression->isType(hsql::kExprLiteralInt))
        result += to_string(expression->ival);
    else if (expression->isType(hsql::kExprColumnRef))
    {
        string expressionValue = expression->name;
        toLower(expressionValue);
        if (metricsData["forward-metrics-mapping"][biologicalStructure]["data"].contains(expressionValue))
        {
            auto metric = metricsData["forward-metrics-mapping"][biologicalStructure]["data"][expressionValue];
            result += metric["database-destination"];
        }
        else
            result += expression->name;
    }
    else if (expression->isType(hsql::kExprLiteralFloat))
        result += to_string(expression->expr2->fval);
    else
        RETURN_PARSE_ERROR("Unknown type: " + expression->type)
    return true;
}
bool JsonDataExtractor::ValidateQueryMetric(hsql::Expr *expression, const string biologicalStructure, bool addAlias, string &result)
{
    assert(expression->type == hsql::kExprColumnRef);

    string metricName = expression->name;
    toLower(metricName);
    auto forwardMetric = metricsData["forward-metrics-mapping"][biologicalStructure]["data"][metricName];
    auto backwardMetric = metricsData["backward-metrics-mapping"];
    if (forwardMetric == nullptr)
        RETURN_PARSE_ERROR("Unrecognized Metrics in the SELECT Clause: " + metricName)

    string resultMetric = forwardMetric["database-destination"];

    result += resultMetric;
    if (addAlias)
    {
        result += " AS \"";
        result += backwardMetric[resultMetric];
        result += "\"";
    }
    return true;
}

bool JsonDataExtractor::GetDefaultIdMetric(const string biologicalStructure, string &result)
{
    string resultMetric = metricsData["forward-metrics-mapping"][biologicalStructure]["data"]["id"]["database-destination"];

    result += ", ";
    result += resultMetric;
    result += "AS \"id\"";
    return true;
}

bool JsonDataExtractor::GetAllMetrics(const string biologicalStructure, string &result)
{
    auto forwardMetrics = metricsData["forward-metrics-mapping"][biologicalStructure]["data"];
    auto backwardMetric = metricsData["backward-metrics-mapping"];

    bool first = true;
    for (const auto &forwardMetric : forwardMetrics.items())
    {
        if (forwardMetric.value()["database-destination"].is_array())
        {
            for (auto item : forwardMetric.value()["database-destination"])
            {
                string resultMetric = item.get<std::string>();

                if (!addedMetrics.contains(resultMetric))
                {
                    if (!first)
                        result += ",";

                    result += resultMetric;
                    result += " AS \"";
                    result += backwardMetric[resultMetric];
                    result += "\"";

                    addedMetrics.insert(resultMetric);
                }
                first = false;
            }
        }
        else
        {
            string resultMetric = forwardMetric.value()["database-destination"];
            if (!addedMetrics.contains(resultMetric))
            {
                if (!first)
                    result += ",";

                result += resultMetric;
                result += " AS \"";
                result += backwardMetric[resultMetric];
                result += "\"";
            }
        }
        first = false;
    }
    return true;
}
bool JsonDataExtractor::GetTableAndLeftJoins(const string biologicalStructure, string &result)
{
    auto metrics = metricsData["tables"][biologicalStructure];

    result += metrics["table"];
    result += " ";
    result += metrics["joins"];
    result += " ";

    return true;
}

bool JsonDataExtractor::GetDatasetIdMetric(const string biologicalStructure, int datasetId, string &result)
{
    auto datasetMetric = metricsData["forward-metrics-mapping"][biologicalStructure]["data"]["datasetid"];

    result += datasetMetric["database-destination"];
    result += "=";
    result += to_string(datasetId);

    return true;
}

bool JsonDataExtractor::GetDefaultOrder(const string biologicalStructure, string &result)
{
    auto defaultOrder = metricsData["tables"][biologicalStructure]["order"];
    result += defaultOrder;
    return true;
}

bool JsonDataExtractor::GetDefaultGroupBy(const string biologicalStructure, string &result)
{
    auto defaultOrder = metricsData["tables"][biologicalStructure]["group-by"];
    result += defaultOrder;
    return true;
}

void JsonDataExtractor::Clear()
{
    errorMessage = "";
    addedMetrics.clear();
    operatorValidator.Clear();
}