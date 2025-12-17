#pragma once

#include "storage/mongo.hpp"
#include "ingest/http_ingestor.hpp"
#include <boost/beast/core.hpp>
#include <boost/beast/http.hpp>
#include <boost/asio/ip/tcp.hpp>
#include <memory>
#include <string>
#include <functional>
#include <nlohmann/json.hpp>

namespace beast = boost::beast;
namespace http = beast::http;
namespace net = boost::asio;
using tcp = net::ip::tcp;
using json = nlohmann::json;

namespace siem::api {

/**
 * REST API server for ingesting events and querying incidents
 */
class RESTServer {
public:
    using IngestCallback = std::function<void(const std::vector<json>&)>;

    struct Config {
        unsigned short port = 8080;
        std::string bind_address = "0.0.0.0";
    };

    explicit RESTServer(
        Config config,
        storage::MongoStorage& storage,
        ingest::HTTPIngestor& http_ingestor);
    
    ~RESTServer();

    /**
     * Start server
     */
    void start(IngestCallback ingest_callback);

    /**
     * Stop server
     */
    void stop();

    /**
     * Set ingest callback
     */
    void set_ingest_callback(IngestCallback callback) {
        ingest_callback_ = callback;
    }

private:
    Config config_;
    storage::MongoStorage& storage_;
    ingest::HTTPIngestor& http_ingestor_;
    IngestCallback ingest_callback_;
    
    std::unique_ptr<net::io_context> ioc_;
    std::unique_ptr<tcp::acceptor> acceptor_;
    std::unique_ptr<std::thread> thread_;

    void do_accept();
    void handle_request(tcp::socket socket);
    
    http::response<http::string_body> handle_health();
    http::response<http::string_body> handle_ingest(
        const http::request<http::string_body>& req);
    http::response<http::string_body> handle_get_incidents(
        const http::request<http::string_body>& req);
    http::response<http::string_body> handle_get_incident(const std::string& id);
    http::response<http::string_body> handle_get_events(
        const http::request<http::string_body>& req);
    
    http::response<http::string_body> make_response(
        http::status status,
        const std::string& body,
        const std::string& content_type = "application/json");
};

} // namespace siem::api

