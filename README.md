# Markro Client

Next.js 16 App Router frontend for **Markro**, a peer-to-peer equipment rental marketplace.

Buyers browse and rent approved listings, sellers publish and manage ads, and admins approve listings and review payments. Authentication and payments are handled by Better Auth and Stripe Checkout.

## Prerequisites

- Node.js 20.9+ (22 LTS recommended)
- npm
- A MongoDB database named `markro`
- Stripe test-mode API keys
- An ImgBB API key for seller image uploads
- The companion Express API in [`../server`](../server) running on port `5000`

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in this directory:

   ```env
   BETTER_AUTH_SECRET=replace-with-a-long-random-secret
   BETTER_AUTH_URL=http://localhost:3000
   NEXT_APP_URL=http://localhost:3000
   BETTER_AUTH_DB_URL=mongodb://localhost:27017/markro
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_IMG_BB_URL=your-imgbb-api-key

   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   ```

   `NEXT_APP_URL` must match the API server's `NEXT_API_CLIENT_URL`, because the server verifies Better Auth JWTs against `${NEXT_API_CLIENT_URL}/api/auth/jwks`.

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open <http://localhost:3000>.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm start` | Serve a production build |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Type-check without emitting files |

Maintenance scripts:

```bash
# Convert legacy numeric prices to USD dollars (idempotent)
node --env-file=.env scripts/migrate-ad-prices-to-usd.mjs

# Preview seller Stripe payments that could be backfilled
node --env-file=.env scripts/backfill-stripe-payments.mjs

# Actually write the backfill records (use carefully)
node --env-file=.env scripts/backfill-stripe-payments.mjs --apply
```

## Environment variables

| Variable | Purpose |
| --- | --- |
| `BETTER_AUTH_SECRET` | Secret used by Better Auth to sign/verify auth data |
| `BETTER_AUTH_URL` | Better Auth local base URL |
| `NEXT_APP_URL` | Public app origin and JWT issuer/audience |
| `BETTER_AUTH_DB_URL` | MongoDB connection string for Better Auth, bookings, and payments |
| `NEXT_PUBLIC_API_URL` | Base URL of the Express ads API |
| `NEXT_PUBLIC_IMG_BB_URL` | ImgBB upload API key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_SECRET_KEY` | Stripe secret key used by server route handlers |

## Main flows

### Browse and product details

- `/browse-ads` supports `search`, `category`, `city`, and `rentType` filters.
- Filter parameters can repeat; the backend treats repeated values as an `$in` query.
- Listings link to `/ads/:id`.
- Product detail pages require a signed-in user; logged-out visitors are sent to the home page with a `redirectTo` value.
- Search and listing cards use the shared `ProductCard`, so home and browse cards stay consistent.

### Buyer rental checkout

1. The **Rent** button on `/ads/:id` submits a native POST to `/api/buyer/rent-checkout`.
2. The route creates a Stripe Checkout Session for **one rent unit**.
3. `ad.price` is stored in **USD dollars** (for example `35` means `$35.00`); the client converts it to `3500` cents for Stripe.
4. `/checkout/rent/success` verifies the session belongs to the signed-in buyer and is paid before recording anything.
5. A successful checkout creates a booking and payment record once, then decrements the ad quantity by one.
6. Completed rentals appear in `/dashboard/buyer/my-bookings` and `/dashboard/buyer/payment-history`.

### Seller posting paywall

- Sellers can publish **2 ads for free**.
- The third posting attempt is redirected to `/dashboard/seller/payment-history/checkout`.
- Checkout charges a one-time **$20.00** Stripe payment.
- After Stripe confirms payment, the seller can keep posting without paying again.
- Eligibility is checked in `/api/seller/posting-status` and again by the Express API when an ad is created.
- Only payments with `product: "seller_pro"` satisfy the seller paywall; rental payments do not.

### Admin

- `/dashboard/admin/ads-approval` reviews pending ads.
- `/dashboard/admin/manage-ads` manages all ads.
- `/dashboard/admin/manage-users` manages users.
- `/dashboard/admin/payment-management` lists every completed seller and rental payment.
- `/dashboard/admin` shows a payment overview and the five most recent payments.

## Project structure

```text
src/
  app/
    (Pages)/                 # Public pages and dashboard pages
    api/                     # Route handlers for Stripe and posting status
  components/
    BrowseUI/                # Browse filters, grid, and product card
    DashboardUI/             # Admin, buyer, and seller dashboard components
    HomeUI/                  # Home page sections
    NavbarUI/                # Header, login, and registration dialogs
  lib/
    ads.ts                   # Approved-ad queries
    auth.ts / auth-client.ts # Better Auth server/client setup
    booking*.ts              # Rental pricing, bookings, and quantity updates
    payment*.ts              # USD formatting, Stripe helpers, payment storage
  proxy.ts                   # Route protection for /ads and /dashboard
scripts/                     # Data migration and Stripe backfill helpers
```

## Pricing convention

All item prices are stored as **USD dollars** in MongoDB. Formatting uses `formatUsdPrice`, and Stripe amounts use `formatUsd`/`getAdPriceInCents`. Payment amounts in `bookings` and `payments` are stored as integer cents to avoid floating-point rounding.

## Notes

- `cacheComponents` and `authInterrupts` are enabled in `next.config.ts`.
- Pages that read cookies, headers, sessions, or `searchParams` use `<Suspense>` where required.
- Route protection is implemented in `src/proxy.ts` (Next.js 16 naming).
- Use Stripe **test** keys during development. Never commit real `.env` values.
