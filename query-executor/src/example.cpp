#include <string>
#include <iostream>
#include "query-executor.hpp"

using namespace std;

int main(int argc, char *argv[])
{
    string query = argv[1];
    QueryExecutor executor;
    auto [a,b] = executor.ParseAndExecute(query);
    for (auto const &row : a)
    {
        for (auto const &field : row)
            std::cout << field.c_str() << '\t';
        std::cout << std::endl;
    }
    cout << b << endl;
}