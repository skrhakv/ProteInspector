#ifndef InnerQueryGenerator_H
#define InnerQueryGenerator_H

#include "end-query-generator.hpp"
#include "../utils.hpp"

class InnerQueryGenerator : public EndQueryGenerator
{
public:
    bool Generate(const hsql::SelectStatement *selectStatement, const string &biologicalStructure, int datasetId, string &result) override
    {
        if (selectStatement->whereClause)
        {
            result += " WHERE ";
            return this->Generate(selectStatement->whereClause, biologicalStructure, result);
        }
        return true;
    }

    void addPageLimitWithOffset(int page, int pageSize, string &result)
    {
    }

private:
    bool Generate(const hsql::Expr *expression, const string &biologicalStructure, string &result)
    {
        if (expression->expr->type == hsql::kExprColumnRef)
        {
            string validationResult;
            bool isValid = converter.ValidateWhereClause(expression, biologicalStructure, validationResult);
            if (!isValid)
                RETURN_PARSE_ERROR(converter.errorMessage)

            result += "(" + validationResult + ")";
            return isValid;
        }
        else if (expression->expr->type == hsql::kExprOperator && expression->expr2->type == hsql::kExprOperator)
        {
            result += "(";
            Generate(expression->expr, biologicalStructure, result);

            string operatorResult;
            bool isValid = operatorValidator.parseLogicOperator(expression->opType, operatorResult);
            if (!isValid)
                RETURN_PARSE_ERROR(converter.errorMessage)
            result += ' ' + operatorResult + ' ';

            Generate(expression->expr2, biologicalStructure, result);
            result += ")";

            return true;
        }
        else
            RETURN_PARSE_ERROR("Unrecognized expression type: " + expression->type)
    }
};

#endif
