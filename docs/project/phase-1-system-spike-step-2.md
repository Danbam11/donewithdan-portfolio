# Phase 1 SYSTEM spike — Step 2

## Scope

This isolated Storybook spike adds a scroll-driven browser-style showcase treatment around the existing SYSTEM WorkflowBoard host. It does not add SYSTEM to the homepage or alter the portable WorkflowBoard runtime.

## Exact files changed

- `app/routes/home/system/system.jsx`
- `app/routes/home/system/system.module.css`
- `app/routes/home/system/system.stories.jsx`
- `docs/project/phase-1-system-spike-step-2.md`

The portable files under `app/routes/home/system/haircutdone/` are unchanged.

## Container Scroll adaptation and showcase shell

The supplied reference maps target-bound native scroll progress to an outer `rotateX` and `scale` transform beneath a perspective parent. This spike adapts that motion idea with the repository's installed `framer-motion@11.0.5` APIs: `useScroll`, `useTransform`, `useSpring`, `useMotionValueEvent`, and `motion`.

Deliberately not copied: the `motion/react` import, Tailwind, fixed demo dimensions, demo copy, reference styling, and mobile scale treatment. No global scroll controller or manual window-scroll listener was added. The requested spike-only browser shell is an intentional scoped deviation from the earlier no-device-shell direction: it is a dark presentation frame with restrained chrome, not a copied brand or production homepage treatment.

## Outer motion

The scroll source remains `useScroll({ target: presentationStageRef, offset: ['start 90%', 'end 18%'] })`. The desktop sticky stage was compressed from `180vh` to `125vh`. Native page scroll now drives the approved entrance with `0.00–0.36` for approach/parallax, `0.36–0.42` for the final front-facing settle, then immediately releases the anchor to ordinary page flow at `0.42`.

| State | Outer transform |
| --- | --- |
| Starting | `perspective: 1000px`; `rotateX: 18deg`; `scale: 0.90`; `y: 88px` |
| Settled | `rotateX: 0deg`; `scale: 1`; `y: 0px` |

The text block retains a separate upward parallax transform (`y: 0px → -62px → -72px → -128px`). The board retains its approved `18deg`, `0.90`, and `88px` starting state; only its scroll pacing has been compressed (`18deg → 3deg → 0deg`, `0.90 → 0.985 → 1`, `88px → 16px → 0px`). Each transform passes through the unchanged `useSpring` configuration of `{ stiffness: 110, damping: 26, mass: 0.8 }`. The WorkflowBoard host remains atomic inside the browser shell; no WorkflowBoard node, path, signal, or timing is scroll-scrubbed.

The former board-bound `['start 67%', 'start 20%']` range and `0.92` threshold were replaced because they could not provide a readable settled hold before upward exit. The former showcase pacing settled at `0.58` in a `180vh` sticky stage. The one-way near-settled threshold is now `scrollYProgress >= 0.42`, matching the compressed final-settle point; its settled class releases `position: sticky` to `position: relative`, eliminating the former dead-scroll hold.

## Settlement and ambient handoff

The near-settled threshold is `scrollYProgress >= 0.42`. Crossing it marks a ref-backed React state milestone exactly once for the mounted section. It never flips back to false when the user scrolls upward, avoiding ambient restart churn while the outer visual transform can still respond naturally to scroll.

The browser shell is a desaturated smoked forest-charcoal: outer frame `#121816`, chrome `#17201D`, border `#28342F`, and side/inner frame `#141A18`. A subtle neutral inner edge plus low-contrast forest-charcoal outer separation keep the shell silhouette distinct from the near-black page without a glow. Its fake browser buttons are muted `#5B6E66`, `#6A7C74`, and `#788B82`; the address line remains `#42554E`, leaving WorkflowBoard's internal cyan as the active accent.

The Perspective Entrance story enables automatic host visibility gating. Its `IntersectionObserver` marks the host eligible at 15% visibility and stops ambient work only at genuine 0% visibility. Ambient starts only when both visibility eligibility and the one-time settlement milestone are true; its diagnostic Start ambient control remains disabled before settlement. On a genuine offscreen exit it calls `stopAmbient()`; a later visibility-qualified re-entry calls `startAmbient()` without replaying settlement. The existing `ambientRunningRef` guard prevents repeated controller requests.

## Reduced motion and mobile

With `prefers-reduced-motion: reduce`, no outer motion style is applied and the entrance is marked settled immediately. The existing portable runtime remains responsible for its own reduced-motion suppression; this spike does not force ambient work on.

At widths below 768px, the sticky stage and outer transform are removed immediately and settlement is immediate. The browser shell remains a compact static frame; the portable 960px local horizontal workflow viewport, touch panning, and native vertical document scroll are left unchanged.

## Step 1 regression boundary

The original `Lifecycle Mount` story remains available. Its opt-in diagnostic visibility gate, hydration-gated one-time initializer, `autoStart: false`, controller `startAmbient()` / `stopAmbient()` / `destroy()` ownership, cleanup, local overflow behavior, and portable source are retained. The added perspective behavior is activated only by the new `Perspective Entrance` story prop.

## Validation

| Command | Result |
| --- | --- |
| `git diff --check` | Passed with no output after the showcase upgrade. |
| `npm run build` | Passed outside the sandbox after sandboxed esbuild was denied required ancestor-directory access. Existing `three-stdlib` eval, chunk-size, and article dynamic-import warnings remain. |
| `npm run build:storybook` | Passed outside the sandbox after the same esbuild ancestor-directory restriction. Existing Vite CJS deprecation, `three-stdlib` / `telejson` eval, and chunk-size warnings remain. |

No dependencies were installed or changed.

## Remaining human verification

- Observe the desktop perspective entrance and settling quality in the Storybook Perspective Entrance story.
- Confirm ambient does not begin before settlement and does begin after settlement while visible.
- Confirm full offscreen exit stops ambient and re-entry resumes it without replaying entrance eligibility.
- Confirm mobile local horizontal panning and natural vertical scrolling.
- Confirm reduced motion presents immediately settled with no outer perspective motion.

Static/build checks do not claim subjective motion quality.
