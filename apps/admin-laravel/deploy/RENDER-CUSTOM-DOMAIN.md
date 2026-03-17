# Bind admin.niatmurniacademy.com to Render (fix 403)

**Note:** Subdomain migration is **paused**. Current working admin URL is **https://niatmurniacademy.com/admin** (Next.js). This doc is for when you resume moving admin to the subdomain.

Laravel works at **niatmurniacademy.com/admin** (via main site) but **admin.niatmurniacademy.com/admin** returns **403** when the subdomain is not bound to the Render service.

---

## 1. Render: Add custom domain

1. Open [Render Dashboard](https://dashboard.render.com).
2. Select your **Laravel (admin)** web service.
3. Go to **Settings** → **Custom Domains**.
4. Click **Add Custom Domain**.
5. Enter: **admin.niatmurniacademy.com**
6. Save. Render will show the target you need for DNS (e.g. **your-service-name.onrender.com**).

---

## 2. Cloudflare: DNS record

1. Open [Cloudflare Dashboard](https://dash.cloudflare.com) → select **niatmurniacademy.com**.
2. Go to **DNS** → **Records**.
3. Add or edit:

   | Type  | Name  | Target                          | Proxy status   |
   |-------|-------|----------------------------------|----------------|
   | CNAME | admin | your-service-name.onrender.com  | **DNS only** (grey cloud) |

   Use the **exact** target Render shows under Custom Domains (e.g. `niatmurniacademy-admin.onrender.com`).

4. **Important:** Set the cloud to **grey (DNS only)**. Orange (proxied) can cause 403 or SSL issues with Render unless you use Full (strict) SSL and have Render’s cert.

---

## 3. Confirm niatmurniacademy.com/admin does not serve Laravel

The **Next.js** app (main site) does **not** serve Laravel at `/admin`. It **redirects** to the subdomain:

- **niatmurniacademy.com/admin** → 302 → **https://admin.niatmurniacademy.com/admin**

So there is no conflicting route on the main domain pointing at Laravel; the main site only redirects.

---

## 4. Wait and redeploy

- DNS can take a few minutes (up to 48 hours in rare cases).
- In Render, trigger a **Manual Deploy** (Deploy → Deploy latest commit) after adding the custom domain so Render can provision SSL for **admin.niatmurniacademy.com**.

---

## 5. Verify

- **https://admin.niatmurniacademy.com** → redirects to `/admin` (Laravel).
- **https://admin.niatmurniacademy.com/admin** → Filament login/dashboard (no 403).

---

## Why you were getting 403

- Render only accepts requests for domains listed under **Custom Domains** for that service.
- If **admin.niatmurniacademy.com** is not added, Render responds with **403 Forbidden** for that `Host`.
- Adding the subdomain in Render and pointing it with a CNAME (DNS only) in Cloudflare fixes the 403 so the Laravel app is served correctly.
