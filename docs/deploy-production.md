# Deploy Production (Render + Vercel)

## Backend on Render

### 1) Service type
- Create a **Web Service** from this repo.
- Use Blueprint (`render.yaml`) or configure manually.

### 2) If configuring manually
- Root Directory: `backend`
- Build Command: `npm install --include=dev && npm run build`
- Start Command: `npm run start`

### 3) Required environment variables
- `DATABASE_URL`
- `JWT_SECRET` (minimum 32 chars in production)
- `FRONTEND_ORIGIN` (comma-separated if many domains), for example:
  - `https://your-frontend.vercel.app`
- Optional cookie settings:
  - `COOKIE_SAME_SITE` (`lax`/`strict`/`none`)
  - `COOKIE_SECURE` (`true` in production)
  - `COOKIE_DOMAIN` (if using shared parent domain)

### 4) Database migration
- Recommended Pre-Deploy Command on Render:
  - `npx prisma migrate deploy`

---

## Frontend on Vercel

### 1) Project settings
- Root Directory: `frontend` (if deploying monorepo)
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

### 2) Environment variable
- `VITE_API_URL=https://<your-render-backend-domain>/api`

### 3) Common TS build issue
- If Vercel still reports an old TypeScript error (for example, unused import), verify the deployment is using the latest commit SHA.
- If needed, use **Redeploy** with latest commit and **Clear Cache**.
