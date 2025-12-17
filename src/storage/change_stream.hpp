#pragma once

#include "storage/mongo.hpp"
#include <mongocxx/change_stream.hpp>
#include <functional>
#include <atomic>
#include <thread>
#include <memory>

namespace siem::storage {

/**
 * MongoDB change stream watcher for real-time incident updates
 */
class ChangeStreamWatcher {
public:
    using ChangeCallback = std::function<void(const json&)>;

    explicit ChangeStreamWatcher(MongoStorage& storage);
    ~ChangeStreamWatcher();

    /**
     * Start watching incidents collection
     */
    void start(ChangeCallback callback);

    /**
     * Stop watching
     */
    void stop();

    /**
     * Check if running
     */
    bool is_running() const { return running_.load(); }

private:
    MongoStorage& storage_;
    std::atomic<bool> running_{false};
    std::unique_ptr<std::thread> watch_thread_;
    ChangeCallback callback_;

    void watch_loop();
};

} // namespace siem::storage

