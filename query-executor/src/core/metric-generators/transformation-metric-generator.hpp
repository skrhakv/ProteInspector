#ifndef TransformationMetricGenerator_H
#define TransformationMetricGenerator_H

#include "metric-generator.hpp"

class TransformationMetricGenerator : public MetricGenerator
{
    bool Generate(const hsql::SelectStatement *selectStatement, const string &biologicalStructure, string &result) override
    {
        converter.GetDefaultGroupBy(biologicalStructure, result);
        return true;
    }
};

#endif
