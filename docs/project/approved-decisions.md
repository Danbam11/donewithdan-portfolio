# Approved decisions

This document records approved product and design direction. `docs/audit/` remains authoritative for repository facts; engineering choices below remain subject to runtime verification unless explicitly frozen.

## FROZEN

### Structure and navigation

- Homepage order: Hero; continuous logo-only tool strip; SYSTEM/workflow showcase; GAPS with exactly three stacking cards; HaircutDone 3D laptop gateway; Profile/About; Footer. Floating navigation remains outside scrolling sections.
- Navigation labels are Work, About, and Contact. Articles is removed.
- Contact is the existing separate route/window/connected experience. Navigation Contact and Profile “Send me a message →” must reach the same destination; neither may scroll to an inline Profile form.

### Contact UI

- Visible heading: `Say hello` (no period). Fields: Email and Message. Submit label: Send message.
- Backend delivery is blocked until Daniel confirms destination email, provider/delivery method, and whether visitors receive confirmation email. Secrets/API keys must never be client-side.

### Hero and tool strip

- Hero eyebrow: `DONEWITHDAN · TECH VA`; static line: `I GET`; changing lines: `AUTOMATION DONE.`, `FUNNELS DONE.`, `WORKFLOWS DONE.`
- Preserve the Hamish cyan/blue block-cover entrance language; do not replace it with generic fades/slides.
- Tool strip is one continuous logo-only loop of roughly 6–8 replaceable tools, about four visible on desktop, slower 25–35 second loop, fewer mobile, offscreen pause/reduction, and no continuous motion under reduced motion. No categories, descriptions, or “Built with” copy.

### SYSTEM, GAPS, and decorative depth

- SYSTEM outer entrance uses restrained Container-Scroll-style perspective/settling only; no Magic UI Safari, copied demo styling, Tailwind, or fixed demo dimensions. WorkflowBoard begins ambient motion after the entrance settles.
- GAPS has exactly these three cards in order. Desktop uses scroll-controlled stacking; native page scroll remains authoritative. Reduced motion and small mobile use a readable normal/light vertical flow.

  Card 01

  `Leads,`  
  `not leaks.`

  `Funnels, forms, and quizzes route every inquiry where it needs to go.`

  Card 02

  `Bookings,`  
  `not back-and-forth.`

  `Confirmations, reminders, and reschedules move without manual chasing.`

  Card 03

  `Follow-ups,`  
  `not forgotten.`

  `Every next step runs when it should—even after cancellations or no-shows.`
- Decorative words SYSTEM, GAPS, CASE STUDY, and PROFILE must show covered portions at lower contrast while uncovered portions remain stronger. A single flat opacity is not acceptable.

### HaircutDone

- Both “View the full system →” and “Explore HaircutDone →” reach one case-study destination.
- Case-study structure: large opening; screenshot/parallax compilation; deliberate chapter separation; Loom walkthrough; return to portfolio. Exact approved copy:

  `HAIRCUTDONE`

  `From haircut quiz to follow-up,`  
  `the full customer journey—DONE.`

  `WALKTHROUGH`

  `See the full system in motion.`

  `← Return to portfolio`
- Do not restore Hamish’s continuous animated photo strip. ScrollSmoother is not approved; GSAP/ScrollTrigger require repository-aware justification.
- Mobile gallery: one screenshot per view, manual horizontal swipe/drag, no arrows/autoplay, dot/pill indicator, circular wrapping, natural vertical scrolling, responsive/lazy loading, and manual operation under reduced motion. Desktop retains screenshot/parallax composition.

### Profile

- Desktop source of truth: `Desktop — Profile + Copyright — APPROVED MASTER`

- Approved desktop copy:

  `Ready to get things`
  `DONE?`

  `I build GoHighLevel systems designed to make leads, bookings, and follow-ups easier to manage.`

  `With seven years in customer support, I’ve seen where customer journeys usually break—missed leads, delayed replies, forgotten follow-ups, and too much manual work. I now turn those friction points into organized systems that feel clear, reliable, and easier to run.`

  `Let’s talk!`

- Only `GoHighLevel` and `seven` receive the static cyan highlight treatment. Highlight animation is deferred to the next Profile phase.
- Approved copyright: `© 2026 DonewithDan. Designed & built by Daniel.`

<!-- Superseded Profile direction retained only in repository history: -->

<!--
  Exact frozen copy:

  `About me`

  `Hi, I’m Dan.`

  `I build GoHighLevel systems designed to make leads, bookings, and follow-ups easier to manage.`

  `With nine years in customer support, I’ve seen where customer journeys usually break—missed leads, delayed replies, forgotten follow-ups, and too much manual work. I now turn those friction points into organized systems that feel clear, reliable, and easier to run.`

  `Send me a message →`
-->

## SUPPLIED

- DonewithDan logo SVG; Facebook SVG; custom divider SVG.
- GAPS Card 01, 02, and 03 illustrations; GAPS stacking reference source/handoff.
- WorkflowBoard portable source package and motion recording/reference.
- Container Scroll reference source.
- Twisted Blob reference/source.

These are implementation inputs only, not approval to copy into production unchanged. Do not add or optimize them during Phase 0.

## DEFERRED

- Exact tool list/order/logos and usage rights.
- Contact destination address, provider/delivery method, and visitor automatic-confirmation decision. Spam protection, validation, provider privacy implications, rate limiting, and security are later implementation/provider requirements, not a fourth Daniel prerequisite.
- Final production identity/domain/hosting decisions; Facebook URL and other external destinations.
- Asset/font/model rights, legacy-route disposition, final Portrait plus alt intent, remaining HaircutDone screens/order, Loom URL/poster/privacy/accessibility inputs.
- Twisted Blob production compatibility/fallback decision.

## ENGINEERING DECISION / REQUIRES RUNTIME VERIFICATION

- Confirm all candidate integrations against existing Remix/React/CSS Modules/Framer Motion architecture before adoption; do not add packages by default.
- WorkflowBoard remains framework-neutral DOM/SVG. Its host must supply Nunito, mount only one instance per document, use `autoStart: false` for SYSTEM, and control element-level offscreen start/stop with lifecycle cleanup.
- Twisted Blob production form must remove OrbitControls/lil-gui, use autonomous deformation only, use bounded/capability-gated magnetism, bound DPR, and prove performance/fallback behavior.
- Reuse the Hamish 3D laptop foundation only after mobile, DPR, lifecycle, failure fallback, and repeated route-cycle stability are verified.
- Decorative depth’s visible result is frozen; choose a repository-compatible mechanism through rendered verification. CSS layering, duplicated `aria-hidden` decorative text, masks, clipping, SVG, or another suitable method may be used.
- Verify desktop/mobile/reduced-motion/offscreen behavior, listener/RAF/WebGL cleanup, accessibility, and media performance before acceptance of any visual system.
