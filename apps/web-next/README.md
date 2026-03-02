# web-next (Next.js)

Public website + participant portal + trainer portal.

## Run
```bash
cp .env.example .env.local
npm install
npm run dev
```

## Rules
- No direct DB access.
- Call Go Core API only: `NEXT_PUBLIC_API_BASE_URL`.
