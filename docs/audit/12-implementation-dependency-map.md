# Implementation dependency map

## Scope

This document records prerequisites and ordering constraints for a later implementation. It does not authorize or contain implementation code. Every target below is evaluated against the current repository and the locked DonewithDan requirements.

## Dependency spine

1. Safety baseline and ownership decisions
2. Identity, domain, asset, route, and hosting contracts
3. Preserved root/theme/motion/media primitives
4. Stable homepage section IDs and separate route destinations
5. Navigation and Contact
6. Homepage sections, one controlled section at a time
7. HaircutDone gateway, then HaircutDone detail route
8. Metadata, responsive, accessibility, and performance release gates

The critical dependency chains are:

- Production URL and route policy → canonical/metadata/sitemap → release.
- SESSION_SECRET and hosting → theme persistence; hosting and delivery choice → Contact action.
- Final section IDs → desktop/mobile navigation → hash scrolling and active states.
- Motion/reduced-motion policy → Hero, tool strip, SYSTEM, GAPS, laptop, Profile, and route transitions.
- HaircutDone route contract and assets → laptop texture/gateway → both HaircutDone actions → detail page.
- Workflow specification → SYSTEM shell internals and mobile fallback. No final node, path, tracer, or timing work can precede it.

## Cross-cutting prerequisites

| Prerequisite | Repository evidence | Evidence classification | Downstream consumers | Gate |
| --- | --- | --- | --- | --- |
| Work only on the authorized redesign branch | Current audit preflight confirmed wireframe-prototype; master points to b7444bc while HEAD is 3864548. | CONFIRMED BY LOCAL REPOSITORY | Every implementation phase | Check cwd, branch, and status before each future phase. |
| Resolve Node/toolchain contract | package.json:66-68 requires Node >=19.9.0; README.md:10-27 repeats 19.9.0+; .node-version:1 pins 18.0.0. | CONFIRMED BY LOCAL REPOSITORY | Install, build, Storybook, deployment | Choose and record one supported version before dependency or build work. |
| Approve asset/content rights | README.md:38-42 allows code adaptation but explicitly forbids presenting Hamish’s projects as one’s own; app/assets contains Hamish project/profile media and fonts. | CONFIRMED BY LOCAL REPOSITORY | Hero visual, laptop texture, Profile, case study, errors, OG art, fonts | Human rights review and replacement inventory before public preview. |
| Freeze production identity | app/config.json:1-10, app/utils/meta.js:1-33, app/root.jsx:49-53, public/manifest.json, public/sitemap.xml, public/humans.txt, and Storybook metadata all contain Hamish identity. | CONFIRMED BY LOCAL REPOSITORY | Footer, nav labels, metadata, social links, cookie/domain testing | Daniel supplies name/role/domain/social accounts and approved public credit. |
| Define reduced-motion and performance budgets | app/global.module.css:7-10 defines motion/touch media; many consumers use Framer useReducedMotion, but Intro interval and several opacity/timing paths remain active. | CONFIRMED BY LOCAL REPOSITORY | Every animation, WebGL surface, video, scroll coupling | Agree what becomes static, instant, paused, or simplified before tuning individual sections. |
| Preserve stable primitive contracts | Transition is at app/components/transition/transition.jsx; media at app/components/image/image.jsx; tokens at app/components/theme-provider; internal links at Button/Link. | CONFIRMED BY LOCAL REPOSITORY | All composed sections and routes | Baseline stories/manual fixtures before changing shared primitives. |

## Target-by-target prerequisites

### Navigation

- Goal dependency: the final Work, About, Contact labels are locked, but Work/About require final homepage IDs and Contact requires the retained /contact route.
- Repository evidence: navLinks is the single source at app/layouts/navbar/nav-data.js:3-20; both renderings consume it at navbar.jsx:158-198; same-page scrolling uses useScrollToHash at navbar.jsx:25,32-37,126-140.
- Evidence classification: CONFIRMED BY LOCAL REPOSITORY.
- Prerequisites: stable Hero/Work/About section destinations; legacy Articles route policy; Daniel social URLs; mobile focus/scroll behavior.
- Must preserve: persistent root ownership, desktop floating orientation, mobile overlay, active state, theme inversion, internal prefetch/view-transition opt-in.
- Verification gate: keyboard and touch navigation; same-route and cross-route hashes; Contact from desktop/mobile; active state; Escape/focus return; 696px width and short-height mode.

