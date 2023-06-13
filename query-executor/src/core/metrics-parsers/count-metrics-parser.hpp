#ifndef CountMetricGenerator_H
#define CountMetricGenerator_H

#include "metrics-parser.hpp"

/// @brief Class generates COUNT(*) instead of metrics
class CountMetricsParser : public MetricsParser
{
    /// @brief parses tokens and generates the METRICS clause
    /// @param selectStatement tokens
    /// @param biologicalStructure proteins, domains, domainpairs, residues
    /// @param result container for converted part of the query
    /// @return true if conversion successful
    bool Parse(const hsql::SelectStatement *selectStatement, const string &biologicalStructure, string &result) override;
};

#endif
