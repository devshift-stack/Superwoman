
/**
 * Express Server für AI Supervisor System
 * REST API für Supervisor, Agents, Tasks, Knowledge Base
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Supervisor = require('./supervisor/src/Supervisor');
const errorHandler = require('./middleware/errorHandler');
const supervisorCheck = require('./middleware/supervisorCheck');

// Import new modular routes
const agentRoutes = require('./routes/agents');
const taskRoutes = require('./routes/tasks');
const sessionRoutes = require('./routes/sessions');
const knowledgeRoutes = require('./routes/knowledge');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files (dashboard.html, etc.)

/**
 * Initialisiert Supervisor
 */
async function initializeSupervisor() {
  try {
    const supervisor = new Supervisor({
      redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
      dbPath: process.env.DB_PATH || './data/sessions.db',
    });
    await supervisor.initialize();
    app.set('supervisor', supervisor); // Make supervisor available to middleware
    console.log('✅ Supervisor initialisiert');
  } catch (error) {
    console.error('❌ Fehler beim Initialisieren des Supervisors:', error);
    throw error;
  }
}

// Health Check
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'AI Supervisor System',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Dashboard route
app.get('/dashboard', (req, res) => {
  res.sendFile(__dirname + '/dashboard.html');
});

// API Routes
const apiRouter = express.Router();
apiRouter.use(supervisorCheck);

// A route for supervisor status that doesn't fit in other categories
apiRouter.get('/status', async (req, res, next) => {
  try {
    const status = await req.app.get('supervisor').getStatus();
    res.json(status);
  } catch (error) {
    next(error);
  }
});

// Use modular routers
apiRouter.use('/agents', agentRoutes);
apiRouter.use('/tasks', taskRoutes);
apiRouter.use('/sessions', sessionRoutes);
apiRouter.use('/knowledge', knowledgeRoutes);

app.use('/api', apiRouter);

// Error Handling
app.use(errorHandler);

// Start Server
async function start() {
  try {
    await initializeSupervisor();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server läuft auf Port ${PORT}`);
      console.log(`📊 API verfügbar unter: http://localhost:${PORT}/api`);
      console.log(`💚 Health Check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Fehler beim Starten des Servers:', error);
    process.exit(1);
  }
}

// Graceful Shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM empfangen, beende Server...');
  const supervisor = app.get('supervisor');
  if (supervisor) {
    await supervisor.shutdown();
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT empfangen, beende Server...');
  const supervisor = app.get('supervisor');
  if (supervisor) {
    await supervisor.shutdown();
  }
  process.exit(0);
});

// Start
start();
