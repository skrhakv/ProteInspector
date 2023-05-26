#ifndef TransformationMetricGenerator_H
#define TransformationMetricGenerator_H

#include "metrics-parser.hpp"

class TransformationMetricsParser : public MetricsParser
{
    bool Parse(const hsql::SelectStatement *selectStatement, const string &biologicalStructure, string &result) override;
};

#endif
