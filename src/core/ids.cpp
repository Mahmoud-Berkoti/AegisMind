#include "core/ids.hpp"
#include <iomanip>
#include <sstream>
#include <cstring>

namespace siem::core {

std::mt19937_64& IDGenerator::get_rng() {
    static thread_local std::mt19937_64 rng{
        static_cast<uint64_t>(std::chrono::steady_clock::now().time_since_epoch().count())
    };
    return rng;
}

std::string IDGenerator::base36_encode(uint64_t value) {
    static const char digits[] = "0123456789abcdefghijklmnopqrstuvwxyz";
    if (value == 0) return "0";
    
    std::string result;
    while (value > 0) {
        result = digits[value % 36] + result;
        value /= 36;
    }
    return result;
}

std::string IDGenerator::generate_incident_id() {
    auto now = std::chrono::system_clock::now();
    auto epoch = now.time_since_epoch();
    uint64_t timestamp = std::chrono::duration_cast<std::chrono::seconds>(epoch).count();
    
    std::uniform_int_distribution<uint32_t> dist(0, 0xFFFFFF);
    uint32_t random_part = dist(get_rng());
    
    return "inc_" + base36_encode(timestamp) + base36_encode(random_part);
}

std::string IDGenerator::generate_cluster_id(const std::string& fingerprint) {
    uint32_t hash = murmur3_hash(fingerprint);
    std::ostringstream oss;
    oss << "clu_" << std::hex << std::setw(8) << std::setfill('0') << hash;
    return oss.str();
}

std::string IDGenerator::generate_trace_id() {
    std::uniform_int_distribution<uint64_t> dist;
    uint64_t val1 = dist(get_rng());
    uint64_t val2 = dist(get_rng());
    
    std::ostringstream oss;
    oss << std::hex << std::setw(16) << std::setfill('0') << val1;
    return oss.str();
}

uint32_t IDGenerator::murmur3_hash(const std::string& key) {
    const uint32_t c1 = 0xcc9e2d51;
    const uint32_t c2 = 0x1b873593;
    const uint32_t seed = 0x5a5a5a5a;
    
    uint32_t h1 = seed;
    const size_t nblocks = key.size() / 4;
    
    const uint32_t* blocks = reinterpret_cast<const uint32_t*>(key.data());
    for (size_t i = 0; i < nblocks; i++) {
        uint32_t k1 = blocks[i];
        k1 *= c1;
        k1 = (k1 << 15) | (k1 >> 17);
        k1 *= c2;
        h1 ^= k1;
        h1 = (h1 << 13) | (h1 >> 19);
        h1 = h1 * 5 + 0xe6546b64;
    }
    
    const uint8_t* tail = reinterpret_cast<const uint8_t*>(key.data() + nblocks * 4);
    uint32_t k1 = 0;
    switch (key.size() & 3) {
        case 3: k1 ^= tail[2] << 16; [[fallthrough]];
        case 2: k1 ^= tail[1] << 8; [[fallthrough]];
        case 1: k1 ^= tail[0];
                k1 *= c1; k1 = (k1 << 15) | (k1 >> 17); k1 *= c2; h1 ^= k1;
    }
    
    h1 ^= key.size();
    h1 ^= h1 >> 16;
    h1 *= 0x85ebca6b;
    h1 ^= h1 >> 13;
    h1 *= 0xc2b2ae35;
    h1 ^= h1 >> 16;
    
    return h1;
}

} // namespace siem::core


