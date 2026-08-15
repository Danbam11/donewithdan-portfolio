# 03 — Homepage section map

## Scope and evidence convention

This document maps the original homepage exactly as authored, then evaluates each original section against the approved future order:

1. Hero
2. Continuous logo-only tool strip
3. SYSTEM / workflow showcase
4. GAPS / three stacking cards
5. HaircutDone 3D laptop gateway
6. Profile / About
7. Footer

The floating navigation remains outside that sequence. Nothing in this document is an implemented redesign.

Evidence classifications used are exactly:

- **CONFIRMED BY LOCAL REPOSITORY**
- **STRONG INFERENCE**
- **UNRESOLVED / NEEDS RUNTIME VERIFICATION**

## Original render order

`Home` returns one wrapper containing the following siblings at `app/routes/home/home.jsx:94-172`:

| Original order | Section/owner | Anchor | Current content | Recommended future treatment | Evidence classification |
| --- | --- | --- | --- | --- | --- |
| 1 | `Intro` | `#intro` | Hamish name, “Designer” plus rotating disciplines, WebGL sphere | **adapt** into the approved DonewithDan hero while preserving the block-cover language and compatible visual system | CONFIRMED BY LOCAL REPOSITORY |
| 2 | `ProjectSummary` instance 01 | `#project-1` | Smart Sparrow laptop gateway | **adapt** into the HaircutDone laptop gateway, then move to approved position 5 | CONFIRMED BY LOCAL REPOSITORY |
| 3 | `ProjectSummary` instance 02 | `#project-2` | External Gamestack two-phone gateway | **replace** with the SYSTEM workflow shell; retain only proven shared section/reveal primitives | CONFIRMED BY LOCAL REPOSITORY |
| 4 | `ProjectSummary` instance 03 | `#project-3` | Slice laptop gateway | **replace** with the GAPS three-card composition; retain only proven shared section/reveal primitives | STRONG INFERENCE |
| 5 | `Profile` | `#details` | About copy, Contact CTA, portrait, katakana decoration | **adapt** for Daniel and the future PROFILE section | CONFIRMED BY LOCAL REPOSITORY |
| 6 | `Footer` | none | Dynamic year, Hamish identity, `/humans.txt` credit | **adapt** for DonewithDan branding | CONFIRMED BY LOCAL REPOSITORY |

`references/section-inventory.md:6-22` explicitly says to keep the hero structure, adapt project 01 for HaircutDone, replace project 02 with an interactive workflow board, replace project 03 with outcomes/process, adapt Profile for Daniel, and adapt the footer. Mapping project 03 specifically to the later-approved GAPS cards is a **STRONG INFERENCE** because the tracked reference predates that exact label.

The continuous tool strip has no original homepage sibling and must be inserted after the hero. This is **CONFIRMED BY LOCAL REPOSITORY**: `Home` has only the six siblings above, and no logo-strip/marquee implementation or matching asset set was found under `app/`.

## Page-level controller and section reveal

Before the per-section detail, one homepage controller affects sections 1–5:

- `Home` owns refs for `intro`, three project sections, and `details`, plus `visibleSections` and `scrollIndicatorHidden` state (`app/routes/home/home.jsx:49-56`).
- A one-shot `IntersectionObserver` observes all five refs, unobserves each intersecting section, and appends its DOM node to `visibleSections`; options are `rootMargin: '0px 0px -10% 0px'` and `threshold: 0.1` (`home.jsx:58-73,82-92`).
- A second observer watches the intro and hides the fixed scroll indicator when the intro is no longer intersecting (`home.jsx:75-90`).
- Each project and Profile also treats focus within the section as visible, so keyboard focus can reveal content even before scroll visibility (`project-summary.jsx:34,177-209`; `profile.jsx:38-55`).

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

The behavior if `IntersectionObserver` is unavailable, and the exact reveal timing on low-powered devices, are **UNRESOLVED / NEEDS RUNTIME VERIFICATION**. Safest later verification is a browser test with observer support disabled/polyfilled and keyboard focus moved directly to section actions; human review is required for perceived timing.

