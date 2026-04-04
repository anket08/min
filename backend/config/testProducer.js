const { connectKafka, produceEvent, TOPICS } = require('./kafka');

(async () => {
  await connectKafka();

  await produceEvent(TOPICS.INVENTORY_CHECKED, {
    orderId: "order-999",
    userId: "user-1",
    items: ["pizza"],
    paymentMethod: "card",
    totalPrice: 500
  });

  process.exit();
})();