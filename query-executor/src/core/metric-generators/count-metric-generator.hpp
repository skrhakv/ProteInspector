#ifndef CountMetricGenerator_H
#define CountMetricGenerator_H

#include "metric-generator.hpp"

class CountMetricGenerator : public MetricGenerator
{
    bool Generate(const hsql::SelectStatement *selectStatement, const string &biologicalStructure, string &result) override
    {
        result += "COUNT(*) OVER()";
        return true;
    }
};

#endif
