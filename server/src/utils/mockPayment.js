const createMockIntent = (provider, amount) => {
  const intentId = `${provider}_intent_${Date.now()}_${Math.floor(
    Math.random() * 10000
  )}`;

  return {
    intentId,
    provider,
    amount,
    currency: "INR"
  };
};

const simulatePayment = (provider, amount) => {
  const success = Math.random() >= 0.1;
  const transactionId = `${provider}_txn_${Date.now()}_${Math.floor(
    Math.random() * 10000
  )}`;

  return {
    success,
    provider,
    transactionId,
    amount,
    currency: "INR",
    status: success ? "captured" : "failed"
  };
};

module.exports = {
  createMockIntent,
  simulatePayment
};
