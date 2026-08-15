# 08 — Scroll system audit

## Executive finding

The site uses the browser document as its primary vertical scroller. There is no custom smooth-scroll engine, transformed scroll root, scroll-snap declaration, or nested application-level vertical scroll container in the production source. `html, body` set `width:100vw` and only `overflow-x:hidden` in `app/global.module.css:17-30`; Remix renders `<ScrollRestoration />` after the app in `app/root.jsx:103-137`. **Classification: CONFIRMED BY LOCAL REPOSITORY.**

Local exceptions are horizontal code overflow (`app/components/code/code.module.css:24-29`) and clipped visual wrappers such as the Earth viewport (`app/routes/projects.smart-sparrow/earth.module.css:22-31`). **Classification: CONFIRMED BY LOCAL REPOSITORY.**

## Scroll topology

| Area | Scroller / trigger | Consumer and effect | Cleanup | Classification |
|---|---|---|---|---|
| Whole application | Native document/window scroll | All routes; normal document flow. Root `ScrollRestoration` delegates position history to Remix (`app/root.jsx:135,158`). | Framework-owned | CONFIRMED BY LOCAL REPOSITORY |
| Hash navigation | `useScrollToHash()` calls `Element.scrollIntoView()` with smooth or auto behavior (`app/hooks/useScrollToHash.js:5-41`). | Hero indicators (`app/routes/home/intro.jsx:30,48-50,114-140`), Navbar home anchors (`app/layouts/navbar/navbar.jsx:25,32-37,126-140`), and post content arrow (`app/layouts/post/post.jsx:17-34,82-97`). | The hook returns a listener/timer cleanup, but callers do not retain or call it. The listener self-removes only after a scroll event followed by 50 ms quiet. | CONFIRMED BY LOCAL REPOSITORY |
| Homepage reveal | Two `IntersectionObserver` instances in `Home` (`app/routes/home/home.jsx:49-92`). | One-time reveal for Intro, three projects, and Profile at threshold 0.1/root margin `0 0 -10% 0`; a second observer hides the hero indicator after Intro. | Both observers disconnect in effect cleanup. | CONFIRMED BY LOCAL REPOSITORY |
| Shared viewport gating | `useInViewport()` (`app/hooks/useInViewport.js:3-34`). | `Image`, `Model`, hero sphere, Earth, Armor, and Carousel gate loading, listeners, or render loops. | Observer disconnects; optional one-time unobserve. | CONFIRMED BY LOCAL REPOSITORY |
| Project background | `useParallax(0.6)` (`app/layouts/project/project.jsx:106-128`). | rAF-throttled scroll writes `--offset`; CSS applies vertical translate only when motion is allowed (`project.module.css:157-176`). | Removes listener and cancels last rAF (`app/hooks/useParallax.js:29-38`). | CONFIRMED BY LOCAL REPOSITORY |
| Article banner blur | `useParallax(0.004)` (`app/layouts/post/post.jsx:17-29`). | Writes clamped `--blurOpacity` to crossfade blurred banner layer. | Same shared-hook cleanup. | CONFIRMED BY LOCAL REPOSITORY |
| Floating-nav inversion | Direct `document` scroll listener in `Navbar` (`app/layouts/navbar/navbar.jsx:39-113`). | In light theme, measures overlap between fixed nav items and `[data-theme='dark'][data-invert]`, then sets per-item `data-theme`. | Removes listener and resets item themes. | CONFIRMED BY LOCAL REPOSITORY |
| Smart Sparrow Earth chapters | Direct window listener throttled to 100 ms, then rAF (`app/routes/projects.smart-sparrow/earth.jsx:482-651`). | Converts each 100vh section to camera interpolation, mesh state, GLTF clips, and label visibility over a sticky canvas. | Removes scroll listener and cancels the scene rAF in related effects (`:407-423,641-651`). | CONFIRMED BY LOCAL REPOSITORY |
| Pointer coupling, not scrolling | Model and hero sphere listen to global `mousemove`; Earth `OrbitControls` consumes pointer gestures; Carousel installs document pointer listeners while dragging. | Rotates WebGL content or changes carousel slide. | Individual cleanup exists, with gaps described below. | CONFIRMED BY LOCAL REPOSITORY |

## Hash scrolling and focus

`useScrollToHash` parses the string after `#`, calls `document.getElementById(id)`, invokes `scrollIntoView({behavior})`, then updates the URL after scroll settles (`app/hooks/useScrollToHash.js:11-38`). `useReducedMotion()` changes `smooth` to `auto`. **Classification: CONFIRMED BY LOCAL REPOSITORY.**

The helper never checks whether `targetElement` exists before `targetElement.scrollIntoView()` at line 16. A stale/incorrect hash therefore reaches a null dereference. **Classification: CONFIRMED BY LOCAL REPOSITORY.**

