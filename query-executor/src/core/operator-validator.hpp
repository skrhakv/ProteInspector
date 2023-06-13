#ifndef OPERATORVALIDATOR_H
#define OPERATORVALIDATOR_H

#include "hsql/SQLParser.h"
#include <string>

using namespace std;
/// @brief Class validates math and logic operators
class OperatorValidator
{
public:
    string errorMessage;
    /// @brief validates operator token
    /// @param op operator token
    /// @param operatorResult container for converted operator
    /// @return true if operator valid
    bool parseMathOperator(const hsql::OperatorType op, string &operatorResult);
    /// @brief validates operator token
    /// @param op operator token
    /// @param operatorResult container for converted operator
    /// @return true if operator valid
    bool parseLogicOperator(const hsql::OperatorType op, string &operatorResult);
    void Clear();
};

#endif