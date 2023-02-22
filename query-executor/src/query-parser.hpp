#ifndef QUERYPARSER_H
#define QUERYPARSER_H

#include <string>
#include "hsql/SQLParser.h"
#include "converter.hpp"
#include "operator-validator.hpp"

using namespace std;

class QueryParser
{
private:
    string biologicalStructure;
    Converter jsonMetricReaderAndParser;
    OperatorValidator operatorValidator;
    string queryResult = "";

    bool parseWhere(const hsql::Expr *expression, string &result);
    bool parseOrderBy(const vector<hsql::OrderDescription *> *orderByClause, string &result);
    bool parseQuery(const hsql::SelectStatement *selectStatement);
    bool checkForAllowedGrammar(const hsql::SelectStatement *selectStatement);

public:
    string errorMessage;

    bool ConvertAndExecuteQuery(string query);
};

#endif