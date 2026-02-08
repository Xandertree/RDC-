# Ride or Die Deal Finder (Embeddable MVP)

This is a **static** (no-backend) MVP you can host anywhere and **embed into your existing GoDaddy site** with an iframe.

It enforces your defaults:
- **California (CA)**
- **Clean title only**
- **Normal wear only**
- **Deal% <= 50%**
- Deal% uses **price + fees estimate + $500 transport buffer**

It currently loads inventory from:
- `data/sample_listings.json` (replace with your real feed)

## Run locally (quick test)
Option A: open `index.html` directly.
Option B (better): run a tiny web server so fetch() works everywhere:

### Python
```bash
cd rideordie-dealfinder
python -m http.server 8080
```
Then open: http://localhost:8080

## Deploy (pick one)
### Netlify (fast)
1. Create a free Netlify account
2. Drag-and-drop the folder into Netlify
3. Netlify gives you a URL like `https://yourname.netlify.app`

### Vercel / Cloudflare Pages / GitHub Pages
Any static host works.

## Embed into GoDaddy
Create a page (or section) and add an **HTML / Embed** block, then paste:

```html
<iframe
  src="https://YOUR-HOST-URL-HERE/"
  style="width:100%;height:1200px;border:0;border-radius:16px;overflow:hidden;"
  loading="lazy"
  referrerpolicy="no-referrer"
></iframe>
```

## Replace sample inventory with real inventory
Update `data/sample_listings.json` to a list of objects like:

```json
{
  "id": "COPART-123",
  "source": "Copart",
  "state": "CA",
  "city": "Sacramento",
  "year": 2018,
  "make": "Toyota",
  "model": "Camry",
  "trim": "SE",
  "miles": 84500,
  "title": "Clean",
  "damage": "Normal Wear",
  "price": 5200,
  "fees_est": 750,
  "transport_buffer": 500,
  "fmv": 16500,
  "url": "https://...",
  "img": "https://..."
}
```

## Important
Auction “damage codes” are not guarantees; third parties note auctions disclaim accuracy, so treat this as a **lead filter**, not a promise.
