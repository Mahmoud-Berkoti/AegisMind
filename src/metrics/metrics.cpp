#include "metrics/metrics.hpp"
#include <spdlog/spdlog.h>

namespace siem::metrics {

MetricsCollector::MetricsCollector(storage::MongoStorage& storage) : storage_(storage) {}

void MetricsCollector::increment(const std::string& name, const json& labels) {
    std::string key = make_key(name, labels);
    
    std::lock_guard<std::mutex> lock(mutex_);
    counters_[key].value.fetch_add(1, std::memory_order_relaxed);
}

void MetricsCollector::gauge(const std::string& name, double value, const json& labels) {
    storage::MetricPoint metric;
    metric.ts = std::chrono::system_clock::now();
    metric.name = name;
    metric.value = value;
    metric.labels = labels;
    
    std::lock_guard<std::mutex> lock(mutex_);
    pending_metrics_.push_back(metric);
}

void MetricsCollector::histogram(const std::string& name, double value, const json& labels) {
    storage::MetricPoint metric;
    metric.ts = std::chrono::system_clock::now();
    metric.name = name + "_seconds";
    metric.value = value;
    metric.labels = labels;
    
    std::lock_guard<std::mutex> lock(mutex_);
    pending_metrics_.push_back(metric);
}

uint64_t MetricsCollector::get_counter(const std::string& name) const {
    std::lock_guard<std::mutex> lock(mutex_);
    auto it = counters_.find(name);
    if (it != counters_.end()) {
        return it->second.value.load(std::memory_order_relaxed);
    }
    return 0;
}

void MetricsCollector::flush() {
    std::vector<storage::MetricPoint> to_flush;
    
    {
        std::lock_guard<std::mutex> lock(mutex_);
        to_flush = std::move(pending_metrics_);
        pending_metrics_.clear();
        
        // Also flush counters as metrics
        for (const auto& [key, counter] : counters_) {
            storage::MetricPoint metric;
            metric.ts = std::chrono::system_clock::now();
            metric.name = key;
            metric.value = counter.value.load(std::memory_order_relaxed);
            metric.labels = json::object();
            to_flush.push_back(metric);
        }
    }
    
    // Write to database
    for (const auto& metric : to_flush) {
        try {
            storage_.insert_metric(metric);
        } catch (const std::exception& e) {
            spdlog::warn(R"({{"msg":"metric_insert_error","error":"{}"}})", e.what());
        }
    }
    
    if (!to_flush.empty()) {
        spdlog::debug(R"({{"msg":"metrics_flushed","count":{}}})", to_flush.size());
    }
}

std::string MetricsCollector::make_key(const std::string& name, const json& labels) const {
    if (labels.empty()) return name;
    return name + "_" + labels.dump();
}

// ScopedTimer implementation
ScopedTimer::ScopedTimer(MetricsCollector& collector, const std::string& name, const json& labels)
    : collector_(collector), name_(name), labels_(labels)
    , start_(std::chrono::steady_clock::now()) {}

ScopedTimer::~ScopedTimer() {
    auto end = std::chrono::steady_clock::now();
    auto duration = std::chrono::duration<double>(end - start_).count();
    collector_.histogram(name_, duration, labels_);
}

} // namespace siem::metrics

