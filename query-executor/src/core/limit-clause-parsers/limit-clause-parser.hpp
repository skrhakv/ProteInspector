#ifndef LimitParser_H
#define LimitParser_H

#include <string>

using namespace std;

class LimitClauseParser
{
public:
    virtual void Parse(int page, int pageSize, string &result)
    {
        return;
    }
};

#endif