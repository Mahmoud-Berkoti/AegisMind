#pragma once

#include "storage/schemas.hpp"
#include <string>
#include <vector>
#include <functional>

namespace siem::ingest {

using json = nlohmann::json;

/**
 * Ingests events from JSON files or streams
 */
class FileIngestor {
public:
    using EventCallback = std::function<void(const std::vector<json>&)>;

    FileIngestor() = default;

    /**
     * Ingest events from JSON file
     * Supports both single object and array of objects
     */
    void ingest_file(const std::string& filepath, EventCallback callback);

    /**
     * Parse JSON string and extract events
     */
    std::vector<json> parse_json(const std::string& json_str);

private:
    void process_batch(const std::vector<json>& batch, EventCallback callback);
};

} // namespace siem::ingest

