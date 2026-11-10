# WordPress security checklist

The `evenly-core` plugin already handles the code-level items:
- security headers (HSTS, nosniff, frame options, referrer, permissions)
- XML-RPC off and X-Pingback removed
- WordPress version hidden
- `?author=` and `/wp/v2/users` user enumeration blocked for visitors
- generic login errors
- theme and plugin file editor disabled in wp-admin
- every form field nonce-checked and sanitized, and all output escaped

The items below are server- and account-level, so you set them up once:

## Accounts
- [ ] **2FA for every admin** (Wordfence Login Security, or your host's).
- [ ] No user called `admin`. Use unique, long passwords from a password manager.
- [ ] Give staff the **Shop Manager** role, not Administrator.
- [ ] Remove old or unused users.

## Hosting
- [ ] HTTPS everywhere (free Let's Encrypt), with HTTP → HTTPS redirect.
- [ ] PHP 8.2 or newer.
- [ ] Web application firewall: Cloudflare (free plan + "WordPress" rules), or Wordfence, or the host's WAF.
- [ ] Rate-limit `wp-login.php` and `xmlrpc.php` at the firewall.
- [ ] **Daily off-site backups** with 30-day retention. Test a restore once.
- [ ] In `wp-config.php`: `define('DISALLOW_FILE_MODS', true);` on production if you deploy from Git (this also blocks plugin installs from wp-admin).
- [ ] Fresh salts in `wp-config.php` (https://api.wordpress.org/secret-key/1.1/salt/).
- [ ] `wp-config.php` permissions 440 or 400. Never commit it to Git.

## Plugins
- [ ] Auto-update minor WordPress releases and security plugins.
- [ ] Keep the plugin count small. Delete deactivated plugins.
- [ ] Only install plugins from wordpress.org or known vendors. **Never "nulled" premium plugins**, a top cause of hacked stores.

## Payments (PCI)
- [ ] Use the official **WooCommerce Stripe Gateway** with Stripe's hosted card fields. Card data never touches your server, which keeps you in the simplest PCI scope (SAQ A).
- [ ] Turn on **Stripe Radar** rules: block when CVC fails and when the ZIP code check fails, and review high-risk payments.
- [ ] Keep Stripe API keys only inside WooCommerce settings. Never put them in the theme, in Git, or in email.

## WooCommerce
- [ ] WooCommerce → Settings → Advanced → REST API: delete any keys you don't use. Read-only keys for integrations that only read.
- [ ] Turn on order-attribution and fraud logging. Watch for card-testing (many small failed orders) and add a CAPTCHA to checkout if it happens (e.g. Cloudflare Turnstile).

## Monitoring
- [ ] Uptime monitor (UptimeRobot, free).
- [ ] Google Search Console: watch for "Security issues" and "Manual actions".
