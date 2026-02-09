#!/bin/bash
set -e

echo "=== MongoDB Setup for Cognitive SIEM ==="
echo

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed"
    echo "Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if docker-compose is available
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    echo "Error: docker-compose is not available"
    exit 1
fi

echo "Using compose command: $COMPOSE_CMD"
echo

# Start MongoDB
echo "Starting MongoDB with replica set..."
$COMPOSE_CMD up -d mongodb

echo
echo "Waiting for MongoDB to be ready..."
sleep 10

# Check if replica set is initialized
docker exec siem-mongodb mongosh --quiet --eval "
try {
    rs.status();
    print('Replica set already initialized');
} catch(e) {
    print('Initializing replica set...');
    rs.initiate({
        _id: 'rs0',
        members: [{_id: 0, host: 'localhost:27017'}]
    });
    print('Replica set initialized successfully');
}
"

echo
echo "=== MongoDB is ready! ==="
echo
echo "Connection string: mongodb://localhost:27017/?replicaSet=rs0"
echo "Database: cog_siem"
echo
echo "To view logs:"
echo "  docker logs -f siem-mongodb"
echo
echo "To stop:"
echo "  $COMPOSE_CMD down"
echo
echo "To stop and remove data:"
echo "  $COMPOSE_CMD down -v"

