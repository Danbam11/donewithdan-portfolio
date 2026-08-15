# 10 — Responsive and accessibility audit

## Scope and confidence

This document reports static repository evidence. No browser, screen reader, automated accessibility scanner, keyboard walkthrough, color-contrast calculation, device lab, build, or Lighthouse run was performed because the audit brief permits inspection only. Semantics and declared styles are source-confirmed; computed layout, contrast, announcements, reading order, focus movement, and device performance require later runtime/human verification.

## Responsive foundation

### Canonical breakpoints

`app/global.module.css:1-10` declares the shared custom media queries. `app/utils/style.js:2-10` exposes the same width values to JavaScript (except height, pointer, and motion queries). **Classification: CONFIRMED BY LOCAL REPOSITORY.**

| Token | Query | Main purpose | Evidence classification |
|---|---:|---|---|
| `--mediaDesktop` | max-width 2080 px | Large-desktop typography/layout reduction | CONFIRMED BY LOCAL REPOSITORY |
| `--mediaLaptop` | max-width 1680 px | Widths, spacing, typography, project/post layout | CONFIRMED BY LOCAL REPOSITORY |
| `--mediaTablet` | max-width 1040 px | Single-column projects, device sizing, section padding, disabled Earth controls | CONFIRMED BY LOCAL REPOSITORY |
| `--mediaMobile` | max-width 696 px | Mobile navigation, typography, padding, carousel arrows, content layouts | CONFIRMED BY LOCAL REPOSITORY |
| `--mediaMobileLS` | max-height 696 px | Short-viewport/mobile-navigation behavior | CONFIRMED BY LOCAL REPOSITORY |
| `--mediaMobileS` | max-width 400 px | Small-phone typography/spacing | CONFIRMED BY LOCAL REPOSITORY |
| `--mediaTouch` | pointer coarse | Hero indicator switch and Earth input suppression | CONFIRMED BY LOCAL REPOSITORY |
| `--mediaNoTouch` | pointer fine | Desktop hero indicator behavior | CONFIRMED BY LOCAL REPOSITORY |
| `--mediaUseMotion` / `--mediaReduceMotion` | motion preference | Spatial-motion gating/fallbacks | CONFIRMED BY LOCAL REPOSITORY |

`ThemeProvider` converts token groups into CSS variables at programmatic width breakpoints (`app/components/theme-provider/theme-provider.jsx:82-95`), using values defined in `theme.js:58-107`. Base headings range from 140 px to 24 px and progressively reduce through desktop/laptop/tablet/mobile/small-mobile token sets; `spaceOuter` reduces 64→48→24→16 px (`theme.js:23-49,58-107`). **Classification: CONFIRMED BY LOCAL REPOSITORY.**

Additional component-local thresholds exist: 1200 px in project header layout (`app/layouts/project/project.module.css:217-233`), 1190 px for Articles (`app/routes/articles_._index/articles.module.css:1`), 1096 px for post layout (`app/layouts/post/post.module.css:25-35`), 820×420 short landscape in Intro/Navbar/Profile/Section styles, and 360 px height for mobile nav link text (`navbar.module.css:117-123,197-203`). **Classification: CONFIRMED BY LOCAL REPOSITORY.**

The local thresholds are intentional-looking but not represented in `utils/style.js`; a future cross-component change can therefore drift if it assumes only four JavaScript widths. Consolidation should wait until each layout is visually regression-tested. **Classification: STRONG INFERENCE.**

## Desktop/mobile differences