## Global navigation boundary

`Navbar` is not rendered by `Home`. Root places it before `<main><Outlet /></main>` (`app/root.jsx:120-133`), so it remains a floating global surface while homepage sections scroll beneath it. Desktop and mobile variants are both produced by the same `Navbar` component (`app/layouts/navbar/navbar.jsx:142-203`) and the same `navLinks` data (`nav-data.js:3-20`).

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.** This ownership already satisfies the future constraint that navigation remain separate from scrolling sections; its labels/content still need later adaptation.

## 1. Intro / original hero

### Ownership and hierarchy

```text
Home
└── Intro (Section as <section>, #intro, aria-labelledby, tabIndex=-1)
    └── Transition (keyed by theme, 3000 ms)
        ├── lazy DisplacementSphere (hydrated client only)
        ├── <header>
        │   ├── <h1> → DecoderText(config.name)
        │   └── Heading as <h2>
        │       ├── visually hidden combined label
        │       ├── static config.role + animated line
        │       └── one Transition per rotating discipline
        ├── desktop scroll indicator link
        └── touch/mobile scroll indicator link
```

Definitions and call sites: `Home` imports/renders `Intro` at `app/routes/home/home.jsx:15,94-100`; `Intro` is defined at `app/routes/home/intro.jsx:20-146`; `Section` supplies the semantic wrapper at lines 53-62.

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

### Content source

- Eyebrow/name: `config.name` (`app/config.json:2`) rendered through `DecoderText` (`intro.jsx:71-74`).
- Static display line: `config.role` (`app/config.json:3`) at `intro.jsx:75-87`.
- Rotating display lines: `config.disciplines` (`app/config.json:4`) selected by `disciplineIndex` (`intro.jsx:21-28`) and advanced every 5000 ms with `useInterval` (`intro.jsx:33-40`; `app/hooks/useInterval.js:3-19`).
- Screen-reader label combines role and all disciplines (`intro.jsx:25-27,75-78`) while visual words are `aria-hidden` (`intro.jsx:79-110`).

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

The approved future copy is not present. A content-only edit to `config.json` would not be sufficient by itself: the visual component automatically adds a `+` before rotating values (`app/routes/home/intro.module.css:136-140`) and constructs a role-plus-disciplines accessible label. The future “I GET” plus sentence lines therefore requires an intentional component/content adaptation while preserving the animation mechanics.

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

### Styles and block-cover animation

Primary styles are `app/routes/home/intro.module.css` with shared `Section`, `Heading`, theme tokens, and global keyframes.

The cyan/blue cover is implemented as follows:

1. Each `.word` is `position: relative`, isolated, starts with transparent text color, and receives timing through the inline `--delay` custom property (`intro.module.css:107-120`; `intro.jsx:80-104`; `app/utils/style.js:49-72`).
2. `.word::after` is an absolutely positioned `var(--accent)` rectangle, initially scale-X zero with left origin (`intro.module.css:121-134`).
3. On `data-status='entering'`, text receives `introTextReveal`, and—only when `prefers-reduced-motion: no-preference`—the cover receives the shared global `reveal` animation (`intro.module.css:89-105,142-150`; `app/global.module.css:61-80`).
4. The global `reveal` scales the block left-to-right to full width, switches transform origin at 51%, then collapses it toward the right. `introTextReveal` makes the letters visible after the cover crosses them.
5. On `entered`, the text is visible and the cover is collapsed at the right; on `exiting`, the outgoing discipline becomes absolute and fades while the incoming word takes its place (`intro.module.css:152-168`).
6. The outer `Transition` is keyed by theme, and a theme change resets the discipline index (`intro.jsx:24,42-46,63-64`), replaying the entrance language with current theme tokens.

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

Reduced motion suppresses the moving cover, but `introTextReveal` is assigned outside the no-motion media condition and still runs its color animation. Whether this meets the future motion policy is **UNRESOLVED / NEEDS RUNTIME VERIFICATION**; later inspect computed animation under reduced motion and obtain accessibility review before changing it.

