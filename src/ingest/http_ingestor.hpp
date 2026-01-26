#pragma once

#include <string>
#include <vector>
#include <nlohmann/json.hpp>
#include <openssl/hmac.h>
#include <openssl/evp.h>

namespace siem::ingest {

using json = nlohmann::json;

/**
 * HTTP ingest endpoint with HMAC signature verification
 */
class HTTPIngestor {
public:
    struct Config {
        std::string hmac_secret = "your-secret-key";
        size_t max_body_size = 1048576; // 1 MB
    };

    explicit HTTPIngestor(Config config);

    /**
     * Verify HMAC signature
     * Returns true if signature is valid
     */
    bool verify_signature(const std::string& body, const std::string& signature) const;

    /**
     * Validate and parse ingest request
     * Returns parsed events or throws
     */
    std::vector<json> parse_ingest_request(const std::string& body);

private:
    Config config_;

    std::string compute_hmac(const std::string& data) const;
};

} // namespace siem::ingest

