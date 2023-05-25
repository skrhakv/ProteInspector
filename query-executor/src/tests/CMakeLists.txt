cmake_minimum_required(VERSION 3.14)
project(query-executor-test)

# GoogleTest requires at least C++14
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_library(hyrise_sql SHARED IMPORTED)
set_property(TARGET hyrise_sql PROPERTY IMPORTED_LOCATION "/usr/local/lib/libsqlparser.so")

include(FetchContent)
FetchContent_Declare(
  googletest
  URL https://github.com/google/googletest/archive/03597a01ee50ed33e9dfd640b249b4be3799d395.zip
)
# For Windows: Prevent overriding the parent project's compiler/linker settings
set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(googletest)

configure_file(../../metrics.json metrics.json COPYONLY)

enable_testing()

add_executable(
  query_executor_test
  test.cpp
  ../core/operator-validator.cpp
  ../core/json-data-extractor.cpp
  ../core/json-reader.cpp
  ../core/expression-parser.cpp
)
target_link_libraries(
  query_executor_test
  GTest::gtest_main
)
target_link_libraries(query_executor_test hyrise_sql)

include(GoogleTest)
gtest_discover_tests(query_executor_test)
