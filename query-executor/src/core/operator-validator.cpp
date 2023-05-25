#include "operator-validator.hpp"
#include "hsql/SQLParser.h"
#include "utils.hpp"
#include <string>

bool OperatorValidator::parseMathOperator(const hsql::OperatorType op, string &operatorResult)
{
    if (op == hsql::kOpEquals)
        operatorResult = "=";
    else if (op == hsql::kOpNotEquals)
        operatorResult = "!=";
    else if (op == hsql::kOpLess)
        operatorResult = "<";
    else if (op == hsql::kOpLessEq)
        operatorResult = "<=";
    else if (op == hsql::kOpGreater)
        operatorResult = ">";
    else if (op == hsql::kOpGreaterEq)
        operatorResult = ">=";
    else if (op == hsql::kOpBetween)
        operatorResult = "BETWEEN";
    else if (op == hsql::kOpPlus)
        operatorResult = "+";
    else if (op == hsql::kOpMinus)
        operatorResult = "-";
    else if (op == hsql::kOpSlash)
        operatorResult = "/";
    else if (op == hsql::kOpAsterisk)
        operatorResult = "*";
    else
        RETURN_PARSE_ERROR("Unrecognized Operator type: " + op)

    return true;
}
bool OperatorValidator::parseLogicOperator(const hsql::OperatorType op, string &operatorResult)
{
    if (op == hsql::kOpAnd)
        operatorResult = "AND";
    else if (op == hsql::kOpOr)
        operatorResult = "OR";
    else
        RETURN_PARSE_ERROR("Unrecognized Operator type: " + op)
    return true;
}

void OperatorValidator::Clear()
{
    errorMessage = "";
}