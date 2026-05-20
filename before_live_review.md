# 📋 CK Cake Lounge: Before-Live Review Deferred Items

These items are documented for final implementation after domain verification and API keys are switched to Production, but prior to public launch.

---

## 1. 📧 Customer Order Confirmation Email (High Priority)
* **Goal:** Automatically send a digital checkout receipt directly to the customer's email address (`formData.email`) upon a verified transaction.
* **Why it was deferred:** Implementing this before domain ownership is verified in the Resend dashboard would cause the emails to fail or be blacklisted as spam, since the sandbox sender `onboarding@resend.dev` can only send to the sandbox administrator.
* **Implementation Plan:**
  1. Complete Resend domain verification (DNS MX/TXT records).
  2. In `src/app/api/payment/route.js`, add a second `resend.emails.send` call:
     * **From:** `CK Cake Lounge <orders@ckcakelounge.com>`
     * **To:** `safeEmail` (extracted and escaped from `formData.email`)
     * **Subject:** `🍰 Your CK Cake Lounge Order Receipt - Ticket #${receiptId}`
     * **HTML Body:** Build a professional customer-facing confirmation invoice listing the ordered items, pickup/delivery times, payment receipt details, and a link to their digital ticket.

---

## 2. 🛡️ Secure Distance & Delivery Fee Verification (Security Hardening)
* **Goal:** Prevent clients from forging checkout payloads containing artificial delivery distances (e.g. bypassing the delivery fee calculation).
* **Why it was deferred:** Requires registering a paid maps geocoding API key (such as Google Distance Matrix API, Radar API, or Mapbox API) and matching custom backend keys.
* **Implementation Plan:**
  1. Obtain a geocoding distance API credential.
  2. Modify the `/api/payment` route:
     * Receive the customer's `address`, `city`, and `postalCode`.
     * Execute an HTTPS call to the distance matrix API to measure the routing distance between the bakery (Evans Blvd) and the destination address.
     * Verify that the calculated distance matches the fee charged.
     * Alternatively, implement a server-side regular expression match against a mapping of approved London, ON postal code FSAs (e.g. `N6M`, `N6C`, `N6A`) mapped to exact delivery fee zones, completely ignoring client-submitted distance dropdown numbers.
