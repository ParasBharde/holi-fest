# Holi Fest (Next.js + Neon + Three.js)

Production-ready single-page Holi web experience with protected admin dashboard.

## Stack
- Next.js App Router
- TailwindCSS
- Three.js + GSAP
- Neon Postgres
- API Routes
- Middleware route protection
- Vercel-ready

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy env:
   ```bash
   cp .env.example .env.local
   ```
3. Run SQL in Neon:
   ```sql
   \i sql/schema.sql
   ```
4. Start dev server:
   ```bash
   npm run dev
   ```

## Routes
- `/` user experience (name entry + personalized animation)
- `/admin` admin login
- `/admin/dashboard` protected dashboard

## API
- `POST /api/user`
- `GET /api/user-count`
- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/users`

## Security
- Admin credentials validated server-side in API route.
- httpOnly session cookie with JWT signature.
- Middleware protects `/admin/*` except `/admin` login page.
