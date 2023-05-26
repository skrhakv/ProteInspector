#ifndef EndQueryGenerator_H
#define EndQueryGenerator_H

#include "../json-data-extractor.hpp"
#include "../expression-parser.hpp"
class WhereClauseParser
{
protected:
    JsonDataExtractor jsonDataExtractor;
    OperatorValidator operatorValidator;
    ExpressionParser expressionParser;

public:
    virtual ~WhereClauseParser() {}
    string errorMessage;
    virtual bool Parse(const hsql::SelectStatement *selectStatement, const string &biologicalStructure, int datasetId, string &result)
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
