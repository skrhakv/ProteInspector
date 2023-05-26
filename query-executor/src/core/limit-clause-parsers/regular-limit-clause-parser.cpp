#include "regular-limit-clause-parser.hpp"

void RegularLimitClauseParser::Parse(int page, int pageSize, string &result)
{
    int offset = page * pageSize;
    result += " LIMIT " + to_string(pageSize) + " OFFSET " + to_string(offset);
}