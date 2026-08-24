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
| 1 | **Project links** — six cards point at `*.demo.sureshsurkheti.com` and `github.com/SureshSurkheti/<slug>`. Point them at your real live sites and repos. | `index.html` — search `project__links` |
| 2 | **Project images** — replace the files in `assets/img/`, keeping the same names. One image is a watermarked stock photo. | `assets/img/project-*.jpg` |
| 3 | **Stats** — placeholder figures. Use real numbers or delete the ones you can't back up. | `index.html` — search `data-target` |
| 4 | **Résumé** — replace the `TODO` items, then run `npm run resume`. | `resume.html` |
| 5 | **Timeline** — name the agency and your university. | `index.html` — search `TODO` |
| 6 | **Social links** — verify the LinkedIn and Facebook URLs are actually yours. | `index.html` — search `linkedin.com/in` |
| 7 | **Domain** — replace `sureshsurkheti.com` in `robots.txt`, `sitemap.xml`, and the `og:image` / `twitter:image` tags. | see below |

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