### WebGL asset and behavior

`DisplacementSphere` is lazy-loaded from `intro.jsx:16-18` and only mounted after `useHydrated` reports client hydration (`intro.jsx:31,66-70`; `app/hooks/useHydrated.js:3-13`). It imports raw vertex/fragment shaders (`displacement-sphere.jsx:22-23`), replaces a `MeshPhongMaterial` shader in `onBeforeCompile` (`lines 70-80`), creates a high-segment sphere (`lines 82-88`), and renders to an alpha canvas (`lines 51-68,185-197`). Theme changes replace directional/ambient lighting (`lines 96-110`).

Pointer springs use throttled `mousemove` only when in view and motion is allowed (`lines 137-155`); the requestAnimationFrame loop likewise pauses out of view or for reduced motion and emits one static frame (`lines 157-183`). Resize changes renderer/camera and sphere position at mobile/tablet breakpoints (`lines 112-135`). Related style `displacement-sphere.module.css:1-13` fades the canvas in over three seconds.

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

### Desktop and mobile behavior

- Desktop: full viewport hero (`intro.module.css:1-7`), text centered with responsive max widths (`lines 9-33`), mouse-shaped fixed scroll indicator on fine pointers (`lines 232-283`), and pointer-reactive sphere.
- Mobile/touch: text offsets and sizes tighten (`lines 23-33,48-67`); the desktop indicator is hidden for coarse pointers (`lines 276-278`) and a bottom chevron appears only for coarse pointers (`lines 285-336`); the sphere shifts to `x=14,y=10` at `<=696` and `x=18,y=14` at `<=1040` (`displacement-sphere.jsx:125-134`). Touch has no equivalent tilt listener because the scene listens only to `mousemove`.
- Tracked baselines visually corroborate the layout in `references/screenshots/desktop/01-original-full-page-desktop.png`, `references/screenshots/mobile/02-mobile-hero.png`, and `references/screenshots/mobile/01-original-full-page-mobile-390px.png`.

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

### Future treatment

**adapt.** Preserve the `Transition` status contract, accent block-cover keyframes, accessible hidden label pattern, responsive hero shell, reduced-motion branch, hydration guard, and—if retained after performance validation—the sphere infrastructure. Replace the original identity and discipline model with the locked DonewithDan copy. Do not recreate the cover with an unrelated library while this source mechanism remains viable.

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY** for reusable mechanics and `references/section-inventory.md:6-7` for the keep/adapt decision. Whether the sphere remains visually appropriate is **UNRESOLVED / NEEDS RUNTIME VERIFICATION** and needs Daniel's visual approval plus device testing.

## Shared `ProjectSummary` anatomy (original sections 2–4)

All three current project sections instantiate one generic component with different props (`app/routes/home/home.jsx:101-165`). Its hierarchy is:

```text
ProjectSummary
└── Section as <section>, aria-labelledby, tabIndex=-1
    └── content
        └── Transition(in = intersection visibility OR focus)
            ├── details
            │   ├── Divider + numeric index
            │   ├── Heading as <h2>
            │   ├── description
            │   └── Button(buttonLink)
            └── preview
                ├── decorative katakana SVG
                ├── Loader until model load
                └── lazy Model (hydrated + visible only)
```

`ProjectSummary` is defined at `app/routes/home/project-summary.jsx:21-213`. Text/index/button are assembled by `renderDetails` (`lines 66-99`); laptop/phone preview branches are assembled by `renderPreview` (`lines 101-175`); semantic section and responsive order are at lines 177-212.

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

Shared styles are `project-summary.module.css`: full-viewport/max-height desktop sections (`lines 1-33`), two-column/alternate grids (`lines 35-63`), oversized models (`lines 78-140`), katakana positioning (`lines 151-190`), and staged index/title/description/button reveals (`lines 192-277`). Shared component dependencies are `Button`, `Divider`, `Heading`, `Section`, `Text`, `ThemeProvider`, `Transition`, `Loader`, `Model`, `useWindowSize`, and `useHydrated` (`project-summary.jsx:1-19`).

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

