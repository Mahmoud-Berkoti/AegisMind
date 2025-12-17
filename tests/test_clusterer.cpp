#include <catch2/catch_test_macros.hpp>
#include <catch2/catch_approx.hpp>
#include "core/incident_clusterer.hpp"

using namespace siem::core;
using namespace siem::storage;

TEST_CASE("IncidentClusterer assigns clusters", "[clusterer]") {
    IncidentClusterer::Config config;
    config.window_seconds = 120;
    config.similarity_threshold = 0.75;
    
    IncidentClusterer clusterer(config);
    
    SECTION("Events with same fingerprint get same cluster") {
        std::vector<storage::Event> events(2);
        events[0].fingerprint = "abc123";
        events[0].ts = std::chrono::system_clock::now();
        events[0].features = {{"verb_deny", 1}, {"proto_tcp", 1}};
        
        events[1].fingerprint = "abc123";
        events[1].ts = std::chrono::system_clock::now();
        events[1].features = {{"verb_deny", 1}, {"proto_tcp", 1}};
        
        clusterer.assign_clusters(events);
        
        REQUIRE(events[0].cluster_id.has_value());
        REQUIRE(events[1].cluster_id.has_value());
        REQUIRE(*events[0].cluster_id == *events[1].cluster_id);
    }
    
    SECTION("Events with different fingerprints get different clusters") {
        std::vector<storage::Event> events(2);
        events[0].fingerprint = "abc123";
        events[0].ts = std::chrono::system_clock::now();
        events[0].features = {{"verb_deny", 1}};
        
        events[1].fingerprint = "xyz789";
        events[1].ts = std::chrono::system_clock::now();
        events[1].features = {{"verb_allow", 1}};
        
        clusterer.assign_clusters(events);
        
        REQUIRE(events[0].cluster_id.has_value());
        REQUIRE(events[1].cluster_id.has_value());
        REQUIRE(*events[0].cluster_id != *events[1].cluster_id);
    }
}

TEST_CASE("Similarity metrics", "[clusterer]") {
    SECTION("Jaccard similarity") {
        json f1 = {{"a", 1}, {"b", 1}, {"c", 1}};
        json f2 = {{"b", 1}, {"c", 1}, {"d", 1}};
        
        double sim = IncidentClusterer::jaccard_similarity(f1, f2);
        
        // Intersection: {b, c} = 2
        // Union: {a, b, c, d} = 4
        // Similarity: 2/4 = 0.5
        REQUIRE(sim == Catch::Approx(0.5).epsilon(0.01));
    }
    
    SECTION("Cosine similarity") {
        json f1 = {{"a", 1.0}, {"b", 1.0}};
        json f2 = {{"a", 1.0}, {"b", 1.0}};
        
        double sim = IncidentClusterer::cosine_similarity(f1, f2);
        
        REQUIRE(sim == Catch::Approx(1.0).epsilon(0.01));
    }
}

