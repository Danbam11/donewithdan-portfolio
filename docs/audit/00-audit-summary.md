# Audit summary

## Repository identity and preflight

| Item | Result | Evidence classification |
| --- | --- | --- |
| Repository | `C:\Users\DanBam\Documents\GitHub\donewithdan-portfolio` | CONFIRMED BY LOCAL REPOSITORY |
| Working branch | `wireframe-prototype` at `386454829df8e866b34a8cd59080d42d5fe5c727` | CONFIRMED BY LOCAL REPOSITORY |
| Protected baseline | Local `master` and `upstream/master` remained at `b7444bc16216f38c64f4afb8d2f53b8c4cbb2bda` | CONFIRMED BY LOCAL REPOSITORY |
| Repository lineage | `origin` is `Danbam11/donewithdan-portfolio`; `upstream` is `HamishMW/portfolio` | CONFIRMED BY LOCAL REPOSITORY |
| Initial working tree | `git status --short` returned no entries before audit documentation was created | CONFIRMED BY LOCAL REPOSITORY |
| Audit writes | All audit-created files are under `docs/audit/`; application code, configuration, dependencies, lockfiles, assets, references, branches, and Git history were not changed | CONFIRMED BY LOCAL REPOSITORY |

Preflight matched the required repository and branch, so the static audit proceeded. No build, lint, test, Storybook, formatter, development-server, install, postinstall, deploy, commit, push, branch-switch, or pull-request action was run.

## Scope

This audit traces the current Hamish Williams portfolio as the technical foundation for a future DonewithDan adaptation. It covers the framework/runtime/build contract; root and Cloudflare entry points; every discovered route; Home, navigation, Contact, theme, scrolling, animation, Three.js/media, responsive, and accessibility systems; source and public assets; metadata/error/loading behavior; quality-tool configuration; reuse decisions; implementation dependencies; risks; sequencing; and decisions that genuinely require Daniel's input.

The locked DonewithDan direction was used only as an evaluation constraint. The audit does not implement the new homepage order, copy, navigation, Contact changes, decorative words, SYSTEM workflow, GAPS cards, HaircutDone gateway/detail route, assets, metadata, or backend.

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY** for the inspected source and audit output. Browser-rendered behavior, deployed configuration, performance, accessibility outcomes, third-party services, and final art/content remain **UNRESOLVED / NEEDS RUNTIME VERIFICATION** where explicitly identified in the detailed documents.

## Architecture summary

The application is a Remix 2.7.1 and React 18.2 ESM application built with Vite 5.1 and served through a Cloudflare Pages function. `functions/[[path]].js:1-5` passes requests to the generated server build; `app/root.jsx:49-163` owns the theme loader, document, global navigation, loading UI, route outlet, scroll restoration, and root error boundary. Route UI is source-authored JSX/MDX, styled primarily through CSS Modules, PostCSS custom media, and server-injected semantic theme tokens. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

The root-owned `Navbar` remains outside `<Outlet />`, while the current Home route composes `Intro`, three `ProjectSummary` instances, `Profile`, and `Footer` (`app/root.jsx:120-133`; `app/routes/home/home.jsx:94-172`). Internal links request Remix's `unstable_viewTransition`, and root independently fades loading route content and shows `Progress`; no repository-owned named shared-element or modal/window router exists (`app/components/link/link.jsx:14-42`; `app/components/button/button.jsx:13-27`; `app/root.module.css:2-10`). **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

The theme is server-first: a signed HTTP-only cookie is read by the root loader, `data-theme` and token CSS are present in the initial HTML, and a fetcher provides optimistic dark/light toggling (`app/root.jsx:49-120`; `app/components/theme-provider/theme-provider.jsx:48-183`; `app/routes/api.set-theme.js:3-30`). This is a strong no-wrong-theme-first-paint foundation, although duplicated cookie configuration, a one-space secret fallback, and unvalidated submitted theme values require later hardening. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY** for the mechanism and gaps; the no-flash assessment is a **STRONG INFERENCE** pending rendered first-paint testing.

