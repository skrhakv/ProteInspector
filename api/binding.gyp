{
    "targets": [{
        "target_name": "query-executor",
        "cflags_cc": [ "-std=c++20","-lstdc++" ,"-fexceptions", "-Wall", "-L/usr/local/lib" ],
        'cflags_cc!': [ '-fno-rtti' ],
        "sources": [
            "../query-executor/src/core/converter.cpp",
            "../query-executor/src/core/db-client.cpp",
            "../query-executor/src/core/json-reader.cpp",
            "../query-executor/src/core/operator-validator.cpp",
            "../query-executor/src/core/query-executor.cpp",
            "../query-executor/src/core/query-parser.cpp",
            "../query-executor/src/core/converter.cpp",
            "../query-executor/src/core/utils.hpp",
            "../query-executor/src/query-executor-napi.cpp",
            "../query-executor/src/main.cpp"            
          
        ],
        'include_dirs': [
            "<!@(node -p \"require('node-addon-api').include\")",
            "-I/usr/local/include/hsql",
            "-I../query-executor/src"       
        ],
        'libraries': [
            "-lsqlparser",
            "-lpqxx",
            "-lpq"
        ],
        'link_settings': {
            'library_dirs': [
                "/usr/local/lib",

            ]
        },
        'dependencies': [
            "<!(node -p \"require('node-addon-api').gyp\")"
        ],
        'defines': [ 'NAPI_DISABLE_CPP_EXCEPTIONS' ],
        "copies":[
                    { 
                        'destination': './',
                        'files':[
                                "../query-executor/config.json",
                                "../query-executor/metrics.json"

                             ]
                    }
                ]
    }]
}