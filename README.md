# 🌿 Vidhi's Nursery — E-Commerce Website

A beautiful, full-featured plant nursery e-commerce app built with **React + Vite + Tailwind CSS + Supabase**.

## Features
- 🛍️ Product catalog with categories, search, sort & price filter
- 🛒 Add to cart with persistent localStorage storage
- 💳 Full checkout flow (Shipping → Payment → Confirm)
- 🏷️ Coupon codes (try `GREENIE` for 15% off!)
- 👤 User authentication (Sign up / Sign in / Sign out)
- 📦 Order history
- ❤️ Product wishlist
- 📱 Fully responsive mobile design
- 🌙 Beautiful animations & micro-interactions

## Tech Stack
- **React 18** + **Vite 5**
- **Tailwind CSS 3**
- **Supabase** (Auth + Postgres DB)
- **React Router v6**
- **react-hot-toast** for notifications
- **lucide-react** for icons

---

## Setup Instructions

### 1. Install dependencies
```bash
npm install
```

### 2. Create Supabase project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **SQL Editor** and paste the contents of `supabase-schema.sql` to create tables
3. Go to **Settings → API** to get your project URL and anon key

### 3. Configure environment variables
```bash
cp .env.example .env
```
Edit `.env` and add your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run the dev server
```bash
npm run dev
```

Visit `http://localhost:5173` 🎉

---

## Payment Integration (Production)

For real payments, integrate **Razorpay** (recommended for India):

1. Install: `npm install razorpay`
2. Sign up at [razorpay.com](https://razorpay.com)
3. Replace the mock payment in `CheckoutPage.jsx` with Razorpay checkout

```js
// Example Razorpay integration
const options = {
  key: 'YOUR_RAZORPAY_KEY',
  amount: finalTotal * 100, // in paise
  currency: 'INR',
  name: "Vidhi's Nursery",
  handler: function(response) {
    // Save order to Supabase
  }
}
const rzp = new window.Razorpay(options)
rzp.open()
```

---

## Project Structure
```
src/
├── components/
│   ├── Navbar.jsx        # Top navigation with search & cart
│   ├── CartDrawer.jsx    # Sliding cart sidebar  
│   ├── ProductCard.jsx   # Reusable product card
│   └── Footer.jsx        # Site footer
├── context/
│   ├── CartContext.jsx   # Global cart state
│   └── AuthContext.jsx   # Supabase auth state
├── lib/
│   ├── supabase.js       # Supabase client & helpers
│   └── mockData.js       # Sample products (replace with Supabase)
├── pages/
│   ├── HomePage.jsx      # Landing page with hero, categories
│   ├── ShopPage.jsx      # Product listing with filters
│   ├── ProductPage.jsx   # Individual product detail
│   ├── CheckoutPage.jsx  # 3-step checkout flow
│   ├── AuthPages.jsx     # Login & Register
│   ├── OrdersPage.jsx    # User order history
│   ├── AboutPage.jsx     # About us
│   └── ContactPage.jsx   # Contact form
└── App.jsx               # Routes & providers
```
