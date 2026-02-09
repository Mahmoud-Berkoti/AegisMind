@echo off
echo === Starting MongoDB for Cognitive SIEM (Windows) ===
echo.

REM Check if Docker Desktop is running
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker Desktop is not running
    echo.
    echo Please start Docker Desktop first:
    echo 1. Open Docker Desktop from Start menu
    echo 2. Wait for it to start completely
    echo 3. Run this script again
    echo.
    pause
    exit /b 1
)

echo Docker is running, starting MongoDB...
echo.

REM Start MongoDB with replica set
docker run -d --name siem-mongodb ^
    -p 27017:27017 ^
    mongo:7 --replSet rs0

if %errorlevel% neq 0 (
    echo Warning: Container might already exist, trying to start it...
    docker start siem-mongodb
)

echo Waiting for MongoDB to be ready...
timeout /t 10 /nobreak >nul

echo Initializing replica set...
docker exec siem-mongodb mongosh --quiet --eval "try { rs.status(); print('Replica set already initialized'); } catch(e) { print('Initializing replica set...'); rs.initiate({_id:'rs0',members:[{_id:0,host:'localhost:27017'}]}); print('Replica set initialized!'); }"

echo.
echo === MongoDB is ready! ===
echo.
echo Connection string: mongodb://localhost:27017/?replicaSet=rs0
echo Database: cog_siem
echo.
echo To view logs:
echo   docker logs -f siem-mongodb
echo.
echo To stop:
echo   docker stop siem-mongodb
echo.
echo To remove:
echo   docker stop siem-mongodb
echo   docker rm siem-mongodb
echo.

