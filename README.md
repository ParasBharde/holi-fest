# holi-fest

Single-page Holi animated website + mini-game (“Holi Color Blitz”) with optional Neon Postgres leaderboard for Vercel deploys.

## Features
- Step-wise flow: enter player name → start 20s game.
- Fullscreen, no-page-reload Holi experience.
- Canvas powder bursts + floating gulal particles.
- Throw Colors button, ripple effect, bonus orb (+5), quote rotation.
- Theme changes on interactions.
- Optional persistent leaderboard via Neon Postgres through Vercel Serverless Functions.

## Local run
```bash
python3 -m http.server 4173
# open http://localhost:4173
```

> Note: with static server only, `/api/*` won’t exist, so leaderboard gracefully shows “API not connected yet”.

## Deploy on Vercel + Neon
1. Create Neon Postgres project and copy pooled connection string.
2. In Vercel project settings, add environment variable:
   - `DATABASE_URL=<your-neon-connection-string>`
3. Deploy.
4. Serverless endpoints used by frontend:
   - `POST /api/score`
   - `GET /api/leaderboard`

The table is auto-created on first request (`holi_scores`).
