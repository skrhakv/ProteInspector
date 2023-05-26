#include "count-metrics-parser.hpp"

bool CountMetricsParser::Parse(const hsql::SelectStatement *selectStatement, const string &biologicalStructure, string &result)
{
    result += "COUNT(*)";
    return true;
}