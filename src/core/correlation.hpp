#pragma once

#include "storage/schemas.hpp"
#include <vector>
#include <map>
#include <string>

namespace siem::core {

/**
 * Correlates clustered events into incidents
 * Groups by entity (ip/host) and assigns severity
 */
class CorrelationEngine {
public:
    struct Config {
        int window_seconds = 120;
    };

    explicit CorrelationEngine(Config config);

    /**
     * Correlate events and update/create incidents
     * Returns list of incident IDs affected
     */
    std::vector<std::string> correlate_events(
        const std::vector<storage::Event>& events,
        std::map<std::string, storage::Incident>& incidents);

    /**
     * Determine severity based on event patterns
     */
    static storage::Severity determine_severity(
        const std::vector<storage::Event>& related_events);

    /**
     * Generate incident title from events
     */
    static std::string generate_title(const std::vector<storage::Event>& events);

private:
    Config config_;

    std::string extract_entity_key(const storage::Event& event) const;
};

} // namespace siem::core


