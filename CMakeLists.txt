cmake_minimum_required(VERSION 3.20)
project(CognitiveSIEM VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

# Find packages
find_package(mongocxx CONFIG REQUIRED)
find_package(bsoncxx CONFIG REQUIRED)
find_package(Boost REQUIRED COMPONENTS beast)
find_package(spdlog CONFIG REQUIRED)
find_package(nlohmann_json CONFIG REQUIRED)
find_package(CLI11 CONFIG REQUIRED)
find_package(yaml-cpp CONFIG REQUIRED)
find_package(OpenSSL REQUIRED)
find_package(Catch2 3 CONFIG REQUIRED)

# Include directories
include_directories(${CMAKE_SOURCE_DIR}/src)

# Core library
add_library(siem_core STATIC
    src/core/event_normalizer.cpp
    src/core/incident_clusterer.cpp
    src/core/correlation.cpp
    src/core/ids.cpp
    src/storage/mongo.cpp
    src/storage/change_stream.cpp
    src/ingest/file_ingestor.cpp
    src/ingest/http_ingestor.cpp
    src/api/websocket_server.cpp
    src/api/rest_server.cpp
    src/audit/auditor.cpp
    src/metrics/metrics.cpp
)

target_link_libraries(siem_core PUBLIC
    mongo::mongocxx_shared
    mongo::bsoncxx_shared
    Boost::beast
    spdlog::spdlog
    nlohmann_json::nlohmann_json
    yaml-cpp::yaml-cpp
    OpenSSL::SSL
    OpenSSL::Crypto
)

target_compile_options(siem_core PRIVATE
    $<$<CXX_COMPILER_ID:MSVC>:/W4>
    $<$<NOT:$<CXX_COMPILER_ID:MSVC>>:-Wall -Wextra -Wpedantic>
)

# Main executable
add_executable(siemd src/main.cpp)
target_link_libraries(siemd PRIVATE siem_core)
if(MSVC)
    target_compile_options(siemd PRIVATE /std:c++20)
endif()

# Seed data script
add_executable(seed_demo_data scripts/seed_demo_data.cpp)
target_link_libraries(seed_demo_data PRIVATE siem_core)

# Tests
enable_testing()
add_executable(siem_tests
    tests/test_normalizer.cpp
    tests/test_clusterer.cpp
    tests/test_ids.cpp
)

target_link_libraries(siem_tests PRIVATE
    siem_core
    Catch2::Catch2WithMain
)

include(CTest)
include(Catch)
catch_discover_tests(siem_tests)

# Install targets
install(TARGETS siemd seed_demo_data DESTINATION bin)
install(DIRECTORY config/ DESTINATION etc/siem)
install(DIRECTORY ui/static/ DESTINATION share/siem/ui)


