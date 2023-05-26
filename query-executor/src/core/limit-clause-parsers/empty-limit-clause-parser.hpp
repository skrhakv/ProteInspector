#ifndef EmptyLimitParser_H
#define EmptyLimitParser_H

#include "limit-clause-parser.hpp"

class EmptyLimitClauseParser : public LimitClauseParser {
    void Parse(int page, int pageSize, string &result) override;
};

#endif