| System | Desktop / fine pointer | Tablet/mobile/coarse pointer | Evidence and classification |
|---|---|---|---|
| Floating navigation | Fixed vertical links/socials, separate theme toggle; links use vertical writing mode (`app/layouts/navbar/navbar.jsx:142-174,202-223`; `navbar.module.css:1-145`). | Desktop nav hides at width ≤696 or height ≤696; a full-viewport overlay, mobile links/socials/theme toggle, and menu button appear (`navbar.jsx:22-24,155-201`; CSS `:147-234`). | CONFIRMED BY LOCAL REPOSITORY |
| Hero | Large text and fixed side scroll indicator; fine pointer gets the desktop indicator. | Typography/width/padding shrink at 2080/1680/696/400 and short landscape; coarse pointer gets bottom chevron (`app/routes/home/intro.module.css:1-68,215-336`). | CONFIRMED BY LOCAL REPOSITORY |
| Homepage projects | Two-column, 100vh/max-1080 section; details/preview order depends on `alternate` (`project-summary.jsx:177-209`; CSS `:1-87`). | At ≤1040 sections become auto-height/single-column and JS puts preview before details; laptop/phone sizes and decoration positions reduce (`project-summary.jsx:37-44,192-208`; CSS `:16-31,88-190`). | CONFIRMED BY LOCAL REPOSITORY |
| Profile | Wider content/portrait composition. | Max width and spacing/padding collapse at 1040/696/short landscape (`app/routes/home/profile.module.css:1-55,79-142`). | CONFIRMED BY LOCAL REPOSITORY |
| 3D models | Global mousemove can drive model/sphere at any viewport width when emitted; Earth exposes OrbitControls above its width cutoff. | There is no touch/gyro listener or pointer-type gate for model/sphere; sphere object position changes at 696/1040. Earth controls are disabled at ≤1040 and its canvas ignores coarse pointer (`model.jsx:282-303`; `displacement-sphere.jsx:112-155`; `earth.jsx:324-328`; `earth.module.css:33-41`). | CONFIRMED BY LOCAL REPOSITORY |
| Carousel | Pointer drag plus visible previous/next arrows and dots. | Arrows hide at ≤696; swipe/dots remain, and image region uses `touch-action:none` (`app/components/carousel/carousel.module.css:12-22,83-101`). | CONFIRMED BY LOCAL REPOSITORY |
| Project/post/article layout | Multi-column project metadata/content; article featured card sticky. | Project/post content collapses at their width thresholds; featured article becomes relative/single-column at 1190 (`project.module.css`, `post.module.css`, `articles.module.css:127-139`). | CONFIRMED BY LOCAL REPOSITORY |

`useWindowSize()` initializes its ref with a function returning `{w, h}` and passes that function as the `useState` lazy initializer (`app/hooks/useWindowSize.js:3-4,44`). The initial state therefore has `w`/`h`, while consumers read `width`/`height`, until the mount effect writes the latter shape. Navbar and ProjectSummary consequently take their desktop branch on server/first client render, then may switch to mobile order/menu after measurement (`navbar.jsx:22-24`; `project-summary.jsx:37-44`). The initial markup remains hydration-consistent, but a post-hydration layout switch/shift is possible. **Classification: STRONG INFERENCE.**

CSS uses `100vh` for ProjectSummary and Earth chapters even though `useWindowSize` has an iOS `100vh` ruler (`useWindowSize.js:6-35`; `project-summary.module.css:1-4`; `earth.module.css:22-30,100-103`). Address-bar and orientation behavior needs iOS/Android verification; source does not use `dvh`/`svh`. **Classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION.**

## Touch behavior and target size

- The reset applies `touch-action:manipulation` to all buttons and links (`app/reset.module.css:20-31`). The base Button is 56 px high (`app/components/button/button.module.css:2-12`); navbar icon links are 48×48 px (`navbar.module.css:126-140`). **Classification: CONFIRMED BY LOCAL REPOSITORY.**
- Mobile nav links span the full viewport width with 24/32 px token padding (`navbar.module.css:177-203`), providing large targets. **Classification: CONFIRMED BY LOCAL REPOSITORY.**
- Carousel dot buttons use a 10 px visual dot plus 16 px padding on each side, approximately 42×42 px (`carousel.module.css:108-131`). Whether target-spacing exceptions and final computed sizes meet the selected WCAG/product target must be measured. **Classification: STRONG INFERENCE.**
- Carousel's `touch-action:none` can block vertical page panning when a gesture starts over the image. Document pointer listeners handle `pointerup` but not `pointercancel` or captured pointers (`carousel.jsx:261-338`). **Classification: CONFIRMED BY LOCAL REPOSITORY.**
- Homepage Model and sphere bind only mousemove; there is no touch, gyroscope, device-orientation, width, or pointer-type branch (`app/components/model/model.jsx:282-303`; `app/routes/home/displacement-sphere.jsx:137-155`). **Classification: CONFIRMED BY LOCAL REPOSITORY.** A static touch outcome is likely where the browser emits no mousemove, but its adequacy and cross-browser behavior are **Classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION.**
- The mobile menu has no body scroll lock or overscroll containment. Background scroll while open depends on browser/gesture behavior and requires touch-device testing. **Classification: STRONG INFERENCE.**

