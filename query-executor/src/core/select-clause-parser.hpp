#ifndef QUERYPARSER_H
#define QUERYPARSER_H

#include <string>
#include "hsql/SQLParser.h"
#include "json-data-extractor.hpp"
#include "operator-validator.hpp"
#include "metrics-parsers/metrics-parser.hpp"
#include "where-clause-parsers/where-clause-parser.hpp"

using namespace std;

class SelectClauseParser
{
private:
    string biologicalStructure;
    JsonDataExtractor jsonDataExtractor;
    OperatorValidator operatorValidator;
    MetricsParser *metricsParser;
    WhereClauseParser *whereClauseParser;
    string convertedQuery;

    bool checkForAllowedGrammar(const hsql::SelectStatement *selectStatement);
    bool checkFromKeyword(const string query);

public:
    string errorMessage;
    void SetMetricsParser(MetricsParser *_metricsParser);
    void SetWhereClauseParser(WhereClauseParser *_whereClauseParser);

    bool Parse(const string query, int datasetId, int page = 0, int pageSize = 100);
    bool Parse(const hsql::SelectStatement *selectStatement, int datasetId, int page = 0, int pageSize = 100);

    string GetConvertedQuery();
    void Clear();
};

#endif