#include "core/correlation.hpp"
#include "core/ids.hpp"
#include <spdlog/spdlog.h>
#include <algorithm>
#include <set>

namespace siem::core {

CorrelationEngine::CorrelationEngine(Config config) : config_(config) {}

std::vector<std::string> CorrelationEngine::correlate_events(
    const std::vector<storage::Event>& events,
    std::map<std::string, storage::Incident>& incidents) {
    
    std::vector<std::string> affected_incident_ids;
    
    // Group events by entity
    std::map<std::string, std::vector<storage::Event>> entity_groups;
    for (const auto& event : events) {
        std::string entity_key = extract_entity_key(event);
        entity_groups[entity_key].push_back(event);
    }
    
    auto now = std::chrono::system_clock::now();
    
    for (auto& [entity_key, entity_events] : entity_groups) {
        if (entity_events.empty()) continue;
        
        // Find or create incident for this entity
        std::string incident_id;
        bool found = false;
        
        // Check if any event already has an incident_id
        for (const auto& evt : entity_events) {
            if (evt.incident_id.has_value()) {
                incident_id = *evt.incident_id;
                found = true;
                break;
            }
        }
        
        // Look for existing open incident for this entity
        if (!found) {
            for (auto& [iid, inc] : incidents) {
                if (inc.status == storage::IncidentStatus::Open) {
                    std::string inc_entity_key;
                    if (inc.entity.contains("ip")) {
                        inc_entity_key = inc.entity["ip"].get<std::string>();
                    } else if (inc.entity.contains("host")) {
                        inc_entity_key = inc.entity["host"].get<std::string>();
                    }
                    
                    if (inc_entity_key == entity_key) {
                        incident_id = iid;
                        found = true;
                        break;
                    }
                }
            }
        }
        
        // Create new incident if not found
        if (!found) {
            incident_id = IDGenerator::generate_incident_id();
            
            storage::Incident new_incident;
            new_incident.id = incident_id;
            new_incident.status = storage::IncidentStatus::Open;
            new_incident.title = generate_title(entity_events);
            new_incident.severity = determine_severity(entity_events);
            new_incident.created_at = now;
            new_incident.updated_at = now;
            new_incident.last_event_ts = entity_events.back().ts;
            
            // Set entity from events
            if (entity_events[0].features.contains("ip")) {
                new_incident.entity["ip"] = entity_events[0].features["ip"];
            }
            new_incident.entity["host"] = entity_events[0].host;
            
            // Collect cluster IDs
            std::set<std::string> cluster_set;
            for (const auto& evt : entity_events) {
                if (evt.cluster_id.has_value()) {
                    cluster_set.insert(*evt.cluster_id);
                }
            }
            new_incident.cluster_ids.assign(cluster_set.begin(), cluster_set.end());
            
            // Placeholder scores
            new_incident.scores["anomaly"] = 0.85;
            new_incident.scores["confidence"] = 0.80;
            
            incidents[incident_id] = new_incident;
        } else {
            // Update existing incident
            auto& incident = incidents[incident_id];
            incident.updated_at = now;
            incident.last_event_ts = entity_events.back().ts;
            
            // Add new cluster IDs
            std::set<std::string> cluster_set(incident.cluster_ids.begin(), incident.cluster_ids.end());
            for (const auto& evt : entity_events) {
                if (evt.cluster_id.has_value()) {
                    cluster_set.insert(*evt.cluster_id);
                }
            }
            incident.cluster_ids.assign(cluster_set.begin(), cluster_set.end());
            
            // Re-evaluate severity
            incident.severity = determine_severity(entity_events);
        }
        
        affected_incident_ids.push_back(incident_id);
    }
    
    return affected_incident_ids;
}

std::string CorrelationEngine::extract_entity_key(const storage::Event& event) const {
    if (event.features.contains("ip")) {
        return event.features["ip"].get<std::string>();
    }
    return event.host;
}

storage::Severity CorrelationEngine::determine_severity(
    const std::vector<storage::Event>& related_events) {
    
    int deny_count = 0;
    int fail_count = 0;
    bool has_exfil = false;
    bool has_malware = false;
    
    for (const auto& evt : related_events) {
        if (evt.features.contains("outcome")) {
            std::string outcome = evt.features["outcome"].get<std::string>();
            if (outcome == "deny" || outcome == "block") deny_count++;
            if (outcome == "fail") fail_count++;
        }
        
        if (evt.features.contains("verb")) {
            std::string verb = evt.features["verb"].get<std::string>();
            if (verb == "exfil" || verb == "upload") has_exfil = true;
            if (verb == "malware") has_malware = true;
        }
    }
    
    // Critical: exfil or malware
    if (has_exfil || has_malware) {
        return storage::Severity::Critical;
    }
    
    // High: 10+ failures (brute force)
    if (fail_count >= 10 || deny_count >= 10) {
        return storage::Severity::High;
    }
    
    // Medium: 5+ failures
    if (fail_count >= 5 || deny_count >= 5) {
        return storage::Severity::Medium;
    }
    
    return storage::Severity::Low;
}

std::string CorrelationEngine::generate_title(const std::vector<storage::Event>& events) {
    if (events.empty()) return "Unknown incident";
    
    std::map<std::string, int> verb_counts;
    for (const auto& evt : events) {
        if (evt.features.contains("verb")) {
            std::string verb = evt.features["verb"].get<std::string>();
            verb_counts[verb]++;
        }
    }
    
    // Find most common verb
    std::string most_common_verb = "activity";
    int max_count = 0;
    for (const auto& [verb, count] : verb_counts) {
        if (count > max_count) {
            max_count = count;
            most_common_verb = verb;
        }
    }
    
    std::string source = events[0].source;
    
    if (most_common_verb == "auth" && max_count >= 5) {
        return "SSH brute force attempt";
    } else if (most_common_verb == "deny") {
        return "Repeated access denials";
    } else if (most_common_verb == "exfil") {
        return "Data exfiltration detected";
    }
    
    return most_common_verb + " on " + source;
}

} // namespace siem::core


