#include "wrapper-where-clause-parser.hpp"
#include "../utils.hpp"

bool WrapperWhereClauseParser::Parse(const hsql::SelectStatement *selectStatement, const string &biologicalStructure, string &result)
{
    TransformationMetricsParser transformationMetricsParser;
    RegularWhereClauseParser regularWhereClauseParser(true);
    RegularLimitClauseParser limitClauseParser(page, pageSize);

    parser.SetMetricsParser(&transformationMetricsParser);
    parser.SetWhereClauseParser(&regularWhereClauseParser);
    parser.SetLimitClauseParser(&limitClauseParser);

    parser.Clear();

    result += " WHERE ";
    if (includeDatasetId)
    {
        jsonDataExtractor.GetDatasetIdMetric(biologicalStructure, datasetId, result);
        result += " AND ";
    }
    jsonDataExtractor.GetDefaultGroupBy(biologicalStructure, result);
    result += " IN (";

    bool isValid = parser.Parse(selectStatement);
    if (!isValid)
        RETURN_PARSE_ERROR(parser.errorMessage);

    result += parser.GetConvertedQuery();

    result += ")";
    return true;
}