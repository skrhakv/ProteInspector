#ifndef EmptyLimitParser_H
#define EmptyLimitParser_H

#include "limit-clause-parser.hpp"

class EmptyLimitClauseParser : public LimitClauseParser {
    string Parse() override;
};

#endif