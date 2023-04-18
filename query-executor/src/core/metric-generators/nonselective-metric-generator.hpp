#ifndef NonSelectiveMetricGenerator_H
#define NonSelectiveMetricGenerator_H

#include "metric-generator.hpp"

class NonSelectiveMetricGenerator : public MetricGenerator
{
    bool groupBy;

public:
    NonSelectiveMetricGenerator(bool _groupBy) : groupBy(_groupBy) {}
    bool Generate(const hsql::SelectStatement *selectStatement, const string &biologicalStructure, string &result) override
    {
        converter.GetAllMetrics(biologicalStructure, groupBy, result);
        return true;
    }
};

#endif
