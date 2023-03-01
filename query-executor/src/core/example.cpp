#include <string>
#include <iostream>
#include "query-executor.hpp"

using namespace std;

// for debugging purposes
int main(int argc, char *argv[])
{
    string query = argv[1];
    QueryExecutor executor;
    auto [r, b] = executor.GetNumberOfPages(query);
    std::size_t const num_rows = std::size(r);
    std::size_t const num_cols = r.columns();
    for (std::size_t rownum = 0u; rownum < num_rows; ++rownum)
    {
        cout << rownum << endl;
        pqxx::row const row = r[rownum];
        for (std::size_t colnum = 0u; colnum < num_cols; ++colnum)
        {
            cout << colnum << endl;
            pqxx::field const field = row[colnum];
            std::cout << field.c_str() << '\t';
        }
        std::cout << '\n';
    }
    cout << b << endl;
}