The returned cleanup at lines 33-36 is not consumed by the three call-site families. If `scrollIntoView` produces no scroll event—for example, the destination is already aligned—the self-removal path at lines 18-28 does not run, leaving a listener until a later scroll. This is a lifecycle risk, not proof of a user-visible failure. **Classification: STRONG INFERENCE.**

The URL update passes `{ scroll: false }` to `navigate()` at line 26. No repository code consumes that option; whether installed Remix interprets it as intended cannot be proven statically. Verify the actual history entry, restoration, and duplicate movement in the installed runtime rather than assuming equivalence to the framework's documented scroll-reset option. **Classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION.**

Targets such as Intro, ProjectSummary, Profile, and post content are `tabIndex={-1}`, but the helper scrolls only; it does not call `focus()`. Clicking the skip link can move browser focus to `main`, but homepage/nav hash clicks do not explicitly move focus to their destination. Keyboard and screen-reader reading position after those actions needs runtime testing. **Classification: CONFIRMED BY LOCAL REPOSITORY** for the absence of focus code; **Classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION** for browser/assistive-technology behavior.

## Intersection observers

### Homepage ownership

`Home` observes five refs, unobserves a section after its first intersection, and stores DOM elements in `visibleSections` (`app/routes/home/home.jsx:49-92`). That state controls project/model and Profile reveals (`:94-170`). **Classification: CONFIRMED BY LOCAL REPOSITORY.**

Because the effect depends on `visibleSections`, every newly revealed element disconnects and rebuilds both observers and re-observes the full ref list. Already-visible elements are guarded by an array check, but the lifecycle churn still occurs. Refactoring to a stable callback/set would be a later performance correction; no change is made in this audit. **Classification: STRONG INFERENCE.**

### Shared hook

`useInViewport(elementRef, unobserveOnIntersect, options = {}, shouldObserve = true)` owns the generic observer and disconnects it in cleanup (`app/hooks/useInViewport.js:3-34`). Consumers include `app/components/image/image.jsx:25-35`, `app/components/model/model.jsx:86-87`, `app/routes/home/displacement-sphere.jsx:45-46`, `app/routes/projects.smart-sparrow/earth.jsx:136`, `app/routes/projects.volkihar-knight/armor.jsx:54`, and `app/components/carousel/carousel.jsx:49-50`. **Classification: CONFIRMED BY LOCAL REPOSITORY.**

The default `{}` and several inline options objects are effect dependencies (`useInViewport.js:6,31`), so a consumer rerender can create a fresh options identity and rebuild the observer. Actual churn frequency depends on each render path and must be profiled, but the dependency shape is present. **Classification: STRONG INFERENCE.**

## Sticky and chapter systems

- Earth is the only custom scroll narrative. `.viewport` is `position:sticky; top:0; width:100vw; height:100vh`; `.sections` overlaps it with `margin-top:-100vh`, and every chapter is `height:100vh` (`app/routes/projects.smart-sparrow/earth.module.css:22-31,94-127`). The route lazily imports `Earth`/`EarthSection` in `app/routes/projects.smart-sparrow/smart-sparrow.jsx:68-71` and supplies seven sections at `:343-520`. **Classification: CONFIRMED BY LOCAL REPOSITORY.**
- The Articles index makes only the featured card sticky, reverting it to relative below its local 1190 px breakpoint (`app/routes/articles_._index/articles.module.css:1,127-139`). Articles are a future removal target, so this is not the recommended HaircutDone chapter foundation by default. **Classification: CONFIRMED BY LOCAL REPOSITORY.**
- Homepage ProjectSummary sections use `height:100vh`/`max-height:1080px` and become auto-height below 1040 px (`app/routes/home/project-summary.module.css:1-31`), but they are not sticky. Profile and Intro are normal-flow sections. **Classification: CONFIRMED BY LOCAL REPOSITORY.**

The future HaircutDone route requires deliberate chapter separation but explicitly excludes restoration of the original continuous photo strip. Existing `Project` sections and optional `ProjectBackground` parallax are safer generic primitives than copying Earth's tightly coupled camera/100vh chapter engine. This is an architectural recommendation based on specialization, not an implementation decision. **Classification: STRONG INFERENCE.**

## Parallax behavior

`useParallax` reads `window.scrollY`, multiplies it, clamps the result to ±one viewport height, and calls the consumer at most once per animation frame (`app/hooks/useParallax.js:4-38`). It installs no scroll listener when reduced motion is requested. **Classification: CONFIRMED BY LOCAL REPOSITORY.**

Both consumers pass inline callback functions (`ProjectBackground` at `app/layouts/project/project.jsx:109-112`; `Post` at `app/layouts/post/post.jsx:26-29`). Because `onChange` is an effect dependency, a parent rerender removes/re-adds the listener. The cleanup is correct, but callback memoization would reduce lifecycle churn if these systems are expanded. **Classification: STRONG INFERENCE.**

