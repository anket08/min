// ========================================================================
// MODULE 3: Kafka Consumer — Delivery Service
// ========================================================================
// Topics: Microservices decoupling, Background workers
//
// This consumer listens to the 'orders' topic.
// After order is placed, it simulates finding a delivery agent
// and updates the order status to "confirmed" to begin the tracking flow.
// ========================================================================

const Order = require('../../models/Order');

const deliveryHandler = async ({ message }) => {
    try {
        const eventData = JSON.parse(message.value.toString());
        const { orderId } = eventData;
        
        console.log(`[Delivery Consumer] Trying to allocate agent for order ${orderId}...`);

        // Simulate finding an available agent Delay (2 seconds)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Update status to 'confirmed' (Agent found, restaurant preparing)
        // Wait, check if order was cancelled by Inventory Consumer first!
        const existingOrder = await Order.findById(orderId);
        if (existingOrder && existingOrder.status === 'cancelled') {
            console.log(`[Delivery Consumer] ⚠️ Order ${orderId} was cancelled. Halting allocation.`);
            return;
        }

        await Order.findByIdAndUpdate(orderId, { status: 'confirmed' });
        
        console.log(`[Delivery Consumer] ✅ Agent allocated! Order ${orderId} status set to confirmed.`);
    } catch (error) {
        console.error('[Delivery Consumer] Error:', error.message);
    }
};

module.exports = deliveryHandler;
