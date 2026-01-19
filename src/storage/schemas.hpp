#pragma once

#include <string>
#include <vector>
#include <map>
#include <chrono>
#include <optional>
#include <nlohmann/json.hpp>

namespace siem::storage {

using json = nlohmann::json;
using timestamp_t = std::chrono::system_clock::time_point;

enum class Severity {
    Low,
    Medium,
    High,
    Critical
};

enum class IncidentStatus {
    Open,
    Acknowledged,
    Closed
};

enum class AlertAction {
    Block,
    Notify,
    Isolate
};

inline std::string to_string(Severity s) {
    switch (s) {
        case Severity::Low: return "low";
        case Severity::Medium: return "medium";
        case Severity::High: return "high";
        case Severity::Critical: return "critical";
    }
    return "low";
}

inline std::string to_string(IncidentStatus s) {
    switch (s) {
        case IncidentStatus::Open: return "open";
        case IncidentStatus::Acknowledged: return "ack";
        case IncidentStatus::Closed: return "closed";
    }
    return "open";
}

inline std::string to_string(AlertAction a) {
    switch (a) {
        case AlertAction::Block: return "block";
        case AlertAction::Notify: return "notify";
        case AlertAction::Isolate: return "isolate";
    }
    return "notify";
}

inline Severity severity_from_string(const std::string& s) {
    if (s == "critical") return Severity::Critical;
    if (s == "high") return Severity::High;
    if (s == "medium") return Severity::Medium;
    return Severity::Low;
}

inline IncidentStatus status_from_string(const std::string& s) {
    if (s == "ack") return IncidentStatus::Acknowledged;
    if (s == "closed") return IncidentStatus::Closed;
    return IncidentStatus::Open;
}

/**
 * Normalized security event
 */
struct Event {
    timestamp_t ts;
    std::string source;           // fw, ids, app
    std::string host;
    std::string trace_id;
    std::string fingerprint;
    json features;                // proto, dport, bytes, etc.
    std::optional<std::string> cluster_id;
    std::optional<std::string> incident_id;
    
    json to_json() const;
    static Event from_json(const json& j);
};

/**
 * Incident representing clustered events
 */
struct Incident {
    std::string id;
    IncidentStatus status;
    std::string title;
    Severity severity;
    json entity;                  // host, ip, user
    std::vector<std::string> cluster_ids;
    std::map<std::string, double> scores;  // anomaly, confidence
    timestamp_t created_at;
    timestamp_t updated_at;
    timestamp_t last_event_ts;
    
    json to_json() const;
    static Incident from_json(const json& j);
};

/**
 * Alert triggered by incident
 */
struct Alert {
    std::string incident_id;
    timestamp_t ts;
    AlertAction action;
    std::string reason;
    std::string result;           // success, failed
    
    json to_json() const;
};

/**
 * Audit trail entry
 */
struct AuditEntry {
    timestamp_t ts;
    std::string actor;
    std::string action;
    std::string incident_id;
    json before;
    json after;
    
    json to_json() const;
};

/**
 * Metric data point
 */
struct MetricPoint {
    timestamp_t ts;
    std::string name;
    double value;
    json labels;
    
    json to_json() const;
};

} // namespace siem::storage


