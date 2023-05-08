#ifndef RegularQueryGenerator_H
#define RegularQueryGenerator_H

#include "end-query-generator.hpp"
#include "../utils.hpp"

class RegularQueryGenerator : public EndQueryGenerator
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
            bool isValid = this->Generate(selectStatement->whereClause, biologicalStructure, result);
            if (!isValid)
                RETURN_PARSE_ERROR(converter.errorMessage)

            result += " AND ";
            converter.GetDatasetIdMetric(biologicalStructure, datasetId, result);
        }
        else
        {
            result += " WHERE ";
            converter.GetDatasetIdMetric(biologicalStructure, datasetId, result);
        }
        if (selectStatement->order)
        {
            string orderByClause, defaultOrder;
            bool isValid = parseOrderBy(selectStatement->order, biologicalStructure, orderByClause) && converter.GetDefaultOrder(biologicalStructure, defaultOrder);
            if (!isValid)
                RETURN_PARSE_ERROR(errorMessage)

            result += " ORDER BY " + orderByClause;
            result += ", ";
            result += defaultOrder;
        }
        else
        {
            string defaultOrder;
            converter.GetDefaultOrder(biologicalStructure, defaultOrder);
            result += " ORDER BY " + defaultOrder;
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
            bool isValid = Generate(expression->expr, biologicalStructure, result);
            if (!isValid)
                RETURN_PARSE_ERROR(errorMessage)

            string operatorResult;
            isValid = operatorValidator.parseLogicOperator(expression->opType, operatorResult);
            if (!isValid)
                RETURN_PARSE_ERROR(converter.errorMessage)
            result += ' ' + operatorResult + ' ';

            isValid = Generate(expression->expr2, biologicalStructure, result);
            if (!isValid)
                RETURN_PARSE_ERROR(converter.errorMessage)
            result += ")";

            return true;
        }
        else if (expression->expr->type == hsql::kExprOperator && expression->opType != hsql::kOpNone)
        {
            result += "(";
            Generate(expression->expr, biologicalStructure, result);

            string operatorResult;
            bool isValid = operatorValidator.parseMathOperator(expression, operatorResult);
            if (!isValid)
                RETURN_PARSE_ERROR(converter.errorMessage)

            result += ' ' + operatorResult + ' ';

            isValid = converter.ParseValue(expression->expr2, biologicalStructure, result);
            if (!isValid)
                RETURN_PARSE_ERROR(converter.errorMessage)
            result += ")";

            return true;
        }
        else
            RETURN_PARSE_ERROR("Unrecognized expression type: " + expression->type)
    }
};

#endif
