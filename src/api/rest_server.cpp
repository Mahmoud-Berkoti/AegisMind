#include "api/rest_server.hpp"
#include <spdlog/spdlog.h>
#include <sstream>

namespace siem::api {

RESTServer::RESTServer(
    Config config,
    storage::MongoStorage& storage,
    ingest::HTTPIngestor& http_ingestor)
    : config_(config)
    , storage_(storage)
    , http_ingestor_(http_ingestor)
    , ioc_(std::make_unique<net::io_context>()) {}

RESTServer::~RESTServer() {
    stop();
}

void RESTServer::start(IngestCallback ingest_callback) {
    ingest_callback_ = ingest_callback;
    
    try {
        auto address = net::ip::make_address(config_.bind_address);
        acceptor_ = std::make_unique<tcp::acceptor>(
            *ioc_, tcp::endpoint(address, config_.port));
        
        spdlog::info(R"({{"msg":"rest_server_starting","port":{}}})", config_.port);
        
        do_accept();
        
        thread_ = std::make_unique<std::thread>([this]() {
            ioc_->run();
        });
        
        spdlog::info(R"({{"msg":"rest_server_started","port":{}}})", config_.port);
        
    } catch (const std::exception& e) {
        spdlog::error(R"({{"msg":"rest_start_error","error":"{}"}})", e.what());
        throw;
    }
}

void RESTServer::stop() {
    if (!ioc_) return;
    
    if (acceptor_) {
        acceptor_->close();
    }
    
    ioc_->stop();
    
    if (thread_ && thread_->joinable()) {
        thread_->join();
    }
    
    spdlog::info(R"({{"msg":"rest_server_stopped"}})");
}

void RESTServer::do_accept() {
    acceptor_->async_accept(
        [this](beast::error_code ec, tcp::socket socket) {
            if (!ec) {
                std::thread(&RESTServer::handle_request, this, std::move(socket)).detach();
            }
            
            if (acceptor_->is_open()) {
                do_accept();
            }
        });
}

void RESTServer::handle_request(tcp::socket socket) {
    try {
        beast::flat_buffer buffer;
        http::request<http::string_body> req;
        http::read(socket, buffer, req);
        
        http::response<http::string_body> res;
        
        std::string target = std::string(req.target());
        
        if (req.method() == http::verb::get && target == "/health") {
            res = handle_health();
        } else if (req.method() == http::verb::post && target == "/ingest") {
            res = handle_ingest(req);
        } else if (req.method() == http::verb::get && target.starts_with("/events")) {
            res = handle_get_events(req);
        } else if (req.method() == http::verb::get && target.starts_with("/incidents")) {
            if (target == "/incidents") {
                res = handle_get_incidents(req);
            } else {
                // Extract ID from /incidents/{id}
                std::string id = target.substr(11); // Skip "/incidents/"
                if (!id.empty() && id[0] == '/') id = id.substr(1);
                res = handle_get_incident(id);
            }
        } else {
            res = make_response(http::status::not_found, 
                               R"({"error":"Not found"})");
        }
        
        // Add CORS headers
        res.set(http::field::access_control_allow_origin, "*");
        res.set(http::field::access_control_allow_methods, "GET, POST, OPTIONS");
        res.set(http::field::access_control_allow_headers, "Content-Type, X-Signature");
        
        http::write(socket, res);
        socket.shutdown(tcp::socket::shutdown_send);
        
    } catch (const std::exception& e) {
        spdlog::warn(R"({{"msg":"request_error","error":"{}"}})", e.what());
    }
}

http::response<http::string_body> RESTServer::handle_health() {
    json response;
    response["status"] = "ok";
    response["service"] = "cognitive-siem";
    response["timestamp"] = std::chrono::system_clock::to_time_t(
        std::chrono::system_clock::now());
    
    return make_response(http::status::ok, response.dump());
}

http::response<http::string_body> RESTServer::handle_ingest(
    const http::request<http::string_body>& req) {
    
    try {
        // Verify signature
        auto sig_it = req.find("X-Signature");
        if (sig_it == req.end()) {
            return make_response(http::status::unauthorized,
                               R"({"error":"Missing X-Signature header"})");
        }
        
        std::string signature = std::string(sig_it->value());
        if (!http_ingestor_.verify_signature(req.body(), signature)) {
            spdlog::warn(R"({{"msg":"invalid_signature"}})");
            return make_response(http::status::unauthorized,
                               R"({"error":"Invalid signature"})");
        }
        
        // Parse events
        auto events = http_ingestor_.parse_ingest_request(req.body());
        
        // Invoke callback
        if (ingest_callback_) {
            ingest_callback_(events);
        }
        
        json response;
        response["accepted"] = events.size();
        response["rejected"] = 0;
        
        spdlog::info(R"({{"msg":"ingested","count":{}}})", events.size());
        
        return make_response(http::status::ok, response.dump());
        
    } catch (const std::exception& e) {
        spdlog::error(R"({{"msg":"ingest_error","error":"{}"}})", e.what());
        json response;
        response["error"] = e.what();
        return make_response(http::status::bad_request, response.dump());
    }
}

http::response<http::string_body> RESTServer::handle_get_incidents(
    const http::request<http::string_body>& req) {
    
    try {
        // Parse query parameters (simplified)
        std::optional<storage::IncidentStatus> status;
        int limit = 100;
        std::optional<std::string> after;
        
        // Query incidents
        auto incidents = storage_.query_incidents(status, limit, after);
        
        json response = json::array();
        for (const auto& inc : incidents) {
            response.push_back(inc.to_json());
        }
        
        return make_response(http::status::ok, response.dump());
        
    } catch (const std::exception& e) {
        json response;
        response["error"] = e.what();
        return make_response(http::status::internal_server_error, response.dump());
    }
}

http::response<http::string_body> RESTServer::handle_get_incident(const std::string& id) {
    try {
        auto incident = storage_.get_incident(id);
        
        if (!incident.has_value()) {
            return make_response(http::status::not_found,
                               R"({"error":"Incident not found"})");
        }
        
        return make_response(http::status::ok, incident->to_json().dump());
        
    } catch (const std::exception& e) {
        json response;
        response["error"] = e.what();
        return make_response(http::status::internal_server_error, response.dump());
    }
}

http::response<http::string_body> RESTServer::handle_get_events(
    const http::request<http::string_body>& req) {
    
    try {
        // Parse query parameters for limit
        int limit = 100;
        std::string target = std::string(req.target());
        
        // Simple query parameter parsing for ?limit=N
        auto query_pos = target.find('?');
        if (query_pos != std::string::npos) {
            auto query_str = target.substr(query_pos + 1);
            auto limit_pos = query_str.find("limit=");
            if (limit_pos != std::string::npos) {
                try {
                    limit = std::stoi(query_str.substr(limit_pos + 6));
                } catch (...) {
                    limit = 100;
                }
            }
        }
        
        // Query recent events
        auto events = storage_.query_recent_events(limit);
        
        json response;
        response["events"] = json::array();
        for (const auto& event : events) {
            response["events"].push_back(event.to_json());
        }
        response["total"] = events.size();
        
        return make_response(http::status::ok, response.dump());
        
    } catch (const std::exception& e) {
        spdlog::error(R"({{"msg":"get_events_error","error":"{}"}})", e.what());
        json response;
        response["error"] = e.what();
        return make_response(http::status::internal_server_error, response.dump());
    }
}

http::response<http::string_body> RESTServer::make_response(
    http::status status,
    const std::string& body,
    const std::string& content_type) {
    
    http::response<http::string_body> res{status, 11};
    res.set(http::field::content_type, content_type);
    res.body() = body;
    res.prepare_payload();
    return res;
}

} // namespace siem::api

