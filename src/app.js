const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const path = require('path');

const app = express();

// Body parser
app.use(express.json());

app.set("trust proxy", 1);

// Enable CORS
app.use(cors());

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Mount routes
app.use('/api', routes);

// Base route for testing
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Global Error Handler MUST be the last middleware
app.use(errorHandler);

module.exports = app;
