#ifndef UTILS_H
#define UTILS_H

#include <string>
#include <algorithm>

using namespace std;

#define CONCAT_STR(a, b) (a + b)
#define BOOL_STR(b) ((b) ? "true" : "false")
#define RETURN_PARSE_ERROR(ERROR) \
    {                             \
        errorMessage = ERROR;     \
        return false;                \
    }

inline void toLower(string &original)
{
    transform(original.begin(), original.end(), original.begin(),
              [](unsigned char c)
              { return tolower(c); });
}

#endif