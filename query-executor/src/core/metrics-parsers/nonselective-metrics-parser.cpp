#include "nonselective-metrics-parser.hpp"

bool NonSelectiveMetricsParser::Parse(const hsql::SelectStatement *selectStatement, const string &biologicalStructure, string &result)
    {
        jsonDataExtractor.GetAllMetrics(biologicalStructure, result);
        return true;
    }