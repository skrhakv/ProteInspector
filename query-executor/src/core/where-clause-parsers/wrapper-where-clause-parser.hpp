#ifndef OuterQueryGenerator_H
#define OuterQueryGenerator_H

#include "where-clause-parser.hpp"
#include "regular-where-clause-parser.hpp"
#include "../utils.hpp"
#include "../select-clause-parser.hpp"
#include "../metrics-parsers/transformation-metrics-parser.hpp"

class WrapperWhereClauseParser : public WhereClauseParser
{
private:
    SelectClauseParser parser;
    int page = 0;
    int pageSize = 0;

public:
    WrapperWhereClauseParser(int _page, int _pageSize) : page(_page), pageSize(_pageSize) {}

    bool Parse(const hsql::SelectStatement *selectStatement, const string &biologicalStructure, int datasetId, string &result) override
    {
        TransformationMetricsParser transformationMetricsParser;
        RegularWhereClauseParser regularWhereClauseParser(true);
        parser.SetMetricsParser(&transformationMetricsParser);
        parser.SetWhereClauseParser(&regularWhereClauseParser);

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

    void addPageLimitWithOffset(int page, int pageSize, string &result) override
    {
        return;
    }
};

#endif
