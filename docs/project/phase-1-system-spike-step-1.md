# Phase 1 SYSTEM spike — Step 1

## Scope

This isolated Storybook spike proves WorkflowBoard mounting and lifecycle ownership only. It does not add SYSTEM to the homepage and does not implement the final SYSTEM layout, decorative word, or Container Scroll entrance.

## Portable source

The following files were copied byte-for-byte from `haircutdone-workflow-codex.zip`, portable root `src/haircutdone/`, into `app/routes/home/system/haircutdone/`:

- `haircutdone-workflow.js`
- `haircutdone-workflow.css`
- `haircutdone-workflow.svg`

SHA-256 comparisons against the ZIP returned `True` for each file. There were no source-path adaptations: the three files remain colocated, so the runtime's existing relative SVG URL continues to resolve.

## React host architecture

`SystemWorkflowSpike` is a Storybook-only, route-local React adapter. It statically imports the portable initializer and stylesheet, renders an empty dedicated host through a direct ref, and waits for the repository `useHydrated` hook before calling:

```js
createHaircutDoneWorkflow(hostElement, { autoStart: false })
```

The controller is ref-owned. Initialization is guarded while pending, cleanup destroys the retained controller, and a late asynchronous resolution is destroyed immediately if the host no longer exists. The microtask cleanup preserves the in-flight instance through React development effect replay while still destroying on a genuine unmount. Diagnostic controls test `startAmbient()`, `stopAmbient()`, and explicit destroy/reinitialize.

The adapter also owns two disposable observers:

- `ResizeObserver` reports the host width for containment testing and disconnects on unmount.
- An opt-in `IntersectionObserver` starts at 15% visibility and stops at 0% visibility. It is off initially so the `autoStart: false` stopped state can be tested; it disconnects on cleanup.

The controller is never initialized by selector and no internal WorkflowBoard topology, timing, SVG, CSS, or mobile strategy was changed.

## Containment and accessibility structure

The host has a 1248px maximum sizing layer; the portable CSS preserves proportional desktop sizing. Its unchanged below-768px local viewport retains the supplied 960px workflow width, `overflow-x: auto`, `overflow-y: hidden`, `overscroll-behavior-x: contain`, and `touch-action: pan-x pan-y`. No global scrolling, homepage clipping, or scroll controller changed.

The wrapper has a labelled semantic section and plain diagnostic controls. It uses Framer Motion's already-installed `useReducedMotion`: the wrapper stops ambient work and disables its start control under reduced motion, leaving the portable component's static reduced-motion behavior intact.

Nunito is still absent from the repository's approved bundled fonts. The portable component therefore uses its supplied scoped fallback metrics (`Nunito, system-ui, sans-serif`); exact typography comparison remains pending a separately approved font integration.

## Validation

| Command | Result |
| --- | --- |
| `npm exec eslint app/routes/home/system/system.jsx app/routes/home/system/system.stories.jsx` | Passed with no output. |
| `git diff --check` | Passed with no output. |
| `npm run build` | Passed outside the sandbox after the sandboxed esbuild process was denied parent-path access. Production Vite/SSR build completed; existing `three-stdlib` eval and chunk-size warnings remain. |
| `npm run build:storybook` | Passed after the final opt-in `IntersectionObserver` addition. It generated the isolated story with the portable SVG and SYSTEM spike bundle; existing Vite/Storybook eval, telemetry, and chunk-size warnings remain. |
| SHA-256 ZIP/runtime comparison | All three portable files match exactly. |

No dependencies were installed or changed.

## Final validation-policy note

An earlier `npm exec eslint` invocation occurred despite the requested validation policy. It did not change `package.json` or `package-lock.json`, install any dependency, or create any visible tracked-working-tree dependency change. The final validation used only `npm run build:storybook`, `git diff --check`, and `git status --short`.

## Human runtime verification

The following results were verified by a human in the isolated Storybook spike. They are runtime evidence, distinct from the static/build validation above.

### Desktop lifecycle — PASS

- One intact WorkflowBoard rendered at the 1248px host with proportional composition, no topology reflow, and no clipping.
- Initial state was ambient stopped. Start Ambient started traveling cyan workflow signals; Stop Ambient removed them while retaining the board.
- Destroy and reinitialize returned exactly one intact board, stopped without automatically restarting ambient work. No duplicate instance was visible.

### Visibility gating — PASS

The Storybook story includes explicitly labelled **SPIKE-ONLY** before/after vertical scroll space. This is test-harness infrastructure, not final SYSTEM layout.

With visibility gating enabled, the same board instance was verified as:

```text
visible          -> ambient running
fully offscreen  -> ambient stopped automatically
visible again    -> ambient resumed automatically
```

No Start/Stop control was used during the offscreen/re-entry test.

### Mobile interaction — PASS

At a `390 × 844` CSS-pixel viewport, with a 358px observed host width:

- The wide topology remained intact rather than stacking or reflowing.
- A horizontal gesture in the cream WorkflowBoard panned only its local workflow.
- The Storybook/page shell did not slide horizontally.
- A vertical gesture within the board continued to scroll the page vertically.
- No mobile scroll trap was observed.

### Mobile node glow — EXPECTED SOURCE BEHAVIOR

The stronger desktop node glow is hover/focus feedback. The approved portable source uses its original pressed-state behavior for touch, and pressed-state CSS hides the hover-equivalent node glow. Ambient cyan signals are independent from node hover glow. Changing mobile touch behavior to imitate desktop hover glow would alter the approved portable interaction behavior, so no correction is required.

### Reduced motion — PASS

With Chrome DevTools emulating `prefers-reduced-motion: reduce`, the board remained visible and usable. Start Ambient did not produce traveling cyan ambient signals; the static presentation and existing featured/static cyan styling remained intact, with no continuous ambient workflow motion observed.

The spike diagnostic status can still say `Ambient running` because it represents the host/controller request, rather than the portable runtime's reduced-motion suppression. This is spike-only diagnostic wording and is not evidence that ambient animation is actually running.

## Remaining later-phase work

Step 1 now satisfies SSR/build safety; hydration-gated and initialize-once behavior; start/stop and destroy/reinitialize lifecycle; desktop containment; host-owned offscreen visibility control; mobile local horizontal scrolling alongside natural vertical scrolling; reduced-motion behavior; and no new production dependency.

It does not approve or implement final SYSTEM composition, Container Scroll/perspective entrance, decorative SYSTEM depth treatment, final Nunito typography metrics, homepage integration, or final performance budgets alongside the full homepage/WebGL environment. Those remain later implementation/runtime work.

## Decision

SYSTEM SPIKE STEP 1 COMPLETE — READY FOR GPT REVIEW AND COMMIT.
