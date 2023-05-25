#ifndef ExpressionParser_H
#define ExpressionParser_H

#include <string>
#include "hsql/SQLParser.h"
#include <nlohmann/json.hpp>
#include "utils.hpp"
#include "operator-validator.hpp"
#include "json-reader.hpp"

using namespace std;
class ExpressionParser
{
    nlohmann::json metricsData;
    OperatorValidator operatorValidator;
    string equationType = "";

public:
    ExpressionParser();
    string errorMessage;
    bool Parse(const hsql::Expr *expression, const string biologicalStructure, string &result);
};

#endif
