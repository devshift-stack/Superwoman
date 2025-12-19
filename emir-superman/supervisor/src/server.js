
const express = require('express');
const supervisor = require('./supervisor');
const sessionRoutes = require('./api/routes/sessionRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Mount the session routes
app.use('/api/v1/sessions', sessionRoutes);

app.get('/', (req, res) => {
    res.send('Supervisor is running!');
});

// Initialize and start the supervisor, then start the server
supervisor.initialize().then(() => {
    app.listen(port, () => {
        console.log(`Server listening at http://localhost:${port}`);
    });
}).catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
