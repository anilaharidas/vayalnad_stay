# Vayalnad Stay — website

A static, multi-page marketing site for Vayalnad Stay, a homestay in Wayanad, Kerala.
No build step. Just HTML, CSS and one small JS file. Host it anywhere (Netlify,
GitHub Pages, Cloudflare Pages, or plain shared hosting / cPanel).

## Structure

```
site/
├── index.html            Home
├── about.html            Our Story (host name & history: placeholder)
├── rooms.html            Rooms & Rates
├── things-to-do.html     Things to Do in Wayanad
├── gallery.html          Photo gallery + lightbox
├── booking.html          Booking request → pre-filled WhatsApp message
├── contact.html          Contact details, map, directions
└── assets/
    ├── css/styles.css
    ├── js/main.js        nav, reveal, lightbox, video, booking→WhatsApp
    ├── img/              your property photos + property-tour.mp4
    └── brand/            favicon.svg, logo.jpg
```

## Run locally

```bash
cd site
python -m http.server 8080
```

Then open http://localhost:8080

## >>> Before you go live — replace the placeholders <<<

1. **Contact details** — edit the `window.VNS` object at the top of
   `assets/js/main.js`:
   ```js
   window.VNS = {
     whatsapp: '919000000000',        // full international, digits only
     phoneDisplay: '+91 90000 00000',
     email: 'stay@vayalnadstay.com',
   };
   ```
   The site fills every WhatsApp / call / email link from these three values.

2. **Address & distances** — search the pages for `Vayalnad, near Meenangadi`
   and the `note-strip` boxes. Update the address, the Google Maps embed `src`
   in `contact.html`, and all the `~ nn km` distances (rooms, things-to-do,
   contact).

3. **Rooms & rates** — `rooms.html`, `index.html` (rooms preview) and
   `booking.html` (the `<select id="room">` options + rates panel). Room names,
   bed configs, occupancy and prices are all sample content.

4. **Story text** — `about.html`. Only the tagline is confirmed; the host
   name, family history and all plot/grounds details are placeholder prose.

5. **Reviews** — `index.html` testimonials are placeholders. Swap in real
   quotes or link your Google / Airbnb reviews.

6. **Social links** — every `href="#"` on the Instagram / Facebook icons
   (top bar + footer on all pages).

7. **Images** — drop replacements into `assets/img/` keeping the same
   filenames and the pages pick them up. For best performance, re-export the
   large photos to ~1600px wide and consider WebP.

Every spot that needs your input is also flagged on-page with a dashed green
"note strip" so nothing ships unnoticed.

## Branding

- Colours: deep olive green `#2c3617`, copper / rose-gold `#c08a6b`,
  brick clay `#a4542f`, cream `#f7f2e7` — all defined as CSS variables at the
  top of `styles.css`.
- Type: Cormorant Garamond (headings) + Work Sans (text), loaded from Google
  Fonts.
- The header/footer wordmark is set in type with a small SVG tree mark that
  echoes your logo. Your actual `logo.jpg` is used as the favicon source and
  the social-share (OG) image. If you have the logo as a transparent PNG or
  SVG, send it and it can go straight into the header.
