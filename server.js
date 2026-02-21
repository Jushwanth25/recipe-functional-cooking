// Main server entry - sets up Express, connects to MongoDB, and serves API + static files
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 4000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// API routes
app.use('/api/recipes', require('./routes/recipes'));

// Analytics route
app.get('/api/analytics', async (req, res) => {
  try {
    const Recipe = require('./models/Recipe');
    const total = await Recipe.countDocuments();
    const avgTime = await Recipe.aggregate([{ $group: { _id: null, avg: { $avg: '$time' } } }]);
    const quick = await Recipe.countDocuments({ time: { $lte: 15 } });
    res.json({ total, avgTime: avgTime[0] ? Math.round(avgTime[0].avg) : 0, quick });
  } catch (err) {
    res.status(500).json({ message: 'Analytics error', error: err.message });
  }
});

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
