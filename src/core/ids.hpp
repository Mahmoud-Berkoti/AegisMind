#pragma once

#include <string>
#include <chrono>
#include <random>
#include <array>

namespace siem::core {

/**
 * ID generation utilities for incidents and clusters
 */
class IDGenerator {
public:
    /**
     * Generate incident ID: "inc_" + base36(timestamp) + random
     * Example: inc_lx9k3m2p
     */
    static std::string generate_incident_id();

    /**
     * Generate cluster ID from fingerprint hash
     * Example: clu_9f2a8b3c
     */
    static std::string generate_cluster_id(const std::string& fingerprint);

    /**
     * Generate trace ID for distributed tracing
     * Example: c3e1f4a2b7d8e9f0
     */
    static std::string generate_trace_id();

private:
    static std::string base36_encode(uint64_t value);
    static uint32_t murmur3_hash(const std::string& key);
    static std::mt19937_64& get_rng();
};

} // namespace siem::core


