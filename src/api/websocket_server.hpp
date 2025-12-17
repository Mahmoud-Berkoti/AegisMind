#pragma once

#include <boost/beast/core.hpp>
#include <boost/beast/websocket.hpp>
#include <boost/asio/ip/tcp.hpp>
#include <boost/asio/strand.hpp>
#include <nlohmann/json.hpp>
#include <memory>
#include <string>
#include <set>
#include <mutex>
#include <thread>

namespace beast = boost::beast;
namespace websocket = beast::websocket;
namespace net = boost::asio;
using tcp = net::ip::tcp;
using json = nlohmann::json;

namespace siem::api {

/**
 * WebSocket server for streaming incident updates to UI
 */
class WebSocketServer {
public:
    explicit WebSocketServer(unsigned short port);
    ~WebSocketServer();

    /**
     * Start accepting connections
     */
    void start();

    /**
     * Stop server
     */
    void stop();

    /**
     * Broadcast message to all connected clients
     */
    void broadcast(const json& message);

    /**
     * Get number of connected clients
     */
    size_t client_count() const;

private:
    class Session;
    
    unsigned short port_;
    std::unique_ptr<net::io_context> ioc_;
    std::unique_ptr<tcp::acceptor> acceptor_;
    std::unique_ptr<std::thread> thread_;
    
    std::set<std::shared_ptr<Session>> sessions_;
    mutable std::mutex sessions_mutex_;

    void do_accept();
    void add_session(std::shared_ptr<Session> session);
    void remove_session(std::shared_ptr<Session> session);
};

/**
 * Individual WebSocket session
 */
class WebSocketServer::Session : public std::enable_shared_from_this<Session> {
public:
    explicit Session(tcp::socket socket, WebSocketServer& server);

    void run();
    void send(const std::string& message);
    void close();

private:
    websocket::stream<beast::tcp_stream> ws_;
    WebSocketServer& server_;
    beast::flat_buffer buffer_;

    void on_accept(beast::error_code ec);
    void do_read();
    void on_read(beast::error_code ec, std::size_t bytes_transferred);
    void on_write(beast::error_code ec, std::size_t bytes_transferred);
};

} // namespace siem::api

