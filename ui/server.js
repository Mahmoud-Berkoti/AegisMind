// Simple management API server for Docker control
import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const app = express();
const PORT = 3001;

app.use(express.json());

// CORS for local development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Docker commands
const DOCKER_COMMANDS = {
  start: 'docker start siem-mongodb',
  stop: 'docker stop siem-mongodb',
  restart: 'docker restart siem-mongodb',
  status: 'docker ps -a --filter name=siem-mongodb --format "{{.Status}}"',
};

// Start MongoDB
app.post('/api/docker/start', async (req, res) => {
  try {
    const { stdout, stderr } = await execAsync(DOCKER_COMMANDS.start);
    console.log('✅ MongoDB started:', stdout);
    res.json({ success: true, message: 'MongoDB container started', output: stdout });
  } catch (error) {
    console.error('❌ Failed to start MongoDB:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: 'Failed to start MongoDB. Make sure Docker is running.'
    });
  }
});

// Stop MongoDB
app.post('/api/docker/stop', async (req, res) => {
  try {
    const { stdout, stderr } = await execAsync(DOCKER_COMMANDS.stop);
    console.log('✅ MongoDB stopped:', stdout);
    res.json({ success: true, message: 'MongoDB container stopped', output: stdout });
  } catch (error) {
    console.error('❌ Failed to stop MongoDB:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: 'Failed to stop MongoDB'
    });
  }
});

// Restart MongoDB
app.post('/api/docker/restart', async (req, res) => {
  try {
    const { stdout, stderr } = await execAsync(DOCKER_COMMANDS.restart);
    console.log('✅ MongoDB restarted:', stdout);
    res.json({ success: true, message: 'MongoDB container restarted', output: stdout });
  } catch (error) {
    console.error('❌ Failed to restart MongoDB:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: 'Failed to restart MongoDB'
    });
  }
});

// Get MongoDB status
app.get('/api/docker/status', async (req, res) => {
  try {
    const { stdout } = await execAsync(DOCKER_COMMANDS.status);
    const isRunning = stdout.toLowerCase().includes('up');
    res.json({ 
      success: true, 
      running: isRunning,
      status: stdout.trim()
    });
  } catch (error) {
    console.error('❌ Failed to get status:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🔧 Management API running on http://localhost:${PORT}`);
  console.log('📡 Docker controls available at /api/docker/*');
});