No scroll-linked CSS Animation Timeline, `ScrollTimeline`, GSAP, Lenis, locomotive-scroll, or equivalent custom scrolling dependency/import was found in production source or `package.json`. **Classification: CONFIRMED BY LOCAL REPOSITORY.**

## Earth scroll/pointer coupling

Earth calculates `currentScrollY` relative to the container, divides it into viewport-height chapters, interpolates the next camera position, and schedules the update with rAF (`app/routes/projects.smart-sparrow/earth.jsx:482-627`). A separate continuous rAF updates the mixer, controls, renderer, and DOM label positions while the canvas is in viewport (`:154-188,407-423`). **Classification: CONFIRMED BY LOCAL REPOSITORY.**

The `prevTarget` variable is declared inside `handleScroll` at line 489, so it starts undefined for every listener invocation. The `prevTarget !== currentTarget` guard at lines 607-613 therefore cannot persist chapter identity between scroll events; mesh/animation/label updates can rerun on each throttled call. **Classification: CONFIRMED BY LOCAL REPOSITORY.**

At width ≤1040 px, `controls.current.enabled` is set to false (`earth.jsx:324-328`); the effect has no branch that explicitly sets it back to true after resizing wider. Coarse-pointer CSS also sets the canvas to `pointer-events:none` (`earth.module.css:33-41`). Scroll-driven chapters still operate. **Classification: CONFIRMED BY LOCAL REPOSITORY.**

Reduced motion assigns camera coordinates directly and skips GLTF animation, but the continuous render loop remains and opacity/chunk spring calls are not consistently bypassed (`earth.jsx:154-188,491-568,617-627`). **Classification: CONFIRMED BY LOCAL REPOSITORY.**

## Route transitions and restoration

Internal Link/Button/Navbar paths, the Contact `<Form>`, and the Articles featured link request `unstable_viewTransition` (`app/components/link/link.jsx:14-42`, `app/components/button/button.jsx:13-27`, `app/layouts/navbar/navbar.jsx:142-190`, `app/routes/contact/contact.jsx:107-113`, `app/routes/articles_._index/articles.jsx:52-63`). During Remix navigation, root also fades `main` and shows a delayed progress bar (`app/root.jsx:80-135`, `app/root.module.css:1-10`, `app/components/progress/progress.jsx:5-58`). `<ScrollRestoration />` has no custom key or storage policy. **Classification: CONFIRMED BY LOCAL REPOSITORY.**

No app-level code coordinates view-transition completion, focus movement, hash scrolling, or scroll restoration. Whether back/forward restores before/after the opacity transition, whether a Contact return preserves the previous home position, and whether hash navigation creates duplicate jumps require real-browser history testing. **Classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION.**

Safest later matrix: direct load, internal link, same-page hash, cross-route-then-hash, browser Back/Forward, reload, keyboard activation, reduced motion on/off, and slow navigation. Record `window.scrollY`, active element, URL/hash, and view-transition support in Chrome, Safari, and Firefox. Human review is required for perceived continuity. **Classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION.**

## Mobile scrolling and viewport height

`useWindowSize` measures `window.innerHeight`, with an iOS-specific temporary `100vh` ruler, and removes its resize listener (`app/hooks/useWindowSize.js:3-60`). Navbar, ProjectSummary, hero sphere, and Earth use the hook. **Classification: CONFIRMED BY LOCAL REPOSITORY.**

CSS still uses legacy `100vh` for ProjectSummary and every Earth chapter (`project-summary.module.css:1-4`; `earth.module.css:22-30,100-103`). The JS ruler therefore improves calculations but does not replace those CSS heights with `dvh`/`svh`. Address-bar expansion, safe areas, and orientation behavior cannot be guaranteed from source. **Classification: STRONG INFERENCE.**

The mobile Navbar overlay is fixed/full-viewport but contains no body-scroll lock or overscroll containment in `app/layouts/navbar/navbar.jsx:175-201` or `navbar.module.css:147-234`. Background page scroll while the menu is open is therefore possible depending on gesture/browser behavior. **Classification: STRONG INFERENCE.**

Carousel sets `touch-action:none` on its image container (`app/components/carousel/carousel.module.css:12-22`), so vertical page panning that begins over the image can be suppressed. Earth disables pointer input on coarse pointers; ordinary chapter scrolling remains. **Classification: CONFIRMED BY LOCAL REPOSITORY.**

Static search found no `overscroll-behavior`, scroll snap, or safe-area scroll policy. Browser defaults apply. Bounce/chaining on iOS and Android remain runtime questions. **Classification: CONFIRMED BY LOCAL REPOSITORY** for absence; **Classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION** for observed platform behavior.

## Listener and cleanup review

