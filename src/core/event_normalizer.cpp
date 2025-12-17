#include "core/event_normalizer.hpp"
#include "core/ids.hpp"
#include <spdlog/spdlog.h>
#include <sstream>
#include <iomanip>
#include <openssl/sha.h>

namespace siem::core {

EventNormalizer::EventNormalizer() {
    allowed_fields_ = {
        "ts", "source", "host", "entity", "verb", "object", "outcome",
        "proto", "dport", "sport", "bytes", "user", "ip"
    };
    
    secret_fields_ = {
        "password", "token", "api_key", "secret", "credential"
    };
}

std::vector<storage::Event> EventNormalizer::normalize_batch(const std::vector<json>& raw_events) {
    std::vector<storage::Event> events;
    events.reserve(raw_events.size());
    
    for (const auto& raw : raw_events) {
        try {
            events.push_back(normalize(raw));
        } catch (const std::exception& e) {
            spdlog::warn(R"({{"msg":"normalization_failed","error":"{}"}})", e.what());
        }
    }
    
    return events;
}

storage::Event EventNormalizer::normalize(const json& raw_event) {
    storage::Event event;
    
    // Parse timestamp
    if (raw_event.contains("ts") && raw_event["ts"].is_string()) {
        std::string ts_str = raw_event["ts"];
        std::tm tm = {};
        std::istringstream ss(ts_str);
        ss >> std::get_time(&tm, "%Y-%m-%dT%H:%M:%S");
        auto tp = std::chrono::system_clock::from_time_t(std::mktime(&tm));
        event.ts = tp;
    } else {
        event.ts = std::chrono::system_clock::now();
    }
    
    // Required fields
    event.source = get_string_or_default(raw_event, "source", "unknown");
    event.host = get_string_or_default(raw_event, "host", "unknown");
    event.trace_id = IDGenerator::generate_trace_id();
    
    // Build features
    json features;
    if (raw_event.contains("verb")) features["verb"] = raw_event["verb"];
    if (raw_event.contains("outcome")) features["outcome"] = raw_event["outcome"];
    
    if (raw_event.contains("object") && raw_event["object"].is_object()) {
        const auto& obj = raw_event["object"];
        if (obj.contains("proto")) features["proto"] = obj["proto"];
        if (obj.contains("dport")) features["dport"] = obj["dport"];
        if (obj.contains("sport")) features["sport"] = obj["sport"];
        if (obj.contains("user")) features["user"] = obj["user"];
    }
    
    if (raw_event.contains("entity") && raw_event["entity"].is_object()) {
        const auto& entity = raw_event["entity"];
        if (entity.contains("ip")) features["ip"] = entity["ip"];
        if (entity.contains("user")) features["user"] = entity["user"];
    }
    
    redact_secrets(features);
    event.features = features;
    
    // Compute fingerprint
    event.fingerprint = compute_fingerprint(event);
    
    return event;
}

std::string EventNormalizer::compute_fingerprint(const storage::Event& event) const {
    std::ostringstream oss;
    oss << event.source << ":"
        << event.host << ":";
    
    if (event.features.contains("ip")) {
        oss << event.features["ip"].get<std::string>();
    } else {
        oss << "none";
    }
    oss << ":";
    
    if (event.features.contains("proto")) {
        oss << event.features["proto"].get<std::string>();
    } else {
        oss << "none";
    }
    oss << ":";
    
    if (event.features.contains("dport")) {
        oss << event.features["dport"].get<int>();
    } else {
        oss << "0";
    }
    
    std::string raw = oss.str();
    
    // SHA256 hash
    unsigned char hash[SHA256_DIGEST_LENGTH];
    SHA256(reinterpret_cast<const unsigned char*>(raw.c_str()), raw.size(), hash);
    
    std::ostringstream hex;
    for (int i = 0; i < 8; ++i) {
        hex << std::hex << std::setw(2) << std::setfill('0') << static_cast<int>(hash[i]);
    }
    
    return hex.str();
}

json EventNormalizer::extract_features(const storage::Event& event) const {
    // Return one-hot encoded features for clustering
    json features;
    
    if (event.features.contains("verb")) {
        features["verb_" + event.features["verb"].get<std::string>()] = 1;
    }
    if (event.features.contains("proto")) {
        features["proto_" + event.features["proto"].get<std::string>()] = 1;
    }
    if (event.features.contains("outcome")) {
        features["outcome_" + event.features["outcome"].get<std::string>()] = 1;
    }
    
    return features;
}

void EventNormalizer::redact_secrets(json& obj) {
    if (!obj.is_object()) return;
    
    for (auto it = obj.begin(); it != obj.end(); ++it) {
        if (secret_fields_.count(it.key())) {
            it.value() = "***REDACTED***";
        } else if (it.value().is_object()) {
            redact_secrets(it.value());
        }
    }
}

std::string EventNormalizer::get_string_or_default(
    const json& j, const std::string& key, const std::string& default_val) const {
    if (j.contains(key) && j[key].is_string()) {
        return j[key].get<std::string>();
    }
    return default_val;
}

} // namespace siem::core


