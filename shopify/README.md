# Vayalnad Stay — Shopify theme starter

These files port the header, footer, layout shell and one example content
section (the hero) of the static site into a **custom Shopify theme**. They
reuse your existing `styles.css` and `main.js` almost unchanged.

> Shopify's minimum plan is ~$39/mo. If you only need the marketing pages +
> WhatsApp enquiry, the free static site on Cloudflare/GitHub Pages already
> does that. Use Shopify only if you want online booking + payments or to also
> sell products.

## Folder → Shopify theme mapping

```
shopify/
├── layout/theme.liquid            → layout/theme.liquid
├── config/settings_schema.json    → config/settings_schema.json
├── sections/header.liquid         → sections/header.liquid
├── sections/footer.liquid         → sections/footer.liquid
├── sections/hero.liquid           → sections/hero.liquid   (example page section)
├── snippets/icon.liquid           → snippets/icon.liquid
├── snippets/brand-mark.liquid     → snippets/brand-mark.liquid
├── templates/index.json           → templates/index.json
└── templates/page.json            → templates/page.json
```

You also need to add, from the existing site:

```
assets/styles.css   ← copy of assets/css/styles.css  (unchanged)
assets/main.js      ← copy of assets/js/main.js  WITH ONE EDIT (see below)
assets/favicon.svg  ← copy of assets/brand/favicon.svg
assets/logo.jpg     ← copy of assets/brand/logo.jpg  (used as OG/social image)
```

### The one edit to `main.js`

Delete the `window.VNS = { ... };` object at the very top of the file
(roughly the first 13 lines, down to and including the closing `};`).
`theme.liquid` now defines `window.VNS` from your **Theme settings**, so the
rest of `main.js` works as-is.

## Setup

1. Install the Shopify CLI: `npm i -g @shopify/cli @shopify/theme`
2. `shopify theme init vayalnad-theme` and choose **Skeleton** (or start from
   Dawn and delete its sections).
3. Drop the files above into place, matching the mapping.
4. `shopify theme dev --store your-store.myshopify.com` to preview locally.
5. In the Shopify admin:
   - **Online Store → Navigation** — create a menu called *Main menu* with:
     Home, Rooms & Rates, Things to Do, Gallery, Contact (link each to its Page).
   - **Online Store → Pages** — create Rooms & Rates, Things to Do, Gallery,
     Contact, Book Your Stay. Assign the `page` template.
   - **Online Store → Themes → Customize** — open *Theme settings* and fill in
     the phone / WhatsApp number / email / socials / map link / address.
6. Rebuild each page's body by adding sections (port the remaining markup from
   `rooms.html`, `gallery.html`, etc. the same way `hero.liquid` was made).
7. `shopify theme push` and publish.

## Booking

The `booking.html` form is pure JS + a `wa.me` link — copy its markup into a
new `sections/booking-form.liquid` and it keeps working with no Shopify
commerce involved.

For **real** bookings (dates lock, payment taken), install a booking app
(Appointo / Tipo / Sesami), make each room a Product priced per night, and add
the app's date picker block to the booking section.

## Note: theme editor re-binding

Shopify's theme editor re-renders a section when you edit it, which drops
`main.js`'s event listeners on that section. For the **live site** this is not
an issue. If you want it smooth inside the editor, wrap `main.js`'s body in a
named `init()` and add:

```js
document.addEventListener('shopify:section:load', init);
```
