#ifndef JSONMETRICSREADER_H
#define JSONMETRICSREADER_H

#include <nlohmann/json.hpp>
#include <string>

class JsonMetricsReader {

public:
    static nlohmann::json GetMetricsData(std::string metricsPath);
};

#endif