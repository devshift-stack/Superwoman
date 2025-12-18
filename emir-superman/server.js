/**
 * Express Server für AI Supervisor System
 * REST API für Supervisor, Agents, Tasks, Knowledge Base
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Supervisor = require('./supervisor/src/Supervisor');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Supervisor Instance
let supervisor = null;

/**
 * Initialisiert Supervisor
 */
async function initializeSupervisor() {
  try {
    supervisor = new Supervisor({
      redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
      dbPath: process.env.DB_PATH || './data/sessions.db',
    });
    await supervisor.initialize();
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

// Supervisor Status
app.get('/api/status', async (req, res) => {
  try {
    if (!supervisor) {
      return res.status(503).json({ error: 'Supervisor nicht initialisiert' });
    }
    const status = await supervisor.getStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Agent Management
app.post('/api/agents/register', async (req, res) => {
  try {
    if (!supervisor) {
      return res.status(503).json({ error: 'Supervisor nicht initialisiert' });
    }
    const agent = await supervisor.registerAgent(req.body);
    res.json(agent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/agents', async (req, res) => {
  try {
    if (!supervisor) {
      return res.status(503).json({ error: 'Supervisor nicht initialisiert' });
    }
    const agents = supervisor.agentRegistry.getAllAgents();
    res.json(agents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Task Management
app.post('/api/tasks', async (req, res) => {
  try {
    if (!supervisor) {
      return res.status(503).json({ error: 'Supervisor nicht initialisiert' });
    }
    const taskId = await supervisor.addTask(req.body);
    res.json({ taskId, status: 'queued' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tasks/:taskId', async (req, res) => {
  try {
    if (!supervisor) {
      return res.status(503).json({ error: 'Supervisor nicht initialisiert' });
    }
    const task = supervisor.activeTasks.get(req.params.taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task nicht gefunden' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Session Management
app.post('/api/sessions', async (req, res) => {
  try {
    if (!supervisor) {
      return res.status(503).json({ error: 'Supervisor nicht initialisiert' });
    }
    const { userId, metadata } = req.body;
    const session = await supervisor.createSession(userId, metadata);
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/sessions/:sessionId', async (req, res) => {
  try {
    if (!supervisor) {
      return res.status(503).json({ error: 'Supervisor nicht initialisiert' });
    }
    const session = await supervisor.getSession(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session nicht gefunden' });
    }
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Knowledge Base
app.post('/api/knowledge/search', async (req, res) => {
  try {
    if (!supervisor) {
      return res.status(503).json({ error: 'Supervisor nicht initialisiert' });
    }
    const { query, options = {} } = req.body;
    const results = await supervisor.searchKnowledge(query, options);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/knowledge/store', async (req, res) => {
  try {
    if (!supervisor) {
      return res.status(503).json({ error: 'Supervisor nicht initialisiert' });
    }
    const { text, source, metadata = {} } = req.body;
    const id = await supervisor.storeResearch(text, source, metadata);
    res.json({ id, status: 'stored' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/knowledge/verify/:id', async (req, res) => {
  try {
    if (!supervisor) {
      return res.status(503).json({ error: 'Supervisor nicht initialisiert' });
    }
    const { notes = '' } = req.body;
    const verified = await supervisor.verifyKnowledge(req.params.id, notes);
    res.json({ verified, id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/knowledge/stats', async (req, res) => {
  try {
    if (!supervisor) {
      return res.status(503).json({ error: 'Supervisor nicht initialisiert' });
    }
    const stats = await supervisor.knowledgeBase.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error Handling
app.use((err, req, res, next) => {
  console.error('❌ Server Fehler:', err);
  res.status(500).json({ error: 'Interner Serverfehler' });
});

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
  if (supervisor) {
    await supervisor.shutdown();
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT empfangen, beende Server...');
  if (supervisor) {
    await supervisor.shutdown();
  }
  process.exit(0);
});

// Start
start();