### Model loading and motion shared by all three

- `Model` is lazy and does not mount until the route has hydrated and the section is visible (`project-summary.jsx:17-19,38,111-129,141-168`).
- `deviceModels` maps laptop to `macbook-pro.glb` with `LaptopOpen` and phone to `iphone-11.glb` with `SpringUp` (`app/components/model/device-models.js:1-23`).
- The renderer uses a transparent, non-antialiased high-performance WebGL canvas at pixel ratio 2 (`app/components/model/model.jsx:91-104`), perspective camera/lights, and blurred depth render targets for shadows (`lines 106-223,225-280`).
- A throttled mouse listener drives spring rotations when in view and not reduced-motion (`model.jsx:282-303`); resize updates renderer/camera (`lines 305-325`). There is no touch/pointer-tilt equivalent.
- `Device` loads the placeholder texture and then the GLTF sequentially because both loader calls are individually awaited while the `Promise.all` input is constructed; it binds the chosen responsive image to a mesh named `Screen`, then fades from placeholder to full texture (`model.jsx:371-427`, especially `392-395`). Laptop lids spring open (`lines 463-488`); reduced motion sets the final pose and renders statically (`lines 430-434,498-516`).
- Cleanup disposes render targets, lights, scene resources, renderer, and spring subscriptions (`model.jsx:213-221`); shared loader configuration and disposal helpers live in `app/utils/three.js:1-83`.

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

## 2. Project 01 — Smart Sparrow laptop

### Render order, content, assets, and hierarchy

This is the first `ProjectSummary` after `Intro` (`home.jsx:101-120`), with `id="project-1"`, index `1`, title “Designing the future of education,” supporting description, CTA “View project,” and internal destination `/projects/smart-sparrow`. It passes a single `laptop` model texture and alt text.

Asset chain:

- `app/assets/spr-lesson-builder-dark.jpg`
- `app/assets/spr-lesson-builder-dark-large.jpg`
- `app/assets/spr-lesson-builder-dark-placeholder.jpg`
- `app/assets/macbook-pro.glb` through `deviceModels.laptop`

Imports are `home.jsx:10-12`; props are `home.jsx:101-119`; responsive texture sizes are composed in `project-summary.jsx:43-44,119-127`.

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

### Desktop behavior

Details render left and laptop preview right because the instance is not `alternate` and `isMobile` is false (`project-summary.jsx:195-200`). The model is deliberately oversized and shifted right (`project-summary.module.css:88-111`); the katakana word sits behind/around the device at the lower right (`lines 151-176`). Text and model enter when the section first intersects or receives focus.

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

### Mobile/tablet behavior

At JavaScript width `<=1040`, `isMobile` becomes true and preview is rendered before details (`project-summary.jsx:37-44,201-205`). CSS also collapses the grid to one column at the tablet breakpoint (`project-summary.module.css:50-62`), makes section height automatic (`lines 16-24`), and reduces/recenters laptop width (`lines 105-110`). The model has no touch tilt but retains load/static or laptop-open entrance according to motion preference.

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

### Future treatment

**adapt** into the HaircutDone 3D laptop gateway and move it after SYSTEM and GAPS. `references/section-inventory.md:9-10` explicitly assigns project 01 to HaircutDone. Preserve the generic section semantics, responsive ordering, hydration/loading gates, laptop model pipeline, screen-texture source selection, focus-triggered reveal, reduced-motion final pose, and internal `Button` path behavior. Replace all Smart Sparrow text/assets/route metadata.

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.** The final HaircutDone screen image and destination slug remain **UNRESOLVED / NEEDS RUNTIME VERIFICATION**; frozen opening/case-study copy, structure, and shared-CTA destination requirement do not. Both “View the full system →” and “Explore HaircutDone →” must later use one identical route value.

## 3. Project 02 — Gamestack phones

### Render order, content, assets, and hierarchy