## Keyboard navigation

Native links/buttons are used for primary navigation, CTAs, theme/menu toggles, video playback, Carousel controls, and segmented options. Internal custom Link/Button components retain native elements (`app/components/link/link.jsx:14-42`; `app/components/button/button.jsx:13-58`). **Classification: CONFIRMED BY LOCAL REPOSITORY.**

### Positive evidence

- Root provides a “Skip to main content” anchor; `main#main-content` is focusable with `tabIndex={-1}` (`app/root.jsx:121-133`), and the focused skip link receives a prominent fixed style (`app/root.module.css:12-42`). **Classification: CONFIRMED BY LOCAL REPOSITORY.**
- Navbar marks the active link with `aria-current="page"` and mobile links close the menu on activation (`app/layouts/navbar/navbar.jsx:115-140,158-200`). **Classification: CONFIRMED BY LOCAL REPOSITORY.**
- `NavToggle` is a native button with label “Menu” and `aria-expanded` (`app/layouts/navbar/nav-toggle.jsx:5-24`). Theme toggle is a labeled native button (`theme-toggle.jsx:6-41`). **Classification: CONFIRMED BY LOCAL REPOSITORY.**
- Carousel provides previous/next buttons, dot buttons with labels and pressed state, a live-region current-image role, and arrow-key handling that can receive bubbled events while a child control is focused (`app/components/carousel/carousel.jsx:340-410`). **Classification: CONFIRMED BY LOCAL REPOSITORY.**
- `SegmentedControl` exposes a labeled `radiogroup`, radio buttons, roving option `tabIndex`, and arrow-key focus/selection (`app/components/segmented-control/segmented-control.jsx:16-121`). **Classification: CONFIRMED BY LOCAL REPOSITORY.**

### Gaps and verification

- Opening mobile navigation does not focus the first item; there is no focus trap, Escape handler, focus return, `aria-controls`, dialog/modal semantic, inert background, or body scroll lock in `navbar.jsx:142-203`/`nav-toggle.jsx:5-24`. Closed overlay content is unmounted, so it is not tabbable while closed. **Classification: CONFIRMED BY LOCAL REPOSITORY.**
- Resizing to desktop does not explicitly close `menuOpen`; resizing back can restore the previously open overlay state. Actual focus/display behavior needs a responsive keyboard walkthrough. **Classification: STRONG INFERENCE.**
- Route navigation does not focus `main` or the new route heading. `main` is focusable, but no location-change focus effect was found in `app/root.jsx:80-140`. Focus after an activating link is removed/replaced is browser-dependent. **Classification: CONFIRMED BY LOCAL REPOSITORY** for absence; **Classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION** for resulting focus.
- `useScrollToHash` scrolls but does not focus its destination (`app/hooks/useScrollToHash.js:11-38`). Sections are `tabIndex={-1}`, so an explicit future policy is possible, but not implemented. **Classification: CONFIRMED BY LOCAL REPOSITORY.**
- `SegmentedControl` gives both the group and selected radio `tabIndex=0`, producing two potential tab stops; arrow handlers do not call `preventDefault()`, so Up/Down may also scroll the page (`segmented-control.jsx:28-40,70-75,111-119`). **Classification: STRONG INFERENCE.**
- Carousel's outer key handler is on a non-focusable `div` (`carousel.jsx:340-353`); arrow behavior depends on focus being on a child control and event bubbling, not focus on the image surface itself. **Classification: CONFIRMED BY LOCAL REPOSITORY.**

## Focus visibility

The global rule provides a 4 px `var(--text)` outline with 4 px offset and removes it only for `:focus:not(:focus-visible)` (`app/global.module.css:42-49`). Buttons/links generally inherit this strong keyboard focus indicator. **Classification: CONFIRMED BY LOCAL REPOSITORY.**

`Section` always removes its outline on focus (`app/components/section/section.module.css:2-8`), which hides programmatic focus location for homepage/hash targets. `html,body` also remove their own focus outline (`global.module.css:17-30`). **Classification: CONFIRMED BY LOCAL REPOSITORY.**

