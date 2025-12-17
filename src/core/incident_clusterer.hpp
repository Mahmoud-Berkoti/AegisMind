#pragma once

#include "storage/schemas.hpp"
#include <vector>
#include <map>
#include <string>
#include <chrono>
#include <nlohmann/json.hpp>

namespace siem::core {

using json = nlohmann::json;

/**
 * Clusters events into incidents using locality-sensitive hashing
 * and similarity metrics (Jaccard, cosine)
 */
class IncidentClusterer {
public:
    struct Config {
        int window_seconds = 120;
        int min_events = 5;
        double similarity_threshold = 0.75;
    };

    explicit IncidentClusterer(Config config);

    /**
     * Assign cluster_id to events based on fingerprint and features
     */
    void assign_clusters(std::vector<storage::Event>& events);

    /**
     * Calculate Jaccard similarity between two feature sets
     */
    static double jaccard_similarity(const json& f1, const json& f2);

    /**
     * Calculate cosine similarity between two feature vectors
     */
    static double cosine_similarity(const json& f1, const json& f2);

private:
    Config config_;
    
    struct Cluster {
        std::string id;
        std::string fingerprint;
        json centroid;
        std::chrono::system_clock::time_point last_updated;
        int event_count = 0;
    };

    std::map<std::string, Cluster> active_clusters_;

    void cleanup_old_clusters();
    std::string find_or_create_cluster(const storage::Event& event, const json& features);
};

} // namespace siem::core


