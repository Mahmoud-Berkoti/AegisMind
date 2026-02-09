#include "storage/mongo.hpp"
#include "core/event_normalizer.hpp"
#include "core/incident_clusterer.hpp"
#include "core/correlation.hpp"
#include <nlohmann/json.hpp>
#include <iostream>
#include <thread>
#include <chrono>

using namespace siem;
using json = nlohmann::json;

void seed_firewall_events(storage::MongoStorage& storage,
                          core::EventNormalizer& normalizer,
                          core::IncidentClusterer& clusterer,
                          core::CorrelationEngine& correlator) {
    
    std::map<std::string, storage::Incident> incidents;
    
    std::cout << "Seeding firewall deny events (SSH brute force simulation)...\n";
    
    for (int i = 0; i < 15; ++i) {
        auto now = std::chrono::system_clock::now();
        auto ts = now + std::chrono::seconds(i);
        
        json raw_event = {
            {"ts", std::chrono::system_clock::to_time_t(ts)},
            {"source", "fw"},
            {"host", "edge-01"},
            {"entity", {{"ip", "10.0.0.7"}}},
            {"verb", "deny"},
            {"object", {{"proto", "tcp"}, {"dport", 22}, {"bytes", 184}}},
            {"outcome", "block"}
        };
        
        auto events = normalizer.normalize_batch({raw_event});
        clusterer.assign_clusters(events);
        
        auto affected = correlator.correlate_events(events, incidents);
        
        storage.insert_events(events);
        
        for (const auto& inc_id : affected) {
            if (incidents.count(inc_id)) {
                storage.upsert_incident(incidents[inc_id]);
                std::cout << "  Created/Updated incident: " << inc_id << "\n";
            }
        }
        
        std::this_thread::sleep_for(std::chrono::milliseconds(200));
    }
}

void seed_app_auth_failures(storage::MongoStorage& storage,
                            core::EventNormalizer& normalizer,
                            core::IncidentClusterer& clusterer,
                            core::CorrelationEngine& correlator) {
    
    std::map<std::string, storage::Incident> incidents;
    
    std::cout << "Seeding app auth failures...\n";
    
    for (int i = 0; i < 8; ++i) {
        auto now = std::chrono::system_clock::now();
        auto ts = now + std::chrono::seconds(i * 5);
        
        json raw_event = {
            {"ts", std::chrono::system_clock::to_time_t(ts)},
            {"source", "app"},
            {"host", "web-02"},
            {"entity", {{"ip", "203.0.113.9"}}},
            {"verb", "auth"},
            {"object", {{"user", "alice"}}},
            {"outcome", "fail"}
        };
        
        auto events = normalizer.normalize_batch({raw_event});
        clusterer.assign_clusters(events);
        
        auto affected = correlator.correlate_events(events, incidents);
        
        storage.insert_events(events);
        
        for (const auto& inc_id : affected) {
            if (incidents.count(inc_id)) {
                storage.upsert_incident(incidents[inc_id]);
                std::cout << "  Created/Updated incident: " << inc_id << "\n";
            }
        }
        
        std::this_thread::sleep_for(std::chrono::milliseconds(200));
    }
}

void seed_anomalous_traffic(storage::MongoStorage& storage,
                            core::EventNormalizer& normalizer,
                            core::IncidentClusterer& clusterer,
                            core::CorrelationEngine& correlator) {
    
    std::map<std::string, storage::Incident> incidents;
    
    std::cout << "Seeding anomalous traffic...\n";
    
    for (int i = 0; i < 6; ++i) {
        auto now = std::chrono::system_clock::now();
        auto ts = now + std::chrono::seconds(i * 3);
        
        json raw_event = {
            {"ts", std::chrono::system_clock::to_time_t(ts)},
            {"source", "ids"},
            {"host", "sensor-03"},
            {"entity", {{"ip", "192.168.1.50"}}},
            {"verb", "upload"},
            {"object", {{"proto", "https"}, {"dport", 443}, {"bytes", 10485760}}},
            {"outcome", "alert"}
        };
        
        auto events = normalizer.normalize_batch({raw_event});
        clusterer.assign_clusters(events);
        
        auto affected = correlator.correlate_events(events, incidents);
        
        storage.insert_events(events);
        
        for (const auto& inc_id : affected) {
            if (incidents.count(inc_id)) {
                // Boost anomaly score for large uploads
                incidents[inc_id].scores["anomaly"] = 0.95;
                incidents[inc_id].severity = storage::Severity::Critical;
                storage.upsert_incident(incidents[inc_id]);
                std::cout << "  Created/Updated incident: " << inc_id << " (CRITICAL)\n";
            }
        }
        
        std::this_thread::sleep_for(std::chrono::milliseconds(200));
    }
}

int main(int argc, char** argv) {
    try {
        std::cout << "=== Cognitive SIEM Demo Data Seeder ===\n\n";
        
        // Initialize MongoDB
        storage::MongoStorage::Config config;
        config.uri = "mongodb://localhost:27017/?replicaSet=rs0";
        config.db_name = "cog_siem";
        
        storage::MongoStorage storage(config);
        storage.initialize();
        
        // Initialize components
        core::EventNormalizer normalizer;
        
        core::IncidentClusterer::Config cluster_config;
        cluster_config.window_seconds = 120;
        cluster_config.similarity_threshold = 0.75;
        core::IncidentClusterer clusterer(cluster_config);
        
        core::CorrelationEngine::Config corr_config;
        corr_config.window_seconds = 120;
        core::CorrelationEngine correlator(corr_config);
        
        // Seed different types of events
        seed_firewall_events(storage, normalizer, clusterer, correlator);
        std::this_thread::sleep_for(std::chrono::seconds(2));
        
        seed_app_auth_failures(storage, normalizer, clusterer, correlator);
        std::this_thread::sleep_for(std::chrono::seconds(2));
        
        seed_anomalous_traffic(storage, normalizer, clusterer, correlator);
        
        std::cout << "\n=== Demo data seeded successfully! ===\n";
        std::cout << "You should now see incidents in the UI.\n";
        
        return 0;
        
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }
}

