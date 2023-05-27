#ifndef RegularLimitParser_H
#define RegularLimitParser_H

#include "limit-clause-parser.hpp"

class RegularLimitClauseParser : public LimitClauseParser
{
    int page, pageSize;
    string Parse() override;

public:
    RegularLimitClauseParser(int _page, int _pageSize) : page(_page), pageSize(_pageSize) {}
};

#endif