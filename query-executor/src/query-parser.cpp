#include <string>
#include "hsql/SQLParser.h"
#include "converter.hpp"
#include "operator-validator.hpp"
#include "utils.hpp"
#include "query-parser.hpp"

bool QueryParser::parseWhere(const hsql::Expr *expression, string &result)
{
    if (expression->expr->type == hsql::kExprColumnRef)
    {
        string validationResult;
        bool isValid = jsonMetricReaderAndParser.ValidateWhereClause(expression, biologicalStructure, validationResult);
        if (!isValid)
            RETURN_PARSE_ERROR(jsonMetricReaderAndParser.errorMessage)

        result += "(" + validationResult + ")";
        return isValid;
    }
    else if (expression->expr->type == hsql::kExprOperator && expression->expr2->type == hsql::kExprOperator)
    {
        result += "(";
        parseWhere(expression->expr, result);

        string operatorResult;
        bool isValid = operatorValidator.parseLogicOperator(expression->opType, operatorResult);
        if (!isValid)
            RETURN_PARSE_ERROR(jsonMetricReaderAndParser.errorMessage)
        result += ' ' + operatorResult + ' ';

        parseWhere(expression->expr2, result);
        result += ")";

        return true;
    }
    else
        RETURN_PARSE_ERROR("Unrecognized expression type: " + expression->type)
}

bool QueryParser::parseOrderBy(const vector<hsql::OrderDescription *> *orderByClause, string &result)
{
    bool first = true;
    for (const auto &element : *orderByClause)
    {
        string metric;
        bool isValid = jsonMetricReaderAndParser.ValidateQueryMetric(element->expr, biologicalStructure, metric);
        if (!isValid)
            RETURN_PARSE_ERROR(jsonMetricReaderAndParser.errorMessage)

        if (first)
        {
            result += metric;
            first = false;
        }
        else
            result += ", " + metric;

        if (element->type)
            result += (element->type == hsql::OrderType::kOrderAsc) ? " ASC" : " DESC";
    }

    return true;
}

bool QueryParser::parseQuery(const hsql::SelectStatement *selectStatement)
{
    bool isValid = checkForAllowedGrammar((const hsql::SelectStatement *)selectStatement);
    if (!isValid)
        RETURN_PARSE_ERROR(errorMessage)

    convertedQuery += "SELECT ";
    bool first = true;
    for (hsql::Expr *expr : *selectStatement->selectList)
    {
        if (expr->type == hsql::kExprStar && selectStatement->selectList->size() > 1)
            RETURN_PARSE_ERROR("Star together with other Metric Ids violates rules of this grammar.")
        else if (expr->type == hsql::kExprStar)
        {
            string metrics;
            jsonMetricReaderAndParser.GetAllMetrics(biologicalStructure, metrics);
            convertedQuery += metrics;
        }
        else if (expr->type == hsql::kExprColumnRef)
        {
            if (!first)
                convertedQuery += ",";
            string metric;
            bool isValid = jsonMetricReaderAndParser.ValidateQueryMetric(expr, biologicalStructure, metric);
            if (!isValid)
                RETURN_PARSE_ERROR(jsonMetricReaderAndParser.errorMessage)
            convertedQuery += metric;
            first = false;
        }
    }

    convertedQuery += " FROM ";
    string fromClauseAndJoins;
    jsonMetricReaderAndParser.GetTableAndLeftJoins(biologicalStructure, fromClauseAndJoins);
    convertedQuery += fromClauseAndJoins;

    if (selectStatement->whereClause)
    {
        string whereClause;
        bool isValid = parseWhere(selectStatement->whereClause, whereClause);
        if (!isValid)
            return isValid;
        convertedQuery += "WHERE " + whereClause;
    }

    if (selectStatement->order)
    {
        string orderByClause;
        bool isValid = parseOrderBy(selectStatement->order, orderByClause);
        if (!isValid)
            return isValid;
        convertedQuery += " ORDER BY " + orderByClause;
    }

    convertedQuery += ";";

    return true;
}

bool QueryParser::checkForAllowedGrammar(const hsql::SelectStatement *selectStatement)
{
    if (selectStatement->groupBy != nullptr)
        RETURN_PARSE_ERROR("Group-By clause is not a part of this query language!")
    if (selectStatement->selectDistinct)
        RETURN_PARSE_ERROR("Select-Distinct clause is not a part of this query language!")
    if (selectStatement->limit != nullptr)
        RETURN_PARSE_ERROR("Limit clause is not a part of this query language!")
    if (selectStatement->lockings != nullptr)
        RETURN_PARSE_ERROR("Locking is not a part of this query language!")
    if (selectStatement->setOperations != nullptr)
        RETURN_PARSE_ERROR("Set operation is not a part of this query language!")
    if (selectStatement->withDescriptions != nullptr)
        RETURN_PARSE_ERROR("With clause is not a part of this query language!")

    biologicalStructure = selectStatement->fromTable->name;
    toLower(biologicalStructure);

    // if (biologicalStructure != PROTEINS && biologicalStructure != DOMAINS && biologicalStructure != RESIDUES && biologicalStructure != PROTEIN_PROGRESSION)
    if (!jsonMetricReaderAndParser.ValidBiologicalStructure(biologicalStructure))
        RETURN_PARSE_ERROR("Unknown structure. Valid structures are: Proteins, Domains, Residues, and Protein-Progression")

    return true;
}

bool QueryParser::ConvertQuery(const string& query)
{
    // parse a given query
    hsql::SQLParserResult result;
    hsql::SQLParser::parse(query, &result);

    // check whether the parsing was successful
    if (result.isValid())
    {
        if (result.size() > 1 || result.size() == 0)
            RETURN_PARSE_ERROR("Exactly one query is permitted.");

        const hsql::SQLStatement *statement = result.getStatement(0);

        if (!(statement->is(hsql::StatementType::kStmtSelect)))
            RETURN_PARSE_ERROR("Only SELECT statements are supported.")

        return parseQuery((const hsql::SelectStatement *)statement);
    }
    else
    {
        string msgBuilder = "Given string is not a valid query: ";
        msgBuilder += result.errorMsg();
        RETURN_PARSE_ERROR(msgBuilder)
    }

    return true;
}

string QueryParser::GetConvertedQuery()
{
    return convertedQuery;
}
