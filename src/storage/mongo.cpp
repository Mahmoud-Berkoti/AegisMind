#include "storage/mongo.hpp"
#include <mongocxx/instance.hpp>
#include <bsoncxx/builder/stream/document.hpp>
#include <bsoncxx/json.hpp>
#include <spdlog/spdlog.h>

using bsoncxx::builder::stream::document;
using bsoncxx::builder::stream::open_document;
using bsoncxx::builder::stream::close_document;
using bsoncxx::builder::stream::open_array;
using bsoncxx::builder::stream::close_array;
using bsoncxx::builder::stream::finalize;

namespace siem::storage {

// Ensure mongocxx instance is initialized once
static mongocxx::instance& get_instance() {
    static mongocxx::instance instance{};
    return instance;
}

MongoStorage::MongoStorage(Config config) : config_(config) {
    get_instance(); // Initialize mongocxx
    
    mongocxx::uri uri{config_.uri};
    pool_ = std::make_unique<mongocxx::pool>(uri);
}

MongoStorage::~MongoStorage() = default;

void MongoStorage::initialize() {
    auto client = pool_->acquire();
    auto db = (*client)[config_.db_name];
    
    // Create regular collections (time-series collections disabled to avoid TTL issues)
    try {
        db.create_collection("events_ts");
        db.create_collection("metrics_ts");
    } catch (const std::exception& e) {
        spdlog::warn(R"({{"msg":"collection_exists","error":"{}"}})", e.what());
    }
    
    // Ensure regular collections exist
    db.create_collection("incidents");
    db.create_collection("alerts");
    db.create_collection("audits");
    db.create_collection("models");
    
    create_indexes();
    
    spdlog::info(R"({{"msg":"mongo_initialized","db":"{}","uri":"{}}})", config_.db_name, config_.uri);
}

void MongoStorage::create_time_series_collection(const std::string& name, const std::string& time_field) {
    auto client = pool_->acquire();
    auto db = (*client)[config_.db_name];
    
    document create_cmd;
    create_cmd << "create" << name
               << "timeseries" << open_document
                   << "timeField" << time_field
                   << "metaField" << "host"
                   << "granularity" << "seconds"
               << close_document
               << "expireAfterSeconds" << static_cast<int32_t>(config_.retention_days * 24 * 60 * 60);
    
    db.run_command(create_cmd.view());
}

void MongoStorage::create_indexes() {
    auto client = pool_->acquire();
    auto db = (*client)[config_.db_name];
    
    // Note: TTL for time-series collections is set during collection creation
    // No need to create TTL index separately
    
    // Incidents indexes
    auto incidents = db["incidents"];
    incidents.create_index(document{} << "updated_at" << -1 << finalize);
    incidents.create_index(document{} << "status" << 1 << finalize);
    incidents.create_index(document{} << "entity.host" << 1 << finalize);
    incidents.create_index(document{} << "severity" << 1 << finalize);
    
    // Alerts indexes
    auto alerts = db["alerts"];
    alerts.create_index(document{} << "incident_id" << 1 << finalize);
    alerts.create_index(document{} << "ts" << -1 << finalize);
    
    // Audits indexes
    auto audits = db["audits"];
    audits.create_index(document{} << "incident_id" << 1 << finalize);
    audits.create_index(document{} << "ts" << -1 << finalize);
    
    spdlog::info(R"({{"msg":"indexes_created"}})");
}

void MongoStorage::insert_events(const std::vector<Event>& events) {
    if (events.empty()) return;
    
    auto client = pool_->acquire();
    auto collection = (*client)[config_.db_name]["events_ts"];
    
    std::vector<bsoncxx::document::value> docs;
    docs.reserve(events.size());
    
    for (const auto& event : events) {
        auto json_str = event.to_json().dump();
        docs.push_back(bsoncxx::from_json(json_str));
    }
    
    collection.insert_many(docs);
}

void MongoStorage::upsert_incident(const Incident& incident) {
    auto client = pool_->acquire();
    auto collection = (*client)[config_.db_name]["incidents"];
    
    auto json_str = incident.to_json().dump();
    auto doc = bsoncxx::from_json(json_str);
    
    document filter;
    filter << "_id" << incident.id;
    
    mongocxx::options::update opts;
    opts.upsert(true);
    
    document update;
    update << "$set" << open_document
           << bsoncxx::builder::concatenate(doc.view())
           << close_document;
    
    collection.update_one(filter.view(), update.view(), opts);
}

std::optional<Incident> MongoStorage::get_incident(const std::string& id) {
    auto client = pool_->acquire();
    auto collection = (*client)[config_.db_name]["incidents"];
    
    document filter;
    filter << "_id" << id;
    
    auto result = collection.find_one(filter.view());
    if (!result) return std::nullopt;
    
    auto json_str = bsoncxx::to_json(result->view());
    auto j = json::parse(json_str);
    
    return Incident::from_json(j);
}

std::vector<Incident> MongoStorage::query_incidents(
    const std::optional<IncidentStatus>& status,
    int limit,
    const std::optional<std::string>& after_id) {
    
    auto client = pool_->acquire();
    auto collection = (*client)[config_.db_name]["incidents"];
    
    document filter;
    if (status.has_value()) {
        filter << "status" << to_string(*status);
    }
    if (after_id.has_value()) {
        filter << "_id" << open_document << "$gt" << *after_id << close_document;
    }
    
    mongocxx::options::find opts;
    opts.sort(document{} << "updated_at" << -1 << finalize);
    opts.limit(limit);
    
    auto cursor = collection.find(filter.view(), opts);
    
    std::vector<Incident> incidents;
    for (auto&& doc : cursor) {
        auto json_str = bsoncxx::to_json(doc);
        auto j = json::parse(json_str);
        incidents.push_back(Incident::from_json(j));
    }
    
    return incidents;
}

