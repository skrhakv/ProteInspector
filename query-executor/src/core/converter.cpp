#include "converter.hpp"
#include "utils.hpp"
#include "json-reader.hpp"

using namespace std;

Converter::Converter()
{
    metricsData = JsonReader::GetJsonData("metrics.json");
}

bool Converter::ValidBiologicalStructure(string biologicalStructure)
{
    if (metricsData["forward-metrics-mapping"][biologicalStructure]["data"].is_null())
        return false;
    return true;
}

bool Converter::ValidateWhereClause(const hsql::Expr *expression, const string biologicalStructure, string &result)
{
    assert(expression->expr->type == hsql::kExprColumnRef && "kExprColumnRef is expected as a type of the first expression");

    string metricValue, operatorValue, metricName = expression->expr->name;
    toLower(metricName);
    auto metric = metricsData["forward-metrics-mapping"][biologicalStructure]["data"][metricName];

    bool isValid = operatorValidator.parseMathOperator(expression, operatorValue);
    if (!isValid)
    {
        errorMessage = operatorValidator.errorMessage;
        return isValid;
    }

    if (metric == nullptr)
        RETURN_PARSE_ERROR("Unrecognized Metrics in the WHERE clause: " + metricName)

    if (metric["type"] == "string")
    {
        if (!expression->expr2->isType(hsql::kExprColumnRef))
            RETURN_PARSE_ERROR("Metric " + metricName + " expects a string as a value.")

        if (expression->opType != hsql::OperatorType::kOpEquals && expression->opType != hsql::OperatorType::kOpNotEquals)
            RETURN_PARSE_ERROR("Metric " + metricName + " expects a string and supports only '=' and '!=' operators.")
        metricValue += "'";
        metricValue += expression->expr2->name;
        metricValue += "'";
    }
    else if (metric["type"] == "integer")
    {
        if (!expression->expr2->isType(hsql::kExprLiteralInt))
            RETURN_PARSE_ERROR("Metric " + metricName + " expects an integer as a value.")

        metricValue = to_string(expression->expr2->ival);
    }

    else if (metric["type"] == "integer-between")
    {
        if (expression->opType != hsql::OperatorType::kOpEquals && expression->opType != hsql::OperatorType::kOpBetween)
            RETURN_PARSE_ERROR("Metric " + metricName + " expects an integer and supports only '=', 'BETWEEN' operators.")

        string startMetric = metric["database-destination"][0].get<string>();
        string endMetric = metric["database-destination"][1].get<string>();

        if (expression->opType == hsql::OperatorType::kOpEquals)
        {
            if (!expression->expr2->isType(hsql::kExprLiteralInt))
                RETURN_PARSE_ERROR("Metric " + metricName + " expects a integer as a value.")

            metricValue = to_string(expression->expr2->ival);
            result += metricValue + " BETWEEN " + startMetric + " AND " + endMetric;
        }
        else if (expression->opType == hsql::OperatorType::kOpBetween)
        {
            assert(expression->exprList->size() == 2 && "BETWEEN has to have two literals.");

            hsql::Expr e1 = (*(*expression->exprList)[0]);
            hsql::Expr e2 = (*(*expression->exprList)[1]);

            if (e1.type != hsql::kExprLiteralInt || e2.type != hsql::kExprLiteralInt)
                RETURN_PARSE_ERROR("Metric " + metricName + " expects a integer as a value.")

            string startInterval = to_string(e1.ival);
            string endInterval = to_string(e2.ival);

            result += "(" + startMetric + " BETWEEN " + startInterval + " AND " + endInterval + ") OR (" + endMetric + " BETWEEN " + startInterval + " AND " + endInterval + ")";
        }
        return true;
    }

    else if (metric["type"] == "float")
    {
        // float can be also defined as integer
        if (expression->expr2->isType(hsql::kExprLiteralFloat))
            metricValue = to_string(expression->expr2->fval);
        else if (expression->expr2->isType(hsql::kExprLiteralInt))
            metricValue = to_string(expression->expr2->ival);
        else
            RETURN_PARSE_ERROR("Metric " + metricName + " expects float as a value.")
    }
    else if (metric["type"] == "bool")
    {
        if (!expression->expr2->isType(hsql::kExprLiteralInt) || !expression->expr2->isBoolLiteral)
            RETURN_PARSE_ERROR("Metric " + metricName + " expects boolean as a value.")

        if (expression->opType != hsql::OperatorType::kOpEquals && expression->opType != hsql::OperatorType::kOpNotEquals)
            RETURN_PARSE_ERROR("Metric " + metricName + " expects a bool and supports only '=' and '!=' operators.")
        metricValue = BOOL_STR(expression->expr2->ival);
    }
    else
        assert(false && "Suported types are bool, integer, float and string only!");

    if (metric["database-destination"].is_array())
    {
        result += '(';
        bool first = true;
        for (auto item : metric["database-destination"])
        {
            if (!first)
                result += " OR ";
            result += item.get<std::string>();
            result += ' ' + operatorValue + ' ' + metricValue;
            first = false;
        }
        result += ')';
    }
    else
    {
        result += metric["database-destination"];
        result += ' ' + operatorValue + ' ' + metricValue;
    }
    return true;
}
bool Converter::ValidateQueryMetric(hsql::Expr *expression, const string biologicalStructure, bool arrayAgg, bool addAlias, string &result)
{
    assert(expression->type == hsql::kExprColumnRef);

    string metricName = expression->name;
    toLower(metricName);
    auto forwardMetric = metricsData["forward-metrics-mapping"][biologicalStructure]["data"][metricName];
    auto backwardMetric = metricsData["backward-metrics-mapping"];
    if (forwardMetric == nullptr)
        RETURN_PARSE_ERROR("Unrecognized Metrics in the SELECT Clause: " + metricName)

    string resultMetric = forwardMetric["database-destination"];

    if (arrayAgg)
    {
        result += "array_agg(";
        result += resultMetric;
        result += " order by ";
        GetDefaultOrder(biologicalStructure, result);
        result += ")";
        if (addAlias)
        {
            result += " AS \"";
            result += backwardMetric[resultMetric];
            result += "\"";
        }
        return true;
    }
    else
    {
        result += resultMetric;
        if (addAlias)
        {
            result += " AS \"";
            result += backwardMetric[resultMetric];
            result += "\"";
        }
        return true;
    }
}