| Owner | Positive cleanup evidence | Remaining risk | Classification |
|---|---|---|---|
| `useParallax` | Removes window scroll and cancels rAF (`useParallax.js:34-37`). | Inline callback can cause reinstall; `cancelAnimationFrame(null)` is harmless in browsers but should be verified in target support. | CONFIRMED BY LOCAL REPOSITORY / STRONG INFERENCE |
| `Home` observers | Both disconnect (`home.jsx:88-91`). | Recreated after each `visibleSections` update. | CONFIRMED BY LOCAL REPOSITORY / STRONG INFERENCE |
| `useInViewport` | Disconnects (`useInViewport.js:30`). | Options identity can rebuild observers. | CONFIRMED BY LOCAL REPOSITORY / STRONG INFERENCE |
| Navbar inversion | Removes document listener and resets theme (`navbar.jsx:109-112`). | Handler is unthrottled, queries/measures every scroll in light theme (`:58-90`). | CONFIRMED BY LOCAL REPOSITORY |
| `useScrollToHash` | Defines removal/timer clearing and self-removal (`useScrollToHash.js:18-36`). | Returned cleanup is ignored; missing/no-op target path can retain listener or throw. | CONFIRMED BY LOCAL REPOSITORY / STRONG INFERENCE |
| Earth | Removes scroll/control/dev click listeners and cancels rAF (`earth.jsx:231-263,407-423,449-480,641-651`). | `requestAnimationFrame(update)` at line 627 is not stored/cancelled; an already queued update can run after state changes. Continuous scene loop remains expensive. | CONFIRMED BY LOCAL REPOSITORY / STRONG INFERENCE |
| Carousel drag | Removes document `pointermove`/`pointerup` on pointerup (`app/components/carousel/carousel.jsx:314-335`). | No `pointercancel`, pointer capture, or unmount cleanup for a drag interrupted before pointerup. | CONFIRMED BY LOCAL REPOSITORY |

## Performance risks

1. Navbar inversion performs selector queries, `offsetTop`/`offsetHeight` reads, and dataset writes in an unthrottled scroll listener. This can force layout and compete with WebGL/section effects. **Classification: STRONG INFERENCE.** Evidence: `navbar.jsx:58-90`.
2. Earth combines a 100 ms scroll listener, queued update rAF, continuous render rAF, GLTF mixer, OrbitControls, springs, and per-label style writes. Mid-range mobile performance is unknown. **Classification: CONFIRMED BY LOCAL REPOSITORY** for work performed; **Classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION** for impact.
3. Multiple viewport observers may coexist on the homepage, and current dependency identities can rebuild them. **Classification: STRONG INFERENCE.**
4. `overflow-x:hidden` on `html, body`, Home, post, articles, and Earth sections prevents visual horizontal escape but can clip off-canvas focus outlines/content rather than expose layout defects. **Classification: STRONG INFERENCE.** Evidence includes `app/global.module.css:17-30`, `app/routes/home/home.module.css:1-3`, and `app/layouts/post/post.module.css:39-43`.
5. No passive option is specified for direct scroll listeners. Browsers can still optimize non-canceling scroll handlers differently by target; actual main-thread cost requires profiling. **Classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION.**

## Preservation guidance (future target only)

- Preserve native document scrolling, Remix restoration, the shared reduced-motion-aware `useParallax`, and observer-gated model/media loading. **Classification: STRONG INFERENCE** based on their broad existing integration.
- Treat Earth as a specialized reference, not the default SYSTEM or HaircutDone chapter engine. SYSTEM node/path/tracer/mobile scroll behavior is explicitly unresolved and must not be inferred from Earth. **Classification: CONFIRMED BY LOCAL REPOSITORY** for current specialization and absence of a SYSTEM implementation.
- Before adapting route or hash behavior, establish one focus/scroll contract covering Home anchors, Contact, HaircutDone, Back/Forward, and reduced motion. This is a later verification gate; no scroll code was changed in this audit. **Classification: STRONG INFERENCE.**

## Completion-pass delta — observer and offscreen authority

- **CONFIRMED BY LOCAL REPOSITORY:** `useInViewport` disconnects its observer on cleanup and can unobserve after first intersection (`app/hooks/useInViewport.js:3-34`). Home disconnects its two observers (`app/routes/home/home.jsx:58-92`). Hero and Earth stop their render loops offscreen (`displacement-sphere.jsx:157-183`; `earth.jsx:154-188`); Model and Armor use viewport state only for mouse listeners, not renderer disposal (`app/components/model/model.jsx:282-303`; `app/routes/projects.volkihar-knight/armor.jsx:156-181`).
- **STRONG INFERENCE:** because Home’s observer effect depends on `visibleSections`, it recreates both observers after each newly revealed section. Its cleanup prevents accumulation, but the churn should be measured rather than presumed harmless (`app/routes/home/home.jsx:58-92`).
