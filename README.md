# Vayalnad Stay — website

A static, multi-page marketing site for Vayalnad Stay, a homestay in Wayanad,
Kerala. No build step — just HTML, CSS and one small JS file. The site files
live at the repo root so it can be hosted anywhere (GitHub Pages, Cloudflare
Pages, Netlify, or plain shared hosting / cPanel).

## Structure

```
index.html            Home
about.html             Our Story (host name & history: dummy text)
rooms.html             Rooms & Rates
things-to-do.html      Things to Do in Wayanad
gallery.html           Photo gallery + lightbox
booking.html           Booking request -> pre-filled WhatsApp message
contact.html           Contact details, map, directions
assets/
├── css/styles.css
├── js/main.js          nav, reveal, lightbox, video, booking->WhatsApp
├── img/                property photos + property-tour.mp4
└── brand/              favicon.svg, logo.jpg
media/                  original photos & video (source, not used by the site)
```

## Run locally

```bash
python -m http.server 8080
```

Then open http://localhost:8080

## Deploy

**GitHub Pages** — repo Settings → Pages → Source: *Deploy from a branch* →
`main` / `/ (root)`. Live at `https://<user>.github.io/<repo>/`.

**Cloudflare Pages / Netlify** — connect the repo, framework preset *None*,
build command empty, output directory `/` (root).

## Before you go live — replace the dummy content

1. **Contact details** — edit the `window.VNS` object at the top of
   `assets/js/main.js`:
   ```js
   window.VNS = {
     whatsapp: '919567394350',        // full international, digits only
     phoneDisplay: '+91 9567394350',
     email: 'stay@vayalnadstay.com',
   };
   ```
   The site fills every WhatsApp / call / email link from these three values.

2. **Address & distances** — search the pages for `Vayalnad, near Meenangadi`.
   Update the address, the Google Maps embed `src` in `contact.html`, and all
   the `~ nn km` distances (rooms, things-to-do, contact).

3. **Rooms & rates** — `rooms.html`, `index.html` (rooms preview) and
   `booking.html` (the `<select id="room">` options + rates panel). Room names,
   bed configs, occupancy and prices are all sample content.

4. **Story text** — `about.html`. Only the tagline is confirmed; the host name,
   family history and all plot/grounds details are dummy prose.

5. **Reviews** — `index.html` testimonials are dummy. Swap in real quotes or
   link your Google / Airbnb reviews.

6. **Social links** — every `href="#"` on the Instagram / Facebook icons
   (top bar + footer on all pages).

7. **Images** — drop replacements into `assets/img/` keeping the same
   filenames and the pages pick them up. For best performance, re-export the
   large photos to ~1600px wide and consider WebP.

## Branding

- Colours: deep olive green `#2c3617`, copper / rose-gold `#c08a6b`,
  brick clay `#a4542f`, cream `#f7f2e7` — all defined as CSS variables at the
  top of `styles.css`.
- Type: Cormorant Garamond (headings) + Work Sans (text), from Google Fonts.
- The header/footer wordmark is set in type with a small SVG tree mark that
  echoes the logo. `logo.jpg` is used as the favicon source and the
  social-share (OG) image. A transparent PNG or SVG logo can go straight into
  the header if available.