This is the second `ProjectSummary` (`home.jsx:121-145`), with `id="project-2"`, `alternate`, index `2`, title “Video game progress tracking,” CTA “View website,” and external destination `https://gamestack.hamishw.com`. The phone preview contains two instances with different textures/positions (`project-summary.jsx:134-170`).

Asset chain:

- `app/assets/gamestack-login.jpg`, `gamestack-login-large.jpg`, `gamestack-login-placeholder.jpg`
- `app/assets/gamestack-list.jpg`, `gamestack-list-large.jpg`, `gamestack-list-placeholder.jpg`
- `app/assets/iphone-11.glb` through `deviceModels.phone`

Imports are `home.jsx:1-6`; props are `home.jsx:121-144`; phone screen sizes and positions are `project-summary.jsx:43,149-166`.

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

### Desktop behavior

Because `alternate` is true, the CSS grid changes to preview-left/details-right (`project-summary.module.css:35-48`) and JSX emits preview before details (`project-summary.jsx:201-205`). Two phone GLTFs spring upward with stagger based on model index (`app/components/model/model.jsx:436-460`). The katakana word is positioned across the preview near the lower device region (`project-summary.module.css:178-189`).

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

### Mobile/tablet behavior

Preview remains before details because all `<=1040` layouts use the same branch. The grid becomes one column, phone preview width is bounded, and mobile removes the tablet max-height (`project-summary.module.css:54-62,113-139`). Touch does not drive rotation; reduced motion skips spring entrance and uses final positions.

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

### Future treatment

**replace** with the SYSTEM workflow shell. The tracked decision says “Replace with Interactive Workflow Board” (`references/section-inventory.md:12-14`), and the approved target places SYSTEM in the corresponding early showcase position after the new tool strip. Reuse only generic foundations that fit: `Section`, semantic heading/text primitives, intersection/focus visibility, theme tokens, and reduced-motion conventions. The phone GLTFs, Gamestack content/assets, external CTA, and project-decoration assumptions do not describe the future workflow.

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY** for the replacement decision and current dependencies; mapping “Interactive Workflow Board” to the locked SYSTEM shell is a **STRONG INFERENCE**.

No workflow container, nodes, SVG connectors, tracer system, automation logic, glow behavior, or mobile workflow fallback exists in this homepage code. Do not infer final values from the phone layout. Exact nodes, labels, paths, timing, glow, and mobile logic remain **UNRESOLVED / NEEDS RUNTIME VERIFICATION** pending the separate workflow specification. Future structure must reserve the required hooks without inventing their content.

## 4. Project 03 — Slice laptop

### Render order, content, assets, and hierarchy

This is the third `ProjectSummary` (`home.jsx:146-165`), with `id="project-3"`, index `3`, title “Biomedical image collaboration,” CTA “View project,” internal destination `/projects/slice`, and one laptop texture.

Asset chain:

- `app/assets/slice-app.jpg`
- `app/assets/slice-app-large.jpg`
- `app/assets/slice-app-placeholder.jpg`
- `app/assets/macbook-pro.glb` through `deviceModels.laptop`

Imports are `home.jsx:7-9`; props are `home.jsx:146-164`; generic laptop assembly is `project-summary.jsx:101-133`.

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

### Desktop behavior

Like project 01, details render left and laptop right. It shares the exact model, katakana, text-staging, pointer spring, loader, and internal route-link behavior documented above. Only content and texture props differ.

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

### Mobile/tablet behavior

At `<=1040`, preview renders first and details second; CSS collapses the section to one column and reduces the oversized laptop. The full mobile baseline confirms this order in `references/screenshots/mobile/05-mobile-project-03.png` and `references/screenshots/mobile/01-original-full-page-mobile-390px.png`.

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

### Future treatment

**replace** with the GAPS three-card section. The tracked inventory says project 03 should be replaced with “project outcomes or process” (`references/section-inventory.md:15-16`); the approved target now supplies GAPS as the remaining section at this point in the sequence. The exact mapping is therefore a **STRONG INFERENCE**, not a repository-authored decision.

