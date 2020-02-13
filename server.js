const express = require('express');
const path = require('path');
const logger = require('./middleware/logger');

// Init express
const app = express();

// Init middleware
//app.use(logger);

// Body Parse Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const PORT = process.env.PORT || 8000;

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Create your endpoints/route handlers

// Clients API Routes
app.use('/api', require('./routes/api/routes'));

// Listen on a port
app.listen(PORT, () => {
    console.log(`We are live on ${PORT}`);
});

