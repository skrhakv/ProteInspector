#ifndef OuterQueryGenerator_H
#define OuterQueryGenerator_H

#include "end-query-generator.hpp"
#include "inner-query-generator.hpp"
#include "../utils.hpp"
#include "../query-parser.hpp"
#include "../metric-generators/transformation-metric-generator.hpp"

class OuterQueryGenerator : public EndQueryGenerator
{
private:
    QueryParser parser;

    bool parseOrderBy(const vector<hsql::OrderDescription *> *orderByClause, const string &biologicalStructure, string &result)
    {
        bool first = true;
        for (const auto &element : *orderByClause)
        {
            string metric;
            bool isValid = converter.ValidateQueryMetric(element->expr, biologicalStructure, metric);
            if (!isValid)
                RETURN_PARSE_ERROR(converter.errorMessage)

            if (first)
            {
                result += "min(";
                result += metric;
                result += ")";
                first = false;
            }
            else
            {
                result += ", ";
                result += "min(";
                result += metric;
                result += ")";
            }

            if (element->type)
                result += (element->type == hsql::OrderType::kOrderAsc) ? " ASC" : " DESC";
        }

        return true;
    }

public:
    bool Generate(const hsql::SelectStatement *selectStatement, const string &biologicalStructure, int datasetId, string &result) override
    {
        TransformationMetricGenerator transformationMetricGenerator;
        InnerQueryGenerator innerQueryGenerator;
        parser.SetMetricGenerator(&transformationMetricGenerator);
        parser.SetEndQueryGenerator(&innerQueryGenerator);

        parser.Clear();

        result += " WHERE ";
        converter.GetDatasetIdMetric(biologicalStructure, datasetId, result);
        result += " AND ";
        converter.GetDefaultGroupBy(biologicalStructure, result);
        result += " IN (";

        bool isValid = parser.parseQuery(selectStatement, datasetId);
        if (!isValid)
            RETURN_PARSE_ERROR(parser.errorMessage);

        result += parser.GetConvertedQuery();
        result += ")";

        result += " GROUP BY ";
        converter.GetDefaultGroupBy(biologicalStructure, result);

        if (selectStatement->order)
        {
            string orderByClause, defaultOrder;
            bool isValid = parseOrderBy(selectStatement->order, biologicalStructure, orderByClause) && converter.GetDefaultOrder(biologicalStructure, defaultOrder);
            if (!isValid)
                RETURN_PARSE_ERROR(errorMessage)

            result += " ORDER BY " + orderByClause;
            result += ", min(";
            result += defaultOrder;
            result += ")";
        }
        else
        {
            string defaultOrder;
            converter.GetDefaultOrder(biologicalStructure, defaultOrder);
            result += " ORDER BY min(" + defaultOrder + ")";
        }
        return true;
    }

    void addPageLimitWithOffset(int page, int pageSize, string &result)
    {
        int offset = page * pageSize;
        result += " LIMIT " + to_string(pageSize) + " OFFSET " + to_string(offset);
        result += ";";
    }
};

#endif
