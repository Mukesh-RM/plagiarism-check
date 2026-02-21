# AI Detection + Humanizer SaaS (TwinGPT-style)

Production-oriented monorepo scaffold for:
- AI detection (perplexity proxy + burstiness + stylometry)
- Plagiarism pipeline placeholder
- Humanizer rewrite loop (max 3 iterations)
- JWT authentication
- Subscription usage limits
- PDF report generation
- Next.js 14 dashboard

## Structure

- `frontend/` Next.js App Router, Tailwind, Framer Motion UI
- `backend/` Express + MongoDB + JWT + BullMQ-ready API
- `ai-services/` prompt and detection notes
- `utils/` shared placeholders

## API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/analysis/analyze`
- `POST /api/analysis/humanize`
- `POST /api/reports/pdf`
- `POST /api/billing/create-checkout-session`

## Run locally

```bash
npm install
npm run dev:backend
npm run dev:frontend
```

Required env vars for backend:
- `MONGO_URI`
- `JWT_SECRET`
- `OPENAI_API_KEY` (optional, falls back to heuristic humanizer)
- `REDIS_URL`
- `APP_URL`
