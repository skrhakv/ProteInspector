#ifndef QUERYPARSER_H
#define QUERYPARSER_H

#include <string>
#include "hsql/SQLParser.h"
#include "converter.hpp"
#include "operator-validator.hpp"

#define PAGE_SIZE 100

using namespace std;

class QueryParser
{
private:
    string biologicalStructure;
    Converter converter;
    OperatorValidator operatorValidator;
    string convertedQuery;

    bool parseWhere(const hsql::Expr *expression, string &result);
    bool parseOrderBy(const vector<hsql::OrderDescription *> *orderByClause, string &result);
    bool parseQuery(const hsql::SelectStatement *selectStatement, bool countOnly, int page, int pageSize, bool includeAllMetrics);
    bool checkForAllowedGrammar(const hsql::SelectStatement *selectStatement);
    void addPageLimitWithOffset(int page, int pageSize);

public:
    string errorMessage;

    bool ConvertQuery(const string &query, bool countOnly, int page = 0, int pageSize = 100, bool includeAllMetrics = false);
    string GetConvertedQuery();
    void Clear();
};

#endif