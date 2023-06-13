#ifndef ExpressionParser_H
#define ExpressionParser_H

#include <string>
#include "hsql/SQLParser.h"
#include <nlohmann/json.hpp>
#include "utils.hpp"
#include "operator-validator.hpp"
#include "json-reader.hpp"

using namespace std;
/// @brief parses tokens from the WHERE clause and generates the database WHERE clause
class ExpressionParser
{
    nlohmann::json metricsData;
    OperatorValidator operatorValidator;
    string equationType = "";

public:
    ExpressionParser();
    string errorMessage;

    /// @brief parses tokens from the WHERE clause and generates the database WHERE clause
    /// @param expression tokens
    /// @param biologicalStructure proteins, domains, domainpairs or residues
    /// @param result container for the converted tokens
    /// @return true if successful
    bool Parse(const hsql::Expr *expression, const string biologicalStructure, string &result);
};

#endif
