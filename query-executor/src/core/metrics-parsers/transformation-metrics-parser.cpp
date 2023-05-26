#include "transformation-metrics-parser.hpp"

bool TransformationMetricsParser::Parse(const hsql::SelectStatement *selectStatement, const string &biologicalStructure, string &result)
{
    jsonDataExtractor.GetDefaultGroupBy(biologicalStructure, result);
    return true;
}