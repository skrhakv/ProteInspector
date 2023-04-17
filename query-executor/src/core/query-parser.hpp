#ifndef QUERYPARSER_H
#define QUERYPARSER_H

#include <string>
#include "hsql/SQLParser.h"
#include "converter.hpp"
#include "operator-validator.hpp"
#include "metric-generators/metric-generator.hpp"
#include "end-query-generators/end-query-generator.hpp"

using namespace std;

class QueryParser
{
private:
    string biologicalStructure;
    Converter converter;
    OperatorValidator operatorValidator;
    MetricGenerator *metricGenerator;
    EndQueryGenerator *endQueryGenerator;
    string convertedQuery;

    bool checkForAllowedGrammar(const hsql::SelectStatement *selectStatement);

public:
    string errorMessage;
    void SetMetricGenerator(MetricGenerator *_metricGenerator);
    void SetEndQueryGenerator(EndQueryGenerator *_endQueryGenerator);

    bool parseQuery(const hsql::SelectStatement *selectStatement, int datasetId, int page = 0, int pageSize = 100);
    bool ConvertQuery(const string &query, int datasetId, int page = 0, int pageSize = 100);
    string GetConvertedQuery();
    void Clear();
};

#endif