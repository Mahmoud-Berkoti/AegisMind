#!/bin/bash
set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Cognitive SIEM Build Script ===${NC}\n"

# Check for vcpkg
if [ -z "$VCPKG_ROOT" ]; then
    echo -e "${RED}Error: VCPKG_ROOT environment variable not set${NC}"
    echo "Please install vcpkg and set VCPKG_ROOT"
    echo "Example: export VCPKG_ROOT=/path/to/vcpkg"
    exit 1
fi

echo -e "${YELLOW}Using vcpkg at: $VCPKG_ROOT${NC}\n"

# Build type
BUILD_TYPE=${1:-Release}
echo -e "${YELLOW}Build type: $BUILD_TYPE${NC}\n"

# Create build directory
echo -e "${GREEN}Creating build directory...${NC}"
mkdir -p build

# Configure
echo -e "${GREEN}Configuring CMake...${NC}"
cmake -S . -B build \
    -DCMAKE_TOOLCHAIN_FILE="$VCPKG_ROOT/scripts/buildsystems/vcpkg.cmake" \
    -DCMAKE_BUILD_TYPE="$BUILD_TYPE" \
    -DCMAKE_EXPORT_COMPILE_COMMANDS=ON

# Build
echo -e "\n${GREEN}Building...${NC}"
cmake --build build -j$(nproc)

# Run tests
echo -e "\n${GREEN}Running tests...${NC}"
cd build
ctest --output-on-failure
cd ..

echo -e "\n${GREEN}=== Build completed successfully! ===${NC}"
echo -e "Binaries are in: ${YELLOW}build/${NC}"
echo -e "\nTo run the SIEM:"
echo -e "  ${YELLOW}./build/siemd --config ./config/app.yaml${NC}"
echo -e "\nTo seed demo data:"
echo -e "  ${YELLOW}./build/seed_demo_data${NC}"

