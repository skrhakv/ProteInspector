#include "regular-where-clause-parser.hpp"
#include "../utils.hpp"

bool RegularWhereClauseParser::Parse(const hsql::SelectStatement *selectStatement, const string &biologicalStructure, string &result)
{
    if (selectStatement->whereClause)
    {
        result += " WHERE ";
        bool isValid = this->Generate(selectStatement->whereClause, biologicalStructure, result);
        if (!isValid)
            RETURN_PARSE_ERROR(errorMessage)

        if (includeDatasetId)
        {
            result += " AND ";
            jsonDataExtractor.GetDatasetIdMetric(biologicalStructure, datasetId, result);
        }
    }
    else
    {
        if (includeDatasetId)
        {
            result += " WHERE ";
            jsonDataExtractor.GetDatasetIdMetric(biologicalStructure, datasetId, result);
        }
    }
    if (orderBy)
    {
        if (selectStatement->order)
        {
            string orderByClause, defaultOrder;
            bool isValid = orderByParser.Parse(selectStatement->order, biologicalStructure, orderByClause) && jsonDataExtractor.GetDefaultOrder(biologicalStructure, defaultOrder);
            if (!isValid)
                RETURN_PARSE_ERROR(errorMessage)

            result += " ORDER BY " + orderByClause;
            result += ", ";
            result += defaultOrder;
        }
        else
        {
            string defaultOrder;
            jsonDataExtractor.GetDefaultOrder(biologicalStructure, defaultOrder);
            result += " ORDER BY " + defaultOrder;
        }
    }

    return true;
}

bool RegularWhereClauseParser::Generate(const hsql::Expr *expression, const string &biologicalStructure, string &result)
{
    if (expression->expr->type == hsql::kExprColumnRef)
    {
        string validationResult;

        bool isValid = expressionParser.Parse(expression, biologicalStructure, validationResult);
        if (!isValid)
            RETURN_PARSE_ERROR(expressionParser.errorMessage)

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
            RETURN_PARSE_ERROR(operatorValidator.errorMessage)
        result += ' ' + operatorResult + ' ';

        isValid = Generate(expression->expr2, biologicalStructure, result);
        if (!isValid)
            RETURN_PARSE_ERROR(errorMessage)
        result += ")";

        return true;
    }
    else if (expression->expr->type == hsql::kExprOperator && expression->opType != hsql::kOpNone)
    {
        result += "(";
        Generate(expression->expr, biologicalStructure, result);

        string operatorResult;
        bool isValid = operatorValidator.parseMathOperator(expression->opType, operatorResult);
        if (!isValid)
            RETURN_PARSE_ERROR(jsonDataExtractor.errorMessage)

        result += ' ' + operatorResult + ' ';

        isValid = jsonDataExtractor.ParseValue(expression->expr2, biologicalStructure, result);
        if (!isValid)
            RETURN_PARSE_ERROR(jsonDataExtractor.errorMessage)
        result += ")";

        return true;
    }
    else
        RETURN_PARSE_ERROR("Unrecognized expression type: " + expression->type)
}
