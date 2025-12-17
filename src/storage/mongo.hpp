#pragma once

#include "storage/schemas.hpp"
#include <mongocxx/client.hpp>
#include <mongocxx/pool.hpp>
#include <mongocxx/uri.hpp>
#include <memory>
#include <vector>
#include <optional>

namespace siem::storage {

/**
 * MongoDB storage operations for events, incidents, alerts, and audits
 */
class MongoStorage {
public:
    struct Config {
        std::string uri = "mongodb://localhost:27017/?replicaSet=rs0";
        std::string db_name = "cog_siem";
        int retention_days = 14;
    };

    explicit MongoStorage(Config config);
    ~MongoStorage();

    /**
     * Initialize collections, indexes, and time-series
     */
    void initialize();

    /**
     * Insert event batch
     */
    void insert_events(const std::vector<Event>& events);

    /**
     * Upsert incident
     */
    void upsert_incident(const Incident& incident);

    /**
     * Get incident by ID
     */
    std::optional<Incident> get_incident(const std::string& id);

    /**
     * Query incidents with filters
     */
    std::vector<Incident> query_incidents(
        const std::optional<IncidentStatus>& status = std::nullopt,
        int limit = 100,
        const std::optional<std::string>& after_id = std::nullopt);

    /**
     * Insert alert
     */
    void insert_alert(const Alert& alert);

    /**
     * Insert audit entry
     */
    void insert_audit(const AuditEntry& entry);

    /**
     * Insert metric data point
     */
    void insert_metric(const MetricPoint& metric);

    /**
     * Query recent events
     */
    std::vector<Event> query_recent_events(int limit = 100);

    /**
     * Get MongoDB client for change streams
     */
    mongocxx::client get_client();

    /**
     * Get database name
     */
    std::string get_db_name() const { return config_.db_name; }

private:
    Config config_;
    std::unique_ptr<mongocxx::pool> pool_;

    void create_time_series_collection(const std::string& name, const std::string& time_field);
    void create_indexes();
};

} // namespace siem::storage