Motion combines the reusable `Transition` state bridge, CSS status/keyframe animation, Framer Motion springs, Intersection Observer, native View Transition opt-ins, and specialized WebGL loops. The Hero's accent cover is a `.word::after` block driven by the global `reveal` keyframe, not a canvas recreation (`app/routes/home/intro.jsx:63-110`; `app/routes/home/intro.module.css:89-169`; `app/global.module.css:61-80`). The same `DecoderText` provides a stable visually hidden label and a reduced-motion final state (`app/components/decoder-text/decoder-text.jsx:47-100`). **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

Three.js powers five current production surfaces: the Hero sphere, shared device `Model`, Smart Sparrow Earth, Volkihar Armor, and Carousel. The laptop subsystem is separated from current project copy: `ProjectSummary` supplies screen records; `Model` owns the camera, lighting, contact shadows, pointer springs, resize, and cleanup; `Device` maps placeholder/full-resolution textures to GLB nodes named `Screen` and `Frame` (`app/routes/home/project-summary.jsx:101-170`; `app/components/model/model.jsx:57-527`; `app/components/model/device-models.js:1-23`). **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

The Contact experience is already a separate `/contact` route. Desktop/mobile navigation and the Profile CTA already converge on it; the visible heading is exactly “Say hello” without a period and uses `DecoderText`. The current action validates basic values, applies a honeypot, and sends one plain-text message through AWS SES using environment bindings (`app/layouts/navbar/nav-data.js:16-19`; `app/routes/home/profile.jsx:58-66`; `app/routes/contact/contact.jsx:29-237`). **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

## Most valuable reusable systems

| System | Disposition | Why it is valuable | Evidence classification |
| --- | --- | --- | --- |
| Remix root/Cloudflare route foundation | Reuse | Persistent root surfaces, nested route outlet, loaders/actions, error handling, and deploy adapter already work as one architecture (`app/root.jsx`; `functions/[[path]].js`). | CONFIRMED BY LOCAL REPOSITORY |
| Server-first light/dark theme and token pipeline | Reuse and harden | SSR cookie selection, inline tokens, nested inverse themes, and optimistic toggling avoid a client-only theme rewrite (`app/root.jsx:49-120`; `theme-provider.jsx:48-183`). | CONFIRMED BY LOCAL REPOSITORY |
| Shared `Transition`, `DecoderText`, and Hero cover language | Reuse/adapt | These drive multiple existing consumers and directly support the locked Contact and Hero animation requirements. | CONFIRMED BY LOCAL REPOSITORY |
| Persistent desktop/mobile `Navbar` with shared data | Adapt | One `navLinks` source feeds both modes; root ownership already satisfies the floating-navigation constraint (`navbar.jsx:142-223`; `nav-data.js:3-38`). | CONFIRMED BY LOCAL REPOSITORY |
| Shared `Image` reveal/media pipeline | Reuse with owned content | Viewport loading, placeholders, responsive sources, video controls, and reduced-motion behavior support Profile and case-study media (`app/components/image/image.jsx:11-215`). | CONFIRMED BY LOCAL REPOSITORY |
| Laptop `Model` and existing MacBook GLB | Reuse with HaircutDone content | Project content is a caller-owned texture record, so the renderer need not be forked merely to replace the screen and destination. | CONFIRMED BY LOCAL REPOSITORY for separation; STRONG INFERENCE for the reuse recommendation |
| Shared project-detail layout | Adapt | `ProjectContainer`, `ProjectHeader`, `ProjectSection`, `ProjectImage`, text/column primitives, and optional parallax already support long case-study routes (`app/layouts/project/project.jsx:15-188`). | CONFIRMED BY LOCAL REPOSITORY |
| Native document scroll and Remix restoration | Reuse | No custom scroll engine needs removal; existing hash/parallax helpers can be corrected in place (`app/root.jsx:135`; `app/hooks/useScrollToHash.js`; `app/hooks/useParallax.js`). | CONFIRMED BY LOCAL REPOSITORY |
| Separate Contact route | Reuse and harden | It already matches the required destination model, heading effect, and visible control count; backend policy remains deliberately unresolved. | CONFIRMED BY LOCAL REPOSITORY |

