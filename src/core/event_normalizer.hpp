#pragma once

#include "storage/schemas.hpp"
#include <nlohmann/json.hpp>
#include <string>
#include <vector>
#include <set>

namespace siem::core {

using json = nlohmann::json;

/**
 * Normalizes raw security events into standard schema
 * - Drops unknown fields
 * - Redacts secrets
 * - Computes fingerprints
 * - Extracts features for clustering
 */
class EventNormalizer {
public:
    EventNormalizer();

    /**
     * Normalize a batch of raw events
     */
    std::vector<storage::Event> normalize_batch(const std::vector<json>& raw_events);

    /**
     * Normalize single event
     */
    storage::Event normalize(const json& raw_event);

    /**
     * Compute fingerprint for event grouping
     * Format: source:host:ip:proto:port
     */
    std::string compute_fingerprint(const storage::Event& event) const;

    /**
     * Extract features for clustering (one-hot encoding)
     */
    json extract_features(const storage::Event& event) const;

private:
    std::set<std::string> allowed_fields_;
    std::set<std::string> secret_fields_;

    void redact_secrets(json& obj);
    std::string get_string_or_default(const json& j, const std::string& key, const std::string& default_val) const;
};

} // namespace siem::core


