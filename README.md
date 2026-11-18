# YOUR COASTAL KITCHEN — website

Premium one-page website for a coastal Karnataka / Mangalorean food truck in Bangalore.
Built with Next.js (App Router), React, TypeScript, Tailwind CSS, Framer Motion and Lucide icons.

## Run it

```bash
npm install
npm run db:setup                              # create the database (first time, and after updates)
npm run admin:create -- you@example.com       # create your admin login (asks for a password)
npm run dev                                   # http://localhost:3005  ·  admin: http://localhost:3005/admin
```

Production: `npm run build && npm start`.

## Admin dashboard (`/admin`)

Sign in with the account you created. From there you can:

- add, edit, preview, hide or delete dishes
- upload a photo from your phone or computer (resized and cleaned automatically)
- add any number of portions per dish (e.g. Small 250 g ₹180, Medium 500 g ₹340), each with its own price and availability
- mark a dish or a single portion as sold out
- manage categories

Changes show on the website immediately. Drafts stay hidden until you switch on "Show on website".
On the menu, customers pick a portion and "Ask on WhatsApp" sends e.g.
"Hello! I am interested in ordering Chicken Sukka (Medium, 500 g), priced at ₹340."

There is no public sign-up. To add another admin or reset a password, run `npm run admin:create -- email@example.com` again.

## Deploying (Vercel + Turso) — all in the browser

1. **Turso** (turso.tech): create a database (pick the Mumbai region), then copy its **URL** (`libsql://…`) and create a **token**.
2. **Vercel** (vercel.com): Add New → Project → import `akankshk08/food_truck`. Before clicking Deploy, open *Environment Variables* and add:
   - `DATABASE_URL` = the Turso URL
   - `DATABASE_AUTH_TOKEN` = the Turso token
   - `ADMIN_EMAIL` = the email you'll sign in with
   - `ADMIN_PASSWORD` = a strong password (10+ characters)
3. Click **Deploy**. Each build sets up/updates the database automatically (`vercel-build` script); the first one also creates your admin login.
4. **Photos:** Vercel → your project → Storage → Create → **Blob** (public) → connect it to the project, then Redeploy. This sets `BLOB_READ_WRITE_TOKEN`.
5. After your first sign-in at `https://<your-project>.vercel.app/admin`, delete `ADMIN_PASSWORD` (and `ADMIN_EMAIL`) from the environment variables. They are only used when no admin exists yet.
6. Set `NEXT_PUBLIC_SITE_URL` to your site's address (e.g. `https://<your-project>.vercel.app`) and redeploy, so share links and SEO use the right address.
7. In Turso, check that backups / point-in-time recovery are on for your database.

Other hosts work too: any Node.js server with `npm run build && npm start`. Without Blob, photos are saved in `UPLOAD_DIR` (default `./data/uploads`) — back that folder up along with the database.

## Tests

```bash
npm test                         # quick checks (prices, WhatsApp message, validation)
npm run build && npm run test:api   # full API tests against a throwaway database
```

## Change content — one file: `config/brand.ts`

| What | Where in `config/brand.ts` |
|------|---------------------------|
| Brand name (used everywhere, incl. SEO & share card) | `brand.name`, `brand.shortName` |
| WhatsApp number & pre-filled message | `contact.whatsappNumber` (digits only, e.g. `919876543210`), `contact.whatsappMessage` |
| Phone for click-to-call | `contact.phone` (`+919876543210`) and `contact.phoneDisplay` |
| Instagram | `contact.instagramUrl`, `contact.instagramHandle` |
| Truck location & map | `location.spotName`, `location.mapsQuery` (full address) or `location.coordinates` (`{ lat, lng }`), `location.mapZoom` |
| Opening hours | `hours` |
| Menu items, photos & prices | **Admin dashboard at `/admin`** (no code editing needed) |
| Site photos (hero, Our Story) & alt text | `images` |

Until a value is filled in, the site shows a tidy placeholder ("Coming Soon", "Number coming soon", etc.).
WhatsApp buttons work even before a number is set — WhatsApp opens with the message ready and asks who to send it to.

Set `NEXT_PUBLIC_SITE_URL` (e.g. `https://yourdomain.in`) when deploying so SEO and social-share links are correct.

## Photos

See [`public/images/README.md`](public/images/README.md) for file names and a shot list.
Add a photo with the right name and it replaces the placeholder automatically on the next build.

## Structure

```
app/            layout (fonts, SEO, structured data), page, share image, icon, sitemap, robots
components/     Navbar, Hero, HeroScene, MenuSection, MenuCard, OurStory, WhyChooseUs, FindUs, Footer, FloatingWhatsApp
components/ui/  Logo, Reveal (scroll animation), SectionHeading, SmartImage (photo/placeholder), BrandIcons
config/brand.ts all editable content
lib/            link builders (WhatsApp, tel, Maps) and image lookup
```
