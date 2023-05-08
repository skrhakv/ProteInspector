#ifndef CONVERTER_H
#define CONVERTER_H

#include <string>
#include <set>
#include <nlohmann/json.hpp>
#include "hsql/SQLParser.h"
#include "operator-validator.hpp"

using namespace std;

class Converter
{
    nlohmann::json metricsData;
    OperatorValidator operatorValidator;
    set<string> addedMetrics;

public:
    string errorMessage;

    Converter();

    bool ValidBiologicalStructure(string biologicalStructure);
    bool ParseValue(const hsql::Expr *expression, string &result);

    bool ValidateWhereClause(const hsql::Expr *expression, const string biologicalStructure, string &result);
    bool ValidateQueryMetric(hsql::Expr *expression, const string biologicalStructure, bool arrayAgg, bool addAlias, string &result);
    bool GetAllMetrics(const string biologicalStructure, bool arrayAgg, string &result);
    bool GetTableAndLeftJoins(const string biologicalStructure, string &result);
    bool GetDatasetIdMetric(const string biologicalStructure, int datasetId, string &result);
    bool GetDefaultOrder(const string biologicalStructure, string &result);
    bool GetDefaultGroupBy(const string biologicalStructure, string &result);
    void Clear();
};

#endif