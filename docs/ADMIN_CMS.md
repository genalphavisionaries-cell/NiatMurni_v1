# Admin CMS — Homepage & Site Control

The Laravel Filament admin panel lets you control all content referenced in the blueprint and mechanism docs.

## Access

- **URL:** `/admin` (or your deployed admin base URL)
- **Login:** Use credentials from your admin user seeder or Filament auth.

## Navigation

| Group | Items |
|-------|--------|
| **Site** | Homepage Settings (CMS) |
| **Courses** | Programs, Class Sessions |
| **Bookings & Participants** | Bookings, Participants, Employers |
| **Compliance** | Certificates, Verification Records, Audit Logs |

## Homepage Settings (CMS)

Under **Site → Homepage Settings** you get a **tabbed form**:

1. **General** — Site name, header logo, header menu items
2. **Hero** — Headline, subheadline, CTA, background image, overlay
3. **Footer** — Footer logo, description, link columns, copyright, SSL badge image
4. **Banners** — Main banner blocks (title, description, image, CTA, layout)
5. **Why Choose** — Section title, subtitle, image, benefits (icon, title, description, order)
6. **Social Proof** — Section title, Google rating, review count, client logos, testimonials (name, role, rating, review, avatar, order)
7. **Payment Icons** — Payment method icons (VISA, Mastercard, QR, DuitNow, etc.) for footer

All image fields use **File Upload**; files are stored under `storage/app/public` and served at `/storage/...`. Set `APP_URL` in the admin app so the **public API** returns full image URLs to the website.

## Public API for Website

- **Endpoint:** `GET /api/homepage-settings`
- **Auth:** None (public)
- **Response:** JSON matching the frontend `HomepageSettings` type. Storage paths are resolved to full URLs using `APP_URL`.

The Next.js website uses this when `NEXT_PUBLIC_ADMIN_API_URL` is set (e.g. `https://admin.yoursite.com`). It fetches on the server and falls back to built-in defaults if the request fails.

## Blueprint Alignment

- **Programs & Class Sessions** — Create/edit programs and class sessions; assign trainer; Zoom meeting is created automatically when configured.
- **Bookings** — List, edit, override status (with audit reason), trigger Stripe checkout, refund.
- **Participants / Employers** — Manage trainee and corporate accounts.
- **Certificates** — View, re-issue, revoke; QR verification link is public.
- **Verification & Audit** — View verification records and audit logs for compliance.
- **Dashboard** — KPIs: paid/pending bookings, upcoming classes, revenue (via widgets).

## Best Practices

- Use **Save changes** after editing any tab; the current tab is persisted in the URL.
- Repeaters (menu items, footer columns, testimonials, etc.) support **reordering**.
- For payment icons and SSL badge, upload images that work on light backgrounds (footer card).
