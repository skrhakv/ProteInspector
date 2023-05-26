#ifndef SelectiveMetricGenerator_H
#define SelectiveMetricGenerator_H

#include "metrics-parser.hpp"
#include "hsql/SQLParser.h"

class SelectiveMetricsParser : public MetricsParser
{
public:
    bool Parse(const hsql::SelectStatement *selectStatement, const string &biologicalStructure, string &result) override;
};

#endif
