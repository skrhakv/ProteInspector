#ifndef OPERATORVALIDATOR_H
#define OPERATORVALIDATOR_H

#include "hsql/SQLParser.h"
#include <string>

using namespace std;

class OperatorValidator
{
public:
    string errorMessage;

    bool parseMathOperator(const hsql::Expr *expression, string &operatorResult);
    bool parseLogicOperator(const hsql::OperatorType op, string &operatorResult);
    void Clear();
};

#endif