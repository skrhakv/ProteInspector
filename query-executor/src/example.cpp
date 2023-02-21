#include <stdlib.h>
#include <string>
#include <iostream>
#include <algorithm>
#include <cctype>
#include <string>
#include <map>
#include "hsql/SQLParser.h"
#include "hsql/util/sqlhelper.h"
#include <fstream>
#include <nlohmann/json.hpp>

using namespace std;

#define CONCAT_STR(a, b) (a + b)
#define BOOL_STR(b) ((b) ? "true" : "false")
#define RETURN_PARSE_ERROR(ERROR) \
    {                             \
        errorMessage = ERROR;     \
        return -1;                \
    }

void toLower(string &original)
{
    transform(original.begin(), original.end(), original.begin(),
              [](unsigned char c)
              { return tolower(c); });
}

class DatabaseClient;

class JsonMetricReaderAndParser
{
    nlohmann::json metricsData;

    int parseOperator(const hsql::Expr *expression, string &operatorResult)
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
        else
            RETURN_PARSE_ERROR("Unrecognized Operator type: " + expression->opType)

        return 0;
    }

public:
    string errorMessage;

    JsonMetricReaderAndParser()
    {
        std::ifstream f("metrics.json");
        metricsData = nlohmann::json::parse(f);
    }

    bool ValidBiologicalStructure(string biologicalStructure)
    {
        if (metricsData["metrics"][biologicalStructure].is_null())
            return false;
        return true;
    }

    int ValidateWhereClause(const hsql::Expr *expression, const string biologicalStructure, string &result)
    {
        assert(expression->expr->type == hsql::kExprColumnRef && "kExprColumnRef is expected as a type of the first expression");

        string metricValue, operatorValue, metricName = expression->expr->name;
        toLower(metricName);
        auto metric = metricsData["metrics"][biologicalStructure][metricName];

        int returnCode = parseOperator(expression, operatorValue);
        if (returnCode != 0)
            return returnCode;

        if (metric == nullptr)
            RETURN_PARSE_ERROR("Unrecognized Metrics in the WHERE clause: " + metricName)

        if (metric["type"] == "string")
        {
            cout << (!expression->expr2->type) << endl;
            if (!expression->expr2->isType(hsql::kExprColumnRef))
                RETURN_PARSE_ERROR("Metric " + metricName + " expects a string as a value.")

            if (expression->opType != hsql::OperatorType::kOpEquals && expression->opType != hsql::OperatorType::kOpNotEquals)
                RETURN_PARSE_ERROR("Metric " + metricName + " expects a string and supports only '=' and '!=' operators.")
            metricValue += "'";
            metricValue += expression->expr2->name;
            metricValue += "'";
        }
        else if (metric["type"] == "integer")
        {
            if (!expression->expr2->isType(hsql::kExprLiteralInt))
                RETURN_PARSE_ERROR("Metric " + metricName + " expects an integer as a value.")

            metricValue = expression->expr2->ival;
        }

        else if (metric["type"] == "float")
        {
            // float can be also defined as integer
            if (expression->expr2->isType(hsql::kExprLiteralFloat))
                metricValue = to_string(expression->expr2->fval);
            else if (expression->expr2->isType(hsql::kExprLiteralInt))
                metricValue = to_string(expression->expr2->ival);
            else
                RETURN_PARSE_ERROR("Metric " + metricName + " expects float as a value.")
        }
        else if (metric["type"] == "bool")
        {
            if (!expression->expr2->isType(hsql::kExprLiteralInt) || !expression->expr2->isBoolLiteral)
                RETURN_PARSE_ERROR("Metric " + metricName + " expects boolean as a value.")

            if (expression->opType != hsql::OperatorType::kOpEquals && expression->opType != hsql::OperatorType::kOpNotEquals)
                RETURN_PARSE_ERROR("Metric " + metricName + " expects a bool and supports only '=' and '!=' operators.")
            metricValue = BOOL_STR(expression->expr2->ival);
        }
        else
            assert(false && "Suported types are bool, integer, float and string only!");

        if (metric["databaseDestination"].is_array())
        {
            result += '(';
            bool first = true;
            for (auto item : metric["databaseDestination"])
            {
                if (!first)
                    result += " OR ";
                result += item.get<std::string>();
                result += ' ' + operatorValue + ' ' + metricValue;
                first = false;
            }
            result += ')';
        }
        else
        {
            result += metric["databaseDestination"];
            result += ' ' + operatorValue + ' ' + metricValue;
        }
        return 0;
    }
    int ValidateQueryMetric(hsql::Expr *expression, const string biologicalStructure, string &result)
    {
        assert(expression->type == hsql::kExprColumnRef);

        string metricName = expression->name;
        toLower(metricName);
        auto metric = metricsData["metrics"][biologicalStructure][metricName];

        if (metric == nullptr)
            RETURN_PARSE_ERROR("Unrecognized Metrics in the SELECT Clause: " + metricName)

        result = metric["databaseDestination"];
        return 0;
    }
    int GetAllMetrics(const string biologicalStructure, string &result)
    {
        auto metrics = metricsData["metrics"][biologicalStructure];

        bool first = true;
        for (const auto &metric : metrics.items())
        {
            if (metric.value()["databaseDestination"].is_array())
            {
                for (auto item : metric.value()["databaseDestination"])
                {
                    if (!first)
                        result += ",";
                    result += item.get<std::string>();
                    cout << "name getAllMetrics=" << item.get<std::string>() << endl;
                }
            }
            else
            {
                if (!first)
                    result += ",";
                result += metric.value()["databaseDestination"];
            }
            first = false;
        }
        return 0;
    }
    int GetTableAndLeftJoins(const string biologicalStructure, string &result)
    {
        auto metrics = metricsData["tables"][biologicalStructure];

        result += metrics["table"];
        result += " ";
        result += metrics["joins"];
        result += " ";

        return 0;
    }
};

