#ifndef RegularLimitParser_H
#define RegularLimitParser_H

#include "limit-clause-parser.hpp"

class RegularLimitClauseParser : public LimitClauseParser {
    void Parse(int page, int pageSize, string &result) override;
};

#endif