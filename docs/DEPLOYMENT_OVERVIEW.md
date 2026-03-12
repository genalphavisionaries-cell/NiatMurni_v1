# Deployment overview — what runs where

This doc clarifies the **current structure** and **where to deploy** each part so you’re not confused between Laravel (Render) and the new Next.js dashboards.

---

## 1. Quick picture

| What | Where it runs | Role |
|------|----------------|------|
| **Laravel** (existing) | **Render** (current setup) | Backend: CMS API, migrations, Filament (old admin UI). Keep as-is. |
| **Go API** | **Render** (or same as now) | Backend: classes, bookings, payments, certificates. |
| **Next.js** (`apps/web`) | **New deployment** (see below) | Frontend: public website + **new** Admin / Tutor / Participant dashboards and login. |

- You do **not** need a second Laravel or a “new Render Laravel.”
- You **do** need to deploy the **Next.js app** somewhere and point your main domain (or a subdomain) to it so users see the public site and the new dashboards.

---

## 2. Why two “admin” UIs?

- **Laravel Filament (Render)**  
  The original admin panel. It’s “old school” but still useful for: migrations, CMS (homepage settings), and backend tasks. It can stay on Render as a backend service; you can keep using it at e.g. `admin.yoursite.com` or a separate URL, or use it only for API + migrations and stop opening the Filament UI.

- **Next.js dashboards (new)**  
  The **modern** Admin, Tutor, and Participant panels we built in the repo. They live in the **Next.js app** (`apps/web`): `/admin`, `/admin/login`, `/tutor`, `/participant`. This is the UI you want people to use day-to-day. It talks to **Go API** (classes, bookings, etc.) and **Laravel** only for CMS (e.g. homepage content).

So: **Laravel on Render = backend**. **Next.js = frontend + new dashboards**. Deploy Next.js somewhere and use it as the main face of the product.

---

## 3. Where to deploy the Next.js app

The Next.js app is in **`apps/web`**. It currently uses **static export** (`output: 'export'`), so you get a static build (no Node server required unless you want one). You can deploy it to any of these:

### Option A: Cloudflare Pages (recommended if you already use Cloudflare)

- Good for static sites. Fits the current static export.
- Connect your repo, set **build command** to something like:  
  `cd apps/web && npm ci && npm run build`  
  and **publish directory** to `apps/web/out`.
- Set **root directory** to `apps/web` if the platform supports it, or run the build from repo root with the commands above.
- Add env vars: `NEXT_PUBLIC_GO_API_URL`, `NEXT_PUBLIC_ADMIN_API_URL` (Laravel CMS base URL).
- Your main domain (e.g. `niatmurniacademy.com`) or a subdomain (e.g. `www`) can point to this Cloudflare Pages project. That becomes the “frontend” URL; e.g. `https://niatmurniacademy.com/admin/login` will be the new admin login.

### Option B: New service on Render

- Add a **new** Render service (do not replace the existing Laravel one).
- **Static Site:** point it at the repo, build command `cd apps/web && npm ci && npm run build`, publish directory `apps/web/out`.  
  Or **Web Service:** build and run `npm run start` (you’d need to remove `output: 'export'` and run a Node server).
- Give it a URL like `niatmurni-web.onrender.com` or a custom domain. Use this URL for the public site and the new dashboards (`/admin`, `/tutor`, `/participant`).
- Laravel and Go stay as separate services on Render (same as now).

### Option C: Vercel

- Best fit for Next.js. Connect the repo, set root to `apps/web`. Vercel will detect Next.js and build it.
- You can keep static export or switch to server (Vercel runs Node for you). If you keep static export, the same limits apply (e.g. middleware doesn’t run).
- Assign your domain or subdomain to this project. That’s where the new admin login and dashboards live.

### Option D: Netlify

- Similar to Cloudflare Pages: connect repo, set base directory to `apps/web`, build command `npm run build`, publish directory `out`. Add env vars for Go and Laravel API URLs.
- Point your domain or subdomain to this site.

---

## 4. Summary

| Question | Answer |
|----------|--------|
| Do I keep Laravel on Render? | **Yes.** Keep the current Render setup for Laravel (and Go if it’s there). No need for a “new” Laravel. |
| Where do the new Admin/Tutor/Participant panels run? | In the **Next.js app** (`apps/web`). Deploy that app to **one** of: Cloudflare Pages, Render (new static or web service), Vercel, or Netlify. |
| Cloudflare Pages? | **Yes.** Use it for the Next.js static export: build `apps/web`, publish `apps/web/out`, point your domain (or www) to it. |
| New installation on Render? | **Yes**, but as a **new service** (Static Site or Web Service) for **Next.js**, not a second Laravel. |
| What about the 404 on niatmurniacademy.com/admin/login? | If that domain points to **Laravel**, Laravel has no `/admin/login` route (Filament is at `/admin`). So use the **URL of the Next.js deployment** (e.g. Cloudflare Pages or Render) for `/admin/login` and the new dashboards. |

Once the Next.js app is deployed and the domain (or subdomain) points to it, **that** is where you launch the new admin panel and login. Laravel on Render stays as the backend for CMS and migrations; no need to “launch” a second Laravel.
