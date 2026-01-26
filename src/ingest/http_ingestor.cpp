#include "ingest/http_ingestor.hpp"
#include <spdlog/spdlog.h>
#include <iomanip>
#include <sstream>
#include <openssl/bio.h>
#include <openssl/buffer.h>
#include <cstring>

namespace siem::ingest {

HTTPIngestor::HTTPIngestor(Config config) : config_(config) {}

bool HTTPIngestor::verify_signature(const std::string& body, const std::string& signature) const {
    std::string expected = compute_hmac(body);
    
    // Constant-time comparison
    if (expected.size() != signature.size()) return false;
    
    volatile unsigned char result = 0;
    for (size_t i = 0; i < expected.size(); ++i) {
        result |= expected[i] ^ signature[i];
    }
    
    return result == 0;
}

std::string HTTPIngestor::compute_hmac(const std::string& data) const {
    unsigned char hash[EVP_MAX_MD_SIZE];
    unsigned int hash_len = 0;
    
    HMAC(EVP_sha256(),
         config_.hmac_secret.c_str(),
         config_.hmac_secret.size(),
         reinterpret_cast<const unsigned char*>(data.c_str()),
         data.size(),
         hash,
         &hash_len);
    
    // Base64 encode
    BIO* b64 = BIO_new(BIO_f_base64());
    BIO* bmem = BIO_new(BIO_s_mem());
    b64 = BIO_push(b64, bmem);
    BIO_set_flags(b64, BIO_FLAGS_BASE64_NO_NL);
    BIO_write(b64, hash, hash_len);
    BIO_flush(b64);
    
    BUF_MEM* bptr;
    BIO_get_mem_ptr(b64, &bptr);
    
    std::string result(bptr->data, bptr->length);
    BIO_free_all(b64);
    
    return result;
}

std::vector<json> HTTPIngestor::parse_ingest_request(const std::string& body) {
    if (body.size() > config_.max_body_size) {
        spdlog::warn(R"({{"msg":"body_too_large","size":{}}})", body.size());
        throw std::runtime_error("Request body exceeds maximum size");
    }
    
    std::vector<json> events;
    
    try {
        auto parsed = json::parse(body);
        
        if (!parsed.is_array()) {
            throw std::runtime_error("Expected JSON array");
        }
        
        for (const auto& item : parsed) {
            if (item.is_object()) {
                events.push_back(item);
            }
        }
        
    } catch (const json::exception& e) {
        spdlog::error(R"({{"msg":"ingest_parse_error","error":"{}"}})", e.what());
        throw;
    }
    
    return events;
}

} // namespace siem::ingest

