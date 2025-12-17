#include "ingest/file_ingestor.hpp"
#include <spdlog/spdlog.h>
#include <fstream>
#include <sstream>

namespace siem::ingest {

void FileIngestor::ingest_file(const std::string& filepath, EventCallback callback) {
    std::ifstream file(filepath);
    if (!file.is_open()) {
        spdlog::error(R"({{"msg":"file_open_failed","path":"{}"}})", filepath);
        throw std::runtime_error("Failed to open file: " + filepath);
    }
    
    std::stringstream buffer;
    buffer << file.rdbuf();
    std::string content = buffer.str();
    
    try {
        auto events = parse_json(content);
        if (!events.empty()) {
            process_batch(events, callback);
            spdlog::info(R"({{"msg":"file_ingested","path":"{}","count":{}}})", 
                        filepath, events.size());
        }
    } catch (const std::exception& e) {
        spdlog::error(R"({{"msg":"file_parse_error","path":"{}","error":"{}"}})", 
                     filepath, e.what());
        throw;
    }
}

std::vector<json> FileIngestor::parse_json(const std::string& json_str) {
    std::vector<json> events;
    
    try {
        auto parsed = json::parse(json_str);
        
        if (parsed.is_array()) {
            for (const auto& item : parsed) {
                if (item.is_object()) {
                    events.push_back(item);
                }
            }
        } else if (parsed.is_object()) {
            events.push_back(parsed);
        }
    } catch (const json::exception& e) {
        spdlog::error(R"({{"msg":"json_parse_error","error":"{}"}})", e.what());
        throw;
    }
    
    return events;
}

void FileIngestor::process_batch(const std::vector<json>& batch, EventCallback callback) {
    if (callback && !batch.empty()) {
        callback(batch);
    }
}

} // namespace siem::ingest