Generic `Section`, heading/text, intersection/focus visibility, responsive padding, and reduced-motion patterns are reusable. The laptop, Slice texture, route CTA, numeric-project layout, and katakana-project content are not a three-card stack. No stacking-card component, card content, overlap timeline, or touch fallback exists. Those details are **UNRESOLVED / NEEDS RUNTIME VERIFICATION** and must be specified/approved before implementation.

## 5. Profile / About

### Ownership and hierarchy

```text
Home
└── Profile (Section as <section>, #details, aria-labelledby, tabIndex=-1)
    └── Transition(in = intersection visibility OR focus)
        └── two-column content
            ├── column 1
            │   ├── ProfileText
            │   │   ├── Heading → DecoderText("Hi there")
            │   │   └── two paragraphs with internal/external Links
            │   └── Button → /contact
            └── column 2
                ├── Divider + “About me” tag
                └── portrait Image + foreground katakana SVG
```

`Home` imports/renders `Profile` at `home.jsx:16,166-170`; `ProfileText` and `Profile` are defined in `app/routes/home/profile.jsx:18-101`.

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

### Content, styles, animations, and assets

- Content is inline JSX, not `config.json`: original biography and links are `profile.jsx:18-35`; CTA is `profile.jsx:58-66`; tag is `profile.jsx:69-79`.
- Portrait assets are `app/assets/profile.jpg`, `profile-large.jpg`, and `profile-placeholder.jpg`, imported at lines 1-3 and passed to shared `Image` at lines 80-90 with explicit width/height, responsive sizes, and alt text.
- `Image reveal` uses an accent cover driven by the shared global `reveal` keyframe (`app/components/image/image.module.css:14-39`) and delays the actual image opacity (`lines 49-68`); `Image` intersection-gates full resolution (`app/components/image/image.jsx:22-52,175-207`).
- “Hi there” uses the reusable katakana decoder (`profile.jsx:20-22`; `app/components/decoder-text/decoder-text.jsx:47-100`). Text/button/tag/SVG opacity and transform staging are in `profile.module.css:59-142`.
- The decorative symbol is `katakana-profile` from `app/routes/home/katakana.svg:6-8`, referenced at `profile.jsx:91-93`.

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

### Desktop behavior

The section is at least one viewport high and centers a `1fr / 50%` two-column grid (`profile.module.css:1-10,37-47`). Biography/CTA occupy the left column; the tag and portrait occupy the right. The portrait word is positioned to the right/bottom and explicitly placed at `z-index: var(--zIndex3)` (`profile.module.css:119-132`), so it is a foreground overlay rather than a behind-object mask.

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

### Mobile/tablet behavior

At `<=1040`, the grid becomes one column with a 600px max width, text/CTA first and tag/portrait second (`profile.module.css:37-47,80-90`). Outer spacing changes at tablet/mobile/mobile-landscape breakpoints (`lines 11-34`). The responsive image requests full viewport width at `<=696` (`profile.jsx:88`). The tracked mobile baseline shows this stacked order (`references/screenshots/mobile/06-mobile-about-profile.png`).

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

### Future treatment

**adapt.** Use the frozen Profile copy (heading “About me”, opening “Hi, I’m Dan.”, supplied system/support paragraphs, and “Send me a message →”), while replacing the portrait, its final alt intent, external URLs, tag, and decorative glyph with approved inputs. Preserve semantic section ownership, focus-trigger reveal, `DecoderText`, responsive image pipeline, and the separate `/contact` CTA. `references/section-inventory.md:18-19` explicitly requires adaptation and a contact CTA; the current button already routes to `/contact`.

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.** Profile copy is frozen. Portrait, final alt intent, external URLs, footer-credit details, and the exact rendered `PROFILE` mask geometry remain **UNRESOLVED / NEEDS RUNTIME VERIFICATION**.

## 6. Footer

### Ownership, content, styles, and behavior

`Home` renders `Footer` last at `home.jsx:171`. The shared component (`app/components/footer/footer.jsx:1-18`) outputs semantic `<footer>`, the runtime year, `config.name`, and a `/humans.txt` “Crafted by yours truly” link. `footer.module.css:1-24` centers/wraps the text with responsive token-based padding; no section-local motion or media assets are involved.