### Theme

- Goal dependency: theme must be reliable before visual snapshots or WebGL/theme tuning.
- Repository evidence: root loader/session at app/root.jsx:49-77; optimistic mutation at root.jsx:80-94; token/font generation at theme-provider.jsx:98-183; persistence action at api.set-theme.js:3-30.
- Evidence classification: CONFIRMED BY LOCAL REPOSITORY.
- Prerequisites: SESSION_SECRET policy, hosting request context, dark/light allowlist, and preservation of the frozen dark default.
- Must preserve: server-rendered data-theme, inline head tokens, color-scheme/theme-color, nested inverse ThemeProvider behavior, mobile and desktop toggle.
- Verification gate: no wrong-theme first paint on reload/navigation; persistence; cookie failure; error route; both toggles; no arbitrary data-theme values.

### Hero

- Goal dependency: stable theme/motion primitives and accessible heading copy precede timing or WebGL decisions.
- Repository evidence: Intro content/state is app/routes/home/intro.jsx:20-146; block cover/text transitions are intro.module.css:89-169 plus global reveal at global.module.css:61-80; DisplacementSphere is lazy/hydration gated at intro.jsx:16-18,31,66-69.
- Evidence classification: CONFIRMED BY LOCAL REPOSITORY.
- Prerequisites: locked copy is available; supplied Hero Twisted Blob / Shader Slot source plus compatibility/performance decision; define reduced-motion behavior; confirm accessible representation of changing lines.
- Must preserve: cyan/blue block-cover language where feasible, one semantic page heading, scroll affordance, hydration-safe expensive visual.
- Verification gate: copy sequence, cover timing, screen-reader output, reduced motion, theme toggle reset, touch/desktop, WebGL failure, first-content paint.

### Continuous tool strip

- Goal dependency: cannot be content-complete until logos, order, rights, motion direction/speed, and reduced-motion fallback are supplied.
- Repository evidence: no matching tool-strip component/data/assets exist in the current Home tree at home.jsx:1-20,94-172.
- Evidence classification: CONFIRMED BY LOCAL REPOSITORY for absence; UNRESOLVED / NEEDS RUNTIME VERIFICATION for final behavior.
- Prerequisites: Daniel’s approved logo set and usage rights; static accessible label strategy; performance/motion policy.
- Reusable dependencies: Section, theme tokens, Transition, custom media; possibly Image/Icon only if their data models fit.
- Verification gate: seamless visual loop without duplicate screen-reader announcements; pause/static reduced-motion state; high zoom; narrow screens; no layout shift.

### SYSTEM workflow shell

- Goal dependency: the separate workflow specification is a hard input.
- Repository evidence: no workflow node/path/tracer implementation is present in app/routes/home, app/components, or the Home render tree.
- Evidence classification: CONFIRMED BY LOCAL REPOSITORY for absence; UNRESOLVED / NEEDS RUNTIME VERIFICATION for all final workflow values.
- Prerequisites: supplied nodes, labels, connector paths, tracer timing, automation logic, glow behavior, and mobile workflow logic.
- Allowed pre-spec contract only: reserve the section boundary and hooks for a workflow container, SVG paths, nodes, tracers, and mobile fallback.
- Verification gate: specification-to-render traceability, semantic fallback, reduced motion, touch, small screens, and performance. Do not approve invented values.

### GAPS stacking cards

- Goal dependency: three card messages and mobile behavior must precede interaction tuning.
- Repository evidence: current ProjectSummary sections are full-height independent grids, not sticky stacking cards: home.jsx:101-165 and project-summary.module.css:1-63.
- Evidence classification: CONFIRMED BY LOCAL REPOSITORY for the mismatch; UNRESOLVED / NEEDS RUNTIME VERIFICATION for content and final stacking logic.
- Prerequisites: frozen card copy/order/basic desktop-mobile-reduced-motion behavior, decorative GAPS composition, and final illustrations or optional supplied stacking-card source.
- Reusable dependencies: Section, theme tokens, Transition/visibility observer patterns.
- Verification gate: DOM reading order equals visual order; keyboard navigation; reduced motion; sticky support; short viewport; no scroll trap or excessive empty scroll.

