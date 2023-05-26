#ifndef CONVERTER_H
#define CONVERTER_H

#include <string>
#include <set>
#include <nlohmann/json.hpp>
#include "hsql/SQLParser.h"
#include "operator-validator.hpp"

using namespace std;

class JsonDataExtractor
{
    nlohmann::json metricsData;
    OperatorValidator operatorValidator;
    set<string> addedMetrics;

public:
    string errorMessage;

    JsonDataExtractor();

    bool ValidBiologicalStructure(string biologicalStructure);
    bool ParseValue(const hsql::Expr *expression, const string biologicalStructure, string &result);
    bool ValidateQueryMetric(hsql::Expr *expression, const string biologicalStructure, bool addAlias, string &result);
    bool GetAllMetrics(const string biologicalStructure, string &result);
    bool GetTableAndJoins(const string biologicalStructure, string &result);
    bool GetDatasetIdMetric(const string biologicalStructure, int datasetId, string &result);
    bool GetDefaultOrder(const string biologicalStructure, string &result);
    bool GetDefaultGroupBy(const string biologicalStructure, string &result);
    bool GetDefaultIdMetric(const string biologicalStructure, string &result);

    void Clear();
};

#endif