# Admin login 404 on production

If **https://niatmurniacademy.com/admin/login** returns **404 Not Found**, check the following.

## 1. Which app is served at niatmurniacademy.com?

- **If the domain points to the Laravel app**  
  Laravel only has Filament at `/admin` (login is at `/admin`, not `/admin/login`). So `/admin/login` does not exist on Laravel and will 404.

  **Fix:** Use the **Next.js** app URL for the new admin dashboard and login, for example:
  - `https://www.niatmurniacademy.com/admin/login`, or  
  - `https://app.niatmurniacademy.com/admin/login`  
  (depending on how you host the Next.js app).  
  Then use **Email:** `admin@niatmurni.my` / **Password:** `NiatMurniAdmin!`

- **If the domain points to the Next.js app**  
  Continue with the steps below.

## 2. Next.js app: deploy and routing

- **Redeploy**  
  Ensure the latest code (with `app/admin/login/page.tsx`) is built and deployed. A 404 can mean an old build without the admin login route.

- **Static export (`output: 'export'`)**  
  The app uses `output: 'export'`. The build produces `out/admin/login/index.html`. Your host must serve that file for the path `/admin/login` (or use SPA-style fallback so `/admin/login` is handled by the client app).

  - **Vercel:** Do **not** use “Output: Static Export” if you want middleware (e.g. redirect to login). Use standard Node server build, or keep static export and rely on client-side redirects only.  
  - **Netlify:** Publish the `out` directory and ensure **Redirects** include something like:
    - `/admin/*  /admin/index.html  200`
    - so that `/admin/login` serves the app and the client router can show the login page.  
  - **Other static hosts:** Configure so that `/admin/login` either serves `admin/login/index.html` or falls back to the root `index.html` and lets the client router handle the path.

- **Middleware**  
  With static export, **middleware does not run**. So unauthenticated users can open `/admin` without being redirected to `/admin/login`. For full protection, run Next.js with a server (remove `output: 'export'`) so middleware runs.

## 3. Quick checklist

1. Confirm which service (Laravel vs Next.js) is at `https://niatmurniacademy.com`.
2. If it’s Laravel, use the Next.js base URL + `/admin/login` for the new dashboard login.
3. If it’s Next.js, redeploy and ensure the host serves `/admin/login` (or SPA fallback) from the built files.
