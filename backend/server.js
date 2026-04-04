// ========================================================================
// server.js — Express + Kafka + Redis + MongoDB bootstrap
// ========================================================================

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// ── Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders',   require('./routes/orderRoutes'));
app.use('/api/delivery', require('./routes/deliveryRoutes'));
app.use('/api/admin',    require('./routes/adminRoutes'));

app.get('/', (req, res) => res.send('MINIT API is running...'));

// ── Database & Cache ──────────────────────────────────────────────────────
connectDB();
connectRedis();

// ── Kafka consumers ───────────────────────────────────────────────────────
// Each consumer subscribes to a SPECIFIC topic — no longer sharing 'orders'.
//
// Event flow:
//   order_created → inventoryConsumer
//   inventory_checked → paymentConsumer
//   payment_completed → deliveryConsumer
//   order_status_update → orderConsumer  (SOLE writer to Order collection)
//
const { connectKafka, consumeEvent, TOPICS } = require('./config/kafka');

const inventoryConsumer   = require('./kafka/consumers/inventoryConsumer');
const paymentConsumer     = require('./kafka/consumers/paymentConsumer');
const deliveryConsumer    = require('./kafka/consumers/deliveryConsumer');
const orderStatusConsumer = require('./kafka/consumers/orderConsumer');

connectKafka().then(() => {
    consumeEvent(TOPICS.ORDER_CREATED,       'inventory-group',  inventoryConsumer,   { maxRetries: 3 });
    consumeEvent(TOPICS.INVENTORY_CHECKED,   'payment-group',    paymentConsumer,     { maxRetries: 3 });
    consumeEvent(TOPICS.PAYMENT_COMPLETED,   'delivery-group',   deliveryConsumer,    { maxRetries: 3 });
    consumeEvent(TOPICS.ORDER_STATUS_UPDATE, 'order-state-group',orderStatusConsumer, { maxRetries: 5 });
});

// ── Start HTTP server ──────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
