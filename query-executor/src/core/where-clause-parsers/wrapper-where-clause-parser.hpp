#ifndef OuterQueryGenerator_H
#define OuterQueryGenerator_H

#include "where-clause-parser.hpp"
#include "regular-where-clause-parser.hpp"
#include "../select-clause-parser.hpp"
#include "../metrics-parsers/transformation-metrics-parser.hpp"
#include "../limit-clause-parsers/regular-limit-clause-parser.hpp"

class WrapperWhereClauseParser : public WhereClauseParser
{
private:
    SelectClauseParser parser;
    int page = 0;
    int pageSize = 0;

public:
    WrapperWhereClauseParser(int _page, int _pageSize) : page(_page), pageSize(_pageSize) {
        includeDatasetId = false;
    }

    bool Parse(const hsql::SelectStatement *selectStatement, const string &biologicalStructure, string &result) override;
};

#endif
