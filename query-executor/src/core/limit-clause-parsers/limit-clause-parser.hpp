#ifndef LimitParser_H
#define LimitParser_H

#include <string>

using namespace std;

class LimitClauseParser
{
public:
    virtual string Parse()
    {
        return "";
    }
};

#endif