class QueryConverterAndExecutor
{
private:
    string biologicalStructure;
    JsonMetricReaderAndParser jsonMetricReaderAndParser;
    string queryResult = "";
    int parseOperator(const hsql::OperatorType op, string &operatorResult)
    {
        if (op == hsql::kOpAnd)
            operatorResult = "AND";
        else if (op == hsql::kOpOr)
            operatorResult = "OR";
        else
            RETURN_PARSE_ERROR("Unrecognized Operator type: " + op)
        return 0;
    }
    int parseOperatorExpression(const hsql::Expr *expression, string &result)
    {
        if (expression->expr->type == hsql::kExprColumnRef)
        {
            string validationResult;
            int returnCode = jsonMetricReaderAndParser.ValidateWhereClause(expression, biologicalStructure, validationResult);
            if (returnCode != 0)
                RETURN_PARSE_ERROR(jsonMetricReaderAndParser.errorMessage)

            result += ("(" + validationResult + ")");
            return returnCode;
        }
        else if (expression->expr->type == hsql::kExprOperator && expression->expr2->type == hsql::kExprOperator)
        {
            result += "(";
            parseOperatorExpression(expression->expr, result);

            string operatorResult;
            int returnCode = parseOperator(expression->opType, operatorResult);
            if (returnCode != 0)
                RETURN_PARSE_ERROR(jsonMetricReaderAndParser.errorMessage)
            result += ' ' + operatorResult + ' ';

            parseOperatorExpression(expression->expr2, result);
            result += ")";

            return 0;
        }
        else
            RETURN_PARSE_ERROR("Unrecognized expression type: " + expression->type)
    }

    int parseOrderBy(const vector<hsql::OrderDescription *> *orderByClause, string &result)
    {
        bool first = true;
        for (const auto &element : *orderByClause)
        {
            string metric;
            int returnCode = jsonMetricReaderAndParser.ValidateQueryMetric(element->expr, biologicalStructure, metric);
            if (returnCode != 0)
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

        return 0;
    }

    int parseQuery(const hsql::SelectStatement *selectStatement)
    {
        queryResult += "SELECT ";
        bool first = true;
        for (hsql::Expr *expr : *selectStatement->selectList)
        {
            if (expr->type == hsql::kExprStar && selectStatement->selectList->size() > 1)
                RETURN_PARSE_ERROR("Star together with other Metric Ids violates rules of this grammar.")
            else if (expr->type == hsql::kExprStar)
            {
                string metrics;
                int returnCode = jsonMetricReaderAndParser.GetAllMetrics(biologicalStructure, metrics);
                if (returnCode != 0)
                    RETURN_PARSE_ERROR(jsonMetricReaderAndParser.errorMessage)
                queryResult += metrics;
            }
            else if (expr->type == hsql::kExprColumnRef)
            {
                if (!first)
                    queryResult += ",";
                string metric;
                int returnCode = jsonMetricReaderAndParser.ValidateQueryMetric(expr, biologicalStructure, metric);
                if (returnCode != 0)
                    RETURN_PARSE_ERROR(jsonMetricReaderAndParser.errorMessage)
                queryResult += metric;
                first = false;
            }
        }

        queryResult += " FROM ";
        string fromClauseAndJoins;
        jsonMetricReaderAndParser.GetTableAndLeftJoins(biologicalStructure, fromClauseAndJoins);
        queryResult += fromClauseAndJoins;

        if (selectStatement->whereClause)
        {
            string whereClause;
            int returnCode = parseOperatorExpression(selectStatement->whereClause, whereClause);
            if (returnCode != 0)
                return returnCode;
            queryResult += "WHERE " + whereClause;
        }

        if (selectStatement->order)
        {
            string orderByClause;
            int returnCode = parseOrderBy(selectStatement->order, orderByClause);
            if (returnCode != 0)
                return returnCode;
            queryResult += " ORDER BY " + orderByClause;
        }

        queryResult += ";";

        cout << "HERE IS THE RESULT:" << endl;
        cout << queryResult << endl;
        return 0;
    }

    int parseStatement(const hsql::SelectStatement *selectStatement)
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

        return 0;
    }

public:
    string errorMessage;

    int ConvertAndExecuteQuery(string query)
    {
        // parse a given query
        hsql::SQLParserResult result;
        hsql::SQLParser::parse(query, &result);

        // check whether the parsing was successful
        if (result.isValid())
        {
            cout << "Parsed successfully!" << endl;
            cout << "Number of statements: " << result.size() << endl;

            if (result.size() > 1 || result.size() == 0)
                RETURN_PARSE_ERROR("Exactly one query is permitted.");

            const hsql::SQLStatement *statement = result.getStatement(0);

            if (!(statement->is(hsql::StatementType::kStmtSelect)))
                RETURN_PARSE_ERROR("Only SELECT statements are supported.")

            int returnCode = parseStatement((const hsql::SelectStatement *)statement);
            if (returnCode != 0)
                RETURN_PARSE_ERROR(errorMessage)

            return parseQuery((const hsql::SelectStatement *)statement);
        }
        else
        {
            string msgBuilder = "Given string is not a valid query: ";
            msgBuilder += result.errorMsg();
            RETURN_PARSE_ERROR(msgBuilder)
        }

        return 0;
    }
};

int main(int argc, char *argv[])
{
    string query = argv[1];
    QueryConverterAndExecutor qExecutor;
    qExecutor.ConvertAndExecuteQuery(query);
    cout << qExecutor.errorMessage << endl;
}