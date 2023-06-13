#ifndef JSONMETRICSREADER_H
#define JSONMETRICSREADER_H

#include <nlohmann/json.hpp>
#include <string>

/// @brief Class loads JSON data using the nlohmann library
class JsonReader {

public:
    /// @brief Loads JSON data from json file
    /// @param metricsPath path to the file
    /// @return json data
    static nlohmann::json GetJsonData(std::string metricsPath);
};

#endif