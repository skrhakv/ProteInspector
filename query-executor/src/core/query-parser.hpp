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
    Converter jsonMetricReaderAndParser;
    OperatorValidator operatorValidator;
    string convertedQuery;

    bool parseWhere(const hsql::Expr *expression, string &result);
    bool parseOrderBy(const vector<hsql::OrderDescription *> *orderByClause, string &result);
    bool parseQuery(const hsql::SelectStatement *selectStatement, int page);
    bool checkForAllowedGrammar(const hsql::SelectStatement *selectStatement);
    void addPageLimitWithOffset(int page);

public:
    string errorMessage;

    bool ConvertQuery(const string& query, int page);
    string GetConvertedQuery();
};

#endif