### HaircutDone laptop gateway

- Goal dependency: the case-study route and a valid HaircutDone screen source must exist before wiring either action.
- Repository evidence: ProjectSummary lazily renders Model at project-summary.jsx:17-19,101-174; Home currently supplies the laptop and Smart Sparrow screen source at home.jsx:101-120; device contract is device-models.js:17-23.
- Evidence classification: CONFIRMED BY LOCAL REPOSITORY.
- Prerequisites: route slug/URL, HaircutDone screen art and placeholder, intrinsic dimensions, alt text, and frozen gateway/case-study opening copy.
- Must preserve: laptop GLB, open animation, loader, placeholder-to-full texture, focus-triggered reveal, internal Button transition.
- Verification gate: both “View the full system →” and “Explore HaircutDone →” resolve to exactly the same route; texture maps correctly; static/failure fallback; keyboard/touch/mobile; GPU budget.

### HaircutDone connected page

- Goal dependency: route contract, chapter storyboard, owned assets, Loom URL/privacy policy, and gateway precede final navigation.
- Repository evidence: project route naming uses app/routes/projects.<slug>/route.js; shared primitives are app/layouts/project/project.jsx:15-188; long case-study compositions exist in projects.slice/slice.jsx and projects.smart-sparrow/smart-sparrow.jsx.
- Evidence classification: CONFIRMED BY LOCAL REPOSITORY for the reusable route/layout; UNRESOLVED / NEEDS RUNTIME VERIFICATION for HaircutDone content.
- Prerequisites: large opening content, screenshot/parallax compilation, chapter boundaries, Loom walkthrough, return destination, asset performance budget.
- Must preserve/adapt: ProjectContainer/Header/Section/Image/Text primitives, reduced-motion parallax, Footer, root navigation/loading/view transitions.
- Must not restore: a continuous animated photo strip as the governing final structure.
- Verification gate: direct deep link; both gateway links; deliberate chapters; responsive media; accessible embed title/transcript alternative; back/return scroll and focus; metadata/OG.

### Profile

- Goal dependency: frozen Profile copy, owned portrait/external URLs, and Contact route must be stable.
- Repository evidence: Profile is app/routes/home/profile.jsx:18-101; portrait reveal is Image reveal at lines 80-90; CTA is /contact at lines 58-66; responsive styles are profile.module.css:1-143.
- Evidence classification: CONFIRMED BY LOCAL REPOSITORY.
- Prerequisites: frozen Profile copy, portrait/source sets, final alt intent, external links, and PROFILE depth composition.
- Must preserve: focus-triggered visibility, DecoderText option, Image cover reveal, semantic section, shared Contact destination.
- Verification gate: heading order; content at 200%/400% zoom; portrait art direction; touch/keyboard; reduced motion; CTA parity.

### Contact

- Goal dependency: the separate /contact route is locked, while delivery cannot be completed without three explicit Daniel decisions.
- Repository evidence: navigation destination nav-data.js:16-19; Profile CTA profile.jsx:58-66; route export contact/route.js:1; view/form/action contact.jsx:29-241.
- Evidence classification: CONFIRMED BY LOCAL REPOSITORY.
- Prerequisites: destination email, provider/method, auto-confirmation choice; rate-limit/spam policy; privacy copy if data leaves the selected platform.
- Must preserve: separate route, exact “Say hello” heading without period, DecoderText, Email/Message/Send message structure, success/error state concept.
- Verification gate: client and server validation; keyboard and focus; screen-reader error association; honeypot/rate limiting; provider failure; duplicate submit; no secret exposure; both entry points.

### Footer

- Goal dependency: brand identity and retained route/link policy.
- Repository evidence: app/components/footer/footer.jsx:7-18 reads config.name and links /humans.txt; consumers include Home, Contact, project routes, Posts, and Uses.
- Evidence classification: CONFIRMED BY LOCAL REPOSITORY.
- Prerequisites: final name/credit/humans content.
- Must preserve: shared component and semantic footer.
- Verification gate: all retained routes, current year SSR/hydration, link destination, narrow viewport overflow.

### Metadata and social previews

