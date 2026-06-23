# 🌹 Rose App

A full-stack e-commerce platform for flower and gift box delivery, built with Next.js App Router and TypeScript. Supports Arabic and English with full RTL/LTR layout switching.

---

## ✨ Features

### Customer-Facing

- **Product Browsing** — Filter by category, occasion, price range, and rating
- **Product Search** — Real-time search with suggestions
- **Shopping Cart** — Add, update, and remove items with live totals
- **Wishlist** — Save products for later
- **Checkout** — Cash on delivery and credit card payment via Stripe
- **Order Tracking** — View order history and status updates
- **User Profile** — Edit personal info, upload photo, manage addresses, change password
- **Reviews & Testimonials** — Rate products and share experiences
- **Blog** — Browse flower care tips and guides

### Admin Dashboard

- **Overview** — Live statistics: total products, orders, categories, and revenue
- **Products** — Create, edit, and delete products with image uploads
- **Categories** — Manage product categories
- **Occasions** — Manage occasion tags (Wedding, Birthday, etc.)
- **Orders** — View and update order statuses
- **Coupons** — Create and manage discount codes
- **Inventory** — Track stock levels and low-stock alerts
- **Testimonials** — Approve or reject customer testimonials
- **Blog** — Publish and manage blog posts
- **Notifications** — Send bulk or targeted notifications

### Platform

- **Bilingual** — Full Arabic and English support with RTL/LTR layout
- **Dark Mode** — System-aware dark theme
- **Responsive** — Mobile-first design across all screen sizes
- **Role-based Access** — `user`, `admin`, and `superAdmin` roles

---

## 🛠️ Tech Stack

| Category       | Technology                  |
| -------------- | --------------------------- |
| Framework      | Next.js 16 (App Router)     |
| Language       | TypeScript (strict mode)    |
| Styling        | Tailwind CSS v4 + Shadcn/ui |
| Data Fetching  | TanStack Query v5           |
| Authentication | NextAuth.js v5              |
| Forms          | React Hook Form + Zod       |
| i18n           | next-intl                   |
| Charts         | Recharts                    |
| Icons          | Lucide React                |
| Notifications  | Sonner                      |

---

## 📁 Project Structure

```
src/
├── app/                        # Next.js App Router
│   └── [locale]/               # Locale-based routing (ar / en)
│       ├── (auth)/             # Public auth pages
│       ├── (user)/             # Protected user pages
│       └── (admin)/            # Protected admin pages
│
├── features/                   # Feature-based architecture
│   ├── auth/                   # Login, register, password reset
│   ├── products/               # Product listing and detail
│   ├── categories/             # Category management
│   ├── occasions/              # Occasion management
│   ├── cart/                   # Shopping cart
│   ├── orders/                 # Order history and tracking
│   ├── checkout/               # Checkout flow
│   ├── wishlist/               # Saved products
│   ├── reviews/                # Product reviews
│   ├── testimonials/           # Customer testimonials
│   ├── blogs/                  # Blog system
│   ├── coupons/                # Discount codes
│   ├── notifications/          # Push notifications
│   ├── inventory/              # Stock management
│   ├── addresses/              # User addresses
│   ├── home/                   # Home page sections
│   └── admin/                  # Admin dashboard
│
├── shared/                     # Globally shared code
│   ├── components/             # Reusable UI components
│   ├── hooks/                  # Global custom hooks
│   ├── lib/
│   │   ├── apis/               # fetchClient + ApiError
│   │   └── utils/              # Shared utility functions
│   ├── types/                  # Global TypeScript types
│   └── ui/                     # Shadcn/ui components
│
├── messages/                   # Translation files (ar.json / en.json)
│   ├── ar.json
│   └── en.json
│
└── i18n/                       # next-intl navigation and routing configuration
    ├── navigation.ts
    ├── request.ts
    └── routing.ts
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/ahmed-talal-dev/rose-app.git
cd rose-app

# Install dependencies
pnpm install
```

### Environment Variables

Create a `.env.local` file in the root directory:

```dotenv
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-in-production
NEXT_PUBLIC_API_URL=https://flower.elevateegy.com/api/v1
```

| Variable              | Description                                            |
| --------------------- | ------------------------------------------------------ |
| `NEXTAUTH_URL`        | The base URL of your app                               |
| `NEXTAUTH_SECRET`     | A random secret string for NextAuth session encryption |
| `NEXT_PUBLIC_API_URL` | The base URL of the backend API                        |

### Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌍 Internationalization

The app supports **Arabic** and **English** via `next-intl`. The locale is part of the URL path:

```
http://localhost:3000/en   → English (LTR)
http://localhost:3000/ar   → Arabic (RTL)
```

Translation files are located at `src/i18n/messages/`.

---

## 🔐 Authentication & Roles

Authentication is handled by **NextAuth.js v5** using JWT sessions. Routes are protected at the middleware level:

| Route Group  | Allowed Roles                 |
| ------------ | ----------------------------- |
| `/(auth)/*`  | Public                        |
| `/(user)/*`  | `user`, `admin`, `superAdmin` |
| `/(admin)/*` | `admin`, `superAdmin`         |

---

## 📡 API

The app connects to a REST API hosted at:

```
https://flower.elevateegy.com/api/v1
```

All authenticated requests include a Bearer JWT token in the `Authorization` header, handled automatically by the shared `fetchClient`.

---

## 🎨 Design Syste

The app uses a custom design system built on Tailwind CSS v4:

- **Primary color** — Rose red (`#A6252A` → `primary-600`)
- **Typography** — Inter (English) + Tajawal (Arabic)
- **Icons** — Lucide React
- **Components** — Shadcn/ui as the base layer

---

## 📦 Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

---

## 👤 Author

**Ahmed Talal**
[github.com/ahmed-talal-dev](https://github.com/ahmed-talal-dev/rose-app)
