#include "audit/auditor.hpp"
#include <spdlog/spdlog.h>

namespace siem::audit {

Auditor::Auditor(storage::MongoStorage& storage) : storage_(storage) {}

void Auditor::log_state_change(
    const std::string& actor,
    const std::string& incident_id,
    const json& before,
    const json& after) {
    
    storage::AuditEntry entry;
    entry.ts = std::chrono::system_clock::now();
    entry.actor = actor;
    entry.action = "update_status";
    entry.incident_id = incident_id;
    entry.before = before;
    entry.after = after;
    
    storage_.insert_audit(entry);
    
    spdlog::info(R"({{"msg":"audit_logged","actor":"{}","incident_id":"{}","action":"{}"}})",
                actor, incident_id, entry.action);
}

void Auditor::log_action(
    const std::string& actor,
    const std::string& action,
    const json& details) {
    
    storage::AuditEntry entry;
    entry.ts = std::chrono::system_clock::now();
    entry.actor = actor;
    entry.action = action;
    entry.incident_id = details.value("incident_id", "");
    entry.before = json::object();
    entry.after = details;
    
    storage_.insert_audit(entry);
    
    spdlog::info(R"({{"msg":"audit_logged","actor":"{}","action":"{}"}})",
                actor, action);
}

} // namespace siem::audit

