#ifndef InnerQueryGenerator_H
#define InnerQueryGenerator_H

#include "end-query-generator.hpp"
#include "../utils.hpp"

class InnerQueryGenerator : public EndQueryGenerator
{
    bool parseOrderBy(const vector<hsql::OrderDescription *> *orderByClause, const string &biologicalStructure, string &result)
    {
        bool first = true;
        for (const auto &element : *orderByClause)
        {
            string metric;
            bool isValid = converter.ValidateQueryMetric(element->expr, biologicalStructure, false, false, metric);
            if (!isValid)
                RETURN_PARSE_ERROR(converter.errorMessage)

            if (first)
            {
                result += metric;
                first = false;
            }
            else
            {
                result += ", ";
                result += metric;
            }

            if (element->type)
                result += (element->type == hsql::OrderType::kOrderAsc) ? " ASC" : " DESC";
        }

        return true;
    }

public:
    bool Generate(const hsql::SelectStatement *selectStatement, const string &biologicalStructure, int datasetId, string &result) override
    {
        if (selectStatement->whereClause)
        {
            result += " WHERE ";
            return this->Generate(selectStatement->whereClause, biologicalStructure, result);
            result += " AND ";
            converter.GetDatasetIdMetric(biologicalStructure, datasetId, result);
        }
        else
        {
            result += " WHERE ";
            converter.GetDatasetIdMetric(biologicalStructure, datasetId, result);
        }
        return true;
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