- Goal dependency: final domain, brand, routes, and owned OG art.
- Repository evidence: app/config.json, app/utils/meta.js:1-33, root canonical at app/root.jsx:49-53, public/manifest.json, public/sitemap.xml, public/robots.txt, public/social-image.png, and route meta exports.
- Evidence classification: CONFIRMED BY LOCAL REPOSITORY.
- Prerequisites: production URL; route retention/redirect decisions; page titles/descriptions; OG image; social accounts.
- Must correct: malformed canonical construction for non-trailing URLs and the undefined config.twitter consumer.
- Verification gate: raw HTML and response headers on each route; canonical trailing/non-trailing cases; manifest/icons; sitemap only lists public routes; social validator; 404 metadata.

### Responsive work

- Goal dependency: happens inside every section phase and receives a final integration pass.
- Repository evidence: global breakpoints are global.module.css:1-10 and app/utils/style.js:4-10; responsive token overrides are theme.js:58-107; useWindowSize.js:3-60 handles iOS height; components additionally use short-height queries.
- Evidence classification: CONFIRMED BY LOCAL REPOSITORY.
- Prerequisites: final section compositions and asset dimensions.
- Must preserve: desktop/laptop/tablet/mobile/mobile-small breakpoints, coarse/fine pointer distinctions, short-height menu behavior, native scroll.
- Verification gate: representative widths around 2080/1680/1040/696/400, short heights 696/420/360, rotation, dynamic mobile chrome, zoom/reflow.

### Accessibility

- Goal dependency: a per-phase gate, not a final repair phase.
- Repository evidence: root skip link/main target at root.jsx:121-133; Section/Heading/Input/VisuallyHidden primitives; reduced-motion custom media; current gaps documented in 10-responsive-accessibility-audit.md.
- Evidence classification: CONFIRMED BY LOCAL REPOSITORY.
- Prerequisites: semantic content hierarchy, motion policy, mobile-menu interaction model, Contact error model, media alternatives.
- Must preserve: skip link, semantic main/sections/headings, visible focus, real decoder labels, media alt/pause behavior.
- Verification gate: keyboard-only; screen reader; reduced motion; forced colors/high contrast where applicable; zoom; focus across route transitions; form errors/success; automated checks plus human review.

### Performance validation

- Goal dependency: measure after each media/motion section and again on the integrated route.
- Repository evidence: Hero sphere uses continuous RAF while visible at displacement-sphere.jsx:157-183; laptop uses fixed pixel ratio 2 and multi-pass contact shadows at model.jsx:94-105,129-208,247-280; assets include GLB, HDR, MP4, and large responsive images; Vite inlines only assets <=1024 bytes at vite.config.js:15-18.
- Evidence classification: CONFIRMED BY LOCAL REPOSITORY.
- Prerequisites: final assets, device fallback policy, deployment preview, measurement device/network matrix.
- Verification gate: LCP/CLS/INP, route JS and media weight, GPU/frame time, memory/context cleanup, offscreen pause, low-power/mobile fallback, no network waterfall from duplicate preload/prefetch.

## Ordering constraints that must not be bypassed

- Do not tune or finalize SYSTEM until the separate workflow specification exists.
- Do not wire either HaircutDone action to a placeholder or different destination; freeze one case-study route first.
- Do not configure Contact delivery before the destination, provider, and confirmation decisions.
- Do not publish any Hamish project/profile asset or claim under DonewithDan.
- Do not remove legacy routes before redirect/SEO and rights decisions.
- Do not alter theme initialization piecemeal; loader, action, provider, body data-theme, and toggle form one contract.
- Do not evaluate final animation fidelity before reduced-motion behavior and semantic DOM are also testable.
- Do not postpone navigation focus management or Contact error accessibility to the release-only phase.

## Confidence

- CONFIRMED BY LOCAL REPOSITORY — the dependency seams and current consumers above are statically traceable.
- STRONG INFERENCE — the proposed ordering minimizes shared-primitive and route regressions because global systems are gated before dependent sections and each new section receives an isolated rollback point.
- UNRESOLVED / NEEDS RUNTIME VERIFICATION — runtime route aliases, browser view-transition behavior, actual WebGL/device performance, external delivery, Loom behavior, and final content/design inputs require later safe runtime or human verification.
