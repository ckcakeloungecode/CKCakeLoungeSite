# 📱 WhatsApp Order Receiver Setup Guide (CK Cake Lounge)

This guide walks you through setting up **Automated WhatsApp Order Alerts** using Meta's free WhatsApp Cloud API. Once configured, every customer order placed on the site will automatically trigger an instant WhatsApp message to your phone with full order details and reference photos.

---

## 💰 Cost & Pricing
* **First 1,000 Conversations/Month:** 100% **FREE** ($0/month).
* **Setup Cost:** $0.
* **Requirements:** Meta Developer Account & any mobile phone number capable of receiving SMS.

---

## 🚀 Step-by-Step Setup Guide (10 Minutes)

### Step 1: Access Meta Developer Portal
1. Open your browser and go to [https://developers.facebook.com](https://developers.facebook.com).
2. Log in using your Facebook account (or the Bakery's Facebook account).
3. If prompted, complete the quick 1-minute registration to activate your Developer profile.

---

### Step 2: Create a Meta App
1. Click **My Apps** in the top right corner and click **Create App**.
2. Select **Business** as the App Type and click **Next**.
3. Name your app: `CK Cake Lounge Order Alerts`.
4. Enter your contact email and click **Create App**.

---

### Step 3: Add WhatsApp Product
1. On the App Dashboard, scroll down to **WhatsApp** and click **Set Up**.
2. Select or create a Meta Business Portfolio when prompted.
3. You will be taken to the **WhatsApp Getting Started** page.

---

### Step 4: Add & Verify Your Bakery Phone Number
1. Under **"To" (Recipient Phone Number)** on the Getting Started screen, click the dropdown and select **Manage Phone Number List**.
2. Enter your Bakery Phone Number (including country code, e.g., `+1 519-XXX-XXXX`).
3. Meta will send a **6-digit SMS verification code** to your phone.
4. Enter the verification code in Meta's dashboard. Your phone number is now verified to receive order alerts!

---

### Step 5: Copy Your 3 API Credentials

Copy the following 3 values from your Meta Developer screen:

1. **Phone Number ID:** 
   * Found under **Step 1: Select phone numbers** on the WhatsApp Getting Started page (e.g., `104827364519283`).
2. **Access Token:**
   * Found under **Temporary access token** (or create a permanent token under *Business Settings -> System Users*).
3. **Recipient Phone Number:**
   * Your bakery phone number in numbers-only format (e.g., `15191234567`).

---

## 🔑 Step 6: Paste Credentials into Environment Variables

### Local Development (`.env.local`):
Paste the 3 copied values into your local `.env.local` file:

```env
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_ACCESS_TOKEN=your_access_token_here
WHATSAPP_RECIPIENT_PHONE=1519XXXXXXX
```

### Production Live Site (Vercel / Render Dashboard):
1. Log in to your Vercel / Render Dashboard.
2. Go to **Project Settings ➔ Environment Variables**.
3. Add `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, and `WHATSAPP_RECIPIENT_PHONE`.
4. Trigger a fresh redeploy.

---

## 📥 What the WhatsApp Alert Looks Like

Once set up, whenever a customer orders on `ckcakelounge.com`, your WhatsApp will receive:

```text
🍰 NEW CK CAKE LOUNGE ORDER! 🍰

Receipt Ticket: #TICKET-8492
Customer: Jane Doe
Phone: 519-555-0199
Fulfillment: DELIVERY
Date Needed: 2026-08-15 at 2:00 PM
Delivery Address: 123 Evans Blvd, London, ON

Items Ordered:
• 1x Royal Golden Floral Wedding Cake (2-Tier - Vanilla Raspberry - Circle)
• 2x Cupcake Box (Standard - Original)

Total Paid: $185.00

📷 Reference Photo: https://...supabase.co/storage/v1/object/public/cake-photos/custom-photo.jpg
```

---

🎉 **Setup Complete!** Your bakery is now ready for automated instant WhatsApp order dispatching.
