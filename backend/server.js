// ========================================================================
// MODULE 3: Node.js — Implementing HTTP Services with Express
// ========================================================================
// Topics: Installing Node.js, Working with Node Packages, Creating a Node.js
//         Application, Implementing HTTP Services, Saving Time with Express,
//         The Request and Response Objects, Middleware Function Calls, CORS
// ========================================================================

// --- Importing Node Packages (installed via: npm install express dotenv cors) ---
const express = require('express');   // Express framework — simplifies HTTP server creation
const dotenv = require('dotenv');     // dotenv — loads .env file variables into process.env
const cors = require('cors');         // cors — allows frontend (different port) to call this API

// --- Importing our custom modules ---
const connectDB = require('./config/db');          // MongoDB connection function (Module 4)
const { connectRedis } = require('./config/redis'); // Redis cache connection

// --- Load environment variables from .env file ---
dotenv.config(); // reads .env and sets process.env.PORT, process.env.MONGO_URI, etc.

// --- Create the Express Application ---
const app = express(); // creates an Express app (this IS our HTTP server)

// ========================================================================
// MIDDLEWARE FUNCTION CALLS
// Middleware = functions that run BEFORE your route handlers
// They have access to (req, res, next). Call next() to continue.
// ========================================================================

// Built-in middleware: parses JSON request bodies (for POST/PUT requests)
// Without this, req.body would be undefined
app.use(express.json());

// Third-party middleware: enables Cross-Origin Resource Sharing
// This lets our React frontend (port 5173) talk to this backend (port 5000)
app.use(cors());

// ========================================================================
// ROUTES — mapping URLs to handlers
// app.use(path, router) — mounts a router at a path
// ========================================================================

// Auth routes: /api/auth/register, /api/auth/login
app.use('/api/auth', require('./routes/authRoutes'));

// Product routes: /api/products (GET, POST, PUT, DELETE)
app.use('/api/products', require('./routes/productRoutes'));

// Order routes: /api/orders (GET, POST, PUT)
app.use('/api/orders', require('./routes/orderRoutes'));

// --- Simple GET route — The Request and Response Objects ---
// req = what the client sent, res = what we send back
app.get('/', (req, res) => {
    res.send('MINIT API is running...'); // res.send() sends a response
});

// --- Connect to MongoDB Database, Redis Cache, and Kafka ---
connectDB();
connectRedis();

const { connectKafka, consumeEvent } = require('./config/kafka');
const inventoryConsumer = require('./kafka/consumers/inventoryConsumer');
const paymentConsumer = require('./kafka/consumers/paymentConsumer');
const deliveryConsumer = require('./kafka/consumers/deliveryConsumer');

// Initialize Kafka and start consumers in the background
connectKafka().then(() => {
    // Start decoupled microservices simulating different groups
    consumeEvent('orders', 'inventory-group', inventoryConsumer);
    consumeEvent('orders', 'payment-group', paymentConsumer);
    consumeEvent('orders', 'delivery-group', deliveryConsumer);
});

// ========================================================================
// STARTING THE SERVER — Using Events and Listeners
// app.listen() creates an HTTP server and listens on the given port
// The callback is an EVENT LISTENER that fires when server is ready
// ========================================================================
const PORT = process.env.PORT || 5000; // use env variable or default 5000

app.listen(PORT, () => {
    // This callback = event listener for the 'listening' event
    console.log(`Server running on port ${PORT}`);
});
