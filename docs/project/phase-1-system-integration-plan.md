# Phase 1 — SYSTEM Integration Plan

## Evidence boundary

Planning/inspection only. Repository facts are from the current \`donewithdan-implementation\` checkout. WorkflowBoard findings are verified from the supplied ZIP and Container Scroll findings from the supplied reference. Runtime visual/performance behavior still requires the defined spike.

## 1. Repository insertion point

- Home route: \`app/routes/home/route.js\` re-exports \`Home\` from \`app/routes/home/home.jsx\`.
- Current order: \`Intro\`; three \`ProjectSummary\` sections (\`project-1\` to \`project-3\`); \`Profile\`; \`Footer\` (\`home.jsx:94-172\`).
- Approved DonewithDan order places SYSTEM after the future tool strip and before future GAPS. Neither exists, so SYSTEM will eventually be added between those future components; it is not a one-for-one replacement for a legacy ProjectSummary.
- Do not use \`Home.visibleSections\` for SYSTEM: it is a one-shot reveal state and never returns false. SYSTEM needs its own ongoing visibility lifecycle.
- Related layout/lifecycle owners: \`app/root.jsx\` owns \`<main>\`, global Navbar, theme, and Remix \`ScrollRestoration\`; \`app/global.module.css\` and \`app/routes/home/home.module.css\` use x-axis clipping. Mobile board overflow must be local.

## 2. WorkflowBoard source inspection

### Handoff requirements

- Canonical handoff: \`haircutdone-component-handoff-v1\`; portable root: \`src/haircutdone/\`.
- Initializer: \`createHaircutDoneWorkflow(rootElement, options)\`.
- Required host contract: initialize with \`{ autoStart: false }\`; call \`startAmbient()\` after entrance settlement; \`stopAmbient()\` when genuinely offscreen; \`destroy()\` on unmount.
- It remains live DOM/SVG—not a screenshot, video, canvas recreation, or React rewrite.

### Source-verified findings

Static Remix import is SSR-safe: the module only declares constants and a relative SVG URL at module evaluation, with no top-level browser globals. Call createHaircutDoneWorkflow only in a hydrated effect: it checks Element and then uses ownerDocument.defaultView, matchMedia, fetch, DOMParser, SVG geometry APIs, RAF, and listeners. Pass the host ref Element, not a selector.

It exports the specified async initializer and 1248 x 677 board / 1120 x 565 workflow dimensions, with no runtime JS dependencies and no React rewrite. It fetches/parses the adjacent SVG, then creates the live DOM/SVG, 13 signals, and nine interactive nodes. One module-scoped activeInstance allows one board per document until destroy.

Ambient owns one shared RAF and a 650 ms initial timer. stopAmbient clears the timer, cancels RAF, resets state, and hides every signal: it stops continuous work. The component handles document visibility and reduced-motion changes but has no IntersectionObserver. destroy is idempotent: it stops controllers, removes registered listeners/timers/DOM, and releases activeInstance. Reduced motion retains static interactive SVG but schedules no ambient work.

## 3. Repository-native React wrapper architecture

Eventually create a route-local SYSTEM component, e.g. \`app/routes/home/system/\`, containing semantic section/heading, decorative depth layers, board viewport/scroller, and a ref-owned empty board host. Use existing \`useHydrated\` (\`app/hooks/useHydrated.js\`) so SSR renders stable structure only.

\`\`\`text
hydrate
  -> effect invokes the statically imported portable initializer
  -> if still mounted, initialize exactly once with autoStart:false
  -> retain controller ref, initially stopped
observer: settled AND genuinely visible -> startAmbient()
observer: offscreen -> stopAmbient()
cleanup -> mark initialization cancelled; disconnect observer; unsubscribe Motion values;
           destroy once; clear refs
\`\`\`

Use an asynchronous-initialization guard: if the initializer resolves after unmount, immediately destroy the returned controller and do not retain it. Do not use \`React.lazy\` for the imperative initializer. The closest browser-only precedent is \`ProjectSummary\` using \`useHydrated\` plus lazy \`Model\` loading (\`app/routes/home/project-summary.jsx:18-21,37-44,101-170\`); reuse only its hydration pattern.

## 4. CSS and font integration

- Styling is CSS Modules with global theme tokens (\`app/global.module.css\`, \`app/components/theme-provider/theme-provider.jsx\`).
- CSS namespace/reset/overflow/viewport assumptions are source-verified; the exact namespaced and mobile containment contract is recorded in the Source verification addendum.
- Eventual ownership: a colocated \`system.module.css\` only if all portable selectors are board-namespaced. Scope/adapt any reset/global selectors below the SYSTEM host; do not modify global reset, \`html\`, \`body\`, or document overflow.
- Nunito is absent from bundled assets, theme mappings, CSS, and \`package.json\`; only Gotham and IPA Gothic exist (\`app/assets/fonts/*\`, \`theme-provider.jsx:119-174\`, \`theme.js:6-23\`). Nunito is a later approved asset/font integration requirement. Do not install/download it now.

## 5. Outer Container Scroll adaptation

Choose **B: recreate restrained transform math with installed Framer Motion 11.0.5**, not a source copy. \`framer-motion\` is installed (\`package.json:25\`) and uses \`useReducedMotion\`, \`useSpring\`, and \`animate\` elsewhere. No existing \`useScroll\`/\`useTransform\` call exists, but Framer Motion 11 provides the needed stack without package change.

Keep slight \`rotateX\` perspective, modest optional scale/y translation, transform origin, and smooth settlement on an outer visual wrapper. Do not transform internal board topology. Discard 20-degree specifics, Safari/device shell, Tailwind, borders, shadows, fixed demo heights, exact mobile scale, and reference package choice.

## 6. Scroll ownership

Native document/window scroll is the sole global vertical authority. \`app/root.jsx\` owns Remix \`ScrollRestoration\`; audit 08 confirms no smooth-scroll engine, transformed scroll root, snap, or application-level vertical scroller. SYSTEM motion observes scroll only; it never writes scroll position or introduces a global controller. WorkflowBoard does not own page scrolling. Mobile horizontal scrolling is a local native scroller.

## 7. Entrance-to-ambient handoff

Use a one-way host state machine, not workflow scrubbing:

\`\`\`text
unready -> initialized/stopped -> entrance-settled -> ambient-running
                                      |                    |
                                      +-- offscreen -------+-> stopped
\`\`\`

After hydration, subscribe to outer Framer Motion scroll progress. At a runtime-tuned near-settled threshold (spike candidate \`>= 0.95\`), set \`entranceSettled\` once and unsubscribe. A stable visibility observer derives \`shouldRun = entranceSettled && genuinelyVisible && controllerReady\`; invoke controller start/stop only when it changes. If users leave before settlement, it stays mounted/stopped; returning waits for the one-time settlement. It is never reversed by scroll direction.

With reduced motion, render outer transforms already settled and set \`entranceSettled\` without scroll work. The host does not intentionally start ambient motion; WorkflowBoard remains mounted, static, and interactive under its source-confirmed implementation.

## 8. Offscreen visibility lifecycle

Use a dedicated SYSTEM \`IntersectionObserver\`, not \`Home.visibleSections\` or unmodified \`useInViewport\`. The shared hook is a relevant precedent and disconnects cleanly (\`app/hooks/useInViewport.js\`), but is boolean-only and can recreate observers from options identity. SYSTEM needs stable options and hysteresis.

Candidate contract for the spike: start/resume at at least 0.15 intersection; stop at 0 intersection, with root margin tuned against the real board. Track the last desired run state to avoid call chatter. Keep DOM/SVG mounted offscreen; source confirms \`stopAmbient\` cancels its ambient timer/RAF and resets/hides signals.

## 9. Route/unmount cleanup

Home lives in Remix \`<Outlet />\` (\`app/root.jsx:124-133\`), so route navigation unmounts it. Wrapper cleanup must disconnect observer, unsubscribe MotionValue callbacks, mark asynchronous initialization cancelled, call \`destroy()\` exactly once when a controller exists, and clear refs. If initialization resolves after unmount, immediately destroy its returned controller. Required route-cycle result: \`Home -> another route -> Home\` produces exactly one healthy board with no former RAF/listener/observer activity.

## 10. Desktop containment

Atomic board: about 1248 × 677; internal workflow: about 1120 × 565. Constrain a SYSTEM-local responsive frame by Section padding/tokens. Fit the complete atomic board proportionally via one sizing layer preserving aspect ratio; never independently resize/reposition internal SVG topology. Separate layers: outer entrance transform; sizing layer; board host.

## 11. Mobile containment

Below the selected mobile breakpoint, disable perspective movement and provide local \`overflow-x:auto\`, \`overflow-y:hidden\` (plus \`-webkit-overflow-scrolling:touch\` if useful). Preserve an approximately 960 px inner workflow target. Do not compress, stack, or reflow nodes. Keep page vertical scrolling natural and avoid \`touch-action:none\`, which audit evidence shows can suppress vertical panning. Any visible swipe instruction needs later copy approval; do not invent it in the spike.

## 12. Reduced-motion behavior

Use repository Framer Motion \`useReducedMotion\` and global \`--mediaReduceMotion\`. Outer board is immediately front-facing/readable: no perspective scrub, y/scale transition, or pinned narrative. Keep the live board, but let its supplied implementation decide internal motion. Do not add competing CSS animation.

## 13. Accessibility considerations

- Use a semantic SYSTEM heading and \`aria-labelledby\` section.
- Decorative SYSTEM depth layers are \`aria-hidden\`; do not duplicate accessible text. The approved covered/uncovered contrast needs real layering/masking, not flat opacity (audit R-10).
- SOURCE-CONFIRMED: WorkflowBoard gives the SVG an accessible name. Its nine workflow nodes receive button roles, tabindex 0, accessible labels, Enter/Space activation, pointer interaction, source-defined focus treatment, and polite activation announcements. Runtime-generated and copied SVG IDs are namespaced.
- RUNTIME ACCESSIBILITY VERIFICATION: keyboard/focus behavior in the Remix host; screen-reader announcement quality and reading order; touch horizontal-overflow discoverability; focus visibility after proportional containment; interaction while outer transforms are active; contrast and assistive-technology/browser behavior.
- The local mobile scroller must not trap focus or block vertical touch. Test focus rings at narrow/zoomed widths because root/Home x-axis clipping can conceal them.

## 14. Performance/lifecycle risks

### Confirmed by local repository

- Native scroll already has Navbar work and other observers; SYSTEM must add no manual window scroll listener or host RAF beyond Framer Motion’s subscription.
- Home observers are one-shot and rebuild after \`visibleSections\` updates; use a standalone stable observer.
- Existing Home includes visibility-gated WebGL/model work; simultaneous activity and offscreen work are known runtime risks (audit 08; audit 13 R-24/R-29).
- Root/Home x-axis clipping makes local containment mandatory.



### SOURCE-CONFIRMED WORKFLOWBOARD LIFECYCLE

- WorkflowBoard uses one shared ambient requestAnimationFrame loop.
- Ambient startup uses a 650 ms timer.
- \`stopAmbient()\` cancels the pending startup timer and active ambient RAF, then resets/hides traveling signals.
- \`destroy()\` performs instance cleanup and is idempotent for the planned unmount lifecycle.
- Document-visibility handling already exists inside WorkflowBoard.
- WorkflowBoard does not provide section-level \`IntersectionObserver\` / offscreen visibility control; the React host owns that.
- Reduced motion suppresses ambient autoplay/work according to verified source behavior.

### RUNTIME SPIKE MUST VERIFY

- Actual frame/main-thread cost in the DonewithDan homepage, plus layout/paint/compositing and memory behavior during rendering.
- Coexistence with Hamish homepage WebGL; whether the settled threshold feels correct; and whether IntersectionObserver thresholds avoid visibility thrashing.
- Real mobile horizontal-pan versus vertical-page-scroll behavior; keyboard/focus behavior in the final Remix host; and real reduced-motion rendering in the integrated host.
- Repeated Home → route → Home cycles under browser rendering, including confirmation that no listener, observer, RAF, timer, or rendered WorkflowBoard instance survives route unmount.

No benchmark numbers are asserted without profiling.

## 15. Dependency decision

- WorkflowBoard runtime dependencies: **none**. No React rewrite or package install is needed; its three portable files must later be copied together unchanged under authorized implementation.
- Nunito: later font asset requirement, not a package change.
- Container entrance: existing \`framer-motion@11.0.5\` is sufficient.
- Overall Phase 1 dependency change: **NO**.

## 16. Minimum runtime spike

Do not execute during Phase 1.

**Hypothesis:** An SSR-safe statically imported module can perform client-only DOM/SVG initialization once in an effect with \`autoStart:false\`, remain stopped until a restrained Framer Motion entrance settles, visibility-gate ambient work, and cleanly destroy without another global scroll authority.

**Likely files:** temporary route-local SYSTEM component/CSS under \`app/routes/home/system/\`; copied approved portable source under that boundary or \`app/components/haircutdone/\`; then narrow \`app/routes/home/home.jsx\` composition. No global scroll edits or packages.

**Render:** frozen SYSTEM heading/decorative treatment, one real WorkflowBoard, restrained outer transform; no GAPS, Safari demo shell, or unrelated redesign.

**Acceptance criteria:**

- Desktop: full atomic board fits proportionally; settles front-facing; ambient starts once after settlement.
- Mobile/touch: 960 px topology swipes horizontally; vertical page scroll remains natural; no document horizontal overflow.
- Reduced motion: settled/readable from first render; no outer scrub; board follows its supplied reduced-motion mode.
- Offscreen: exact start/stop transitions with no chatter.
- Route cycle: repeated Home-away-Home leaves one active board and no retained activity.
- Performance: profile long tasks, frames, memory/GPU, nearby WebGL contention, and listener/observer counts.

**Failure criteria:** SSR/hydration/import failures; CSS/reset leakage; Nunito layout break; duplicate controllers; continued work after stop/destroy; blocked vertical touch; accessibility/focus failures; or unacceptable profiling contention.

## 17. Recommended production implementation sequence

1. Authorize a narrow lifecycle/runtime spike only; copy the exact three portable files together without modification.
2. Add static import/effect initialization, stylesheet loading, dedicated observer, and \`autoStart:false\`; copy no unrelated homepage systems.
3. Test the defined desktop, mobile, reduced-motion, offscreen, route-cycle, accessibility, and performance matrix.
4. Review thresholds, font asset loading, and CSS ownership/scoping from results.
5. Implement production SYSTEM one controlled component at a time, preserving native scrolling and the proven lifecycle.

## Source verification addendum

Supporting source evidence for the corresponding plan sections follows.

The 419-line WorkflowBoard stylesheet is fully namespaced under .haircutdone-workflow-root, .haircutdone-workflow-*, and --haircutdone-*. Its only universal selector is root-scoped; it has no :root, html, body, unscoped element rules, @import, or @font-face. Preserve it as one non-CSS-Module stylesheet loaded once with the portable source; CSS Modules would break its runtime-created literal classes. It already owns desktop clipping and below 768px local overflow-x:auto, overscroll-behavior-x:contain, touch-action:pan-x pan-y, and the approved 960px canvas. Nunito, system-ui, sans-serif is scoped to root/SVG text. Nunito is not bundled and remains a later approved font-asset/loading requirement for exact metrics.

Container Scroll imports useScroll, useTransform, and motion from motion/react; maps target progress to rotateX 20 to 0, scale, and header translation; applies perspective 1000px; and cleans up a resize listener. Its Tailwind, fixed demo heights, device shell, borders, shadows, and mobile scale are reference-only. Recreate only the restrained outer transform with the installed framer-motion 11.0.5 compatible exports. Do not install motion/react or any other dependency.

The attached WorkflowBoard source was inspected; verified lifecycle findings are incorporated into the main sections.

The future spike must prove actual SVG/layout/paint/main-thread/memory/GPU cost, outer transform compositing, Section/global-overflow containment, mobile focus/pan behavior, and tuned settlement/observer thresholds. It must not re-prove module API, CSS namespace, RAF cancellation, or destroy semantics already confirmed from source.
