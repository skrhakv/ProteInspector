#ifndef SelectiveMetricGenerator_H
#define SelectiveMetricGenerator_H

#include "metrics-parser.hpp"
#include "hsql/SQLParser.h"
#include "../utils.hpp"

class SelectiveMetricsParser : public MetricsParser
{
public:
    bool Parse(const hsql::SelectStatement *selectStatement, const string &biologicalStructure, string &result) override
    {
        bool first = true;
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
        return true;
    }
};

#endif