Inputs explicitly set `outline:none` and replace it with a 2 px underline plus label change (`app/components/input/input.module.css:21-93`). Under reduced motion the underline appears without transition, but its contrast/visibility in light/dark/error/autofill states has not been measured. **Classification: CONFIRMED BY LOCAL REPOSITORY** for styling; **Classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION** for adequacy.

Because several page wrappers use `overflow-x:hidden`, offset focus rings near viewport edges may be clipped. Verify menu, social, Carousel, and form controls at 320 px and 200%/400% zoom. **Classification: STRONG INFERENCE.**

## Landmarks and semantic structure

- Root uses `<header>` for the floating Navbar, nested `<nav>` elements, `<main id="main-content">`, and route-level `<footer>` (`app/root.jsx:103-137`; `app/layouts/navbar/navbar.jsx:142-203`; `app/components/footer/footer.jsx:7-13`). **Classification: CONFIRMED BY LOCAL REPOSITORY.**
- Homepage Intro/ProjectSummary/Profile render semantic sections with `aria-labelledby` and focusable targets (`intro.jsx:53-63`; `project-summary.jsx:177-209`; `profile.jsx:38-99`). **Classification: CONFIRMED BY LOCAL REPOSITORY.**
- Project routes use `<article>`, an `h1` header, and labeled sections through `app/layouts/project/project.jsx:15-104`. Posts use `<article>`, header `h1`, and content section (`app/layouts/post/post.jsx:38-110`). **Classification: CONFIRMED BY LOCAL REPOSITORY.**
- Contact's outer `Section` uses its default `div`, but the form has a semantic `h1` and native form controls (`app/routes/contact/contact.jsx:105-199`). **Classification: CONFIRMED BY LOCAL REPOSITORY.**

## Heading order

`Heading` separates visual `level` from semantic `as`; without `as`, level 1–5 maps to `h1`–`h5` (`app/components/heading/heading.jsx:5-29`). **Classification: CONFIRMED BY LOCAL REPOSITORY.**

Homepage order is: name `h1`, visually hidden complete role/disciplines in an `h2`, each project title as `h2`, then Profile `Heading level={3}` which defaults to `h3` (`intro.jsx:71-112`; `project-summary.jsx:80-88`; `profile.jsx:18-22`). Because Profile is a sibling top-level section, assistive technology can interpret its `h3` as subordinate to the preceding project `h2`. **Classification: CONFIRMED BY LOCAL REPOSITORY** for markup; **Classification: STRONG INFERENCE** for outline ambiguity.

Contact initially has `h1` “Say hello,” matching the locked visible copy with no period (`contact.jsx:115-123`). On success the form/h1 unmounts and the replacement title is an `h3` (`:200-210`), leaving no route-level `h1`. **Classification: CONFIRMED BY LOCAL REPOSITORY.**

Post Markdown maps source H1 to another `h1` and H2 to `h2` (`app/layouts/post/post-markdown.jsx:19-44`). Current MDX files begin their content sections with `##`, so the discovered articles do not add another H1. Future MDX authoring could, so heading lint/content review should remain a gate. **Classification: CONFIRMED BY LOCAL REPOSITORY.**

## Form labels, validation, and status

`Input` creates a real `<label htmlFor>`, applies `aria-labelledby`, and, when `error` is present, associates an error through `aria-describedby` and `role="alert"` (`app/components/input/input.jsx:9-94`). `useFormInput` suppresses the native validation popup, records `validationMessage`, and passes `error`/handlers through Contact's spread props (`app/hooks/useFormInput.js:3-38`; `contact.jsx:136-159`). **Classification: CONFIRMED BY LOCAL REPOSITORY.**

Contact includes required email/message fields and a CSS-hidden honeypot Name field (`contact.jsx:129-159`; `contact.module.css:140-142`). The submit button disables and exposes loading text while submitting (`contact.jsx:184-196`). **Classification: CONFIRMED BY LOCAL REPOSITORY.**

Gaps:

