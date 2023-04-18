#include <string>
#include "hsql/SQLParser.h"
#include "converter.hpp"
#include "operator-validator.hpp"
#include "utils.hpp"
#include "query-parser.hpp"

void QueryParser::SetMetricGenerator(MetricGenerator *_metricGenerator)
{
    this->metricGenerator = _metricGenerator;
    metricGenerator->SetConverter(converter);
}
void QueryParser::SetEndQueryGenerator(EndQueryGenerator *_endQueryGenerator)
{
    this->endQueryGenerator = _endQueryGenerator;
    _endQueryGenerator->SetConverter(converter);
}

bool QueryParser::parseQuery(const hsql::SelectStatement *selectStatement, int datasetId, int page, int pageSize)
{
    bool isValid = checkForAllowedGrammar((const hsql::SelectStatement *)selectStatement);
    if (!isValid)
        RETURN_PARSE_ERROR(errorMessage)

    convertedQuery += "SELECT ";

    isValid = metricGenerator->Generate(selectStatement, biologicalStructure, convertedQuery);
    if (!isValid)
    {
        errorMessage = metricGenerator->errorMessage;
        return false;
    }
    convertedQuery += " FROM ";
    string fromClauseAndJoins;
    converter.GetTableAndLeftJoins(biologicalStructure, fromClauseAndJoins);
    convertedQuery += fromClauseAndJoins;

    isValid = endQueryGenerator->Generate(selectStatement, biologicalStructure, datasetId, convertedQuery);
    if(!isValid)
        RETURN_PARSE_ERROR(endQueryGenerator->errorMessage)

    endQueryGenerator->addPageLimitWithOffset(page, pageSize, convertedQuery);

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
    if (!converter.ValidBiologicalStructure(biologicalStructure))
        RETURN_PARSE_ERROR("Unknown structure. Valid structures are: Proteins, Domains, Residues, and Protein-Progression")

    return true;
}

bool QueryParser::ConvertQuery(const string &query, int datasetId, int page, int pageSize)
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

        bool isValid = parseQuery((const hsql::SelectStatement *)statement, datasetId, page, pageSize);
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

string QueryParser::GetConvertedQuery()
{
    return convertedQuery;
}

void QueryParser::Clear()
{
    convertedQuery = "";
    biologicalStructure = "";
    errorMessage = "";
    converter.Clear();
    endQueryGenerator->Clear();
}
