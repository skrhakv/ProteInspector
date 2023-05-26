#include "wrapper-where-clause-parser.hpp"
#include "../utils.hpp"

bool WrapperWhereClauseParser::Parse(const hsql::SelectStatement *selectStatement, const string &biologicalStructure, int datasetId, string &result)
    {
        TransformationMetricsParser transformationMetricsParser;
        RegularWhereClauseParser regularWhereClauseParser(true);
        RegularLimitClauseParser limitClauseParser;

        parser.SetMetricsParser(&transformationMetricsParser);
        parser.SetWhereClauseParser(&regularWhereClauseParser);
        parser.SetLimitClauseParser(&limitClauseParser);

        parser.Clear();

        result += " WHERE ";
        jsonDataExtractor.GetDatasetIdMetric(biologicalStructure, datasetId, result);
        result += " AND ";
        jsonDataExtractor.GetDefaultGroupBy(biologicalStructure, result);
        result += " IN (";

        bool isValid = parser.Parse(selectStatement, datasetId, page, pageSize);
        if (!isValid)
            RETURN_PARSE_ERROR(parser.errorMessage);

        result += parser.GetConvertedQuery();

        result += ")";
        return true;
    }