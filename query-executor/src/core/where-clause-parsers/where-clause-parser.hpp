#ifndef EndQueryGenerator_H
#define EndQueryGenerator_H

#include "../json-data-extractor.hpp"
#include "../expression-parser.hpp"

/// @brief Parent class for generating the WHERE clause
class WhereClauseParser
{
protected:
    JsonDataExtractor jsonDataExtractor;
    OperatorValidator operatorValidator;
    ExpressionParser expressionParser;
    int datasetId = -1;
    bool includeDatasetId = false;

public:
    virtual ~WhereClauseParser() {}
    string errorMessage;
    /// @brief parses tokens and generates the WHERE clause
    /// @param selectStatement tokens
    /// @param biologicalStructure proteins, domains, domainpairs, residues
    /// @param result converted part of the query
    /// @return true if conversion successful
    virtual bool Parse(const hsql::SelectStatement *selectStatement, const string &biologicalStructure, string &result)
    {
        return false;
    }

    void SetJsonDataExtractor(const JsonDataExtractor &_jsonDataExtractor)
    {
        this->jsonDataExtractor = _jsonDataExtractor;
    }

    void Clear()
    {
        operatorValidator.Clear();
    }
};

#endif
