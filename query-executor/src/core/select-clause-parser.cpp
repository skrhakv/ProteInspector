#include <string>
#include "hsql/SQLParser.h"
#include "operator-validator.hpp"
#include "utils.hpp"
#include "select-clause-parser.hpp"
#include <iostream>

void SelectClauseParser::SetMetricsParser(MetricsParser *_metricsParser)
{
    this->metricsParser = _metricsParser;
    this->metricsParser->SetJsonDataExtractor(jsonDataExtractor);
}

void SelectClauseParser::SetWhereClauseParser(WhereClauseParser *_whereClauseParser)
{
    this->whereClauseParser = _whereClauseParser;
    this->whereClauseParser->SetJsonDataExtractor(jsonDataExtractor);
}

void SelectClauseParser::SetLimitClauseParser(LimitClauseParser *_limitClauseParser)
{
    this->limitClauseParser = _limitClauseParser;
}

bool SelectClauseParser::Parse(const hsql::SelectStatement *selectStatement, int datasetId)
{
    bool isValid = checkForAllowedGrammar((const hsql::SelectStatement *)selectStatement);
    if (!isValid)
        RETURN_PARSE_ERROR(errorMessage)

    convertedQuery += "SELECT ";

    isValid = metricsParser->Parse(selectStatement, biologicalStructure, convertedQuery);
    if (!isValid)
    {
        errorMessage = metricsParser->errorMessage;
        return false;
    }
    convertedQuery += " FROM ";
    string fromClauseAndJoins;
    jsonDataExtractor.GetTableAndJoins(biologicalStructure, fromClauseAndJoins);
    convertedQuery += fromClauseAndJoins;

    isValid = whereClauseParser->Parse(selectStatement, biologicalStructure, datasetId, convertedQuery);
    if (!isValid)
        RETURN_PARSE_ERROR(whereClauseParser->errorMessage)

    convertedQuery += limitClauseParser->Parse();

    return true;
}

bool SelectClauseParser::checkForAllowedGrammar(const hsql::SelectStatement *selectStatement)
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

    if (!jsonDataExtractor.ValidBiologicalStructure(biologicalStructure))
        RETURN_PARSE_ERROR("Unknown structure. Valid structures are: Proteins, Domains, Residues, and Domain Pairs")

    return true;
}
bool SelectClauseParser::checkFromKeyword(const string query)
{
    std::istringstream strm(query);
    std::string s;

    while (strm >> s)
    {
        toLower(s);
        if (s == "from")
            return true;
    }
    return false;
}

bool SelectClauseParser::Parse(const string query, int datasetId)
{
    // unfortunately the library segfaults when you forget the 'FROM' keyword in the query,
    // so we have to check that manually:
    bool isFromPresent = checkFromKeyword(query);
    if (!isFromPresent)
        RETURN_PARSE_ERROR("FROM keyword missing in the query.")

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

        bool isValid = Parse((const hsql::SelectStatement *)statement, datasetId);
        convertedQuery += ";";
        
        return isValid;
    }
    else
    {
        string msgBuilder = "Given string is not a valid query: ";
        msgBuilder += result.errorMsg();
        RETURN_PARSE_ERROR(msgBuilder)
    }

    return true;
}

string SelectClauseParser::GetConvertedQuery()
{
    return convertedQuery;
}

void SelectClauseParser::Clear()
{
    convertedQuery = "";
    biologicalStructure = "";
    errorMessage = "";
    jsonDataExtractor.Clear();
    whereClauseParser->Clear();
}
