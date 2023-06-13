#ifndef OrderByParser_H
#define OrderByParser_H

#include <vector>
#include <string>
#include "hsql/SQLParser.h"
#include "json-data-extractor.hpp"
#include "utils.hpp"
/// @brief Class parses tokens and handles converting the ORDER BY clause
class OrderByParser
{
    JsonDataExtractor extractor;

public:
    OrderByParser(JsonDataExtractor _extractor)
    {
        extractor = _extractor;
    }
    string errorMessage;

    /// @brief parses tokens and generates the ORDER BY clause
    /// @param orderByClause tokens
    /// @param biologicalStructure proteins, domains, domainpairs, residues
    /// @param result container for converted part of the query
    /// @return true if conversion successful
    bool Parse(const vector<hsql::OrderDescription *> *orderByClause, const string &biologicalStructure, string &result);
};

#endif