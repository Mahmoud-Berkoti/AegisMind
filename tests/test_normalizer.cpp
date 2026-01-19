#include <catch2/catch_test_macros.hpp>
#include "core/event_normalizer.hpp"

using namespace siem::core;

TEST_CASE("EventNormalizer normalizes events", "[normalizer]") {
    EventNormalizer normalizer;
    
    SECTION("Basic event normalization") {
        json raw_event = {
            {"ts", "2025-11-07T23:00:01Z"},
            {"source", "fw"},
            {"host", "edge-01"},
            {"entity", {{"ip", "10.0.0.7"}}},
            {"verb", "deny"},
            {"object", {{"proto", "tcp"}, {"dport", 22}}},
            {"outcome", "block"}
        };
        
        auto event = normalizer.normalize(raw_event);
        
        REQUIRE(event.source == "fw");
        REQUIRE(event.host == "edge-01");
        REQUIRE(event.features.contains("verb"));
        REQUIRE(event.features["verb"] == "deny");
        REQUIRE(event.features.contains("proto"));
        REQUIRE(event.features["proto"] == "tcp");
        REQUIRE(!event.fingerprint.empty());
    }
    
    SECTION("Secret redaction") {
        json raw_event = {
            {"ts", "2025-11-07T23:00:01Z"},
            {"source", "app"},
            {"host", "web-01"},
            {"password", "secret123"}
        };
        
        auto event = normalizer.normalize(raw_event);
        // Password should not appear in features
        REQUIRE_FALSE(event.features.contains("password"));
    }
    
    SECTION("Fingerprint computation") {
        json raw1 = {
            {"source", "fw"},
            {"host", "edge-01"},
            {"entity", {{"ip", "10.0.0.7"}}},
            {"object", {{"proto", "tcp"}, {"dport", 22}}}
        };
        
        json raw2 = {
            {"source", "fw"},
            {"host", "edge-01"},
            {"entity", {{"ip", "10.0.0.7"}}},
            {"object", {{"proto", "tcp"}, {"dport", 22}}}
        };
        
        auto event1 = normalizer.normalize(raw1);
        auto event2 = normalizer.normalize(raw2);
        
        REQUIRE(event1.fingerprint == event2.fingerprint);
    }
}

TEST_CASE("EventNormalizer extracts features", "[normalizer]") {
    EventNormalizer normalizer;
    
    json raw_event = {
        {"source", "fw"},
        {"host", "edge-01"},
        {"verb", "deny"},
        {"object", {{"proto", "tcp"}}},
        {"outcome", "block"}
    };
    
    auto event = normalizer.normalize(raw_event);
    auto features = normalizer.extract_features(event);
    
    REQUIRE(features.contains("verb_deny"));
    REQUIRE(features.contains("proto_tcp"));
    REQUIRE(features.contains("outcome_block"));
    REQUIRE(features["verb_deny"] == 1);
}