Desktop and mobile use the same component and flex-wrap behavior. Tracked baselines show it last in `references/screenshots/sections/06-footer-copyright.png` and `references/screenshots/mobile/07-mobile-footer-copyright.png`.

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

### Future treatment

**adapt** for DonewithDan identity and approved footer content. `references/section-inventory.md:21-22` records that decision. Preserve the semantic `<footer>` and reusable shared-component placement; coordinate identity changes with `app/config.json`, `/humans.txt`, public metadata, and other Footer consumers so project/contact/article pages do not retain inconsistent branding.

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.** The final copyright/credit wording and whether `/humans.txt` remains are **UNRESOLVED / NEEDS RUNTIME VERIFICATION** and need Daniel's content approval.

## Exact decorative depth technique

### Project word: current partial occlusion

The current project decoration is not a mask, duplicated text pair, or shader text effect:

1. One SVG `<use>` renders `katakana-project` (`project-summary.jsx:50-62`; `katakana.svg:3-5`).
2. `renderPreview` places that SVG in the DOM immediately before the `.model` container (`project-summary.jsx:101-133` for laptop, `134-172` for phone).
3. The SVG is absolutely positioned and assigned one overall opacity (`project-summary.module.css:151-190`); it has no explicit z-index.
4. The later `Model` sibling owns a transparent WebGL canvas (`model.jsx:91-100,327-352`; `model.module.css:2-14`). Transparent canvas pixels reveal the SVG; opaque rendered device pixels paint over it. This creates object-shaped occlusion without clipping the word itself.
5. The tracked desktop/mobile screenshots visually corroborate that the unobstructed katakana remains bright while the physical device hides intersecting regions (`references/screenshots/sections/02-project-01.png`, `03-project-02.png`, `04-project-03.png`, and mobile equivalents).

Steps 1–4 are **CONFIRMED BY LOCAL REPOSITORY**. The precise browser paint-order explanation is a **STRONG INFERENCE** from DOM order, positioning, alpha renderer configuration, and the tracked visual result.

There is also a whole-word theme adjustment: `svgOpacity` is `0.7` in light theme and `1` in dark theme (`project-summary.jsx:36-42,50-57`). That is exactly a flat opacity applied to the entire word. It may remain useful as a theme calibration reference, but it cannot by itself satisfy the locked future rule that behind-object portions become darker/lower contrast while unobstructed portions remain stronger.

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

### Profile word: current foreground overlay

Profile renders a single SVG inside the portrait wrapper after the `Image` (`profile.jsx:80-93`) and assigns it `z-index: var(--zIndex3)` (`profile.module.css:119-132`). It therefore overlays the portrait edge; it does not create a foreground/background split.

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

### Future treatment of SYSTEM, GAPS, CASE STUDY, PROFILE

**adapt.** Reuse the proven stacking relationship—decorative SVG/text layer plus alpha media/object layer—where it can create real object-shaped occlusion. Do not merely rename the current SVG and apply one opacity. The locked future words require a technique that distinguishes obstructed and unobstructed regions; current source has no duplicated front/back word layers, text mask, or dedicated depth shader. Whether alpha-canvas occlusion alone is sufficient or whether duplicated/masked layers are needed is **UNRESOLVED / NEEDS RUNTIME VERIFICATION**. Safest later method: prototype one word/object pairing using existing stacking primitives, inspect light/dark and responsive states, and obtain Daniel's visual sign-off before generalizing.

## Approved future order: repository coverage and gaps

