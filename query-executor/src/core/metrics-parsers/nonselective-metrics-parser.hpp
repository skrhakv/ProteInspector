#ifndef NonSelectiveMetricGenerator_H
#define NonSelectiveMetricGenerator_H

#include "metrics-parser.hpp"
/// @brief Class generates METRICS clause with ALL the available metrics, regardless the specified metrics
class NonSelectiveMetricsParser : public MetricsParser
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
