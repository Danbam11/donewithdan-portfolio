# Open decisions for Daniel

## Scope

Only decisions that cannot be safely resolved from repository evidence appear here. The following are already locked and are therefore not questions: dark as default; final nav labels; separate Contact destination; exact “Say hello” heading without a period; Contact fields/button; both Contact entry points; Hero copy; homepage order; the one logo-only strip behavior; all three GAPS cards and basic desktop/mobile/reduced-motion behavior; frozen Profile copy; four decorative words and their lower-contrast covered portions; SYSTEM’s prohibition on invented values; the HaircutDone opening/structure/Loom label-heading/return wording and single destination; and rejection of a continuous photo strip as the final case-study structure.

## Contact and operations

### D-01 — What destination email address should receive Contact messages?

- Question: Which production mailbox or alias should the Contact action deliver to?
- Why it matters: delivery cannot be configured or tested end-to-end without an owner-controlled destination, and the address is personal operational data.
- Repository evidence: app/routes/contact/contact.jsx:75-89 currently reads context.cloudflare.env.EMAIL for the recipient and FROM_EMAIL for the verified sender; .dev.vars.example:5-9 documents the variable roles without real values.
- Evidence classification: CONFIRMED BY LOCAL REPOSITORY for the current seam; UNRESOLVED / NEEDS RUNTIME VERIFICATION for the DonewithDan value.
- Available options: Daniel’s personal mailbox; a dedicated contact@/hello@ alias; a ticketing/CRM ingestion address supported by the chosen provider.
- Tradeoffs: personal is simplest but exposes continuity/spam risk; a domain alias is portable and professional; a CRM address adds workflow/vendor coupling.
- Recommended default: an owner-controlled domain alias that can be redirected without changing application code.
- Deadline or implementation phase: before Phase 5 Contact delivery testing.
- Can work continue before the decision: Contact UI/accessibility work can; real delivery cannot.

### D-02 — Which delivery provider or method should Contact use?

- Question: Retain AWS SES, use another transactional-email provider, submit to an automation/CRM endpoint, or use a non-sending contact alternative?
- Why it matters: provider choice controls server API, environment bindings, rate limits, failure behavior, DNS/domain verification, privacy, cost, and hosting compatibility.
- Repository evidence: contact.jsx:33-93 directly constructs SESClient in the route action; package.json:20 includes @aws-sdk/client-ses; README.md:52-55 describes SES and mentions Nodemailer as an alternative.
- Evidence classification: CONFIRMED BY LOCAL REPOSITORY for SES; UNRESOLVED / NEEDS RUNTIME VERIFICATION for the approved final method.
- Available options: keep SES; choose an approved transactional provider; route to Daniel’s automation/CRM; temporarily disable sending and expose an approved alternative destination.
- Tradeoffs: SES maximizes code reuse but requires AWS operations and abuse controls; another provider may simplify developer experience but adds migration/vendor work; automation/CRM can fit Daniel’s workflow but needs authentication/reliability design; a disabled form is safest operationally but fails the intended interaction.
- Recommended default: keep SES for the first implementation only if Daniel already owns and can operate a verified SES setup; otherwise select the provider before action work rather than emulate SES blindly.
- Deadline or implementation phase: before Phase 5 server/action work.
- Can work continue before the decision: presentation and validation planning can; provider integration cannot.

### D-03 — Should a visitor receive an automatic confirmation?

- Question: Send no confirmation, a plain receipt, or a branded transactional reply?
- Why it matters: this changes data use, send volume/cost, templates, deliverability, abuse potential, consent/privacy copy, and success messaging.
- Repository evidence: contact.jsx:72-93 sends one message only to env.EMAIL; no second SendEmailCommand or visitor template exists.
- Evidence classification: CONFIRMED BY LOCAL REPOSITORY for current no-confirmation behavior; UNRESOLVED / NEEDS RUNTIME VERIFICATION for DonewithDan.
- Available options: no visitor email; minimal receipt; branded confirmation.
- Tradeoffs: no email is simplest and least abusable; a receipt reassures visitors but confirms address use and doubles sends; branded email adds design/maintenance and greater deliverability risk.
- Recommended default: no automatic confirmation until the primary delivery path, privacy text, and abuse controls are proven.
- Deadline or implementation phase: before Phase 5 success copy and action acceptance.
- Can work continue before the decision: yes, except final success copy and send logic.

### D-04 — What anti-abuse and privacy posture is acceptable?

