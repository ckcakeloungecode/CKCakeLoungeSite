# 🚀 CK Cake Lounge: Go-Live Master Checklist

Before you officially launch the website to real customers and start taking real money, you must complete these crucial configuration steps to switch the systems from "Testing Mode" to "Production Mode".

---

## 1. 📧 Email System (Resend)
Currently, the system uses a free sandbox email server that can only send emails to *you*.
- [ ] **Verify Your Domain:** Go to your Resend Dashboard and add your official domain (e.g., `ckcakelounge.com`). You will need to add a few DNS records to your domain provider (like GoDaddy or Namecheap).
- [ ] **Customer Receipts:** Once your domain is verified, we can safely update the backend code to automatically email official digital receipts directly to the customer's email address without getting blocked for spam.
- [ ] **Update Sender Address:** Change the email sender from `onboarding@resend.dev` to something professional like `orders@ckcakelounge.com`.

---

## 2. 💳 Payment Processing (Square)
Right now, the website uses "fake money" via the Square Sandbox.
- [ ] **Get Production Keys:** Log into your Square Developer Dashboard and toggle the switch at the bottom from "Sandbox" to "Production".
- [ ] **Copy the 3 Keys:** You need your Production `Application ID`, Production `Location ID`, and Production `Access Token`.
- [ ] **Update Vercel:** You MUST paste these three keys into your Vercel Environment Variables. *Do not put production keys in your local `.env.local` file.*
- [ ] **Server-Side Distance Verification:** Set up a Google Distance Matrix API (or Radar API) key, and update the `/api/payment` route to calculate delivery distance on the server side instead of relying on the client's dropdown input to prevent delivery fee tampering.


---

## 3. 🔒 Authentication & Database (Supabase)
- [ ] **Whitelist Vercel URL:** Go to Supabase Dashboard -> Authentication -> URL Configuration. Add your official live website URL (e.g., `https://ckcakelounge.com`) to the **Site URL** and **Redirect URLs**. If you don't do this, users won't be able to log in on the live site!
- [ ] **Turn on Email Confirmations (Optional):** If you want to force users to verify their emails to prevent spam accounts, turn "Confirm Email" back ON in the Supabase Auth settings.

---

## 4. 🚀 Hosting & Environment (Vercel)
Vercel needs to know all the secret keys to run your backend on the internet.
- [ ] **Migrate Environment Variables:** Go to Vercel -> Your Project -> Settings -> Environment Variables. Copy EVERY SINGLE variable from your local `.env.local` file into Vercel. This includes:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `BAKERY_EMAIL`
  - `RESEND_API_KEY`
- [ ] **Redeploy:** Once all keys are saved in Vercel, click "Deployments" and trigger a fresh redeploy so the server picks up the new keys.

---

## 5. 📱 Business Operations
- [ ] **WhatsApp Number:** Ensure the hardcoded phone number that receives the WhatsApp receipt links on the success page is your actual business phone number.
- [ ] **Test Real Transaction:** Use your own real credit card to buy a $1 test item on the live site to ensure money hits your actual Square bank account before announcing the launch.
