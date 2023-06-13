#ifndef EmptyLimitParser_H
#define EmptyLimitParser_H

#include "limit-clause-parser.hpp"

/// @brief Class disables the pagination feature
class EmptyLimitClauseParser : public LimitClauseParser {
    string Parse() override;
};

#endif