# Campaign integration, 14 October 2026

The owner requested the public campaign be implemented as a page on the live Karibu website. Destination: `/campaign/` and `/campaign/#rewards`. This supersedes the earlier separate-preview-only instruction for this requested integration, without changing the original Sites publication or audience.

Reference: https://karibu-golf-campaign.mikaelaxio.chatgpt.site/ (version 7, source commit c196f73efe56d534ca62601df26f8c1b7a937782). The retained local source matches that published commit. Preserve Campaign Invitation grammar, existing feeling curve and Fitting Alignment signature; this is the same campaign, not a new fingerprint.

Import only the campaign page, named components, rewards data and page-scoped styles. Reuse the byte-identical fairway, founder photos, iron face, badge and shared engine already in the storefront. Do not copy Sites identity, Git repository, credentials or runtime configuration.

The main site's header/footer remain shared. Campaign link belongs in both. The page is exported with canonical/social metadata and sitemap membership. Engine CSS is isolated to the campaign so it cannot recolour the shop or main navigation. The shared JavaScript engine is unchanged.

The studio and community initiatives remain future plans; rewards stay proposed USD tiers ($25, $100, $250, $500+), not shop prices. Storefront products remain KSh-only. Payments/reservations stay closed, enquiries use the existing Karibu WhatsApp and preserve the explored tier. Change ambiguous `Back this project` actions to `Explore rewards`. No fabricated funding target, launch date, backer count, stock, payment success or confirmed booking.

Verify all 11 retained viewport/accessibility configurations against the actual static package. Inspect full-size hero/reward/fitting screenshots, sample intermediate chapter states and check dialogs, focus return, FAQ, selection and menus. Check main navigation widths, home/shop/product regression, product SEO and currency. Headless verification does not certify real iOS touch behaviour. Publish only reviewed source/package to the existing GitHub/Netlify site; no new site or duplicate build.
