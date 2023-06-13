#ifndef MetricGenerator_H
#define MetricGenerator_H

#include "../json-data-extractor.hpp"

/// @brief Parent class for generating the METRICS clause
class MetricsParser
{
protected:
    JsonDataExtractor jsonDataExtractor;

public:
    virtual ~MetricsParser() {}
    string errorMessage;
    /// @brief parses tokens and generates the METRICS clause
    /// @param selectStatement tokens
    /// @param biologicalStructure proteins, domains, domainpairs, residues
    /// @param result container for converted part of the query
    /// @return true if conversion successful
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