- Question: What rate limiting, bot challenge (if any), logging/retention, and privacy disclosure should apply to email/message data?
- Why it matters: a public mail relay can be abused and may transmit personal data to AWS or another provider.
- Repository evidence: contact.jsx:42-49 implements only a hidden name honeypot; no rate limiter, challenge, origin policy, retention statement, or monitoring path is present.
- Evidence classification: CONFIRMED BY LOCAL REPOSITORY for the gap; UNRESOLVED / NEEDS RUNTIME VERIFICATION for policy and vendor choice.
- Available options: server rate limit plus honeypot; privacy-friendly challenge only after suspicious behavior; always-on third-party CAPTCHA; temporarily non-sending form.
- Tradeoffs: stronger challenges reduce abuse but add friction/accessibility/privacy cost; rate limiting needs a dependable store/edge facility; minimal controls are smooth but risky.
- Recommended default: server-side IP/risk-aware rate limiting plus honeypot and provider quota/alerts, adding a challenge only when evidence justifies it.
- Deadline or implementation phase: before any public Phase 5 sending preview.
- Can work continue before the decision: local UI work can; public delivery cannot.

## Identity, platform, routes, and rights

### D-05 — What are the canonical DonewithDan identity and production URL?

- Question: Confirm site/author name, role/tagline outside the locked Hero copy, production origin, canonical hostname, and approved default social-preview artwork.
- Why it matters: these values feed route metadata, canonical links, manifest, sitemap, footer, console/source credit, icons, Storybook branding, and Contact email copy.
- Repository evidence: Hamish identity is in app/config.json:1-10, package.json:2-6, app/utils/meta.js:1-33, app/root.jsx:49-53, public/manifest.json, public/sitemap.xml, public/humans.txt, public assets, and .storybook/manager-head.html.
- Evidence classification: CONFIRMED BY LOCAL REPOSITORY for all consumers; UNRESOLVED / NEEDS RUNTIME VERIFICATION for final values.
- Available options: one primary apex domain; www primary with redirect; temporary preview origin kept noindex until production identity is final.
- Tradeoffs: changing canonical origin after indexing causes redirects/cache churn; preview origins must not leak into metadata.
- Recommended default: one HTTPS primary origin controlled by Daniel, with all alternatives redirected and non-production Pages origins noindexed.
- Deadline or implementation phase: before Phase 3 identity changes; OG art can finalize before Phase 15.
- Can work continue before the decision: isolated component work can; global identity/metadata work should not.

### D-06 — What is the Facebook URL?

- Question: Supply the first live configurable Facebook URL; future socials remain hidden until configured.
- Why it matters: Hamish destinations must be removed without dead icons.
- Repository evidence: app/layouts/navbar/nav-data.js:22-37 builds Bluesky/Figma/GitHub from app/config.json:6-9; navbar.jsx:207-223 renders them as labelled new-tab links; app/components/icon/manifest.json and icons.svg define available icons.
- Evidence classification: CONFIRMED BY LOCAL REPOSITORY for the data-driven edit seam; UNRESOLVED / NEEDS RUNTIME VERIFICATION for the Facebook URL.
- Frozen behavior: remove Hamish destinations; Facebook is the first live configurable placeholder; hide unconfigured future socials; publish no dead icons.
- Recommended default: retain the data-driven architecture and expose only configured, owner-controlled destinations.
- Deadline or implementation phase: before Phase 6 navigation.
- Can work continue before the decision: navigation structure can; final data/icon work cannot.

### D-07 — Is Cloudflare Pages the approved production platform?

- Question: Keep the current Cloudflare Pages/Workers context or migrate later?
- Why it matters: root/session and Contact actions use context.cloudflare.env; functions/[[path]].js is a Pages Function adapter; deployment and anti-abuse storage depend on platform.
- Repository evidence: functions/[[path]].js:1-5, package.json:12,14,17, vite.config.js:1-4,28, and wrangler.toml target Cloudflare.
- Evidence classification: CONFIRMED BY LOCAL REPOSITORY for current platform; UNRESOLVED / NEEDS RUNTIME VERIFICATION for DonewithDan hosting.
- Available options: preserve Cloudflare Pages; move to another Remix-compatible host; defer migration until after feature parity.
- Tradeoffs: preserving it minimizes architectural change; migration can align Daniel’s stack but compounds route/session/email risk during redesign.
- Recommended default: preserve Cloudflare through the redesign and consider migration only as a separate, measured phase.
- Deadline or implementation phase: before Phase 2 deployment verification and Phase 5 backend choice.
- Can work continue before the decision: static component work can; session/contact/deployment acceptance cannot.

### D-08 — Which existing assets/fonts are legally safe to retain?

