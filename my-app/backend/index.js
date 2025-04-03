const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require("dotenv").config();
const { Pool } = require('pg');
const config = require('../config');
const WebSocket = require('ws');
const patientRoutes = require('./routes/patientRoutes');

const app = express();
app.use(cors());
const bodyParser = require('body-parser');
app.use(express.json());
app.use(bodyParser.json());
const db = new Pool(config.DB_CONFIG);
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

db.connect()
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch((err) => console.error('Database connection error:', err));


 
  app.use("/api", patientRoutes);


const conversation = new Map();

wss.on('connection', (ws) => {
  console.log('New client connected');
  ws.on('message', (message) => {
    console.log(`Received: ${message}`);
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

  /*
// API endpoints
app.get('/api/patients', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM patients');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database query error' });
    }
});


app.post('/api/scores', async (req, res) => {
    try {
        const { userId, score } = req.body;
        await db.query('INSERT INTO scores (user_id, score) VALUES ($1, $2)', [userId, score]);
        res.json({ message: 'Score saved successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database insert error' });
    }
}); */

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
