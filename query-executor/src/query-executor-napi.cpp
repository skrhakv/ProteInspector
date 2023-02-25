#include "query-executor-napi.hpp"

Napi::FunctionReference QueryExecutorNapi::constructor;

Napi::Object QueryExecutorNapi::Init(Napi::Env env, Napi::Object exports)
{
    Napi::HandleScope scope(env);

    Napi::Function func =
        DefineClass(
            env, "QueryExecutorNapi",
            {InstanceMethod("ParseAndExecute", &QueryExecutorNapi::ParseAndExecute)});

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

Napi::Value QueryExecutorNapi::ParseAndExecute(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    if (info.Length() != 2)
    {
        Napi::TypeError::New(env, "Wrong number of parameters: expected string").ThrowAsJavaScriptException();
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
        napi_value napiResult;
        napi_create_object(env, &napiResult);

        napi_value resultsKey;
        napi_create_string_utf8(
            env, "results", NAPI_AUTO_LENGTH, &resultsKey);

        napi_value resultArr, columnNamesArr;
        napi_create_array(env, &resultArr);
        napi_create_array(env, &columnNamesArr);

        std::size_t const numRows = std::size(result);
        std::size_t const numCols = result.columns();

        napi_value columnNamesKey;
        napi_create_string_utf8(
            env, "columnNames", NAPI_AUTO_LENGTH, &columnNamesKey);

        for (std::size_t colnum = 0u; colnum < numCols; colnum++)
        {
            napi_value obj;
            napi_create_string_utf8(
                env,
                result.column_name(colnum),
                NAPI_AUTO_LENGTH,
                &obj);
            napi_set_element(env, columnNamesArr, colnum, obj);
        }

        for (std::size_t rownum = 0u; rownum < numRows; ++rownum)
        {
            napi_value resultRowArr;
            napi_create_array(env, &resultRowArr);

            pqxx::row const row = result[0];
            for (std::size_t colnum = 0u; colnum < numCols; ++colnum)
            {
                pqxx::field const field = row[colnum];
                napi_value obj;
                napi_create_string_utf8(
                    env,
                    field.c_str(),
                    NAPI_AUTO_LENGTH,
                    &obj);
                napi_set_element(env, resultRowArr, colnum, obj);
            }
            napi_set_element(env, resultArr, rownum, resultRowArr);
        }
        napi_set_property(env, napiResult, resultsKey, resultArr);

        return Napi::Object(env, napiResult);
    }
    return Napi::String::New(env, error);
}