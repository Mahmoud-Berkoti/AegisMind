#pragma once

#include "storage/schemas.hpp"
#include "storage/mongo.hpp"
#include <string>
#include <atomic>
#include <map>
#include <mutex>
#include <nlohmann/json.hpp>

namespace siem::metrics {

using json = nlohmann::json;

/**
 * Metrics collector for monitoring system performance
 */
class MetricsCollector {
public:
    explicit MetricsCollector(storage::MongoStorage& storage);

    /**
     * Increment counter
     */
    void increment(const std::string& name, const json& labels = json::object());

    /**
     * Record gauge value
     */
    void gauge(const std::string& name, double value, const json& labels = json::object());

    /**
     * Record histogram/timing value (in seconds)
     */
    void histogram(const std::string& name, double value, const json& labels = json::object());

    /**
     * Get counter value
     */
    uint64_t get_counter(const std::string& name) const;

    /**
     * Flush metrics to database
     */
    void flush();

private:
    storage::MongoStorage& storage_;
    
    struct Counter {
        std::atomic<uint64_t> value{0};
    };
    
    mutable std::mutex mutex_;
    std::map<std::string, Counter> counters_;
    std::vector<storage::MetricPoint> pending_metrics_;
    
    std::string make_key(const std::string& name, const json& labels) const;
};

/**
 * RAII timer for automatic histogram recording
 */
class ScopedTimer {
public:
    ScopedTimer(MetricsCollector& collector, const std::string& name, const json& labels = json::object());
    ~ScopedTimer();

private:
    MetricsCollector& collector_;
    std::string name_;
    json labels_;
    std::chrono::steady_clock::time_point start_;
};

} // namespace siem::metrics