- `Input` does not set `aria-invalid` when it has an error (`input.jsx:59-73`). **Classification: CONFIRMED BY LOCAL REPOSITORY.**
- Server action errors are concatenated in a global visual container at `contact.jsx:160-183`; they are not passed back to the individual `Input.error` props and the global container has no `role="alert"`, `aria-live`, or focus transfer. **Classification: CONFIRMED BY LOCAL REPOSITORY.**
- Success uses `aria-live="polite"`, but the live region and `h3` replace the form without explicit focus movement (`contact.jsx:200-231`). Announcement/focus behavior must be tested with NVDA, JAWS, VoiceOver, and TalkBack. **Classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION.**

## Images, canvas, and video alternatives

### Positive evidence

- Shared `Image` forwards alt to the full image/video and makes placeholders empty-alt/presentational (`app/components/image/image.jsx:144-207`). **Classification: CONFIRMED BY LOCAL REPOSITORY.**
- Profile portrait has descriptive alt (`app/routes/home/profile.jsx:81-90`). Project content images generally supply descriptive, context-specific alts, for example Smart Sparrow `smart-sparrow.jsx:121-337` and Volkihar `volkihar-knight.jsx:89-205`. **Classification: CONFIRMED BY LOCAL REPOSITORY.**
- Device `Model` and Armor wrap canvases in `role="img"` with consumer-provided labels (`app/components/model/model.jsx:327-353`; `armor.jsx:205-228`). Hero canvas is deliberately `aria-hidden` (`displacement-sphere.jsx:185-195`). Carousel hides its canvas and exposes a live-region `role="img"` labeled with current alt (`carousel.jsx:353-380`). **Classification: CONFIRMED BY LOCAL REPOSITORY.**
- DecoderText keeps final text in `VisuallyHidden` and marks changing glyphs `aria-hidden` (`app/components/decoder-text/decoder-text.jsx:94-99`). Hero additionally exposes the complete discipline list as one hidden label (`intro.jsx:75-79`). **Classification: CONFIRMED BY LOCAL REPOSITORY.**

### Gaps

- `VolkiharLogo` accepts no props and returns a bare SVG (`app/routes/projects.volkihar-knight/volkihar-logo.jsx:1-20`), so the `role="img"` and `aria-label` supplied by its consumer at `volkihar-knight.jsx:142-146` are discarded. **Classification: CONFIRMED BY LOCAL REPOSITORY.**
- Error-page video calls `Image` without `alt` and with `noPauseButton` (`app/layouts/error/error.jsx:126-135`), yielding a looping video's `aria-label={undefined}` and removing its Pause control (`image.jsx:153-172`). Reduced motion prevents autoplay, but non-reduced users cannot pause it through this component. **Classification: CONFIRMED BY LOCAL REPOSITORY.**
- Earth canvas has no role/label/hidden state, while projected labels are placed in `aria-live="polite"` and toggled `aria-hidden` as scroll chapters change (`earth.jsx:571-587,661-674`). The narrative text remains in chapter content, but live-region chatter/duplicate information and canvas exposure require screen-reader testing. **Classification: STRONG INFERENCE.**
- Decorative katakana SVGs in `ProjectSummary` and Profile do not explicitly set `aria-hidden` (`project-summary.jsx:50-62`; `profile.jsx:91-94`). Browser accessibility-tree treatment of untitled inline SVG varies; mark them decorative explicitly in a later implementation. **Classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION.**

## Motion preferences

The repository has both CSS custom media and Framer `useReducedMotion`. Confirmed positive fallbacks include: final DecoderText, static hero sphere, no device/Armor pointer motion, skipped laptop/phone entrance, no parallax listener, video pause/no autoplay, text Loader, and non-spatial CSS variants. Evidence spans `global.module.css:7-8`, `decoder-text.jsx:47-99`, `displacement-sphere.jsx:137-183`, `model.jsx:282-303,430-435,498-517`, `useParallax.js:1-38`, `image.jsx:76-128,153-166`, and `loader.jsx:7-34`. **Classification: CONFIRMED BY LOCAL REPOSITORY.**

Coverage is incomplete: hero copy still cycles; route main/progress animate; device texture crossfade/model CSS fade remain; Earth still loops and partly springs; Carousel still springs crossfade; several opacity animations continue. Detailed evidence is in `07-animation-inventory.md`. **Classification: CONFIRMED BY LOCAL REPOSITORY.**

Whether remaining opacity/color feedback is acceptable under the product's accessibility target is a human decision. Test OS reduction before deciding; do not simply remove all state feedback. **Classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION.**

