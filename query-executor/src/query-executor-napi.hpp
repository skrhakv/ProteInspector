#ifndef QUERYEXECUTORNAPI_H
#define QUERYEXECUTORNAPI_H

#include "core/query-executor.hpp"
#include <napi.h>

class QueryExecutorNapi : public Napi::ObjectWrap<QueryExecutorNapi>
{
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    QueryExecutorNapi(const Napi::CallbackInfo &info);
    ~QueryExecutorNapi();

private:
    static Napi::FunctionReference constructor;
    QueryExecutor *qExecutor;
    Napi::Value ParseAndExecute(const Napi::CallbackInfo &info);
    Napi::Value ParseAndExecuteWithAllMetrics(const Napi::CallbackInfo &info);
    Napi::Value GetNumberOfPages(const Napi::CallbackInfo &info);
    Napi::Value GetDatasetsInfo(const Napi::CallbackInfo &info);
    Napi::Value GetResultCount(const Napi::CallbackInfo &info);
    Napi::Value GetTransformationContext(const Napi::CallbackInfo &info);

};
#endif
