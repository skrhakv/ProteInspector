#ifndef MetricGenerator_H
#define MetricGenerator_H

#include "../json-data-extractor.hpp"

class MetricsParser
{
protected:
    JsonDataExtractor jsonDataExtractor;

public:
    virtual ~MetricsParser() {}
    string errorMessage;
    virtual bool Parse(const hsql::SelectStatement *selectStatement, const string &biologicalStructure, string &result)
    {
        return false;
    }
    void SetJsonDataExtractor(const JsonDataExtractor &_jsonDataExtractor)
    {
        this->jsonDataExtractor = _jsonDataExtractor;
    }
};

#endif
