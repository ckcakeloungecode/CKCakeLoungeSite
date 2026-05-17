# Software Architecture Document (SAD)
**Project:** CK Cake Lounge  
**Date:** May 2026  
**Document Classification:** Technical Design Specification  

---

## 1. Introduction

### 1.1 Purpose
This document provides a comprehensive architectural overview of the CK Cake Lounge digital storefront. It is intended for software engineers, database administrators, and technical stakeholders to understand the system's architecture, data flow, security boundaries, and integration points.

### 1.2 Technology Stack
* **Frontend Framework:** Next.js 15+ (App Router) / React
* **Backend Runtime:** Node.js (via Next.js Serverless API Routes)
* **Database & Auth:** Supabase (PostgreSQL), Supabase Storage
* **Payment Gateway:** Square Web Payments SDK & Square Node.js SDK
* **Transactional Email:** Resend API

---

## 2. Architecture Overview

The application follows a decoupled, serverless architecture utilizing the Next.js App Router. The frontend acts as a static client with dynamic state management via the React Context API, while the backend utilizes serverless edge functions to handle highly privileged operations (payment processing, database mutation, email dispatching).

---

## 3. Security & Authentication Model

### 3.1 Authentication Flow (Supabase Auth)
The application utilizes Supabase Auth for identity management. The system is designed to support a hybrid checkout model (Guest Checkout + Authenticated Sessions). Session persistence is managed globally via `AuthContext`.

```javascript
// Global Session Management via Context API
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    checkSession();
  }, []);
  // ...
};
```

### 3.2 Database Triggers for User Metadata
To decouple the authentication layer from the application's business logic, a PostgreSQL trigger automatically intercepts the `auth.users` insertion event and marshals the `user_metadata` JSON payload into a strictly typed `public.users` table.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, phone_number)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone_number'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

---

## 4. Payment & Order Pipeline (Square)

### 4.1 Client-Side Tokenization
To maintain strict PCI compliance, raw credit card data is never processed by the Next.js backend. The `react-square-web-payments-sdk` securely encrypts the input and returns a secure nonce (`sourceId`).

### 4.2 The Pre-Charge Firewall
Before the Square SDK is invoked on the backend, a critical security middleware checks the database to prevent fraud (e.g., bypassing frontend validation to reuse a one-time promo code).

```javascript
// src/app/api/payment/route.js

// 🚨 Pre-Charge Security Check 🚨
if (couponCode) {
  const { data: coupon } = await supabaseAdmin
    .from('store_coupons')
    .select('is_one_time_use')
    .eq('code', couponCode)
    .single();
    
  if (coupon?.is_one_time_use) {
    const { data: pastOrders } = await supabaseAdmin
      .from('store_orders')
      .select('id')
      .eq('email', formData.email)
      .eq('coupon_code', couponCode);
      
    if (pastOrders && pastOrders.length > 0) {
      return NextResponse.json(
        { error: 'Security Block: You have already used this coupon.' }, 
        { status: 403 }
      );
    }
  }
}

// Proceed to charge the tokenized card via Square API
const response = await client.payments.create({
  sourceId: sourceId,
  idempotencyKey: crypto.randomUUID(), // Prevent double-charging
  amountMoney: { amount: BigInt(amountInCents), currency: 'CAD' },
});
```

### 4.3 Database Mutation (Service Role Key)
Row-Level Security (RLS) restricts public access to the `store_orders` table. Therefore, the backend relies on the `supabaseAdmin` client, initialized with the `SUPABASE_SERVICE_ROLE_KEY`, to safely bypass RLS during the server-side order insertion.

---

## 5. Storage Pipeline & Automated CRON Cleanup

### 5.1 Lossless Upload Pipeline
When a user selects a "Photo Cake", the image is immediately streamed to the Supabase Storage `cake_photos` bucket before checkout. The resulting public URL is attached to the cart payload.

### 5.2 PG_Cron Automated Janitor
To strictly control cloud storage costs, the database utilizes the `pg_cron` extension to run a scheduled background job. This executes a REST call to the Storage API to permanently prune high-resolution images older than 30 days.

```sql
-- pg_cron scheduling example
select cron.schedule(
    'delete-old-cake-photos',
    '0 0 * * *', -- Runs every day at midnight
    $$
    select net.http_post(
        url:='https://<PROJECT_REF>.supabase.co/rest/v1/rpc/delete_old_storage_objects',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer <SERVICE_ROLE_KEY>"}'::jsonb
    );
    $$
);
```

---

## 6. Email Notification Architecture (Resend)

Upon successful payment and database insertion, the serverless function executes an asynchronous call to the Resend API. The payload dynamically constructs HTML based on the cart state, injecting High-Res photo download links conditionally.

```javascript
// Dynamic HTML Generation for Bakery Orders
let itemsHtml = cartItems.map(item => {
  const meta = [
    item.size !== 'Standard' && item.size, 
    item.flavor !== 'Original' && item.flavor, 
    item.isPhotoCake && 'Photo Cake'
  ].filter(Boolean).join(' &bull; ');
  
  return `
  <li>
    <strong>${item.quantity}x ${item.name}</strong>
    ${item.photoUrl ? `<a href="${item.photoUrl}">📷 Download High-Res Photo</a>` : ''}
  </li>
  `;
}).join('');

await resend.emails.send({
  from: 'Orders <onboarding@resend.dev>',
  to: process.env.BAKERY_EMAIL,
  subject: `🎂 New Order: ${formData.firstName} ${formData.lastName} - $${amount}`,
  html: itemsHtml
});
```

---

## 7. Data Models

### `public.store_orders`
* **`id`** (uuid, primary key)
* **`payment_id`** (text) - Square Payment Idempotency link
* **`customer_name`, `email`, `phone`** (text)
* **`order_type`** (text) - ENUM: 'pickup' | 'delivery'
* **`cart_items`** (jsonb) - Serialized state of the user's cart
* **`discount_amount`** (numeric) - Value stripped from subtotal
* **`coupon_code`** (text, nullable)

### `public.store_coupons`
* **`id`** (uuid, primary key)
* **`code`** (text, unique)
* **`discount_type`** (text) - ENUM: 'percentage' | 'fixed'
* **`is_one_time_use`** (boolean) - Validated via backend Pre-Charge firewall
* **`times_used`** (integer) - Automatically incremented upon successful order
