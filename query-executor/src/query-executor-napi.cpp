#include "query-executor-napi.hpp"
#include <vector>

Napi::FunctionReference QueryExecutorNapi::constructor;

napi_value createJsonResultFromPqxxResult(const pqxx::result &result, Napi::Env &env)
{
    napi_value napiResult;
    napi_create_object(env, &napiResult);

    napi_value resultsKey;
    napi_create_string_utf8(
        env, "results", NAPI_AUTO_LENGTH, &resultsKey);

    napi_value resultArr, columnNamesArr;
    napi_create_array(env, &resultArr);
    napi_create_array(env, &columnNamesArr);

    std::size_t const numRows = result.size();
    std::size_t const numCols = result.columns();

    napi_value columnNamesKey;
    napi_create_string_utf8(
        env, "columnNames", NAPI_AUTO_LENGTH, &columnNamesKey);

    vector<napi_value> columns;

    for (std::size_t colnum = 0u; colnum < numCols; colnum++)
    {
        napi_value obj;
        napi_create_string_utf8(
            env,
            result.column_name(colnum),
            NAPI_AUTO_LENGTH,
            &obj);
        columns.push_back(obj);
        napi_set_element(env, columnNamesArr, colnum, obj);
    }
    napi_set_property(env, napiResult, columnNamesKey, columnNamesArr);

    for (std::size_t rownum = 0u; rownum < numRows; ++rownum)
    {
        napi_value resultRowObj;
        napi_create_object(env, &resultRowObj);

        pqxx::row const row = result[rownum];
        for (std::size_t colnum = 0u; colnum < numCols; ++colnum)
        {
            pqxx::field const field = row[colnum];
            napi_value obj;
            napi_create_string_utf8(
                env,
                field.c_str(),
                NAPI_AUTO_LENGTH,
                &obj);
            napi_set_property(
                env,
                resultRowObj,
                columns[colnum],
                obj);
        }
        napi_set_element(env, resultArr, rownum, resultRowObj);
    }
    napi_set_property(env, napiResult, resultsKey, resultArr);
    return napiResult;
}

Napi::Object QueryExecutorNapi::Init(Napi::Env env, Napi::Object exports)
{
    Napi::HandleScope scope(env);

    Napi::Function func =
        DefineClass(
            env, "QueryExecutorNapi",
            {InstanceMethod("ParseAndExecute", &QueryExecutorNapi::ParseAndExecute),
             InstanceMethod("GetNumberOfPages", &QueryExecutorNapi::GetNumberOfPages),
             InstanceMethod("GetDatasetsInfo", &QueryExecutorNapi::GetDatasetsInfo)});

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();

    exports.Set("QueryExecutorNapi", func);
    return exports;
}

QueryExecutorNapi::QueryExecutorNapi(const Napi::CallbackInfo &info) : Napi::ObjectWrap<QueryExecutorNapi>(info)
{
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    try
    {
        this->qExecutor = new QueryExecutor();
    }
    catch (const std::exception &e)
    {
        Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
    }
}

Napi::Value QueryExecutorNapi::GetDatasetsInfo(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    if (info.Length() != 0)
    {
        Napi::TypeError::New(env, "This method doesn't expect any parameters!").ThrowAsJavaScriptException();
    }

    std::string error;
    pqxx::result result;
    try
    {
        auto [r, error] = qExecutor->GetDatasetsInfo();
        result = r;
    }
    catch (const std::exception &e)
    {
        Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
    }

    if (error.empty())
    {
        auto napiResult = createJsonResultFromPqxxResult(result, env);
        return Napi::Object(env, napiResult);
    }
    return Napi::String::New(env, error);
}

Napi::Value QueryExecutorNapi::GetNumberOfPages(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    if (info.Length() != 1)
    {
        Napi::TypeError::New(env, "Wrong number of parameters: expected parameter is (string query)").ThrowAsJavaScriptException();
    }
    std::string query{info[0].As<Napi::String>().Utf8Value()}, error;

    pqxx::result result;
    try
    {
        auto [r, error] = qExecutor->GetNumberOfPages(query);
        result = r;
    }
    catch (const std::exception &e)
    {
        Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
    }
    if (error.empty())
    {
        size_t rowCount = result[0][0].as<size_t>();
        size_t numberOfPages = rowCount / PAGE_SIZE + (rowCount % PAGE_SIZE != 0);
        return Napi::Number::New(env, numberOfPages);
    }
    return Napi::String::New(env, error);
}

Napi::Value QueryExecutorNapi::ParseAndExecute(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    if (info.Length() != 2)
    {
        Napi::TypeError::New(env, "Wrong number of parameters: expected parameter is (string query, int pageNumber)").ThrowAsJavaScriptException();
    }

    std::string query{info[0].As<Napi::String>().Utf8Value()}, error;
    int page{info[1].As<Napi::Number>().Int32Value()};

    pqxx::result result;
    try
    {
        auto [r, error] = qExecutor->ParseAndExecute(query, page);
        result = r;
    }
    catch (const std::exception &e)
    {
        Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
    }
    if (error.empty())
    {
        auto napiResult = createJsonResultFromPqxxResult(result, env);
        return Napi::Object(env, napiResult);
    }
    return Napi::String::New(env, error);
}