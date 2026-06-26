## Deploy to Cloudflare via GitHub

### What you need

| Service | Purpose | Free tier |
|---------|---------|-----------|
| [GitHub](https://github.com) | Source code + deploy trigger | Yes |
| [Cloudflare](https://dash.cloudflare.com) | Host the app (Workers) | Yes |
| [Neon](https://neon.tech) | Production PostgreSQL | Yes |
| Stripe / Resend / Firebase | Payments, email, images | Test/free tiers |

---

### Step 1 — Production database (Neon)

1. Create a project at [neon.tech](https://neon.tech)
2. Copy the **pooled** connection string (must include `?sslmode=require`)
3. In Neon SQL editor, you can run migrations later with:
   ```bash
   DATABASE_URL="your-neon-url" pnpm db:push
   ```

---

### Step 2 — Cloudflare Hyperdrive

Hyperdrive connects your Worker to Neon with connection pooling.

1. Cloudflare dashboard → **Storage & databases** → **Hyperdrive**
2. **Create** → PostgreSQL → paste your Neon connection string
3. Copy the **Hyperdrive ID**
4. Edit `wrangler.jsonc` and replace `<your-hyperdrive-id>` with that ID

Or via Terminal:

```bash
cd ~/Projects/theminiwear
npx wrangler login
npx wrangler hyperdrive create theminiwear-db --connection-string="YOUR_NEON_URL"
```

---

### Step 3 — Push code to GitHub

```bash
cd ~/Projects/theminiwear
rm -rf .git
git init
git branch -M main
git add .
git commit -m "Initial commit — The Mini Wear storefront"
```

Create a repo on GitHub (empty, no README), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/theminiwear.git
git push -u origin main
```

---

### Step 4 — Cloudflare Worker secrets

In **Workers & Pages** → your worker → **Settings** → **Variables and Secrets**, add:

| Secret | Example |
|--------|---------|
| `NEXTAUTH_SECRET` | Random 32+ char string |
| `NEXTAUTH_URL` | `https://theminiwear.YOUR_SUBDOMAIN.workers.dev` (update after first deploy) |
| `STRIPE_SECRET_KEY` | `sk_test_...` or live key |
| `STRIPE_WEBHOOK_SECRET` | From Stripe webhook settings |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` |
| `RESEND_API_KEY` | Optional |
| `RESEND_FROM_EMAIL` | `orders@theminiwear.com` |
| `FIREBASE_PROJECT_ID` | For image uploads |
| `FIREBASE_CLIENT_EMAIL` | |
| `FIREBASE_PRIVATE_KEY` | |
| `FIREBASE_STORAGE_BUCKET` | |
| `GOOGLE_CLIENT_ID` | Optional OAuth |
| `GOOGLE_CLIENT_SECRET` | Optional OAuth |

`DATABASE_URL` is **not** needed in production if Hyperdrive is configured — Prisma uses the Hyperdrive binding automatically.

---

### Step 5 — Deploy (pick one)

#### Option A — Cloudflare GitHub integration (recommended)

1. **Workers & Pages** → **Create** → **Workers** → **Connect to Git**
2. Select your `theminiwear` repo
3. Build settings:
   - **Framework preset:** None
   - **Build command:** `pnpm install && pnpm db:generate && pnpm exec opennextjs-cloudflare build`
   - **Deploy command:** `pnpm exec opennextjs-cloudflare deploy`
   - **Root directory:** `/`
   - **Node version:** 22
4. Add the secrets from Step 4 in the build/deploy environment
5. Deploy — every push to `main` auto-deploys

#### Option B — GitHub Actions

1. Cloudflare dashboard → **My Profile** → **API Tokens** → Create token with **Edit Cloudflare Workers** permission
2. Copy your **Account ID** from the Workers overview page
3. GitHub repo → **Settings** → **Secrets and variables** → **Actions**:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
4. Push to `main` — the workflow in `.github/workflows/deploy-cloudflare.yml` deploys automatically

---

### Step 6 — After first deploy

1. Note your Worker URL (e.g. `https://theminiwear.username.workers.dev`)
2. Update `NEXTAUTH_URL` secret to that URL
3. Run production migrations:
   ```bash
   DATABASE_URL="your-neon-url" pnpm db:push
   DATABASE_URL="your-neon-url" pnpm db:seed   # optional demo data
   ```
4. Configure Stripe webhook: `https://YOUR-WORKER-URL/api/stripe/webhook`
5. (Optional) Add a custom domain in Cloudflare Workers → **Triggers** → **Custom Domains**

---

### Local Cloudflare preview

```bash
cp .dev.vars.example .dev.vars   # fill in values
pnpm preview                     # runs in Workers runtime on :8787
```

---

### Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails on Prisma | Ensure `pnpm db:generate` runs before `opennextjs-cloudflare build` |
| DB connection errors in prod | Verify Hyperdrive ID in `wrangler.jsonc` and Neon allows Cloudflare IPs |
| Auth redirect loops | `NEXTAUTH_URL` must exactly match your live URL |
| Can't find Hyperdrive | Look under **Storage & databases** → **Hyperdrive** (not Workers & Pages) |
