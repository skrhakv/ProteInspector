#ifndef MetricGenerator_H
#define MetricGenerator_H

#include "../converter.hpp"

class MetricGenerator
{
protected:
    Converter converter;

public:
    virtual ~MetricGenerator() {}
    string errorMessage;
    virtual bool Generate(const hsql::SelectStatement *selectStatement, const string &biologicalStructure, string &result)
    {
        return false;
    }
    void SetConverter(const Converter &_converter)
    {
        this->converter = _converter;
    }
};

#endif
