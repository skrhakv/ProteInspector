#ifndef SelectiveMetricGenerator_H
#define SelectiveMetricGenerator_H

#include "metrics-parser.hpp"
#include "hsql/SQLParser.h"
/// @brief Class generates METRICS clause only with the specified metrics
class SelectiveMetricsParser : public MetricsParser
{
public:
    /// @brief parses tokens and generates the METRICS clause
    /// @param selectStatement tokens
    /// @param biologicalStructure proteins, domains, domainpairs, residues
    /// @param result container for converted part of the query
    /// @return true if conversion successful
    bool Parse(const hsql::SelectStatement *selectStatement, const string &biologicalStructure, string &result) override;
};

#endif
