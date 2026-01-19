#include <catch2/catch_test_macros.hpp>
#include "core/ids.hpp"
#include <set>

using namespace siem::core;

TEST_CASE("IDGenerator generates unique IDs", "[ids]") {
    SECTION("Incident IDs are unique") {
        std::set<std::string> ids;
        
        for (int i = 0; i < 1000; ++i) {
            auto id = IDGenerator::generate_incident_id();
            REQUIRE(id.starts_with("inc_"));
            REQUIRE(ids.find(id) == ids.end()); // Unique
            ids.insert(id);
        }
        
        REQUIRE(ids.size() == 1000);
    }
    
    SECTION("Cluster IDs are deterministic") {
        std::string fingerprint = "test_fingerprint_123";
        
        auto id1 = IDGenerator::generate_cluster_id(fingerprint);
        auto id2 = IDGenerator::generate_cluster_id(fingerprint);
        
        REQUIRE(id1 == id2);
        REQUIRE(id1.starts_with("clu_"));
    }
    
    SECTION("Trace IDs are unique") {
        std::set<std::string> ids;
        
        for (int i = 0; i < 100; ++i) {
            auto id = IDGenerator::generate_trace_id();
            REQUIRE(id.size() == 16); // 16 hex chars
            ids.insert(id);
        }
        
        REQUIRE(ids.size() == 100);
    }
}

