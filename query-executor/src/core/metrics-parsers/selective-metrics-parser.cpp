#include "selective-metrics-parser.hpp"
#include "../utils.hpp"

bool SelectiveMetricsParser::Parse(const hsql::SelectStatement *selectStatement, const string &biologicalStructure, string &result)
{
    bool first = true, addIdExplicitly = false;
    for (hsql::Expr *expr : *selectStatement->selectList)
    {
        if (expr->type == hsql::kExprStar && selectStatement->selectList->size() > 1)
            RETURN_PARSE_ERROR("Star together with other Metric Ids violates rules of this grammar.")
        else if (expr->type == hsql::kExprStar)
        {
            string metrics;
            jsonDataExtractor.GetAllMetrics(biologicalStructure, metrics);
            result += metrics;
        }
        else if (expr->type == hsql::kExprColumnRef)
        {
            addIdExplicitly = true;
            if (!first)
                result += ",";
            string metric;
            bool isValid = jsonDataExtractor.ValidateQueryMetric(expr, biologicalStructure, true, metric);
            if (!isValid)
                RETURN_PARSE_ERROR(jsonDataExtractor.errorMessage)
            result += metric;
            first = false;
        }
    }
    if (addIdExplicitly)
    {
        result += ", ";
        jsonDataExtractor.GetDefaultIdMetric(biologicalStructure, result);
    }

    return true;
}