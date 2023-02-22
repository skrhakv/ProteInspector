#include <string>
#include <iostream>
#include "query-parser.hpp"

using namespace std;

int main(int argc, char *argv[])
{
    string query = argv[1];
    QueryParser parser;
    parser.ConvertAndExecuteQuery(query);
    cout << parser.errorMessage << endl;
}