#ifndef RegularQueryGenerator_H
#define RegularQueryGenerator_H

#include "where-clause-parser.hpp"
#include "../order-by-parser.hpp"

class RegularWhereClauseParser : public WhereClauseParser
{
    bool orderBy;
    OrderByParser orderByParser;

    bool Generate(const hsql::Expr *expression, const string &biologicalStructure, string &result);
public:

    RegularWhereClauseParser(bool _orderBy) : orderBy(_orderBy), orderByParser(jsonDataExtractor) {}
    RegularWhereClauseParser(bool _orderBy, int _datasetId) : orderBy(_orderBy), orderByParser(jsonDataExtractor) {
        includeDatasetId = true;
        datasetId = _datasetId;
    }
    bool Parse(const hsql::SelectStatement *selectStatement, const string &biologicalStructure, string &result) override;
};

#endif
