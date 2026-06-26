# The Mini Wear — Kids Clothing E-commerce

Full-stack dynamic e-commerce platform with storefront, customer dashboard, and admin panel.

## Stack

- **Next.js 16** (App Router, SSR)
- **PostgreSQL** + Prisma ORM
- **NextAuth.js** (credentials + Google OAuth)
- **Stripe** Checkout
- **Firebase Storage** (product images)
- **Resend** (transactional email)
- **Cloudflare Workers** deployment via OpenNext

## Getting Started

**Requirements:** Node.js 22+ (`nvm use` reads `.nvmrc`)

```bash
cd ~/Projects/theminiwear
pnpm install
cp .env.example .env   # then fill in your values
pnpm db:push           # create tables
pnpm db:seed           # seed sample data
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### Seed accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@theminiwear.com | password123 |
| Order Manager | orders@theminiwear.com | password123 |
| Support Agent | support@theminiwear.com | password123 |
| Customer | customer@example.com | password123 |

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Local development server |
| `pnpm build` | Production build |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:push` | Push schema to database |
| `pnpm db:seed` | Seed sample data |
| `pnpm preview` | Cloudflare Workers local preview |
| `pnpm deploy` | Deploy to Cloudflare Workers |

## Deploy to Cloudflare via GitHub

See **[DEPLOY.md](./DEPLOY.md)** for the full step-by-step guide (Neon, Hyperdrive, GitHub, secrets, and auto-deploy).

Quick summary:

1. Push repo to GitHub
2. Create Neon PostgreSQL + Cloudflare Hyperdrive
3. Update Hyperdrive ID in `wrangler.jsonc`
4. Set Worker secrets in Cloudflare dashboard
5. Connect repo in Cloudflare Workers Builds **or** use the included GitHub Action

## Features

- **Storefront:** Home, shop, product detail, cart, Stripe checkout, wishlist
- **Customer account:** Orders, shipping timeline, profile, addresses, inquiries
- **Admin panel:** Products, orders, CRM, inquiries, shipping zones, discounts, analytics
- **Role-based admin:** ADMIN, ORDER_MANAGER, SUPPORT_AGENT