| Future position | Current foundation | What is reusable | What is absent or must change | Treatment | Evidence classification |
| --- | --- | --- | --- | --- | --- |
| Floating navigation | Root-owned `Navbar`, outside outlet content | Global ownership, desktop/mobile render paths, same-page hash hook, theme-aware inversion | Labels must become Work/About/Contact; Articles removed later | **adapt** | CONFIRMED BY LOCAL REPOSITORY |
| 1. Hero | `Intro` | Semantic/full-height shell, block-cover statuses/keyframes, decoder, responsive indicators, optional sphere | Locked copy model differs; performance/visual approval for sphere | **adapt** | CONFIRMED BY LOCAL REPOSITORY |
| 2. Logo-only tool strip | None | Theme tokens, `Section`, reduced-motion media query, generic layout primitives | Frozen one slow continuous logo-only pill strip (6–8 tools, about four visible on desktop, fewer on mobile; offscreen/reduced-motion stop); exact tools/assets/rights remain absent | **replace** (new section) | CONFIRMED BY LOCAL REPOSITORY |
| 3. SYSTEM | Original project 02 slot and generic reveal shell | Section semantics, visibility/focus triggers, tokens, reduced-motion conventions | All workflow content/paths/nodes/tracers/glow/mobile logic absent and locked against invention | **replace** | CONFIRMED BY LOCAL REPOSITORY |
| 4. GAPS | Original project 03 slot and generic reveal shell | Section semantics, typography, visibility/focus triggers | Frozen three-card copy/order plus desktop stack, mobile readable light-stack/linear fallback, and reduced-motion linear behavior; illustrations and supplied reference source remain absent | **replace** | STRONG INFERENCE |
| 5. HaircutDone gateway | Original project 01 laptop `ProjectSummary` | Laptop GLB, texture pipeline, reveal/loading, responsive order, internal-route Button | HaircutDone texture/copy/route and two-CTA ownership absent | **adapt** | CONFIRMED BY LOCAL REPOSITORY |
| 6. Profile | `Profile` | Semantic/focus shell, decoder, image reveal, responsive portrait, Contact route CTA | Daniel content/assets and locked `PROFILE` depth composition | **adapt** | CONFIRMED BY LOCAL REPOSITORY |
| 7. Footer | shared `Footer` | Semantic component and responsive layout | Identity/copy/public-human metadata | **adapt** | CONFIRMED BY LOCAL REPOSITORY |

## Homepage verification boundaries

| Unknown | Why it remains unknown | Safest later verification | Human review | Evidence classification |
| --- | --- | --- | --- | --- |
| Final SYSTEM contents/motion | The brief explicitly defers nodes, labels, connectors, timing, logic, glow, and mobile workflow | Wait for the separate workflow specification; validate a structure-only shell against it | Required | UNRESOLVED / NEEDS RUNTIME VERIFICATION |
| Final GAPS illustrations and stack implementation | Frozen three-card copy/order/basic desktop/mobile/reduced-motion behavior has no source implementation | Supply illustrations and optionally a stacking-card reference; verify the frozen interaction in real browsers | Required | UNRESOLVED / NEEDS RUNTIME VERIFICATION |
| Tool strip inventory and final assets | Frozen one-row/offscreen/reduced-motion behavior has no source implementation | Daniel supplies exact tools/logos/rights; verify the frozen loop/pause behavior | Required | UNRESOLVED / NEEDS RUNTIME VERIFICATION |
| HaircutDone screen/media and route | Only a reference decision exists; no application asset or route | Approve public URL, screen image, case-study assets, and CTA ownership | Required | UNRESOLVED / NEEDS RUNTIME VERIFICATION |
| Hero Twisted Blob / Shader Slot source and compatibility | Existing sphere is a reusable reference, while the approved replaceable shader/blob source is pending | Validate supplied source, fallback, and target-device performance | Required | UNRESOLVED / NEEDS RUNTIME VERIFICATION |
| Decorative word occlusion method | Current project SVG is occluded by alpha WebGL/device paint; current profile SVG is foreground-only | Prototype and compare stacking/mask variants without flattening opacity | Required | UNRESOLVED / NEEDS RUNTIME VERIFICATION |
| Exact mobile/touch choreography | Existing project motion is mouse-centric and future new sections have no touch spec | Real-device keyboard/touch/reduced-motion tests after section specs exist | Required | UNRESOLVED / NEEDS RUNTIME VERIFICATION |
