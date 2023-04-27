#ifndef OuterQueryGenerator_H
#define OuterQueryGenerator_H

#include "end-query-generator.hpp"
#include "inner-query-generator.hpp"
#include "regular-query-generator.hpp"
#include "../utils.hpp"
#include "../query-parser.hpp"
#include "../metric-generators/transformation-metric-generator.hpp"

class OuterQueryGenerator : public EndQueryGenerator
{
private:
    QueryParser parser;
    int page = 0;
    int pageSize = 0;

public:
    OuterQueryGenerator(int _page, int _pageSize) : page(_page), pageSize(_pageSize) {}

    bool Generate(const hsql::SelectStatement *selectStatement, const string &biologicalStructure, int datasetId, string &result) override
    {
        TransformationMetricGenerator transformationMetricGenerator;
        RegularQueryGenerator regularQueryGenerator;
        parser.SetMetricGenerator(&transformationMetricGenerator);
        parser.SetEndQueryGenerator(&regularQueryGenerator);

        parser.Clear();

        result += " WHERE ";
        converter.GetDatasetIdMetric(biologicalStructure, datasetId, result);
        result += " AND ";
        converter.GetDefaultGroupBy(biologicalStructure, result);
        result += " IN (";

        bool isValid = parser.parseQuery(selectStatement, datasetId, page, pageSize);
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
