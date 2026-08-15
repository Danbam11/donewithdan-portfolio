# Recommended implementation sequence

## Operating model

This is a future, controlled sequence; no phase was implemented during this audit. Each numbered phase is intended to be a separate reviewed prompt/change set with its own verification and rollback checkpoint. Do not combine all phases into one request, commit, or deployment.

The sequence preserves the repository’s shared foundations before adapting consumers, and it keeps unresolved content/behavior behind explicit gates.

## Phase 0 — Safety and immutable baseline

- Goal: prove the future change is in the expected repository and authorized branch, record the clean/known working tree, and protect existing reference captures.
- Prerequisites: explicit implementation authorization for a narrowly named phase.
- Files likely involved: none; inspection only.
- Systems that must be preserved: master, references/screenshots/**, references/section-inventory.md, package/lockfiles unless the phase specifically authorizes them.
- Verification gate: cwd, git branch --show-current, git status --short, and current HEAD; list pre-existing changes without altering them.
- Safe rollback point: no-write baseline.
- Evidence required before proceeding: correct repository, non-master implementation branch, understood working-tree ownership, and an allowed-file list.
- Evidence classification: CONFIRMED BY LOCAL REPOSITORY — this audit passed the same gate on wireframe-prototype.

## Phase 1 — Resolve blocking decisions and build the replacement inventory

- Goal: turn unresolved inputs into versioned implementation contracts without touching production UI.
- Prerequisites: Daniel’s responses from 15-open-decisions-for-daniel.md.
- Files likely involved: future planning/content assets in an explicitly approved location; no application file is implied by this audit.
- Systems that must be preserved: all existing application behavior and reference evidence.
- Verification gate: approved production identity/domain; Facebook URL and any future configured socials; Contact destination/provider/confirmation; asset/font rights; tool logos; GAPS illustrations; HaircutDone assets/Loom URL; Profile portrait/URLs; legacy-route policy; hosting decision; SYSTEM specification status.
- Safe rollback point: approved decision/content package, before code.
- Evidence required before proceeding: owner, provenance/license, dimensions/format, copy status, and destination for every replacement asset/input.
- Evidence classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION — these values are not in the repository.

## Phase 2 — Reconcile runtime and verification tooling

- Goal: make later checks reproducible before shared systems are changed.
- Prerequisites: Phase 0; approved runtime target; permission for any dependency/config changes.
- Files likely involved: .node-version, package.json, package-lock.json, README.md, scripts/draco.cjs, CI configuration if later added, and scoped test/Storybook files.
- Systems that must be preserved: Remix/Vite/Cloudflare architecture, Draco path /draco/, existing scripts until replacements are verified.
- Verification gate: clean authorized install, static checks, production build, route manifest, and Storybook in an isolated/preview environment. These commands were deliberately not run during this audit.
- Safe rollback point: a toolchain-only checkpoint before identity or UI changes.
- Evidence required before proceeding: one documented Node/npm combination; resolved Node 18 versus >=19.9 conflict; deterministic Draco generation; check inventory and results.
- Evidence classification: CONFIRMED BY LOCAL REPOSITORY — .node-version:1 conflicts with package.json:66-68 and README.md:12; package.json has no test/lint script.

## Phase 3 — Establish DonewithDan identity and route policy seams

- Goal: remove global Hamish identity from shared configuration without yet redesigning sections, and freeze public route/redirect contracts.
- Prerequisites: Phase 1 identity, domain, social, credits/rights, and legacy-route decisions; Phase 2 verification available.
- Files likely involved: app/config.json, app/utils/meta.js, app/root.jsx, public/manifest.json, public/humans.txt, public icons/social preview, public/sitemap.xml, public/robots.txt, .storybook/manager.js, .storybook/manager-head.html, README.md where approved.
- Systems that must be preserved: baseMeta API, root loader/document shell, canonical link placement, route-specific meta exports, manifest/icon link relationships.
- Verification gate: search for stale Hamish/project identifiers; inspect SSR head for trailing/non-trailing URLs; validate public route list, icons, manifest, OG dimensions, and redirects.
- Safe rollback point: identity/route-policy checkpoint with unchanged homepage composition.
- Evidence required before proceeding: correct domain on every surface; corrected canonical behavior at app/root.jsx:50-53; resolved undefined config.twitter consumer at app/utils/meta.js:3,31; no unapproved old project claims/assets.
- Evidence classification: CONFIRMED BY LOCAL REPOSITORY — identity is distributed across the listed files and the current canonical branch is malformed on non-trailing URLs.

## Phase 4 — Harden and freeze the theme contract

- Goal: preserve the no-flash light/dark architecture while making persistence safe and deterministic.
- Prerequisites: Phase 2 runtime; hosting/session context; production SESSION_SECRET policy; frozen dark-default preservation.
- Files likely involved: app/root.jsx, app/routes/api.set-theme.js, app/components/theme-provider/theme-provider.jsx, theme.js, app/layouts/navbar/theme-toggle.jsx and theme-toggle.module.css; a shared session utility if later approved.
- Systems that must be preserved: server-rendered body data-theme, inline themeStyles before Links, optimistic fetcher update, nested inverse ThemeProvider, theme-color/color-scheme, desktop/mobile toggle icon.
- Verification gate: first visit/reload in both themes, invalid value, cookie disabled, missing secret failure, navigation during toggle, error route, mobile menu, no wrong-theme flash.
- Safe rollback point: theme-only checkpoint before section color or WebGL tuning.
- Evidence required before proceeding: dark/light allowlist, centralized cookie semantics, required non-placeholder secret, screenshot/HTML evidence of correct first paint.
- Evidence classification: CONFIRMED BY LOCAL REPOSITORY — root.jsx:49-94, theme-provider.jsx:98-183, and api.set-theme.js:3-30 form the current contract.

## Phase 5 — Preserve and harden the separate Contact experience

- Goal: adapt Contact to DonewithDan while retaining its independent /contact destination, “Say hello” decode, and locked three-control form.
- Prerequisites: Phase 1 Contact decisions; Phase 3 identity; Phase 4 theme; approved security/error model.
- Files likely involved: app/routes/contact/contact.jsx, contact.module.css, contact/route.js, app/components/input/**, app/components/button/**, app/hooks/useFormInput.js, selected server utility/config locations, environment example names only.
- Systems that must be preserved: separate Remix route, DecoderText, Transition-driven form/success states, Email/Message/Send message, internal view transition, Footer.
- Verification gate: desktop/mobile navigation direct entry; invalid/missing/oversized input; field-linked errors and summary focus; keyboard/screen reader; reduced motion; rate limit/honeypot; provider timeout/rejection; success; no automatic confirmation unless approved; no secret exposure.
- Safe rollback point: Contact-only checkpoint that can fall back to a non-sending but honest unavailable state without moving the form onto Home.
- Evidence required before proceeding: both eventual entry points resolve /contact; exact visible heading has no period; delivery and abuse tests use non-production recipients/credentials.
- Evidence classification: CONFIRMED BY LOCAL REPOSITORY — nav-data.js:16-19 and profile.jsx:58-66 already share /contact; contact.jsx:33-241 owns action and UI.

## Phase 6 — Adapt desktop and mobile navigation

- Goal: deliver only Work, About, Contact while preserving persistent floating desktop and full-screen mobile foundations.
- Prerequisites: Phase 3 route policy; frozen temporary/final Work and About IDs; Phase 4 theme; Phase 5 Contact route.
- Files likely involved: app/layouts/navbar/nav-data.js, navbar.jsx, navbar.module.css, nav-toggle.jsx/module.css, theme-toggle files, app/hooks/useScrollToHash.js, app/components/monogram/**, app/config.json.
- Systems that must be preserved: Navbar outside Outlet in app/root.jsx; vertical fixed desktop layout; shared data source; active state; theme inversion; social icons if approved; view transitions; touch/short-height switch.
- Verification gate: same-page and cross-route Work/About; desktop/mobile Contact; Articles absent; social destinations; keyboard; Escape; focus entry/containment/return; background inert/scroll; rotation; 696px width/height boundary; missing-hash safety.
- Safe rollback point: navigation-only checkpoint with old Home sections still reachable through mapped interim IDs.
- Evidence required before proceeding: DOM/focus trace and route trace for every item at desktop/mobile; no inaccessible background focus.
- Evidence classification: CONFIRMED BY LOCAL REPOSITORY — shared navigation is at navbar.jsx:16-223 and nav-data.js:3-37; current accessibility gaps are statically absent.

## Phase 7 — Recompose the Home route as a semantic section skeleton

- Goal: establish the locked order and stable IDs without implementing each section’s final visual/motion.
- Prerequisites: Phase 6 navigation ID contract; approved component boundaries; content placeholders must be explicitly labelled as non-final and owned.
- Files likely involved: app/routes/home/home.jsx, home.module.css, new route-local section modules under app/routes/home only as later approved.
- Systems that must be preserved: Home remains the index destination; Navbar remains outside scrolling sections; Footer remains last; native document scroll; focusable labelled sections; root loading/restoration.
- Verification gate: DOM and visual order is Hero → tool strip → SYSTEM → GAPS → HaircutDone gateway → Profile → Footer; only one main; correct headings/landmarks; Work/About anchors; no old project media published as replacement content.
- Safe rollback point: composition-skeleton checkpoint before section-specific styling.
- Evidence required before proceeding: component tree, IDs, heading outline, desktop/mobile plain layout, and a mapping from every old section removed/adapted.
- Evidence classification: CONFIRMED BY LOCAL REPOSITORY — Home currently hard-codes Intro, three ProjectSummary refs, Profile, Footer at home.jsx:94-172 and its observer is coupled to five refs at lines 50-92.

## Phase 8 — Adapt the Hero only

- Goal: apply the locked eyebrow, “I GET”, and three changing lines while preserving the original cyan/blue cover language where feasible.
- Prerequisites: Phase 4 theme, Phase 7 semantic shell, motion/reduced-motion policy, supplied Hero Twisted Blob / Shader Slot source and compatibility/performance decision.
- Files likely involved: app/routes/home/intro.jsx, intro.module.css, displacement-sphere.jsx/module.css and shaders only if the approved visual requires it, app/config.json only if copy remains centralized, related stories/tests.
- Systems that must be preserved: Transition status timing, global reveal keyframe, decoder accessibility pattern, semantic heading, desktop/mobile scroll indicator, hydration-gated lazy WebGL if retained.
- Verification gate: exact locked copy/order; cover enters/exits correctly; theme toggle; changing-line layout; stable screen-reader label; reduced motion shows stable content without unwanted cycling; touch/short height; WebGL/static fallback.
- Safe rollback point: Hero-only checkpoint, independently revertible from the Home skeleton.
- Evidence required before proceeding: normal/reduced-motion recordings, heading/accessibility-tree capture, desktop/mobile screenshots, GPU/fallback result.
- Evidence classification: CONFIRMED BY LOCAL REPOSITORY — Intro and its block cover are isolated at intro.jsx and intro.module.css; useInterval is currently unconditional.

## Phase 9 — Build the tool strip only

- Goal: add the continuous logo-only strip directly after Hero.
- Prerequisites: frozen strip behavior; exact logo list/files/rights; Phase 7 slot; motion and accessibility contracts.
- Files likely involved: a new route-local tool-strip component/style/data module, approved assets, Home composition, shared primitives only if a demonstrated gap requires it.
- Systems that must be preserved: native scroll, theme tokens, Home semantic order, reduced-motion support.
- Verification gate: all logos correct/owned; seamless loop; duplicates hidden from accessibility; useful accessible group label; static/pause reduced-motion mode; no hover-only information; narrow/zoom/low-power behavior; no layout shift.
- Safe rollback point: tool-strip-only checkpoint; removing the component restores the Phase 8 Home.
- Evidence required before proceeding: asset manifest, animation/reduced-motion recording, accessibility tree, performance/network trace.
- Evidence classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION — no equivalent component or final logo specification currently exists.

## Phase 10 — Build only the SYSTEM shell, then stop for the workflow specification

- Goal: create the approved section boundary and reserved hooks without inventing workflow content or motion.
- Prerequisites: Phase 7 slot; final four-word art direction sufficient for SYSTEM; supplied workflow specification for anything beyond the empty shell.
- Files likely involved: a new route-local SYSTEM component/style module and Home composition; later workflow-specific child modules/assets only after approval.
- Systems that must be preserved: semantic section and fallback reading order; theme/reduced-motion contracts; hooks for workflow container, SVG paths, nodes, tracers, and mobile fallback.
- Verification gate: no invented nodes, labels, connectors, timings, logic, glow, or mobile behavior; shell reserves agreed extension points; SYSTEM word depth meets approved layer method.
- Safe rollback point: empty semantic SYSTEM shell checkpoint.
- Evidence required before proceeding: Daniel-approved workflow specification with every value traceable; desktop/mobile/reduced-motion design.
- Evidence classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION — the required specification is explicitly deferred and no repository workflow implementation exists.

## Phase 11 — Build the GAPS cards only

- Goal: implement the three-card section and its approved stacking behavior.
- Prerequisites: frozen card copy/order/basic behavior; final illustrations or optional supplied stacking-card reference; Phase 7 slot; four-word depth art direction.
- Files likely involved: a new route-local GAPS component/style/data module, Home composition, shared Transition/visibility utilities if their contracts fit.
- Systems that must be preserved: semantic DOM order, native scrolling, focus visibility, reduced motion, theme tokens.
- Verification gate: exactly three approved cards; DOM order matches meaning; sticky/stack interaction does not trap scroll; keyboard/screen reader; short heights; mobile fallback; reduced motion; GAPS partial-depth contrast.
- Safe rollback point: GAPS-only checkpoint; static cards can remain if stacking enhancement fails.
- Evidence required before proceeding: signed-off copy, normal/reduced-motion desktop/mobile captures, accessibility tree, scroll/performance trace.
- Evidence classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION — current ProjectSummary sections are not stacking cards and final behavior/content is not in source.

## Phase 12 — Adapt the HaircutDone laptop gateway only

- Goal: replace one old project-summary role with the owned HaircutDone gateway and make both locked actions point to one route.
- Prerequisites: Phase 1 HaircutDone screen/alt/route; Phase 7 slot; case-route contract; WebGL fallback/performance policy.
- Files likely involved: app/routes/home/project-summary.jsx/module.css or a carefully adapted route-local successor, app/components/model/model.jsx/module.css and device-models.js only if necessary, app/routes/home/home.jsx, approved screen assets.
- Systems that must be preserved: macbook-pro.glb, loader, named Screen/Frame contract, placeholder-to-full texture swap, laptop-open animation, pointer springs where appropriate, responsive order, focus reveal, internal Button/view transition.
- Verification gate: “View the full system →” and “Explore HaircutDone →” have byte-for-byte equivalent resolved destinations; screen mapping; load/failure/static fallback; reduced motion; touch/keyboard; desktop/mobile; GPU and memory cleanup; CASE STUDY depth.
- Safe rollback point: gateway-only checkpoint with one static internal route link still available if WebGL is disabled.
- Evidence required before proceeding: route assertion for both CTAs, GLTF node/texture validation, performance/fallback captures, owned asset proof.
- Evidence classification: CONFIRMED BY LOCAL REPOSITORY — reusable laptop path is ProjectSummary → Model → Device at project-summary.jsx:101-174 and model.jsx:57-527.

## Phase 13 — Build the HaircutDone connected case-study route in chapters

- Goal: deliver the separate destination with large opening, screenshot/parallax compilation, deliberate chapter separation, Loom walkthrough, and return to portfolio.
- Prerequisites: frozen opening/chapter/Loom-label/return wording; screen/screenshot assets and Loom URL; Phase 3 route/metadata policy; Phase 12 route contract; privacy/accessibility plan.
- Files likely involved: a new app/routes/projects.<approved-slug>/route.js and composed view/style files; app/layouts/project/** only for proven generic gaps; app/components/image/**; Footer/Button/Link; approved image/video/embed assets.
- Systems that must be preserved: Remix project route family, shared Project primitives, responsive images/placeholders, reduced-motion-aware parallax, root nav/loading/restoration/view transitions.
- Systems that must not be used as the governing structure: continuous animated photo strip/carousel.
- Verification gate: direct URL/deep link; both gateway entries; large opening; clear chapter headings; responsive/lazy media; Loom title/captions/transcript or summary/fallback; return destination/focus/scroll; no old project claims/assets; route metadata/OG; failure/offline states.
- Safe rollback point: route-shell checkpoint first, then one checkpoint per chapter; Loom integration is independently removable.
- Evidence required before proceeding: chapter-by-chapter content approval, media provenance, accessibility tree, network/performance report, route and return trace.
- Evidence classification: CONFIRMED BY LOCAL REPOSITORY — app/layouts/project/project.jsx and projects.slice/slice.jsx prove reusable long-form composition; frozen HaircutDone copy/structure is established, while remaining media assets, route slug, Loom URL, and accessibility/privacy details are UNRESOLVED / NEEDS RUNTIME VERIFICATION.

## Phase 14 — Adapt Profile and Footer only

- Goal: complete Daniel’s Profile/About and shared footer while preserving the portrait reveal and Contact route.
- Prerequisites: frozen Profile copy; portrait/final alt intent/links/credit; Phase 5 Contact; Phase 7 slot; PROFILE depth art direction.
- Files likely involved: app/routes/home/profile.jsx/module.css, approved portrait source sets/placeholders, app/components/footer/footer.jsx/module.css, public/humans.txt, app/config.json.
- Systems that must be preserved: focus-triggered Profile Transition, Image reveal cover, semantic section, responsive grid, /contact CTA, shared Footer component.
- Verification gate: owned copy/image; correct alt; “Send me a message →” resolves exactly to the same Contact destination as nav; PROFILE partial-depth contrast; heading order; link safety; zoom/reflow; mobile; reduced motion; footer on every retained route.
- Safe rollback point: Profile/Footer-only checkpoint, independent of case-study and earlier sections.
- Evidence required before proceeding: content approval, asset provenance/dimensions, CTA route assertion, desktop/mobile/reduced-motion captures.
- Evidence classification: CONFIRMED BY LOCAL REPOSITORY — current composition is isolated in profile.jsx:18-101 and Footer at footer.jsx:7-18.

## Phase 15 — Reconcile metadata, legacy routes, errors, and loading against the final route graph

- Goal: finish public identity and route behavior after all destinations are stable.
- Prerequisites: Phases 3, 5, 6, 12, 13, 14; final legacy policy and production URL/OG art.
- Files likely involved: app/config.json, app/utils/meta.js, route meta exports, app/root.jsx, public/sitemap.xml, robots.txt, manifest/icons/social image, error layout/assets, Footer/humans, route redirects/removals explicitly approved.
- Systems that must be preserved: baseMeta route seam, root canonical link, ErrorBoundary/catch-all, Progress/root loading, ordinary deep links.
- Verification gate: crawl every retained/redirected/removed URL; canonical variants; 404/405/500; OG/manifest/sitemap; no Hamish identity; back/forward/loading progress; public indexing policy.
- Safe rollback point: metadata/route-policy checkpoint before deployment; redirects remain independently revertible.
- Evidence required before proceeding: route table with expected status/target/meta, raw response/head capture, social preview, no forbidden content.
- Evidence classification: CONFIRMED BY LOCAL REPOSITORY — the current public route and metadata surfaces are statically enumerated in documents 01 and 02.

## Phase 16 — Integrated responsive, accessibility, motion, and performance release gate

- Goal: validate the whole portfolio without using this phase as a place to postpone known section defects.
- Prerequisites: every included section has already passed its local gate; deployment preview contains no production secrets or unapproved content.
- Files likely involved: only narrowly identified fixes and verification artifacts in approved locations; no broad refactor.
- Systems that must be preserved: native scroll/restoration; keyboard/focus; reduced motion; theme no-flash; navigation; Contact; route transitions; laptop fallback; media lazy loading; errors.
- Verification gate: widths around 2080/1680/1040/696/400; short heights 696/420/360; orientation/mobile chrome; touch/fine pointer; 200%/400% zoom; keyboard and screen reader; reduced motion; contrast; form states; browser matrix; LCP/CLS/INP; GPU/frame time/memory; route teardown; no secret/stale-identity/rights violations.
- Safe rollback point: release-candidate checkpoint; any failing section rolls back to its last passing isolated checkpoint rather than triggering a full redesign rewrite.
- Evidence required before proceeding: signed checklist with automated and human results, device/browser/performance traces, final git diff/status, and Daniel’s visual/content/release approval.
- Evidence classification: STRONG INFERENCE — cross-cutting validation is required because the repository’s shared tokens, navigation, scroll, media, and transition utilities have many consumers; actual results require later runtime verification.

## Stop conditions

Stop the later implementation phase instead of guessing when:

- the branch/path preflight fails;
- a change outside the phase’s allowed files appears;
- asset ownership is unclear;
- SYSTEM workflow values have not been supplied;
- either HaircutDone action lacks the shared destination;
- Contact decisions/secrets/anti-abuse controls are incomplete for sending;
- a shared primitive change breaks another retained route;
- reduced-motion, keyboard, or mobile fallback is absent;
- the phase would require a package/lockfile/hosting change not explicitly approved.

## Recommendation

Proceed only section-by-section in the order above. A controlled phase may be deferred when its inputs are missing—for example, the SYSTEM shell can stop at its reserved contract while Profile or Contact preparation continues—but dependent work must not leap over its explicit gate.
