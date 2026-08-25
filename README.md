# Suresh Surkheti — Portfolio

Personal portfolio site. Static HTML, CSS and vanilla JavaScript — no build step,
no framework, no dependencies to install.

**Live:** _add your URL once deployed_

---

## Run it locally

```bash
npm run dev          # serves on http://localhost:8000
```

Or open `index.html` directly in a browser. (Use the server if you want the
**Download CV** button to appear — it checks that `resume.pdf` exists, which
needs `http://`, not `file://`.)

---

## Project structure

```
.
├── index.html              # the whole site — one page
├── resume.html             # résumé source (edit this)
├── resume.pdf              # generated from resume.html — do not edit by hand
├── robots.txt              # search engine rules
├── sitemap.xml             # search engine index
├── package.json            # dev + resume scripts
└── assets/
    ├── css/styles.css      # all styles, design tokens at the top
    ├── js/main.js          # all behaviour
    └── img/                # portrait + one image per project
```

---

## Before you publish — checklist

The site is fully built, but some content is placeholder. Work through this list:

| # | What | Where |
|---|------|-------|
| 0 | ⚠️ **Contact form is not delivering yet.** Send opens the visitor's own mail app — it only arrives if they press send there. Fix: sign up at [formspree.io](https://formspree.io), create a form, paste the ID over `YOUR_FORM_ID` in the form's `action`. `main.js` switches over automatically. | `index.html` — search `YOUR_FORM_ID` |
| 1 | ~~LinkedIn / Facebook~~ — **done.** Both are live in the hero, the contact block, the JSON-LD `sameAs` array, and (LinkedIn only) the résumé. | — |
| 2 | **NTC Intercom App** — the card ships with a minimal, honest description; the reminder is now an HTML comment rather than visible text. Give me the client, what it does and the rest of the stack and I'll write a proper one. | `index.html` — search `NTC Intercom` |
| 3 | **Public project links** — projects 1, 4, 5 and 6 are publicly launched municipal platforms. To link them, add a button labelled "Live platform" — never the internal code name. Projects 2 and 3 stay unlinked. | `index.html` — search `project__note` |
| 3b | **`projects.html`** — the "See all projects" button opens a dedicated page listing every project plus the personal ones. It shares `styles.css` and `main.js`; the cap that hides cards on the home page is disabled there automatically (it only applies where a `#showAllProjects` control exists). | `projects.html` |
| 4 | **Project images** — eight generated SVG mockups stand in for screenshots. Client work may not be screenshot-able, so these are a safe permanent choice. | `assets/img/project-*.svg` |
| 5 | **Your photo** — `suresh-portrait.jpg` is the uncropped original; the three crops derive from it via `magick suresh-portrait.jpg -crop WxH+X+Y +repage out.jpg`. | `assets/img/suresh-*.jpg` |
| 6 | **Domain** — `sureshsurkheti.com` is wired in everywhere (`robots.txt`, `sitemap.xml`, `canonical`, `og:url`, `og:image`, `twitter:image`, and the blog's "Live site" button) but currently has **no DNS records**, so those links 404 until you point the domain. Nothing else to change once you do. | `index.html`, `robots.txt`, `sitemap.xml` |

**Confidentiality:** client names are deliberately withheld — cards say "Regional Japanese prefecture", not the municipality. Keep it that way unless you have written permission.

Find everything still outstanding:

```bash
grep -rn "TODO" index.html resume.html robots.txt sitemap.xml
```

---

## Updating the résumé

Edit `resume.html`, then:

```bash
npm run resume
```

That regenerates `resume.pdf` via headless Chrome. The **Download CV** button on
the site appears automatically whenever `resume.pdf` is present, and hides itself
if it isn't — so it can never be a dead link.

---

## Deploying

No build step, so any static host works. Free options:

- **Cloudflare Pages** or **Netlify** — drag the folder in, or connect the repo
- **GitHub Pages** — push and enable Pages in repo settings
- **Vercel** — `vercel deploy`

After deploying, update the absolute URLs in `robots.txt`, `sitemap.xml` and the
`og:image` / `twitter:image` meta tags so link previews and search indexing work.

---

## Notes

- **Contact form** posts to [Formspree](https://formspree.io). The free tier allows
  **50 submissions/month** and stops silently past that. The endpoint is in the
  `<form action>` attribute.
- **Theme** defaults to light; the toggle persists the choice in `localStorage`.
- **Accessibility** — skip link, visible focus rings, `prefers-reduced-motion`
  support, and colour contrast checked against WCAG AA.
- **No backend needed.** Everything runs in the browser; the form is the only
  server call and Formspree handles it.

## Deploying to Vercel

1. **vercel.com → Add New → Project → Import** `SureshSurkheti/portfolio`
2. Framework preset **Other**, build command **empty**, output directory **`.`** — there is no build step
3. **Deploy.** You get a `*.vercel.app` URL immediately
4. **Settings → Domains → Add** `sureshsurkheti.com`, then point your registrar at the records Vercel shows
5. **Contact form:** create a Formspree form and paste the ID over `YOUR_FORM_ID` in `index.html`

`vercel.json` is already configured with:

- `cleanUrls` — `/projects` and `/resume` instead of `.html` (all internal links, canonicals and the sitemap already use these)
- Security headers — HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`
- Cache headers — assets immutable for a year, HTML always revalidated

`404.html` is picked up automatically as the not-found page.