bool Converter::GetAllMetrics(const string biologicalStructure, bool arrayAgg, string &result)
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
                    if (arrayAgg)
                    {
                        result += "array_agg(";
                        result += resultMetric;
                        result += " order by ";
                        GetDefaultOrder(biologicalStructure, result);
                        result += ") AS \"";
                        result += backwardMetric[resultMetric];
                        result += "\"";
                    }
                    else
                    {
                        result += resultMetric;
                        result += " AS \"";
                        result += backwardMetric[resultMetric];
                        result += "\"";
                    }
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

                if (arrayAgg)
                {
                    result += "array_agg(";
                    result += resultMetric;
                    result += " order by ";
                    GetDefaultOrder(biologicalStructure, result);
                    result += ") AS \"";
                    result += backwardMetric[resultMetric];
                    result += "\"";
                }
                else
                {
                    result += resultMetric;
                    result += " AS \"";
                    result += backwardMetric[resultMetric];
                    result += "\"";
                }
            }
        }
        first = false;
    }
    return true;
}
bool Converter::GetTableAndLeftJoins(const string biologicalStructure, string &result)
{
    auto metrics = metricsData["tables"][biologicalStructure];

    result += metrics["table"];
    result += " ";
    result += metrics["joins"];
    result += " ";

    return true;
}

bool Converter::GetDatasetIdMetric(const string biologicalStructure, int datasetId, string &result)
{
    auto datasetMetric = metricsData["forward-metrics-mapping"][biologicalStructure]["data"]["datasetid"];

    result += datasetMetric["database-destination"];
    result += "=";
    result += to_string(datasetId);

    return true;
}

bool Converter::GetDefaultOrder(const string biologicalStructure, string &result)
{
    auto defaultOrder = metricsData["tables"][biologicalStructure]["order"];
    result += defaultOrder;
    return true;
}

bool Converter::GetDefaultGroupBy(const string biologicalStructure, string &result)
{
    auto defaultOrder = metricsData["tables"][biologicalStructure]["group-by"];
    result += defaultOrder;
    return true;
}

void Converter::Clear()
{
    errorMessage = "";
    addedMetrics.clear();
    operatorValidator.Clear();
}