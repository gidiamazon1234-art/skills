# Deploying energybuddd.com — moving from CloudBe to Bluehost

The site is 23 static files, ~1.8 MB. No PHP, no database, no build step, and it contacts no
external hosts at runtime. Any host that serves files will run it.

## Order matters

Do these in order. **Do not cancel CloudBe until the last step** — cancelling first takes the
site (and any email) offline while you are still setting the new host up.

### 1. Check where the domain is actually registered — do this first

The CloudBe panel shows the *hosting*. The domain may be registered somewhere else, or it may be
registered **through CloudBe**. That difference matters:

- **Registered elsewhere** (GoDaddy, Namecheap, Google Domains, …): easy. You only change
  nameservers at that registrar. Nothing else to do.
- **Registered through CloudBe**: cancelling the hosting plan can put the domain at risk. Transfer
  the domain out *before* cancelling — unlock it, get the EPP/auth code, start the transfer at the
  new registrar. Transfers take roughly 5–7 days, so start early.

Current nameservers are `ns1.my-websites.co` / `ns2.my-websites.co` (both `49.12.242.68`), which
are CloudBe's. Those get replaced.

### 2. Check for email on the domain

If you have any `@energybuddd.com` mailboxes on CloudBe, **changing nameservers will break them**.
Either move the mail to the new host first, or keep the MX records pointed at the old mail server.
If you have no mailboxes on the domain, skip this — but confirm rather than assume, because
recovering lost mail is not possible.

### 3. Set up Bluehost

1. Buy a plan (the cheapest shared plan is more than enough for a static site).
2. In Bluehost, add `energybuddd.com` as the primary or an addon domain.
3. **cPanel → File Manager**, open `public_html/` for the domain.
4. Delete anything already in there (a default `index.html`, parked page, etc.).
5. Upload the release zip and use **Extract**. Confirm `index.html` sits directly in
   `public_html/`, not inside a subfolder.
6. Turn on **Settings → Show Hidden Files** *before* uploading so `.htaccess` is included —
   it is easy to miss and it carries the HTTPS redirect, caching rules and 404 handling.

### 4. Point DNS at Bluehost

At whichever registrar holds the domain, replace the nameservers with Bluehost's
(they give you the exact pair, typically `ns1.bluehost.com` / `ns2.bluehost.com`).

Propagation is usually under an hour but can take up to 48. During that window some visitors see
the old host and some the new one — which is normal, and another reason not to cancel early.

### 5. Enable SSL

In Bluehost, turn on the free AutoSSL / Let's Encrypt certificate for the domain. Wait until it is
issued before testing, or the `.htaccess` HTTPS redirect will loop against a missing certificate.

### 6. Verify, then cancel CloudBe

Check all of these on the live domain before cancelling anything:

- `https://energybuddd.com` loads and shows the new site
- `http://energybuddd.com` redirects to `https://`
- `https://www.energybuddd.com` redirects to the bare domain
- `/features.html`, `/product.html`, `/about.html` all load
- A made-up URL like `/nope` shows the branded 404 page
- One "Buy on Amazon" button opens the listing

Only once all six pass, cancel the CloudBe plan.

### 7. After launch

- Submit `https://energybuddd.com/sitemap.xml` in Google Search Console
- Paste your Amazon Attribution tag into `assets/app.js` (see the README) so clicks are
  attributed to sales

## Note on the existing WordPress install

CloudBe currently runs WordPress on this domain. Nothing here migrates it — this static site
replaces it. If anything on that WordPress site is worth keeping, export it before you cancel,
because cancelling the plan destroys it.

## Hosting cost

This site needs nothing beyond static file serving, so it is at the very bottom of every hosting
tier. Bluehost's shared plans run well under the $19.95/month CloudBe charges, though note that
introductory pricing renews higher — check the renewal rate, not just the first term.

Static-only hosts (Cloudflare Pages, Netlify, GitHub Pages) serve this exact site for **$0/month**
with a custom domain and free SSL. That is worth knowing given the goal is to cut the bill; the
trade-off is that you would not have cPanel, email hosting, or anywhere to run PHP later.