## Highest implementation risks

1. **Rights and identity:** the MIT code license does not authorize presenting Hamish's project work as Daniel's; old project/profile/error/public-preview content must not ship under DonewithDan (`README.md:38-42`). **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**
2. **Scope and branch safety:** the target crosses shared root, theme, route, motion, WebGL, content, and accessibility systems. One large implementation change would make regressions and recovery difficult; `master` must remain untouched. **Evidence classification: STRONG INFERENCE.**
3. **Contact security and failure handling:** the current public action has only a honeypot, no repository rate limit/origin policy, no provider-error recovery, and incomplete error/focus semantics (`app/routes/contact/contact.jsx:33-93,160-233`). **Evidence classification: CONFIRMED BY LOCAL REPOSITORY** for the source gaps; production abuse likelihood is a **STRONG INFERENCE**.
4. **Theme/session correctness:** cookie configuration is duplicated, arbitrary theme values are stored, and missing `SESSION_SECRET` falls back to a predictable single space (`app/root.jsx:55-65`; `app/routes/api.set-theme.js:7-20`). **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**
5. **WebGL resilience/performance:** renderers have no shared local fallback, the laptop uses fixed DPR 2 plus multipass shadows, async loads are not cancellation-safe, and touch has no model-tilt equivalent (`app/components/model/model.jsx:91-325,356-527`). **Evidence classification: CONFIRMED BY LOCAL REPOSITORY** for implementation; device impact is **UNRESOLVED / NEEDS RUNTIME VERIFICATION**.
6. **Mobile navigation accessibility:** the full-screen menu has no Escape behavior, focus entry/trap/return, controlled relationship, background inertness, or scroll lock (`app/layouts/navbar/navbar.jsx:175-201`; `nav-toggle.jsx:5-24`). **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**
7. **Decorative depth compliance:** current project decoration uses one whole-opacity SVG behind a transparent canvas; Profile uses a foreground SVG. Neither is a reusable per-portion contrast mask for SYSTEM/GAPS/CASE STUDY/PROFILE (`project-summary.jsx:41,50-63`; `profile.jsx:80-93`). **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**
8. **Metadata/route correctness:** root canonical construction is malformed for the non-trailing-slash branch, `baseMeta` reads absent `config.twitter`, and legacy routes/public metadata retain Hamish identity (`app/root.jsx:50-53`; `app/utils/meta.js:3,31`). **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**
9. **Toolchain reproducibility:** `.node-version:1` pins Node 18.0.0 while `package.json:66-68` and `README.md:10-21` require Node 19.9.0 or newer. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

The complete risk register, including likelihood, impact, detection, prevention, recovery, approval, and phase, is in [13-risk-register.md](13-risk-register.md).

## Major unresolved findings

### FROZEN DESIGN REQUIREMENTS

- GAPS remains exactly three cards with approved copy/order and basic desktop stacking, mobile readability, and reduced-motion linear behavior. The logo-only tool strip behavior, frozen Profile copy, HaircutDone opening/chapter/Loom/return structure, shared HaircutDone destination behavior, and the four required decorative-depth results are established requirements, not open design decisions.

### MISSING IMPLEMENTATION/ASSET