## Contrast and zoom concerns

Theme tokens use translucent mixes: dark body text 80% and light text 60%; light-theme body 75% and light text 55% (`app/components/theme-provider/theme.js:109-132`). Navbar links use 80% text, social icons use `textLight`, labels can reduce to 54%, and Earth occluded labels use opacity 0.2 (`navbar.module.css:59-75,126-139`; `input.module.css:73-92`; `earth.module.css:57-79`). **Classification: CONFIRMED BY LOCAL REPOSITORY.**

Static token values are insufficient for a reliable contrast conclusion because actual backgrounds include theme inversions, translucent/backdrop layers, images, gradients, and canvas content. Run computed color contrast checks in both themes and every inverted/image-backed state, including focus, disabled, error, placeholder, mobile overlay, oversized decorative text, and lower-contrast behind-object word portions. Human review is required for canvas/image text. **Classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION.**

Global fixed widths/padding and large H0 text need testing at 200% and 400% zoom. `overflow-x:hidden` may conceal overflow rather than allow reflow; the locked decorative words are particularly high risk. **Classification: STRONG INFERENCE.**

## Screen-reader and loading concerns

- The document has `lang="en"`, a skip link, landmarks, native controls, and hidden equivalents for decoded hero text (`app/root.jsx:103-137`). **Classification: CONFIRMED BY LOCAL REPOSITORY.**
- Animated Loader has no text/status in normal-motion mode; only reduced-motion mode returns visible `Loading...` (`app/components/loader/loader.jsx:7-34`). Root Progress is a visual div with no progress/status semantic (`app/components/progress/progress.jsx:49-57`). Whether silent loading is acceptable depends on wait duration and surrounding state. **Classification: CONFIRMED BY LOCAL REPOSITORY** for markup; **Classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION** for impact.
- Theme toggle's label is always “Toggle theme”; it exposes neither current nor destination theme through accessible name/state (`app/layouts/navbar/theme-toggle.jsx:6-41`). **Classification: CONFIRMED BY LOCAL REPOSITORY.**
- External navbar social links open new tabs with `noopener noreferrer` but their accessible labels do not announce the new-window behavior (`navbar.jsx:207-223`). Whether to announce it is a content/accessibility policy decision. **Classification: CONFIRMED BY LOCAL REPOSITORY.**
- Gotham faces use `font-display:block`, while IPA Gothic uses `swap` (`app/components/theme-provider/theme-provider.jsx:118-173`). Text can be temporarily invisible during Gotham loading, affecting perceived loading and possibly layout timing. Actual font-load behavior requires throttled testing. **Classification: STRONG INFERENCE.**

## Mobile performance risks

1. Mobile nav applies `backdrop-filter:blur(24px) saturate(120%)` over a full viewport (`navbar.module.css:147-175`). Composite cost on low-end devices is unknown. **Classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION.**
2. Model/Armor/Carousel render at pixel ratio 2; Earth continuously renders and writes label positions; hero sphere has dense geometry. Lazy/viewport gating is positive, but final concurrent sections require device profiling. **Classification: CONFIRMED BY LOCAL REPOSITORY** for configuration; **Classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION** for cost.
3. Large MP4/JPG/PNG assets, responsive source selection via JavaScript, block-displayed fonts, and no WebP/AVIF assets increase constrained-network risk; detailed sizes are in `09-3d-and-media-audit.md`. **Classification: STRONG INFERENCE.**
4. `100vh` sections, post-hydration JS order switching, and fixed nav/mobile overlay can react to browser chrome/orientation changes. Test iOS Safari and Android Chrome portrait/landscape, keyboard open, and split-screen. **Classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION.**

## Future DonewithDan constraints (not implementation)