- Question: Confirm licenses/ownership for Gotham and IPA Gothic webfonts, monogram/icon art, GLB device models, shaders, and any non-project decorative media; confirm that every Hamish project/profile/error asset will be replaced or separately licensed.
- Why it matters: the repository MIT license covers software, while README.md explicitly withholds permission to present Hamish’s projects as one’s own; third-party font/model/media licenses are not enumerated in a tracked asset manifest.
- Repository evidence: LICENSE:1-20 is MIT; README.md:38-42 distinguishes adaptable code from project content; app/assets contains fonts, GLB/HDR, profile, project, video, and error media.
- Evidence classification: CONFIRMED BY LOCAL REPOSITORY for the warning and absence of an asset manifest; UNRESOLVED / NEEDS RUNTIME VERIFICATION for each retained asset.
- Available options: retain only assets with documented rights; replace all brand/content assets and verify generic technical assets individually; obtain licenses/permission.
- Tradeoffs: conservative replacement costs design time but avoids ownership ambiguity; retention preserves fidelity but requires provenance.
- Recommended default: treat all personal/project/media/font assets as replace-unless-proven; separately verify the laptop GLB because it is central to the locked gateway.
- Deadline or implementation phase: inventory before Phase 2/3; individual proof before the consuming phase; absolute deadline before any public preview.
- Can work continue before the decision: source audit and neutral shells can; public asset use cannot.

### D-09 — What should happen to legacy Articles, Uses, /home, and Hamish project URLs?

- Question: For each old public route, choose remove/404, redirect, private temporary retention, or an owned replacement; confirm whether the inferred /home alias should be eliminated.
- Why it matters: removing Articles from nav does not decide indexed URLs, backlinks, sitemap entries, or forbidden old content.
- Repository evidence: app/routes/articles*, app/routes/uses, app/routes/projects.*, and public/sitemap.xml:10-36 expose legacy content. vite.config.js:29-35 manually maps Home to / while app/routes/home/route.js may also be conventionally discoverable as /home; static inspection cannot conclusively verify the alias.
- Evidence classification: CONFIRMED BY LOCAL REPOSITORY for the route files/sitemap; STRONG INFERENCE for a possible /home alias; UNRESOLVED / NEEDS RUNTIME VERIFICATION for disposition.
- Available options: permanent redirects to relevant owned destinations; 410/404 removal; keep temporarily behind noindex/access control; replace with owned content.
- Tradeoffs: redirects preserve useful links only when destinations are genuinely equivalent; 410/404 is honest for unrelated content; retaining old content creates rights/identity risk.
- Recommended default: remove old content from public delivery; use a permanent redirect only where a semantically equivalent owned destination exists; verify /home later with the route manifest/runtime and redirect it to / if present.
- Deadline or implementation phase: policy before Phase 3; execution and sitemap reconciliation in Phase 15.
- Can work continue before the decision: new section work can; route deletion/redirect and final metadata cannot.

## Section content and art direction

### D-10 — When will the Hero Twisted Blob / Shader Slot source be supplied?

- Question: Supply the approved replaceable Hero Twisted Blob / Shader Slot source and decide compatibility/performance fallback after inspection.
- Why it matters: the current sphere is valuable technical reference evidence, but not the primary product-choice framing.
- Repository evidence: Intro lazy-loads DisplacementSphere at intro.jsx:16-18,66-69; displacement-sphere.jsx:32-198 owns custom shaders, 128×128 geometry, viewport RAF, pointer springs, theme lights, resize, and cleanup.
- Evidence classification: CONFIRMED BY LOCAL REPOSITORY for the existing reference system; UNRESOLVED / NEEDS RUNTIME VERIFICATION for supplied-source compatibility and target-device performance.
- Recommended default: evaluate the supplied source against the existing sphere’s loading, fallback, reduced-motion, and performance boundaries; do not presume either retention or replacement.
- Deadline or implementation phase: before Phase 8 final Hero work.
- Can work continue before the decision: semantic copy/cover mapping can; final visual/performance tuning cannot.

### D-11 — Which exact tools and logo assets belong in the frozen strip?

- Question: Supply the ordered 6–8 tool list and owned logo sources; direction and any genuinely unspecified visual detail may be confirmed later.
- Why it matters: no equivalent data or asset set exists, and duplicated marquee content can become noisy or legally problematic.
- Repository evidence: Home imports only current project/profile media at home.jsx:1-20; no tool-strip/marquee module or tool-logo assets are tracked.
- Evidence classification: CONFIRMED BY LOCAL REPOSITORY for absence; UNRESOLVED / NEEDS RUNTIME VERIFICATION for final tools/assets only.
- Frozen behavior: one continuous logo-only pill strip; roughly four visible on desktop, fewer on mobile; approximately 25–35 second slow loop; pause/reduce offscreen; stop under reduced motion; no categories, descriptions, or capability text.
- Deadline or implementation phase: before Phase 9.
- Can work continue before the decision: only the section slot/contract can.

