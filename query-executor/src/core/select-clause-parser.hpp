#ifndef QUERYPARSER_H
#define QUERYPARSER_H

#include <string>
#include "hsql/SQLParser.h"
#include "json-data-extractor.hpp"
#include "operator-validator.hpp"
#include "metrics-parsers/metrics-parser.hpp"
#include "where-clause-parsers/where-clause-parser.hpp"
#include "limit-clause-parsers/limit-clause-parser.hpp"
using namespace std;

class SelectClauseParser
{
private:
    string biologicalStructure;
    JsonDataExtractor jsonDataExtractor;
    OperatorValidator operatorValidator;
    MetricsParser *metricsParser;
    WhereClauseParser *whereClauseParser;
    LimitClauseParser *limitClauseParser;
    string convertedQuery;

    bool checkForAllowedGrammar(const hsql::SelectStatement *selectStatement);
    bool checkFromKeyword(const string query);

public:
    string errorMessage;
    void SetMetricsParser(MetricsParser *_metricsParser);
    void SetWhereClauseParser(WhereClauseParser *_whereClauseParser);
    void SetLimitClauseParser(LimitClauseParser *_limitClauseParser);

    bool Parse(const string query, int datasetId);
    bool Parse(const hsql::SelectStatement *selectStatement, int datasetId);

    string GetConvertedQuery();
    void Clear();
};

#endif