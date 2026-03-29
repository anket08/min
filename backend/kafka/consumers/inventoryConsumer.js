// ========================================================================
// MODULE 3: Kafka Consumer — Inventory Service
// ========================================================================
// Topics: Microservices decoupling, Asynchronous event listening
//
// This consumer listens to the 'orders' topic.
// When an order is placed, it checks stock and decrements it.
// If stock is insufficient, it cancels the order.
// ========================================================================

const Order = require('../../models/Order');
const Product = require('../../models/Product');
const { getCache, setCache } = require('../../config/redis');

const inventoryHandler = async ({ message }) => {
    try {
        // Parse the JSON payload from Kafka
        const eventData = JSON.parse(message.value.toString());
        const { orderId, items } = eventData;
        console.log(`[Inventory Consumer] Processing order ${orderId}...`);

        // Check stock for all items
        let stockAvailable = true;
        for (const item of items) {
            let stock = await getCache(`stock:${item.product}`);
            if (stock === null) {
                const product = await Product.findById(item.product);
                if (!product) {
                    stockAvailable = false;
                    break;
                }
                stock = product.stock;
                await setCache(`stock:${item.product}`, stock, 60);
            } else {
                stock = parseInt(stock);
            }

            if (item.qty > stock) {
                stockAvailable = false;
                break;
            }
        }

        // If not enough stock, cancel the order
        if (!stockAvailable) {
            console.log(`[Inventory Consumer] ❌ Insufficient stock for order ${orderId}. Cancelling...`);
            await Order.findByIdAndUpdate(orderId, { status: 'cancelled' });
            return; // Stop processing
        }

        // If stock is available, decrement stock in DB and Cache
        for (const item of items) {
            const product = await Product.findById(item.product);
            product.stock -= item.qty;
            await product.save();
            await setCache(`stock:${item.product}`, product.stock, 60);
        }

        console.log(`[Inventory Consumer] ✅ Stock verified and decremented for order ${orderId}.`);
    } catch (error) {
        console.error('[Inventory Consumer] Error:', error.message);
    }
};

module.exports = inventoryHandler;
