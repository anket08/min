// ========================================================================
// MODULE 3: Kafka Consumer — Payment Service
// ========================================================================
// Topics: Microservices decoupling, Simulating external gateways
//
// This consumer listens to the 'orders' topic.
// Simulates processing a payment (Card, UPI) and updates paymentStatus.
// ========================================================================

const Order = require('../../models/Order');

const paymentHandler = async ({ message }) => {
    try {
        const eventData = JSON.parse(message.value.toString());
        const { orderId, paymentMethod, totalPrice } = eventData;
        console.log(`[Payment Consumer] Checking payment for order ${orderId} (${paymentMethod})...`);

        // If COD, payment is handled at delivery. Do nothing.
        if (paymentMethod === 'cod') {
            console.log(`[Payment Consumer] ℹ️ COD order ${orderId} - payment pending on delivery.`);
            return;
        }

        // Simulate Gateway Processing Delay (1 second)
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Let's assume the payment is successful for demonstration
        await Order.findByIdAndUpdate(orderId, { paymentStatus: 'completed' });
        
        console.log(`[Payment Consumer] ✅ Payment logic complete for order ${orderId}. ₹${totalPrice} collected via ${paymentMethod}.`);
    } catch (error) {
        console.error('[Payment Consumer] Error:', error.message);
    }
};

module.exports = paymentHandler;