- The authoritative SYSTEM nodes, labels, connector paths, tracer timing, automation logic, glow behavior, and mobile logic have not been supplied. Only the future section contract and required hook categories are known. **Evidence classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION.**
- Exact tool list/order/logos/rights; GAPS final illustrations and any supplied stacking implementation; HaircutDone route slug, screen/screenshot assets, Loom URL/poster, and final media accessibility inputs; and Profile portrait, final alt intent, and external URLs remain missing. **Evidence classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION.**
- The Contact destination address, provider/method, visitor auto-confirmation, and acceptable abuse/privacy controls remain undecided. Production identity/domain/hosting, asset/font/model rights, and legacy-route disposition also remain open. **Evidence classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION.**

### UNRESOLVED TECHNICAL/RUNTIME VERIFICATION

- Final palette selection, supplied Hero Twisted Blob / Shader Slot compatibility, decorative-depth implementation/mask geometry, `/home` route-manifest behavior, and browser-native View Transition visuals require later verification. **Evidence classification: STRONG INFERENCE** for the `/home` concern; otherwise **UNRESOLVED / NEEDS RUNTIME VERIFICATION.**
- Route focus/scroll restoration, actual theme first paint, contrast, assistive-technology announcements, mobile viewport behavior, and WebGL/media performance/failure recovery cannot be certified from static source. **Evidence classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION.**

## Required documents created

1. [00-audit-summary.md](00-audit-summary.md)
2. [01-repository-map.md](01-repository-map.md)
3. [02-route-and-window-map.md](02-route-and-window-map.md)
4. [03-homepage-section-map.md](03-homepage-section-map.md)
5. [04-navigation-and-social-audit.md](04-navigation-and-social-audit.md)
6. [05-contact-system-audit.md](05-contact-system-audit.md)
7. [06-theme-system-audit.md](06-theme-system-audit.md)
8. [07-animation-inventory.md](07-animation-inventory.md)
9. [08-scroll-system-audit.md](08-scroll-system-audit.md)
10. [09-3d-and-media-audit.md](09-3d-and-media-audit.md)
11. [10-responsive-accessibility-audit.md](10-responsive-accessibility-audit.md)
12. [11-reuse-adapt-replace-matrix.md](11-reuse-adapt-replace-matrix.md)
13. [12-implementation-dependency-map.md](12-implementation-dependency-map.md)
14. [13-risk-register.md](13-risk-register.md)
15. [14-recommended-implementation-sequence.md](14-recommended-implementation-sequence.md)
16. [15-open-decisions-for-daniel.md](15-open-decisions-for-daniel.md)

## Overall audit confidence

| Area | Confidence | Basis |
| --- | --- | --- |
| Static architecture, files, definitions, imports, consumers, styles, assets, and configuration | High | Direct source tracing and repository enumeration; important conclusions carry paths, symbols, ranges, and classifications. |
| Route hierarchy and framework-default behavior | Medium-high | Explicit routes are source-confirmed; conventional `/home` and runtime normalization remain clearly classified inferences. |
| Rendered animation, scroll, focus, theme, and browser behavior | Medium | Source behavior is traced, but the audit intentionally did not run the application or browser tooling. |
| Deployment, provider, rights, accessibility conformance, and device performance | Medium-low until verified | These require external configuration, provenance, real browsers/devices, assistive technology, measurement, and human review. |

**Evidence classification: STRONG INFERENCE** for the confidence assessment, based on the evidence coverage and the audit's intentionally static boundary.

## Recommendation

**AUDIT READY FOR GPT REVIEW.** The documents are sufficient as the static architectural baseline for external GPT/human review; acceptance follows only after that review. The recommended path is to preserve this repository and proceed only through the section-by-section gates in [14-recommended-implementation-sequence.md](14-recommended-implementation-sequence.md), after resolving the phase-specific inputs in [15-open-decisions-for-daniel.md](15-open-decisions-for-daniel.md).

Acceptance does not resolve the explicitly open product, rights, hosting, backend, accessibility, browser, or performance questions, and it does not authorize implementation. SYSTEM internals must wait for the separate workflow specification; Contact delivery must wait for its three locked backend decisions; public DonewithDan presentation must wait until Hamish-specific content and rights are reconciled.
