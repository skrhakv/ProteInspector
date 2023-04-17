#ifndef NonSelectiveMetricGenerator_H
#define NonSelectiveMetricGenerator_H

#include "metric-generator.hpp"

class NonSelectiveMetricGenerator : public MetricGenerator
{
    bool Generate(const hsql::SelectStatement *selectStatement, const string &biologicalStructure, string &result) override
    {
        converter.GetAllMetrics(biologicalStructure, result);
        return true;
    }
};

#endif
