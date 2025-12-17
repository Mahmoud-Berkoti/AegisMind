#include "api/websocket_server.hpp"
#include <spdlog/spdlog.h>

namespace siem::api {

// WebSocketServer implementation
WebSocketServer::WebSocketServer(unsigned short port) 
    : port_(port), ioc_(std::make_unique<net::io_context>()) {}

WebSocketServer::~WebSocketServer() {
    stop();
}

void WebSocketServer::start() {
    try {
        acceptor_ = std::make_unique<tcp::acceptor>(
            *ioc_, tcp::endpoint(tcp::v4(), port_));
        
        spdlog::info(R"({{"msg":"websocket_server_starting","port":{}}})", port_);
        
        do_accept();
        
        thread_ = std::make_unique<std::thread>([this]() {
            ioc_->run();
        });
        
        spdlog::info(R"({{"msg":"websocket_server_started","port":{}}})", port_);
        
    } catch (const std::exception& e) {
        spdlog::error(R"({{"msg":"websocket_start_error","error":"{}"}})", e.what());
        throw;
    }
}

void WebSocketServer::stop() {
    if (!ioc_) return;
    
    // Close all sessions
    {
        std::lock_guard<std::mutex> lock(sessions_mutex_);
        for (auto& session : sessions_) {
            session->close();
        }
        sessions_.clear();
    }
    
    if (acceptor_) {
        acceptor_->close();
    }
    
    ioc_->stop();
    
    if (thread_ && thread_->joinable()) {
        thread_->join();
    }
    
    spdlog::info(R"({{"msg":"websocket_server_stopped"}})");
}

void WebSocketServer::do_accept() {
    acceptor_->async_accept(
        net::make_strand(*ioc_),
        [this](beast::error_code ec, tcp::socket socket) {
            if (!ec) {
                auto session = std::make_shared<Session>(std::move(socket), *this);
                add_session(session);
                session->run();
            } else {
                spdlog::warn(R"({{"msg":"accept_error","error":"{}"}})", ec.message());
            }
            
            // Accept next connection
            if (acceptor_->is_open()) {
                do_accept();
            }
        });
}

void WebSocketServer::add_session(std::shared_ptr<Session> session) {
    std::lock_guard<std::mutex> lock(sessions_mutex_);
    sessions_.insert(session);
    spdlog::info(R"({{"msg":"client_connected","total":{}}})", sessions_.size());
}

void WebSocketServer::remove_session(std::shared_ptr<Session> session) {
    std::lock_guard<std::mutex> lock(sessions_mutex_);
    sessions_.erase(session);
    spdlog::info(R"({{"msg":"client_disconnected","total":{}}})", sessions_.size());
}

void WebSocketServer::broadcast(const json& message) {
    std::string msg_str = message.dump();
    
    std::lock_guard<std::mutex> lock(sessions_mutex_);
    for (auto& session : sessions_) {
        try {
            session->send(msg_str);
        } catch (const std::exception& e) {
            spdlog::warn(R"({{"msg":"broadcast_error","error":"{}"}})", e.what());
        }
    }
}

size_t WebSocketServer::client_count() const {
    std::lock_guard<std::mutex> lock(sessions_mutex_);
    return sessions_.size();
}

// Session implementation
WebSocketServer::Session::Session(tcp::socket socket, WebSocketServer& server)
    : ws_(std::move(socket)), server_(server) {}

void WebSocketServer::Session::run() {
    ws_.set_option(websocket::stream_base::timeout::suggested(beast::role_type::server));
    ws_.set_option(websocket::stream_base::decorator(
        [](websocket::response_type& res) {
            res.set(beast::http::field::server, "CognitiveSIEM/1.0");
        }));
    
    ws_.async_accept(
        beast::bind_front_handler(&Session::on_accept, shared_from_this()));
}

void WebSocketServer::Session::on_accept(beast::error_code ec) {
    if (ec) {
        spdlog::warn(R"({{"msg":"ws_accept_error","error":"{}"}})", ec.message());
        server_.remove_session(shared_from_this());
        return;
    }
    
    do_read();
}

void WebSocketServer::Session::do_read() {
    ws_.async_read(
        buffer_,
        beast::bind_front_handler(&Session::on_read, shared_from_this()));
}

void WebSocketServer::Session::on_read(beast::error_code ec, std::size_t bytes_transferred) {
    boost::ignore_unused(bytes_transferred);
    
    if (ec == websocket::error::closed) {
        server_.remove_session(shared_from_this());
        return;
    }
    
    if (ec) {
        spdlog::warn(R"({{"msg":"ws_read_error","error":"{}"}})", ec.message());
        server_.remove_session(shared_from_this());
        return;
    }
    
    // Process received message (e.g., filter updates from client)
    // For now, just echo or ignore
    buffer_.consume(buffer_.size());
    
    do_read();
}

void WebSocketServer::Session::send(const std::string& message) {
    ws_.text(true);
    ws_.write(net::buffer(message));
}

void WebSocketServer::Session::on_write(beast::error_code ec, std::size_t bytes_transferred) {
    boost::ignore_unused(bytes_transferred);
    
    if (ec) {
        spdlog::warn(R"({{"msg":"ws_write_error","error":"{}"}})", ec.message());
        server_.remove_session(shared_from_this());
    }
}

void WebSocketServer::Session::close() {
    beast::error_code ec;
    ws_.close(websocket::close_code::normal, ec);
}

} // namespace siem::api

