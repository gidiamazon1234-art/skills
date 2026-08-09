# Deploying energybuddd.com

The site is 23 static files, ~1.8 MB. No PHP, no database, no build step, and it contacts no
external hosts at runtime.

**Current setup:** the domain is registered at **Bluehost**, but DNS and hosting are pointed at
**CloudBe** (`ns1.my-websites.co` / `ns2.my-websites.co`, $19.95/month, DirectAdmin, running a
WordPress install). The goal is to bring hosting to Bluehost so the domain, hosting and billing
sit in one account, and drop the CloudBe plan.

Because the domain is already at Bluehost, **no domain transfer is needed** — this is only a
nameserver change plus a file upload.

---

## Step 1 — Write down your current DNS records BEFORE anything else

This is the step that breaks things if skipped.

Your mail is not hosted at CloudBe, but **CloudBe's nameservers are what currently answer DNS for
the domain**, so the MX records that route your mail live in CloudBe's zone. Switching
nameservers to Bluehost gives you a clean, empty zone — and any record you don't recreate simply
stops existing. For mail that means messages silently stop arriving.

Capture the current records first. Either:

- **In CloudBe:** log in to DirectAdmin → *DNS Management* for `energybuddd.com`, and screenshot
  the whole zone, or
- **From anywhere:** run `dig energybuddd.com MX +short` and `dig energybuddd.com TXT +short`,
  or use a lookup site such as mxtoolbox.com

Record at minimum:

| Record | Why it matters |
|---|---|
| **MX** | Routes your email. Missing = mail stops arriving. |
| **TXT (SPF)** | Usually starts `v=spf1`. Missing = your outgoing mail lands in spam. |
| **TXT (DKIM)** | Often at a selector like `google._domainkey`. Same consequence as SPF. |
| **TXT (DMARC)** | At `_dmarc`. Affects deliverability and reporting. |
| **CNAME** | Any subdomains you use (mail, shop, tracking links, verification records). |

Keep that list somewhere safe. You will re-enter these at Bluehost in step 4.

## Step 2 — Get the Bluehost hosting plan

In your existing Bluehost account, add a hosting plan for `energybuddd.com`. The cheapest shared
plan is more than enough — this site needs nothing but static file serving.

If Bluehost asks whether to use an existing domain, choose `energybuddd.com` from your account
rather than registering a new one.

## Step 3 — Upload the site

1. **cPanel → File Manager** → open `public_html/` for `energybuddd.com`.
2. Delete anything already there (Bluehost's default page, any parked placeholder).
3. Upload the release zip, then right-click → **Extract**.
4. Confirm `index.html` sits directly in `public_html/`, not inside a subfolder.

**Before uploading, turn on Settings → Show Hidden Files.** Otherwise `.htaccess` is silently
skipped, and it carries the HTTPS redirect, the www redirect, caching and the 404 page.

You can do this while DNS still points at CloudBe — the files just sit there until you cut over.

## Step 4 — Recreate your DNS records at Bluehost

In Bluehost's DNS/Zone Editor for the domain, add every MX and TXT record you captured in step 1
**before** switching nameservers. Getting these in place first means mail keeps flowing through
the cutover instead of breaking and then being fixed.

## Step 5 — Switch the nameservers

The domain is registered at Bluehost, so this is in the same account: **Domains →
energybuddd.com → Nameservers**, switch from the CloudBe pair to Bluehost's own nameservers.

Propagation is usually well under an hour but can take up to 48. During that window some visitors
reach CloudBe and some reach Bluehost, which is normal.

## Step 6 — Enable SSL

Turn on the free AutoSSL / Let's Encrypt certificate for the domain in Bluehost. **Wait until it
has actually issued before testing** — the `.htaccess` HTTPS redirect will fail against a domain
with no certificate yet.

## Step 7 — Verify, then cancel CloudBe

Check all of these on the live domain:

- `https://energybuddd.com` loads and shows the new site
- `http://energybuddd.com` redirects to `https://`
- `https://www.energybuddd.com` redirects to the bare domain
- `/features.html`, `/product.html`, `/about.html` all load
- A made-up URL like `/nope` shows the branded 404 page
- One "Buy on Amazon" button opens the listing
- **Send yourself a test email at your `@energybuddd.com` address and confirm it arrives**

Only when all of these pass, cancel the CloudBe plan.

## What you lose when CloudBe is cancelled

The WordPress install currently on that domain is destroyed. Nothing in this deployment migrates
it. If any content there is worth keeping, export it before cancelling.

## After launch

- Submit `https://energybuddd.com/sitemap.xml` in Google Search Console
- Paste your Amazon Attribution tag into `assets/app.js` (see the README) so clicks are
  attributed to sales

## Updating the site later

Re-upload the changed files through File Manager. Nothing is cached server-side, and HTML is sent
with `no-cache`, so changes appear immediately. Images, CSS and JS are cached for a year — if you
replace one, give it a new filename so browsers pick it up.