- Preserve the separate `/contact` experience, its existing DecoderText, and the visible `Say hello` heading. Both final Contact nav and Profile action should resolve to that same destination; current Profile already links `/contact` (`app/routes/home/profile.jsx:58-64`). **Classification: CONFIRMED BY LOCAL REPOSITORY.**
- Adapt navigation labels to Work/About/Contact only after adding modal-menu focus, Escape, focus return, background isolation, route-change focus, and scroll behavior verification. Articles removal must not remove shared focus/route primitives. **Classification: STRONG INFERENCE.**
- Preserve semantic alternatives when replacing hero copy, portrait, laptop screen, and decorative words. Future SYSTEM/GAPS/CASE STUDY/PROFILE depth layers should expose each word once to assistive technology and hide duplicate visual layers. **Classification: STRONG INFERENCE.**
- No current component implements a SYSTEM workflow or its mobile fallback. **Classification: CONFIRMED BY LOCAL REPOSITORY.** The future node order, connector behavior, tracer timing, glow, accessible fallback, and mobile interaction are **Classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION** pending the separate specification; this audit does not invent them.

## Required later verification matrix

| Test | Minimum coverage | Why unresolved | Classification |
|---|---|---|---|
| Keyboard | Full tab/shift-tab, Enter/Space, Escape, arrows; menu open/close; hash and route changes; form errors/success | Focus is not programmatically coordinated across menu/hash/routes. | UNRESOLVED / NEEDS RUNTIME VERIFICATION |
| Screen reader | NVDA+Firefox/Chrome, JAWS+Chrome, VoiceOver macOS/iOS, TalkBack Android | Live regions, canvas roles, decoded text, validation, loading, and heading outline vary by AT/browser. | UNRESOLVED / NEEDS RUNTIME VERIFICATION |
| Reflow/zoom | 320 CSS px, 200%, 400%, text spacing overrides, short landscape | Fixed nav, `100vh`, H0/decorative words, hidden overflow, and local breakpoints need computed layout. | UNRESOLVED / NEEDS RUNTIME VERIFICATION |
| Contrast | Both themes; inverted nav; image/canvas overlays; all states | Translucency/compositing prevents reliable static calculation. | UNRESOLVED / NEEDS RUNTIME VERIFICATION |
| Motion | Reduced motion on/off; theme change; route transitions; hero cycle; 3D; video; Carousel | Coverage is mixed across CSS, Framer, WebGL, and native view transitions. | UNRESOLVED / NEEDS RUNTIME VERIFICATION |
| Touch/device | iOS Safari and Android Chrome; coarse pointer; orientation; virtual keyboard; slow device/network | Gesture arbitration, viewport units, backdrop/WebGL cost, and post-hydration layout are device-dependent. | UNRESOLVED / NEEDS RUNTIME VERIFICATION |
| WebGL/media failure | WebGL disabled/lost; broken GLB/DRACO/image/video; offline/slow | Canvas owners have no common fallback/error contract. | UNRESOLVED / NEEDS RUNTIME VERIFICATION |

## Completion-pass delta — input, motion, and CSS cost boundaries

- **CONFIRMED BY LOCAL REPOSITORY:** Hero, Model, and Armor use throttled (100 ms) `window` `mousemove` only while intersecting and motion is not reduced, with effect cleanup; none has touch/pointer/gyro input (`app/routes/home/displacement-sphere.jsx:137-155`; `app/components/model/model.jsx:282-303`; `app/routes/projects.volkihar-knight/armor.jsx:156-181`). Carousel attaches document pointer listeners only during drag and removes them on pointer-up; no separate unmount cleanup covers an active drag (`app/components/carousel/carousel.jsx:314-337`).
- **CONFIRMED BY LOCAL REPOSITORY:** reduced motion stops Hero mouse/continuous RAF and laptop entrance/mouse input, but does not make motion site-wide: the Hero changing-discipline interval remains unconditional, Earth renders while visible, and Carousel keeps its scheduler (`app/routes/home/intro.jsx:22-40`; `earth.jsx:154-188`; `carousel.jsx:227-242`). Hero DPR remains 1 at all widths; laptop has no touch interaction.
- **CONFIRMED BY LOCAL REPOSITORY:** CSS compositing candidates include mobile Navbar backdrop filtering, Image reveal shadow/transform promotion, Project background transform promotion, and Carousel shadow transitions (`app/layouts/navbar/navbar.module.css:147-166`; `app/components/image/image.module.css:1-36`; `app/layouts/project/project.module.css:138-190`; `app/components/carousel/carousel.module.css:60-140`). No application CSS `background-attachment: fixed` or `mix-blend-mode` was found. Actual paint cost is **UNRESOLVED / NEEDS RUNTIME VERIFICATION**.
