require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'AI Supervisor System - Setup in Progress',
    timestamp: new Date().toISOString()
  });
});

// Health Check für Railway
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server läuft auf Port ${PORT}`);
  console.log(`📊 Status: Setup in Progress`);
  console.log(`⏳ Supervisor-System wird programmiert...`);
});

