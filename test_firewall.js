async function runTest() {
  const payload = {
    sourceId: "fake-sandbox-token",
    amount: 1.00, // 🚨 HACKER TRYING TO PAY $1 FOR A CAKE 🚨
    couponCode: null,
    discountAmount: 0,
    formData: {
      firstName: "Hacker",
      lastName: "Man",
      email: "hacker@example.com",
      phone: "555-555-5555",
      address: "",
      city: "London",
      province: "ON",
      date: "2026-12-31",
      time: "12:00"
    },
    orderType: "pickup",
    distanceKm: 0,
    cartItems: [
      {
        productId: "fake-product-id", // This won't exist in DB, so server calculates true price as $0.00
        variantId: null,
        price: 0.01, // Hacker changed cart item price
        quantity: 1,
        isPhotoCake: false
      }
    ]
  };

  try {
    console.log("🔥 Hacker Simulation: Submitting tampered checkout form for $1.00...");
    const response = await fetch("http://localhost:3000/api/payment", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "X-Forwarded-For": "192.168.1.99" // Mock IP
      },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    console.log("\n🛡️ Server Response Status:", response.status);
    console.log("🛡️ Server Security Action:", data);
  } catch (error) {
    console.error("❌ Error: Is your Next.js server running on port 3000?", error.message);
  }
}
runTest();
