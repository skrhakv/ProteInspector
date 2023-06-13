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
/// @brief Coverts the custom query language into executable database queries 
class SelectClauseParser
{
private:
    /// @brief proteins, domains, domainpairs, or residues
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
    /// @brief Coverts the custom query language into executable database queries
    /// @param query custom query language  
    /// @return true if conversion successful
    bool Parse(const string query);
    /// @brief Parses tokens and generates executable database query
    /// @param selectStatement tokens
    /// @return true if conversion successful
    bool Parse(const hsql::SelectStatement *selectStatement);

    /// @brief Gets converted query
    /// @return Converted query
    string GetConvertedQuery();
    /// @brief Clear state
    void Clear();
};

#endif