#include <string>
#include <fstream>
#include <nlohmann/json.hpp>
#include <iostream>
#include "json-reader.hpp"

using namespace std;

nlohmann::json JsonReader::GetJsonData(string metricsPath)
{
    ifstream f(metricsPath);
    auto json = nlohmann::json::parse(f, nullptr, false);
    if (json.is_discarded())
    {
        cerr << "Error during JSON data loading -"
                "make sure the file has correct format and "
            "has valid location: "  << metricsPath << endl;
    }
    return json;
}
