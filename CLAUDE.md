# Project rules: YOUR COASTAL KITCHEN (Next.js App Router + Drizzle/libSQL (SQLite/Turso) + Tailwind)

Follow the production-web-builder standards. The owner is not a programmer: you are responsible for security and quality by default.

## Map
- Public site: `app/page.tsx` + `components/*` (design is final — don't restyle). Brand/contact/location: `config/brand.ts`.
- Menu data: database, managed at `/admin`. Public menu reads it via `lib/data/menu.ts` → `components/MenuSection.tsx`/`MenuCard.tsx`.
- Admin pages: `app/admin/(panel)/*` (each page calls `requireAdminPage()` itself — layouts alone do NOT protect pages in Next.js).
- Admin API: `app/api/admin/*`, always wrapped in `adminRoute()` (same-origin check + session check + safe errors).
- Data access: `lib/data/*.ts`. Validation: `lib/admin/schemas.ts` (zod, `.strict()`, shared by forms and API).
- Auth: `lib/auth/*` (scrypt hashes, random session tokens stored hashed, httpOnly cookie, DB-backed login rate limit).
- Photos: `lib/storage.ts` (Vercel Blob if `BLOB_STORE_ID` (OIDC) or `BLOB_READ_WRITE_TOKEN`, else `UPLOAD_DIR` served by `app/media/[name]`). Uploads are re-encoded by sharp.
- Schema: `lib/db/schema.ts` → `npm run db:generate` → migration in `drizzle/` → `npm run db:setup`.

## Security (never break)
- No secrets in client code; `NEXT_PUBLIC_*` only for public values.
- Every admin route/page checks the session on the server. No public sign-up; admins via `npm run admin:create`.
- SQL only through Drizzle (parameterized). LIKE searches escape `%`/`_`.
- Never `dangerouslySetInnerHTML` with admin text, except JSON-LD with `<` escaped (see `components/StructuredData.tsx`).
- Prices are integer paise. Never floats.
- Never log passwords, tokens, cookies or full request bodies.

## Workflow
- Smallest change; touch only needed files. Destructive schema changes: stop and explain.
- Run before pushing: `npx tsc --noEmit`, `npm test`, `npm run build && npm run test:api`.
- Add/adjust tests in `tests/` for every new route (401, validation 400, happy path).
- Explain changes to the owner in plain English.
