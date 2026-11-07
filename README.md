# YOUR COASTAL KITCHEN — website

Premium one-page website for a coastal Karnataka / Mangalorean food truck in Bangalore.
Built with Next.js (App Router), React, TypeScript, Tailwind CSS, Framer Motion and Lucide icons.

## Run it

```bash
npm install
npm run dev        # http://localhost:3005
npm run build && npm start   # production
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
| Menu items & prices | `menu` — set `price` to a number (e.g. `180`) when final |
| Photos & alt text | `menu[].image`, `images` |

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
