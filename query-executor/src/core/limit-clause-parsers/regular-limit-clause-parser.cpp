#include "regular-limit-clause-parser.hpp"

string RegularLimitClauseParser::Parse()
{
    int offset = page * pageSize;
    return " LIMIT " + to_string(pageSize) + " OFFSET " + to_string(offset);
}