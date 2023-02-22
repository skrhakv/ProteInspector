#ifndef CONVERTER_H
#define CONVERTER_H

#include <string>
#include <nlohmann/json.hpp>
#include "hsql/SQLParser.h"
#include "operator-validator.hpp"

using namespace std;

class Converter
{
    nlohmann::json metricsData;
    OperatorValidator operatorValidator;
public:
    string errorMessage;

    Converter();
    
    bool ValidBiologicalStructure(string biologicalStructure);

    bool ValidateWhereClause(const hsql::Expr *expression, const string biologicalStructure, string &result);
    bool ValidateQueryMetric(hsql::Expr *expression, const string biologicalStructure, string &result);
    bool GetAllMetrics(const string biologicalStructure, string &result);
    bool GetTableAndLeftJoins(const string biologicalStructure, string &result);
};

#endif