async function runRateLimitTest() {
  const payload = {
    sourceId: "fake-sandbox-token",
    amount: 1.00, 
    couponCode: null,
    discountAmount: 0,
    formData: {
      firstName: "Hacker",
      lastName: "Bot",
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
    cartItems: []
  };

  console.log("🔥 Hacker Bot: Rapid-firing 6 credit cards in 1 second...\n");
  
  for (let i = 1; i <= 6; i++) {
    try {
      const response = await fetch("http://localhost:3000/api/payment", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Forwarded-For": "100.100.100.100" // Bot IP
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (response.status === 429) {
          console.log(`Attempt ${i} -> 🛑 RATE LIMIT TRIGGERED:`, data.error);
      } else {
          console.log(`Attempt ${i} -> 🛡️ Blocked by Pricing Firewall (Status ${response.status})`);
      }
    } catch (e) {
      console.log(`Attempt ${i} -> Error:`, e.message);
    }
  }
}
runRateLimitTest();
