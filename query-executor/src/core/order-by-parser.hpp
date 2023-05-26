#ifndef OrderByParser_H
#define OrderByParser_H

#include <vector>
#include <string>
#include "hsql/SQLParser.h"
#include "json-data-extractor.hpp"
#include "utils.hpp"

class OrderByParser
{
    JsonDataExtractor extractor;

public:
    OrderByParser(JsonDataExtractor _extractor)
    {
        extractor = _extractor;
    }
    string errorMessage;

    bool Parse(const vector<hsql::OrderDescription *> *orderByClause, const string &biologicalStructure, string &result);
};

#endif