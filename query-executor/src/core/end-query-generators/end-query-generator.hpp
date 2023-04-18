#ifndef EndQueryGenerator_H
#define EndQueryGenerator_H

#include "../converter.hpp"

class EndQueryGenerator
{
protected:
    Converter converter;
    OperatorValidator operatorValidator;

public:
    virtual ~EndQueryGenerator() {}
    string errorMessage;
    virtual bool Generate(const hsql::SelectStatement *selectStatement, const string &biologicalStructure, int datasetId, string &result)
    {
        return false;
    }

    void addPageLimitWithOffset(int page, int pageSize, string &result)
    {
        int offset = page * pageSize;
        result += " LIMIT " + to_string(pageSize) + " OFFSET " + to_string(offset);
    }

    void SetConverter(const Converter &_converter)
    {
        this->converter = _converter;
    }
    void Clear()
    {
        operatorValidator.Clear();
    }
};

#endif
