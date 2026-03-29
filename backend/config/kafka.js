// ========================================================================
// MODULE 3: Kafka Event-Driven Architecture — Config & Client
// ========================================================================
// Topics: Message Brokers, Pub/Sub, Decoupling Microservices, High Throughput
//
// Apache Kafka is used to decouple the Order process.
// Fallback: If Kafka is not running, we use Node's native EventEmitter
// to simulate the Pub/Sub architecture so the app still works!
// ========================================================================

const { Kafka } = require('kafkajs');
const EventEmitter = require('events');

// Native EventEmitter for fallback (simulates Kafka in same-process)
class KafkaFallback extends EventEmitter {}
const eventEmitter = new KafkaFallback();

let kafka = null;
let producer = null;
let useFallback = false;

// --- INITIALIZATION ---
const connectKafka = async () => {
    try {
        console.log('🔄 Attempting to connect to Kafka broker...');
        kafka = new Kafka({
            clientId: 'minit-backend',
            brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
            retry: { initialRetryTime: 100, retries: 2 } // Fail fast if broker is down
        });

        producer = kafka.producer();
        await producer.connect();
        console.log('✅ Connected to Kafka broker successfully!');
    } catch (error) {
        console.log('⚠️  Kafka broker not found. Using local EventEmitter fallback.');
        useFallback = true;
    }
};

// --- PRODUCER LOGIC (Publishing Events) ---
// Used by orderController.js to send new orders to the pipeline
const produceEvent = async (topic, messages) => {
    // Expected messages format: [{ value: JSON.stringify(data) }]
    if (useFallback) {
        // Fallback: Emit event synchronously to our local listeners
        messages.forEach(msg => {
            console.log(`[Producer Fallback] Emitting event to topic: ${topic}`);
            eventEmitter.emit(topic, JSON.parse(msg.value));
        });
        return;
    }

    try {
        await producer.send({
            topic,
            messages
        });
        console.log(`[Producer] Message sent to topic: ${topic}`);
    } catch (error) {
        console.error(`[Producer Error] Failed to send message to ${topic}:`, error);
        // Fall back to event emitter if Kafka suddenly dies
        messages.forEach(msg => eventEmitter.emit(topic, JSON.parse(msg.value)));
    }
};

// --- CONSUMER LOGIC (Subscribing to Events) ---
// Used by our inventory, payment, and delivery worker files
const consumeEvent = async (topic, groupId, messageHandler) => {
    if (useFallback) {
        // Fallback: Listen to the local event emitter
        console.log(`[Consumer Fallback] ${groupId} listening to topic: ${topic}`);
        eventEmitter.on(topic, async (data) => {
            // Simulate Kafka payload structure so consumer code doesn't change
            await messageHandler({ message: { value: JSON.stringify(data) } });
        });
        return;
    }

    try {
        const consumer = kafka.consumer({ groupId });
        await consumer.connect();
        await consumer.subscribe({ topic, fromBeginning: true });

        console.log(`[Consumer] ${groupId} listening to topic: ${topic}`);
        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                await messageHandler({ message });
            },
        });
    } catch (error) {
        console.error(`[Consumer Error] ${groupId} failed to connect:`, error);
        // Fall back to event emitter
        console.log(`[Consumer Fallback] ${groupId} switching to local listener for: ${topic}`);
        eventEmitter.on(topic, async (data) => {
            await messageHandler({ message: { value: JSON.stringify(data) } });
        });
    }
};

module.exports = { connectKafka, produceEvent, consumeEvent };
