#ifndef OuterQueryGenerator_H
#define OuterQueryGenerator_H

#include "where-clause-parser.hpp"
#include "regular-where-clause-parser.hpp"
#include "../select-clause-parser.hpp"
#include "../metrics-parsers/transformation-metrics-parser.hpp"
#include "../limit-clause-parsers/regular-limit-clause-parser.hpp"

/// @brief Class generates wrapper WHERE clause for the purpose of obtaining the query context.
/// The context is obtained as follows:
/// SELECT ... WHERE transformation_id IN (SELECT transformation_id ...);
/// This class generates the outer WHERE clause
class WrapperWhereClauseParser : public WhereClauseParser
{
private:
    SelectClauseParser parser;
    int page = 0;
    int pageSize = 0;

public:
    WrapperWhereClauseParser(int _page, int _pageSize) : page(_page), pageSize(_pageSize) {
        includeDatasetId = false;
    }
    /// @brief parses tokens and generates the WHERE clause
    /// @param selectStatement tokens
    /// @param biologicalStructure proteins, domains, domainpairs, residues
    /// @param result container for converted part of the query
    /// @return true if conversion successful
    bool Parse(const hsql::SelectStatement *selectStatement, const string &biologicalStructure, string &result) override;
};

#endif
