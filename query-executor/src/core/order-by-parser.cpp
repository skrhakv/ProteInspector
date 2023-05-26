#include "order-by-parser.hpp"

bool OrderByParser::Parse(const vector<hsql::OrderDescription *> *orderByClause, const string &biologicalStructure, string &result)
    {
        bool first = true;
        for (const auto &element : *orderByClause)
        {
            string metric;
            bool isValid = extractor.ValidateQueryMetric(element->expr, biologicalStructure, false, metric);
            if (!isValid)
                RETURN_PARSE_ERROR(extractor.errorMessage)

            if (first)
            {
                result += metric;
                first = false;
            }
            else
            {
                result += ", ";
                result += metric;
            }

            if (element->type)
                result += (element->type == hsql::OrderType::kOrderAsc) ? " ASC" : " DESC";
        }

        return true;
    }