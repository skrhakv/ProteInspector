#ifndef LimitParser_H
#define LimitParser_H

#include <string>

using namespace std;

/// @brief Parent class responsible for generating the LIMIT keywords to paginate the results
class LimitClauseParser
{
public:
    virtual ~LimitClauseParser() {}

    virtual string Parse()
    {
        return "";
    }
};

#endif