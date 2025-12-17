#pragma once

#include "storage/schemas.hpp"
#include "storage/mongo.hpp"
#include <string>
#include <nlohmann/json.hpp>

namespace siem::audit {

using json = nlohmann::json;

/**
 * Audit trail for incident state changes
 */
class Auditor {
public:
    explicit Auditor(storage::MongoStorage& storage);

    /**
     * Log incident state change
     */
    void log_state_change(
        const std::string& actor,
        const std::string& incident_id,
        const json& before,
        const json& after);

    /**
     * Log generic action
     */
    void log_action(
        const std::string& actor,
        const std::string& action,
        const json& details);

private:
    storage::MongoStorage& storage_;
};

} // namespace siem::audit

