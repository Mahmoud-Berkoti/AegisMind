# Contributing to Cognitive SIEM

Thank you for your interest in contributing to Cognitive SIEM! This document provides guidelines and instructions for contributing.

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/cognitive-siem.git`
3. Create a feature branch: `git checkout -b feature/amazing-feature`
4. Make your changes
5. Run tests: `cd build && ctest`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## 📝 Coding Standards

### C++ Style

- **Standard**: C++20
- **Formatting**: Follow existing code style (consider using clang-format)
- **Naming**:
  - Classes: `PascalCase`
  - Functions: `snake_case`
  - Variables: `snake_case`
  - Constants: `UPPER_SNAKE_CASE`
  - Namespaces: `snake_case`
- **Comments**: Use `//` for single-line, `/* */` for multi-line
- **Headers**: Use `#pragma once` for header guards

### Best Practices

- **RAII**: Always use RAII for resource management
- **No raw pointers**: Use smart pointers (`std::unique_ptr`, `std::shared_ptr`)
- **const correctness**: Mark const wherever possible
- **Error handling**: Use exceptions for exceptional cases, return values for expected errors
- **Thread safety**: Document thread-safety guarantees, use mutexes where needed
- **No globals**: Avoid global state

### Example

```cpp
namespace siem::core {

class EventProcessor {
public:
    explicit EventProcessor(Config config);
    
    // Process a batch of events
    std::vector<Result> process_batch(const std::vector<Event>& events);
    
private:
    Config config_;
    std::mutex mutex_;
};

} // namespace siem::core
```

## 🧪 Testing

- Write unit tests for all new features
- Use Catch2 test framework
- Tests go in `tests/` directory
- Name test files: `test_<component>.cpp`
- Run tests before submitting PR

```cpp
#include <catch2/catch_test_macros.hpp>
#include "core/event_normalizer.hpp"

TEST_CASE("EventNormalizer handles edge cases", "[normalizer]") {
    EventNormalizer normalizer;
    
    SECTION("Empty events") {
        auto result = normalizer.normalize_batch({});
        REQUIRE(result.empty());
    }
}
```

## 📚 Documentation

- Document all public APIs with comments
- Update README.md for user-facing changes
- Add inline comments for complex logic
- Update CHANGELOG.md (if exists)

## 🐛 Bug Reports

When filing a bug report, include:

1. **Description**: Clear description of the bug
2. **Steps to reproduce**: Exact steps to trigger the bug
3. **Expected behavior**: What should happen
4. **Actual behavior**: What actually happens
5. **Environment**: OS, compiler version, MongoDB version
6. **Logs**: Relevant log excerpts

## 💡 Feature Requests

When proposing a feature:

1. **Use case**: Why is this feature needed?
2. **Proposed solution**: How should it work?
3. **Alternatives**: What alternatives did you consider?
4. **Implementation**: Any ideas on implementation?

## 🔍 Pull Request Process

1. **Update documentation**: If you change APIs or behavior
2. **Add tests**: Cover new functionality
3. **Pass all tests**: Ensure `ctest` passes
4. **Clean commit history**: Squash fixup commits
5. **Descriptive PR**: Explain what and why
6. **Link issues**: Reference related issues

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] New tests added for new functionality
- [ ] Documentation updated
- [ ] No compiler warnings
- [ ] Commit messages are clear

## 🏗️ Architecture Guidelines

### Adding a New Component

1. Create header in appropriate namespace directory
2. Implement in corresponding `.cpp` file
3. Add to `CMakeLists.txt`
4. Write tests
5. Update documentation

### Modifying Storage Schema

1. Update `storage/schemas.hpp`
2. Add migration if needed
3. Update indexes in `storage/mongo.cpp`
4. Test with existing data

### Adding API Endpoints

1. Update REST or WebSocket server
2. Document in README.md API section
3. Add authentication if needed
4. Write integration tests

## 📊 Performance Considerations

- Profile before optimizing
- Document performance-critical sections
- Use appropriate data structures
- Minimize allocations in hot paths
- Consider lock contention in multi-threaded code

## 🔒 Security

- Never commit secrets or credentials
- Use constant-time comparison for sensitive data
- Validate all external input
- Follow principle of least privilege
- Report security issues privately

## 📞 Communication

- **Discussions**: Use GitHub Discussions for questions
- **Issues**: Use GitHub Issues for bugs and features
- **PRs**: Use Pull Requests for code contributions
- **Code Review**: Be respectful and constructive

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You!

Your contributions make this project better for everyone. Thank you for taking the time to contribute!