void MongoStorage::insert_alert(const Alert& alert) {
    auto client = pool_->acquire();
    auto collection = (*client)[config_.db_name]["alerts"];
    
    auto json_str = alert.to_json().dump();
    auto doc = bsoncxx::from_json(json_str);
    
    collection.insert_one(doc.view());
}

void MongoStorage::insert_audit(const AuditEntry& entry) {
    auto client = pool_->acquire();
    auto collection = (*client)[config_.db_name]["audits"];
    
    auto json_str = entry.to_json().dump();
    auto doc = bsoncxx::from_json(json_str);
    
    collection.insert_one(doc.view());
}

void MongoStorage::insert_metric(const MetricPoint& metric) {
    auto client = pool_->acquire();
    auto collection = (*client)[config_.db_name]["metrics_ts"];
    
    auto json_str = metric.to_json().dump();
    auto doc = bsoncxx::from_json(json_str);
    
    collection.insert_one(doc.view());
}

std::vector<Event> MongoStorage::query_recent_events(int limit) {
    auto client = pool_->acquire();
    auto collection = (*client)[config_.db_name]["events_ts"];
    
    std::vector<Event> events;
    
    try {
        // Query events, sorted by timestamp descending
        mongocxx::options::find opts{};
        opts.sort(document{} << "ts" << -1 << finalize);
        opts.limit(limit);
        
        auto cursor = collection.find({}, opts);
        
        for (auto&& doc : cursor) {
            auto json_str = bsoncxx::to_json(doc);
            auto j = json::parse(json_str);
            
            // Convert MongoDB's _id.$date format to timestamp
            if (j.contains("ts") && j["ts"].is_object()) {
                if (j["ts"].contains("$date")) {
                    j["ts"] = j["ts"]["$date"].get<int64_t>() / 1000;
                }
            }
            
            events.push_back(Event::from_json(j));
        }
        
    } catch (const std::exception& e) {
        spdlog::error(R"({{"msg":"query_events_error","error":"{}"}})", e.what());
    }
    
    return events;
}

mongocxx::client MongoStorage::get_client() {
    return mongocxx::client{mongocxx::uri{config_.uri}};
}

// Schema implementations
json Event::to_json() const {
    json j;
    j["ts"] = std::chrono::system_clock::to_time_t(ts);
    j["source"] = source;
    j["host"] = host;
    j["trace_id"] = trace_id;
    j["fingerprint"] = fingerprint;
    j["features"] = features;
    if (cluster_id.has_value()) j["cluster_id"] = *cluster_id;
    if (incident_id.has_value()) j["incident_id"] = *incident_id;
    return j;
}

Event Event::from_json(const json& j) {
    Event e;
    e.ts = std::chrono::system_clock::from_time_t(j.value("ts", 0));
    e.source = j.value("source", "");
    e.host = j.value("host", "");
    e.trace_id = j.value("trace_id", "");
    e.fingerprint = j.value("fingerprint", "");
    e.features = j.value("features", json::object());
    if (j.contains("cluster_id")) e.cluster_id = j["cluster_id"].get<std::string>();
    if (j.contains("incident_id")) e.incident_id = j["incident_id"].get<std::string>();
    return e;
}

json Incident::to_json() const {
    json j;
    j["_id"] = id;
    j["status"] = to_string(status);
    j["title"] = title;
    j["severity"] = to_string(severity);
    j["entity"] = entity;
    j["cluster_ids"] = cluster_ids;
    j["scores"] = scores;
    j["created_at"] = std::chrono::system_clock::to_time_t(created_at);
    j["updated_at"] = std::chrono::system_clock::to_time_t(updated_at);
    j["last_event_ts"] = std::chrono::system_clock::to_time_t(last_event_ts);
    return j;
}

Incident Incident::from_json(const json& j) {
    Incident i;
    i.id = j.value("_id", "");
    i.status = status_from_string(j.value("status", "open"));
    i.title = j.value("title", "");
    i.severity = severity_from_string(j.value("severity", "low"));
    i.entity = j.value("entity", json::object());
    i.cluster_ids = j.value("cluster_ids", std::vector<std::string>{});
    i.scores = j.value("scores", std::map<std::string, double>{});
    i.created_at = std::chrono::system_clock::from_time_t(j.value("created_at", 0));
    i.updated_at = std::chrono::system_clock::from_time_t(j.value("updated_at", 0));
    i.last_event_ts = std::chrono::system_clock::from_time_t(j.value("last_event_ts", 0));
    return i;
}

json Alert::to_json() const {
    json j;
    j["incident_id"] = incident_id;
    j["ts"] = std::chrono::system_clock::to_time_t(ts);
    j["action"] = to_string(action);
    j["reason"] = reason;
    j["result"] = result;
    return j;
}

json AuditEntry::to_json() const {
    json j;
    j["ts"] = std::chrono::system_clock::to_time_t(ts);
    j["actor"] = actor;
    j["action"] = action;
    j["incident_id"] = incident_id;
    j["before"] = before;
    j["after"] = after;
    return j;
}

json MetricPoint::to_json() const {
    json j;
    j["ts"] = std::chrono::system_clock::to_time_t(ts);
    j["name"] = name;
    j["value"] = value;
    j["labels"] = labels;
    return j;
}

} // namespace siem::storage

