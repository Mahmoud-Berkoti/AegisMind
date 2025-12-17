#include "core/incident_clusterer.hpp"
#include "core/ids.hpp"
#include "core/event_normalizer.hpp"
#include <spdlog/spdlog.h>
#include <cmath>
#include <set>

namespace siem::core {

IncidentClusterer::IncidentClusterer(Config config) : config_(config) {}

void IncidentClusterer::assign_clusters(std::vector<storage::Event>& events) {
    cleanup_old_clusters();
    
    EventNormalizer normalizer;
    
    for (auto& event : events) {
        json features = normalizer.extract_features(event);
        std::string cluster_id = find_or_create_cluster(event, features);
        event.cluster_id = cluster_id;
    }
}

std::string IncidentClusterer::find_or_create_cluster(
    const storage::Event& event, const json& features) {
    
    double best_similarity = 0.0;
    std::string best_cluster_id;
    
    // Find most similar active cluster
    for (const auto& [cid, cluster] : active_clusters_) {
        if (cluster.fingerprint != event.fingerprint) continue;
        
        double sim = jaccard_similarity(features, cluster.centroid);
        if (sim > best_similarity) {
            best_similarity = sim;
            best_cluster_id = cid;
        }
    }
    
    // Use existing cluster if similarity exceeds threshold
    if (best_similarity >= config_.similarity_threshold && !best_cluster_id.empty()) {
        auto& cluster = active_clusters_[best_cluster_id];
        cluster.event_count++;
        cluster.last_updated = event.ts;
        
        // Update centroid (simple average)
        for (auto& [key, val] : features.items()) {
            if (val.is_number() && cluster.centroid.contains(key)) {
                double old_val = cluster.centroid[key].get<double>();
                cluster.centroid[key] = (old_val * (cluster.event_count - 1) + val.get<double>()) / cluster.event_count;
            } else if (!cluster.centroid.contains(key)) {
                cluster.centroid[key] = val;
            }
        }
        
        return best_cluster_id;
    }
    
    // Create new cluster
    std::string new_cluster_id = IDGenerator::generate_cluster_id(event.fingerprint);
    
    Cluster new_cluster;
    new_cluster.id = new_cluster_id;
    new_cluster.fingerprint = event.fingerprint;
    new_cluster.centroid = features;
    new_cluster.last_updated = event.ts;
    new_cluster.event_count = 1;
    
    active_clusters_[new_cluster_id] = new_cluster;
    
    return new_cluster_id;
}

void IncidentClusterer::cleanup_old_clusters() {
    auto now = std::chrono::system_clock::now();
    auto window = std::chrono::seconds(config_.window_seconds);
    
    for (auto it = active_clusters_.begin(); it != active_clusters_.end(); ) {
        if (now - it->second.last_updated > window) {
            it = active_clusters_.erase(it);
        } else {
            ++it;
        }
    }
}

double IncidentClusterer::jaccard_similarity(const json& f1, const json& f2) {
    if (!f1.is_object() || !f2.is_object()) return 0.0;
    
    std::set<std::string> keys1, keys2;
    for (auto& [key, _] : f1.items()) keys1.insert(key);
    for (auto& [key, _] : f2.items()) keys2.insert(key);
    
    if (keys1.empty() && keys2.empty()) return 1.0;
    
    std::set<std::string> intersection, union_set;
    std::set_intersection(keys1.begin(), keys1.end(), keys2.begin(), keys2.end(),
                         std::inserter(intersection, intersection.begin()));
    std::set_union(keys1.begin(), keys1.end(), keys2.begin(), keys2.end(),
                  std::inserter(union_set, union_set.begin()));
    
    if (union_set.empty()) return 0.0;
    
    return static_cast<double>(intersection.size()) / union_set.size();
}

double IncidentClusterer::cosine_similarity(const json& f1, const json& f2) {
    if (!f1.is_object() || !f2.is_object()) return 0.0;
    
    double dot = 0.0, mag1 = 0.0, mag2 = 0.0;
    
    for (auto& [key, val] : f1.items()) {
        if (!val.is_number()) continue;
        double v1 = val.get<double>();
        mag1 += v1 * v1;
        
        if (f2.contains(key) && f2[key].is_number()) {
            double v2 = f2[key].get<double>();
            dot += v1 * v2;
        }
    }
    
    for (auto& [key, val] : f2.items()) {
        if (!val.is_number()) continue;
        double v2 = val.get<double>();
        mag2 += v2 * v2;
    }
    
    if (mag1 == 0.0 || mag2 == 0.0) return 0.0;
    
    return dot / (std::sqrt(mag1) * std::sqrt(mag2));
}

} // namespace siem::core


