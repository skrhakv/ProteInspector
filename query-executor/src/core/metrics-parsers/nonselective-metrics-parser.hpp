#ifndef NonSelectiveMetricGenerator_H
#define NonSelectiveMetricGenerator_H

#include "metrics-parser.hpp"

class NonSelectiveMetricsParser : public MetricsParser
{
public:
    bool Parse(const hsql::SelectStatement *selectStatement, const string &biologicalStructure, string &result) override;
};

#endif
