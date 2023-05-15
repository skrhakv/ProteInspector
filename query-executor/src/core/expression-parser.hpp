#include <string>
#include "hsql/SQLParser.h"
#include <nlohmann/json.hpp>
#include "utils.hpp"
#include "operator-validator.hpp"
#include "json-reader.hpp"

using namespace std;
class ExpressionParser
{
    nlohmann::json metricsData;
    OperatorValidator operatorValidator;

public:
    ExpressionParser()
    {
        metricsData = JsonReader::GetJsonData("metrics.json");
    }

    string errorMessage;

    bool Parse(const hsql::Expr *expression, const string biologicalStructure, string &result)
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

        if (expression->expr2->isType(hsql::kExprColumnRef))
        {
            string metricName2 = expression->expr2->name;
            toLower(metricName2);
            if (metricsData["forward-metrics-mapping"][biologicalStructure]["data"].contains(metricName2))
            {
                auto metric2 = metricsData["forward-metrics-mapping"][biologicalStructure]["data"][metricName2];
                if (metric["type"] == "string")
                {
                    if (metric2["type"] != "string")
                        RETURN_PARSE_ERROR("Return types don't match: " + metricName + ", " + metricName2)
                }
                else if (metric["type"] == "integer" || metric["type"] == "float")
                {
                    if (metric2["type"] != "integer" && metric2["type"] != "float")
                        RETURN_PARSE_ERROR("Return types don't match: " + metricName + ", " + metricName2)
                }

                result += metric["database-destination"];
                result += ' ' + operatorValue + ' ';
                result += metric2["database-destination"];
                return true;
            }
        }

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
};
