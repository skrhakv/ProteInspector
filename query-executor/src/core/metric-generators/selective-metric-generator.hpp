#ifndef SelectiveMetricGenerator_H
#define SelectiveMetricGenerator_H

#include "metric-generator.hpp"
#include "hsql/SQLParser.h"
#include "../utils.hpp"
#include "../converter.hpp"

class SelectiveMetricGenerator : public MetricGenerator
{
    bool groupBy;

public:
    SelectiveMetricGenerator(bool _groupBy) : groupBy(_groupBy) {}

    bool Generate(const hsql::SelectStatement *selectStatement, const string &biologicalStructure, string &result) override
    {
        bool first = true;
        for (hsql::Expr *expr : *selectStatement->selectList)
        {
            if (expr->type == hsql::kExprStar && selectStatement->selectList->size() > 1)
                RETURN_PARSE_ERROR("Star together with other Metric Ids violates rules of this grammar.")
            else if (expr->type == hsql::kExprStar)
            {
                string metrics;
                converter.GetAllMetrics(biologicalStructure, groupBy, metrics);
                result += metrics;
            }
            else if (expr->type == hsql::kExprColumnRef)
            {
                if (!first)
                    result += ",";
                string metric;
                bool isValid = converter.ValidateQueryMetric(expr, biologicalStructure, groupBy, true, metric);
                if (!isValid)
                    RETURN_PARSE_ERROR(converter.errorMessage)
                result += metric;
                first = false;
            }
        }
        return true;
    }
};

#endif
