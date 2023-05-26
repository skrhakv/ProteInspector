#ifndef CountMetricGenerator_H
#define CountMetricGenerator_H

#include "metrics-parser.hpp"

class CountMetricsParser : public MetricsParser
{
    bool Parse(const hsql::SelectStatement *selectStatement, const string &biologicalStructure, string &result) override;
};

#endif
