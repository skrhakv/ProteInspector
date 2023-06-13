#ifndef CONVERTER_H
#define CONVERTER_H

#include <string>
#include <set>
#include <nlohmann/json.hpp>
#include "hsql/SQLParser.h"
#include "operator-validator.hpp"

using namespace std;

/// @brief Loads parts of query prepared in advance from the metrics.json file
class JsonDataExtractor
{
    nlohmann::json metricsData;
    OperatorValidator operatorValidator;
    set<string> addedMetrics;

public:
    string errorMessage;

    JsonDataExtractor();

    /// @brief Validates biological structure [proteins, domains, domainpairs, residues]
    /// @param biologicalStructure proteins, domains, domainpairs or residues
    /// @return true if valid
    bool ValidBiologicalStructure(string biologicalStructure);
    /// @brief Validates token 
    /// @param expression tokens
    /// @param biologicalStructure proteins, domains, domainpairs or residues
    /// @param result container for converted tokens
    /// @return true if successful
    bool ParseValue(const hsql::Expr *expression, const string biologicalStructure, string &result);
    /// @brief Validates metric
    /// @param expression tokens
    /// @param biologicalStructure proteins, domains, domainpairs or residues
    /// @param addAlias true if add alias to the metric
    /// @param result container for converted tokens
    /// @return true if successful
    bool ValidateQueryMetric(hsql::Expr *expression, const string biologicalStructure, bool addAlias, string &result);
    /// @brief Gets all the metrics of specified biological structure
    /// @param biologicalStructure proteins, domains, domainpairs or residues
    /// @param result container for metrics
    /// @return true if successful
    bool GetAllMetrics(const string biologicalStructure, string &result);
    /// @brief Gets table and all table joins of specified biological structure
    /// @param biologicalStructure proteins, domains, domainpairs or residues
    /// @param result container for table and table joins
    /// @return true if successful
    bool GetTableAndJoins(const string biologicalStructure, string &result);
    /// @brief Adds dataset specification to the WHERE clause
    /// @param biologicalStructure proteins, domains, domainpairs or residues
    /// @param datasetId dataset ID
    /// @param result container for specification
    /// @return true if successful
    bool GetDatasetIdMetric(const string biologicalStructure, int datasetId, string &result);
    /// @brief Retrieves the default order of the biological structure (so the results would have stable position in the result list)
    /// @param biologicalStructure proteins, domains, domainpairs or residues
    /// @param result container for specification
    /// @return true if successful
    bool GetDefaultOrder(const string biologicalStructure, string &result);
    /// @brief get default metric to group by the transformation
    /// @param biologicalStructure proteins, domains, domainpairs or residues
    /// @param result container for the group by metric
    /// @return true if successful
    bool GetDefaultGroupBy(const string biologicalStructure, string &result);
    /// @brief Gets default identification metric of the biological structure
    /// @param biologicalStructure proteins, domains, domainpairs or residues
    /// @param result container for the ID metric
    /// @return true if successful
    bool GetDefaultIdMetric(const string biologicalStructure, string &result);

    void Clear();
};

#endif