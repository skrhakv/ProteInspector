#ifndef RegularLimitParser_H
#define RegularLimitParser_H

#include "limit-clause-parser.hpp"

/// @brief Class generates the LIMIT keywords to paginate the results
class RegularLimitClauseParser : public LimitClauseParser
{
    int page, pageSize;
    string Parse() override;

public:
    RegularLimitClauseParser(int _page, int _pageSize) : page(_page), pageSize(_pageSize) {}
};

#endif