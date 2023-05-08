#include "operator-validator.hpp"
#include "hsql/SQLParser.h"
#include "utils.hpp"
#include <string>

bool OperatorValidator::parseMathOperator(const hsql::Expr *expression, string &operatorResult)
{
    if (expression->opType == hsql::kOpEquals)
        operatorResult = "=";
    else if (expression->opType == hsql::kOpNotEquals)
        operatorResult = "!=";
    else if (expression->opType == hsql::kOpLess)
        operatorResult = "<";
    else if (expression->opType == hsql::kOpLessEq)
        operatorResult = "<=";
    else if (expression->opType == hsql::kOpGreater)
        operatorResult = ">";
    else if (expression->opType == hsql::kOpGreaterEq)
        operatorResult = ">=";
    else if (expression->opType == hsql::kOpBetween)
        operatorResult = "BETWEEN";
    else if (expression->opType == hsql::kOpPlus)
        operatorResult = "+";
    else if (expression->opType == hsql::kOpMinus)
        operatorResult = "-";
    else if (expression->opType == hsql::kOpSlash)
        operatorResult = "/";
    else if (expression->opType == hsql::kOpAsterisk)
        operatorResult = "*";
    else
        RETURN_PARSE_ERROR("Unrecognized Operator type: " + expression->opType)

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