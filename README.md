# aimodelwelfare.org

Static site for Laura Greenbriar’s AI Model Welfare research: interview archive, papers, experiments, and framework.

**Domain:** [aimodelwelfare.org](https://aimodelwelfare.org)

## Stack

Static HTML / CSS / JS. No build step.

## Local preview

```bash
cd welfare-archive
python -m http.server 8765
```

Open http://127.0.0.1:8765

## Deploy (GitHub + Cloudflare Pages)

1. Push this folder to GitHub (this repo).
2. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Select this repo.
4. Build settings:
   - **Framework preset:** None
   - **Build command:** *(leave empty)*
   - **Build output directory:** `/` (root)
5. Deploy.
6. **Custom domains** → add `aimodelwelfare.org` and `www.aimodelwelfare.org`.
7. At your domain registrar (or Cloudflare DNS if nameservers are on Cloudflare), set records Cloudflare shows you — usually:

   | Type  | Name | Content |
   |-------|------|---------|
   | CNAME | www  | *(your-project)*.pages.dev |
   | CNAME or A/AAAA | @ | *(Cloudflare will show exact values)* |

   If the domain is **already on Cloudflare DNS**, add the domain in Pages and Cloudflare finishes DNS automatically.

### Alternative: GitHub Pages

Repo → **Settings** → **Pages** → Source: **Deploy from a branch** → `main` / root.  
The `CNAME` file points to `aimodelwelfare.org`. Then set DNS at your registrar to GitHub’s pages targets.

## Structure

```
├── index.html          # Homepage
├── archive.html        # Interview archive
├── compare.html        # Cross-model compare
├── papers.html         # Research + experiments
├── interviews/         # Interview JSON
├── downloads/          # PDFs
├── css/ style.css
└── js/
```

## Adding interviews

See `ADDING_INTERVIEWS.md`.
