#ifndef JSONMETRICSREADER_H
#define JSONMETRICSREADER_H

#include <nlohmann/json.hpp>
#include <string>

class JsonReader {

public:
    static nlohmann::json GetJsonData(std::string metricsPath);
};

#endif