### D-12 — When will the final SYSTEM workflow specification be supplied?

- Question: Provide the authoritative nodes, workflow labels, connector geometry, tracer timing, automation logic, glow behavior, and mobile workflow logic, or explicitly approve stopping at the empty shell.
- Why it matters: the audit brief prohibits inventing every one of these values.
- Repository evidence: no workflow/node/tracer system exists in the current Home route or component inventory.
- Evidence classification: CONFIRMED BY LOCAL REPOSITORY for absence; UNRESOLVED / NEEDS RUNTIME VERIFICATION for the specification.
- Available options: supply a desktop/mobile motion specification; supply semantic data plus art direction for engineering translation; defer and ship only an approved non-final shell in a private preview.
- Tradeoffs: a complete spec prevents rework; partial data invites visual/logic assumptions; a shell preserves ordering but is not launch-complete.
- Recommended default: do not schedule SYSTEM internals until one signed-off desktop/mobile/reduced-motion specification exists.
- Deadline or implementation phase: hard gate inside Phase 10.
- Can work continue before the decision: other independent sections can; SYSTEM internals cannot.

### D-14 — What complete HaircutDone content/media package is approved?

- Question: Supply the remaining screen/screenshot assets/order, Loom URL/poster, privacy choice, and final media alt/caption/transcript values.
- Why it matters: the current repository contains only Hamish project assets, and both homepage actions must resolve to one content-complete destination.
- Repository evidence: the laptop screen is currently Smart Sparrow art at home.jsx:10-12,110-119; project layout primitives are at app/layouts/project/project.jsx; no HaircutDone or Loom asset/content is tracked.
- Evidence classification: CONFIRMED BY LOCAL REPOSITORY for current sources/absence; UNRESOLVED / NEEDS RUNTIME VERIFICATION for remaining HaircutDone media inputs.
- Frozen content/structure: `HAIRCUTDONE`; “From haircut quiz to follow-up, the full customer journey—DONE.”; large opening, screenshot/parallax compilation, deliberate chapters, Loom walkthrough, return to portfolio; `WALKTHROUGH`; “See the full system in motion.”; `← Return to portfolio`; and one shared destination for “View the full system →” / “Explore HaircutDone →”.
- Available options: local optimized screenshots/video plus Loom embed; privacy-gated Loom; poster/summary with external Loom link; owned video instead of third-party embed if approved.
- Tradeoffs: embed is convenient but adds privacy/performance/accessibility dependencies; external link is lighter but breaks continuity; owned media increases hosting work.
- Recommended default: optimized local chapter media plus a lazy, titled Loom embed with an accessible summary/fallback link, subject to Daniel’s privacy choice.
- Deadline or implementation phase: route/screen subset before Phase 12; complete package before Phase 13.
- Can work continue before the decision: route contract/layout shell can; gateway texture and final page cannot.

### D-15 — Which Profile assets and links should ship?

- Question: Supply owned portrait variants, final alt intent, external URLs, tag wording, and any genuinely unspecified footer credit.
- Why it matters: current content/image identifies Hamish/Qwilr and cannot be repurposed.
- Repository evidence: profile.jsx:18-35 contains Hamish biography/links; lines 80-90 import/render profile assets and Hamish alt; Footer reads config.name and links humans.txt at footer.jsx:7-18.
- Evidence classification: CONFIRMED BY LOCAL REPOSITORY for current content; UNRESOLVED / NEEDS RUNTIME VERIFICATION for remaining assets/links.
- Frozen copy: “About me”; “Hi, I’m Dan.”; the supplied GoHighLevel/customer-support paragraphs; and “Send me a message →”.
- Deadline or implementation phase: before Phase 14.
- Can work continue before the decision: reveal mechanics can be isolated; final composition cannot be approved.

## Decision priority

The earliest blockers are D-05, D-07, D-08, and D-09 for the foundation; D-01 through D-04 for Contact; and D-12 for SYSTEM. D-10, D-11, D-14, and D-15 block only their respective section phases and should not be used to justify a single large speculative implementation. Decorative-depth implementation is an engineering/rendered-visual verification matter, not a Daniel product decision.
