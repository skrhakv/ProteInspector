#ifndef QUERYEXECUTORNAPI_H
#define QUERYEXECUTORNAPI_H

#include "core/query-executor.hpp"
#include <napi.h>

class QueryExecutorNapi : public Napi::ObjectWrap<QueryExecutorNapi>
{
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    QueryExecutorNapi(const Napi::CallbackInfo &info);
    // std::pair<pqxx::result, std::string> ParseAndExecute(const std::string &query);
private:
    static Napi::FunctionReference constructor;
    QueryExecutor *qExecutor;
    Napi::Value ParseAndExecute(const Napi::CallbackInfo &info);
};
#endif
