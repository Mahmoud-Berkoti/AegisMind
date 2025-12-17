#include "storage/change_stream.hpp"
#include <spdlog/spdlog.h>
#include <bsoncxx/builder/stream/document.hpp>
#include <bsoncxx/json.hpp>

using bsoncxx::builder::stream::document;
using bsoncxx::builder::stream::finalize;

namespace siem::storage {

ChangeStreamWatcher::ChangeStreamWatcher(MongoStorage& storage) : storage_(storage) {}

ChangeStreamWatcher::~ChangeStreamWatcher() {
    stop();
}

void ChangeStreamWatcher::start(ChangeCallback callback) {
    if (running_.load()) {
        spdlog::warn(R"({{"msg":"change_stream_already_running"}})");
        return;
    }
    
    callback_ = callback;
    running_.store(true);
    
    watch_thread_ = std::make_unique<std::thread>([this]() { watch_loop(); });
    
    spdlog::info(R"({{"msg":"change_stream_started"}})");
}

void ChangeStreamWatcher::stop() {
    if (!running_.load()) return;
    
    running_.store(false);
    
    if (watch_thread_ && watch_thread_->joinable()) {
        watch_thread_->join();
    }
    
    spdlog::info(R"({{"msg":"change_stream_stopped"}})");
}

void ChangeStreamWatcher::watch_loop() {
    while (running_.load()) {
        try {
            auto client = storage_.get_client();
            auto db = client[storage_.get_db_name()];
            auto collection = db["incidents"];
            
            // Create pipeline for change stream
            mongocxx::pipeline pipeline;
            document filter;
            filter << "operationType" << document{}
                   << "$in" << bsoncxx::builder::stream::open_array
                       << "insert" << "update" << "replace"
                   << bsoncxx::builder::stream::close_array
                   << bsoncxx::builder::stream::close_document;
            
            pipeline.match(filter.view());
            
            // Set options for full document
            mongocxx::options::change_stream opts;
            opts.full_document("updateLookup");
            
            auto stream = collection.watch(pipeline, opts);
            
            spdlog::info(R"({{"msg":"change_stream_connected"}})");
            
            for (const auto& change : stream) {
                if (!running_.load()) break;
                
                try {
                    auto json_str = bsoncxx::to_json(change);
                    auto j = json::parse(json_str);
                    
                    // Extract operation type and document
                    std::string op_type = j.value("operationType", "unknown");
                    json doc;
                    
                    if (j.contains("fullDocument")) {
                        doc = j["fullDocument"];
                    } else if (j.contains("documentKey")) {
                        // For deletes, only have the key
                        doc = j["documentKey"];
                    }
                    
                    // Build notification
                    json notification;
                    notification["type"] = "incident." + op_type;
                    notification["doc"] = doc;
                    notification["timestamp"] = std::chrono::system_clock::to_time_t(
                        std::chrono::system_clock::now());
                    
                    // Invoke callback
                    if (callback_) {
                        callback_(notification);
                    }
                    
                } catch (const std::exception& e) {
                    spdlog::warn(R"({{"msg":"change_process_error","error":"{}"}})", e.what());
                }
            }
            
        } catch (const std::exception& e) {
            spdlog::error(R"({{"msg":"change_stream_error","error":"{}"}})", e.what());
            
            if (running_.load()) {
                // Reconnect after delay
                std::this_thread::sleep_for(std::chrono::seconds(5));
                spdlog::info(R"({{"msg":"change_stream_reconnecting"}})");
            }
        }
    }
}

} // namespace siem::storage

