#include <napi.h>

#include "query-executor-napi.hpp"

Napi::Object
InitAll(Napi::Env env, Napi::Object exports)
{
	return QueryExecutorNapi::Init(env, exports);
}

NODE_API_MODULE(testaddon, InitAll)
