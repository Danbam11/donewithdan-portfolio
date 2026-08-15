# Navigation and social audit

## Scope and future constraint

This document records the current Hamish Williams navigation and social-link implementation. It does not change it. The approved DonewithDan navigation remains a future constraint: **Work**, **About**, and **Contact**, with **Articles** removed from the final navigation. The floating navigation remains separate from homepage sections, and both desktop and mobile Contact actions must continue to reach the separate `/contact` destination.

Evidence classifications used below are exactly: **CONFIRMED BY LOCAL REPOSITORY**, **STRONG INFERENCE**, and **UNRESOLVED / NEEDS RUNTIME VERIFICATION**.

For compact line citations below, `navbar.jsx` means the exact path `app/layouts/navbar/navbar.jsx`, `navbar.module.css` means `app/layouts/navbar/navbar.module.css`, `nav-data.js` means `app/layouts/navbar/nav-data.js`, `nav-toggle.module.css` means `app/layouts/navbar/nav-toggle.module.css`, `home.jsx` means `app/routes/home/home.jsx`, `useScrollToHash.js` means `app/hooks/useScrollToHash.js`, `monogram.module.css` means `app/components/monogram/monogram.module.css`, and `button.module.css` means `app/components/button/button.module.css`.

## Executive finding

The site has one root-mounted `Navbar` and one shared `navLinks`/`socialLinks` data module. Desktop and mobile renderings consume the same arrays, so content changes can be made once without forking the two interfaces. The navigation also owns hash scrolling, active-state calculation, route view-transition opt-in, social icons, the global theme control, and a scroll-time contrast-inversion routine. These behavioral contracts make `app/layouts/navbar/nav-data.js` the safest content seam and `app/layouts/navbar/navbar.jsx` a preservation-sensitive behavior seam. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

## Ownership and dependency trace

| Layer | Repository evidence | Imports and consumers | Related styles/assets | Evidence classification |
| --- | --- | --- | --- | --- |
| Global mount | `App` renders `<Navbar />` before `<main>` in `app/root.jsx:80-139`, specifically line 125. | `app/root.jsx:19` imports the barrel export from `app/layouts/navbar/index.js:1`. Every normal route rendered by `<Outlet />` shares it. | `app/root.module.css:2-10` controls the route-content loading fade, not navbar positioning. | CONFIRMED BY LOCAL REPOSITORY |
| Navigation component | `Navbar` is defined in `app/layouts/navbar/navbar.jsx:16-205`; `NavbarIcons` is defined at lines 207-223. | Imports `Icon`, `Monogram`, theme context/tokens, `Transition`, `useScrollToHash`, `useWindowSize`, Remix routing hooks, and both data arrays at lines 1-14. | `app/layouts/navbar/navbar.module.css:1-235`; `app/layouts/navbar/nav-toggle.module.css:1-70`; `app/layouts/navbar/theme-toggle.module.css:1-97`. | CONFIRMED BY LOCAL REPOSITORY |
| Shared data | `navLinks` and `socialLinks` are exported by `app/layouts/navbar/nav-data.js:3-38`. | Imported only by `Navbar` at `app/layouts/navbar/navbar.jsx:12`; rendered for desktop at lines 158-171, mobile at lines 178-196, and socials at lines 207-223. | Social handles are read from `app/config.json:6-8`. | CONFIRMED BY LOCAL REPOSITORY |
| Route/hash scrolling | `handleNavItemClick`, `handleMobileNavClick`, and the target effect are in `app/layouts/navbar/navbar.jsx:32-37,126-140`. | `useScrollToHash` from `app/hooks/useScrollToHash.js:5-42` uses `scrollIntoView`, respects Framer Motion's `useReducedMotion`, then updates the hash with Remix `navigate`. | Current target elements are owned by `Home`: `#project-1` at `app/routes/home/home.jsx:101-120` and `#details` at lines 166-170. | CONFIRMED BY LOCAL REPOSITORY |
| Route transitions/loading | Navbar route links set `unstable_viewTransition` and `prefetch="intent"` in `app/layouts/navbar/navbar.jsx:144-170,178-195`. | Remix routing owns the route transition. `Progress` and the main-content loading state consume `useNavigation` in `app/root.jsx:83,121,130` and `app/components/progress/progress.jsx:5-58`. | No custom `::view-transition-*` styles exist in `app`; `app/root.module.css:2-10` fades main content while navigation state is `loading`. | CONFIRMED BY LOCAL REPOSITORY |
| Icon system | `Icon` emits an `aria-hidden` SVG `<use>` reference in `app/components/icon/icon.jsx:6-18`. | `NavbarIcons` supplies the accessible name on the containing anchor at `app/layouts/navbar/navbar.jsx:210-219`. | Symbol source: `app/components/icon/icons.svg`; registry: `app/components/icon/manifest.json`. Existing social symbols are `bluesky`, `figma`, and `github` (`icons.svg:12-20,45-47`; `manifest.json:14-25,58-61`). | CONFIRMED BY LOCAL REPOSITORY |

## Desktop navigation structure

The normal document structure is:

1. A fixed `<header>` (`Navbar`) spanning between the top and bottom outer spacing.
2. A monogram link at the top-left.
3. A vertical `<nav>` containing the four route/hash links and a lower social-icon group.
4. A separate theme button fixed at the top-right.

This is defined in `app/layouts/navbar/navbar.jsx:142-174,202-223`. The header is fixed at the left with `z-index: var(--zIndex4)` in `app/layouts/navbar/navbar.module.css:2-16`; the link list uses vertical writing and rotation at lines 51-57; social icons are column-oriented at lines 102-124. The desktop `<nav>` is hidden at the mobile-width or mobile-landscape-height queries at lines 46-48. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

The monogram link points to `/#intro` when already on `/`, otherwise `/`; it is a Remix `RouterLink` with intent prefetch and view-transition opt-in. Its accessible label is composed from `config.name` and `config.role` (`app/layouts/navbar/navbar.jsx:143-154`; values are sourced from `app/config.json:2-3`). The monogram itself is decorative (`aria-hidden`) and uses an SVG clip-path plus accent hover reveal in `app/components/monogram/monogram.jsx:5-31` and `monogram.module.css:1-30`. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

Desktop route links are standard Remix anchors, so native keyboard activation is retained. Hover, active, and `aria-current='page'` states raise text contrast and reveal an accent bar in `app/layouts/navbar/navbar.module.css:59-100`. Keyboard focus remains visible through the global `:focus`/`:focus-visible` rule in `app/global.module.css:42-49`, although the desktop-specific accent bar is not explicitly keyed to `:focus`. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

## Mobile navigation structure and behavior

`Navbar` considers the interface mobile when the measured width is at most 696 px **or** the measured height is at most 696 px (`app/layouts/navbar/navbar.jsx:21-25`; numeric breakpoint source `app/utils/style.js:4-10`). The CSS uses the matching `--mediaMobile` and `--mediaMobileLS` custom media definitions (`app/global.module.css:4-6`) to hide the desktop nav and display the mobile controls (`navbar.module.css:46-48,164-166`; `nav-toggle.module.css:12-14`). The JS and CSS decision boundaries therefore agree for the primary modes. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

The mobile structure is:

- The same top-left monogram.
- `NavToggle`, a native button with `aria-label="Menu"` and `aria-expanded={menuOpen}`, fixed top-right (`app/layouts/navbar/nav-toggle.jsx:5-24`; `nav-toggle.module.css:2-15`).
- A conditionally mounted, full-viewport `<nav>` containing all shared route links, social icons, and a mobile theme toggle (`app/layouts/navbar/navbar.jsx:175-201`).
- A blurred, 70%-opaque theme background and slide-down reveal (`app/layouts/navbar/navbar.module.css:147-175`). Each route link gets a 50 ms incremental delay calculated at `navbar.jsx:188-192`, with its visible/transform states at `navbar.module.css:177-234`.

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

Clicking the toggle flips local `menuOpen` state (`app/layouts/navbar/navbar.jsx:17-18,155`). Clicking any mobile route link delegates to `handleNavItemClick` and then closes the menu (`navbar.jsx:137-140,187`). The menu's unmount delay is `durationL`, currently 600 ms (`navbar.jsx:175`; `app/components/theme-provider/theme.js:8-12`), implemented by the shared `Transition` state machine (`app/components/transition/transition.jsx:8-35,37-103`). **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

There is no close-on-Escape handler, focus move to the first menu item, focus trap, focus return routine, `aria-controls`, modal/dialog semantics, `inert` treatment for background content, or body-scroll lock in `Navbar`, `NavToggle`, or their styles. While closing, `Transition` leaves the nav mounted until its timeout and the links have no `aria-hidden` or disabled-tab state. Keyboard users can therefore tab beyond the visual overlay, and focus behavior during the exit interval is not explicitly managed. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

Whether browser/Remix navigation happens to restore focus acceptably after every mobile link activation cannot be proven from static source. Verify later with keyboard-only testing across open, Escape attempt, Tab/Shift+Tab wrapping, close, route change, same-page hash navigation, viewport rotation, and resize across 696 px/696 px-height boundaries. Human accessibility review is required. **Evidence classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION.**

## Navigation data and current targets

| Current label | Current target | Target owner/evidence | Active behavior | Approved future treatment | Evidence classification |
| --- | --- | --- | --- | --- | --- |
| Projects | `/#project-1` | Data: `app/layouts/navbar/nav-data.js:4-7`. Home target: first `ProjectSummary` at `app/routes/home/home.jsx:101-120`. | Exact comparison against `pathname + hash`. | Rename/adapt to **Work** only after the future Work target ID is fixed. Do not assume `#project-1` remains valid. | CONFIRMED BY LOCAL REPOSITORY |
| Details | `/#details` | Data: `app/layouts/navbar/nav-data.js:8-11`. Home target: `Profile` at `app/routes/home/home.jsx:166-170`. | Exact comparison against `pathname + hash`. | Rename/adapt to **About**; retaining `#details` is possible but not required by the approved copy. | CONFIRMED BY LOCAL REPOSITORY |
| Articles | `/articles` | Data: `app/layouts/navbar/nav-data.js:12-15`. Article route content exists under `app/routes/articles/route.jsx`, `app/routes/articles_._index/`, and the two MDX route files. | Active on exact `/articles`, after one trailing slash is removed. | Remove the nav-data item later. Removing this item does not itself delete article routes or content. | CONFIRMED BY LOCAL REPOSITORY |
| Contact | `/contact` | Data: `app/layouts/navbar/nav-data.js:16-19`; route re-export `app/routes/contact/route.js:1`; implementation `app/routes/contact/contact.jsx`. | Active on exact `/contact`. | Preserve target and change neither desktop nor mobile independently; both consume this one item. | CONFIRMED BY LOCAL REPOSITORY |

`current` is deliberately set in an effect from `${location.pathname}${location.hash}` to avoid an SSR mismatch (`app/layouts/navbar/navbar.jsx:17,27-30`). `getCurrent` strips one trailing slash and returns `'page'` only on exact equality (`navbar.jsx:115-124`). A hash link is marked current only for the matching hash; `/` by itself does not mark Projects or Details active. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

For same-homepage hash clicks, the handler prevents default navigation, stores the hash, and asks `useScrollToHash` to scroll (`navbar.jsx:32-37,126-135`). That hook calls `targetElement.scrollIntoView` without a null guard (`app/hooks/useScrollToHash.js:11-17`), so a future nav/section-ID mismatch will cause a runtime error. It waits for a scroll event to settle before writing the URL (`useScrollToHash.js:18-38`); if no scroll event fires—for example when already precisely aligned—the completion callback and URL update may not run. The hook returns listener cleanup at lines 33-36, but the navbar effect does not return or retain that cleanup (`navbar.jsx:32-37`), so this no-scroll case can leave a listener until a later scroll. The browser-event outcome needs targeted verification. **Evidence classification: STRONG INFERENCE.**

## Social-link data and external-link handling

| Label/icon | URL construction | Source | Rendering behavior | Evidence classification |
| --- | --- | --- | --- | --- |
| Bluesky / `bluesky` | `https://bsky.app/profile/${config.bluesky}` | `app/layouts/navbar/nav-data.js:23-27`; handle key `bluesky` in `app/config.json:6`. | Rendered in both desktop and mobile `NavbarIcons`. | CONFIRMED BY LOCAL REPOSITORY |
| Figma / `figma` | `https://www.figma.com/${config.figma}` | `app/layouts/navbar/nav-data.js:28-32`; handle key `figma` in `app/config.json:7`. | Rendered in both desktop and mobile `NavbarIcons`. | CONFIRMED BY LOCAL REPOSITORY |
| Github / `github` | `https://github.com/${config.github}` | `app/layouts/navbar/nav-data.js:33-37`; handle key `github` in `app/config.json:8`. | Rendered in both desktop and mobile `NavbarIcons`. | CONFIRMED BY LOCAL REPOSITORY |

`NavbarIcons` renders direct `<a>` elements with `target="_blank"` and `rel="noopener noreferrer"`, supplies `aria-label={label}`, and places the sprite icon inside (`app/layouts/navbar/navbar.jsx:207-223`). `Icon` itself is correctly hidden from the accessibility tree (`app/components/icon/icon.jsx:8-17`). The same icon group is reused, rather than copied, for desktop and mobile. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

The static source contains no second social-link data source and the footer does not render socials; `Footer` only renders copyright and `/humans.txt` (`app/components/footer/footer.jsx:7-18`). Repository-wide references show `socialLinks` is defined only in `nav-data.js` and consumed only by `navbar.jsx`. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

The current URL templates assume each `config.json` value is a handle/path fragment, not a complete URL. They perform no escaping or validation. This is acceptable for trusted, checked-in configuration but is a future editing hazard: inserting a full URL into one of these fields would create a malformed destination. Runtime reachability and ownership of the three external profiles were not tested in this audit; use a manual link check after Daniel supplies final social destinations. **Evidence classification: STRONG INFERENCE** for the malformed-URL risk; **UNRESOLVED / NEEDS RUNTIME VERIFICATION** for live destination ownership/reachability.

## Theme-aware navigation contrast

When the global theme is light, `Navbar` measures every `[data-navbar-item]`, listens to document scroll, finds inverse dark sections matching `[data-theme='dark'][data-invert]`, and temporarily assigns `data-theme="dark"` to overlapping fixed nav items (`app/layouts/navbar/navbar.jsx:39-113`). Current inverse sections are produced by nested dark `ThemeProvider` instances in `app/routes/projects.smart-sparrow/smart-sparrow.jsx:218-256,343-523`; nested providers render a wrapper carrying `data-theme` and forwarded `data-invert` in `app/components/theme-provider/theme-provider.jsx:14-40`. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

This contrast behavior is coupled to fixed-item measurements, section geometry, the `data-invert` marker, and the literal `dark`/`light` theme keys. It recomputes on theme, window size, and `location.key`, but not when images/fonts dynamically change layout, and its scroll listener is not throttled (`navbar.jsx:40-113`). Multiple simultaneously visible inverse elements can overwrite one another's per-item result because each loop iteration can clear a value set by an earlier element (`navbar.jsx:75-90`). Those are regression risks for future composed sections; actual failure requires runtime geometry testing. **Evidence classification: STRONG INFERENCE.**

## Focus, keyboard, semantics, and motion

| Finding | Exact evidence | Consequence | Evidence classification |
| --- | --- | --- | --- |
| Native interactive elements | Route items are Remix links (`navbar.jsx:144-170,178-195`); social items are anchors (`210-220`); toggles render through `Button`, which defaults to `<button>` without an `href` (`app/components/button/button.jsx:13-15,30-68`). | Enter/Space/link activation is based on native controls. | CONFIRMED BY LOCAL REPOSITORY |
| Global focus ring | `app/global.module.css:42-49` supplies a 4 px outline for `:focus` and removes it only when `:focus-visible` does not match. | A visible keyboard focus baseline exists. | CONFIRMED BY LOCAL REPOSITORY |
| Mobile-link focus ornament | `.mobileNavLink:focus::after` reveals the accent line (`navbar.module.css:205-228`). | Mobile links have an additional visible focus response. | CONFIRMED BY LOCAL REPOSITORY |
| Menu state announcement | `NavToggle` exposes `aria-expanded`, but the label remains “Menu” and no controlled-nav ID is supplied (`nav-toggle.jsx:5-23`). | Expanded state is announced, but the relationship and “close” action are not explicit. | CONFIRMED BY LOCAL REPOSITORY |
| Menu focus containment | No focus-trap, Escape, inert, scroll-lock, or focus-return implementation exists in the navbar files. | The full-screen visual presentation behaves as a navigation overlay, not as a managed modal interaction. | CONFIRMED BY LOCAL REPOSITORY |
| Reduced motion | `--mediaUseMotion` is `prefers-reduced-motion: no-preference` (`app/global.module.css:7`). Nav translations/rotations are gated in `navbar.module.css:168-170,192-195,217-220` and `nav-toggle.module.css:38-67`; opacity/color/background transitions and the 600 ms JS unmount timeout remain. Hash scrolling switches from `smooth` to `auto` (`useScrollToHash.js:1-16`). | Most spatial movement is removed, but reduced-motion mode is not transition-free. | CONFIRMED BY LOCAL REPOSITORY |
| Touch target behavior | Global reset applies `touch-action: manipulation` to buttons and anchors (`app/reset.module.css:30-32`); nav icon/button dimensions are 48–56 px through navbar spacing and `Button` tokens (`navbar.module.css:126-140`; `button.module.css:2-12,104-112`). | The implementation has an intentional touch baseline. Exact rendered size still needs device verification. | CONFIRMED BY LOCAL REPOSITORY |

## Exact safest future edit points

These are future implementation seams, not changes performed by this audit.

1. **Navigation labels and targets:** edit only the `navLinks` array in `app/layouts/navbar/nav-data.js:3-20` once the future homepage IDs are locked. Both desktop and mobile consumers will update together. Preserve the object shape (`label`, `pathname`) because `Navbar` destructures it at `navbar.jsx:158,178`.
2. **Work/About target contract:** coordinate any pathname changes with the owning section IDs in the future homepage composition. The present pairs are `/#project-1` ↔ `Home`/`ProjectSummary` (`home.jsx:101-120`) and `/#details` ↔ `Home`/`Profile` (`home.jsx:166-170`). Preserve the leading `/#` form for cross-route access unless the routing design deliberately changes.
3. **Articles:** remove the single nav-data object at `nav-data.js:12-15` to remove it from both interfaces. Treat removal of `app/routes/articles*` as a separate, explicitly scoped content/routing decision.
4. **Contact:** retain `pathname: '/contact'` at `nav-data.js:16-19`. The Profile CTA already uses the same destination at `app/routes/home/profile.jsx:58-66`; preserve that shared endpoint when changing its surrounding content.
5. **Social destinations:** update trusted handle/path values in `app/config.json:6-8` only if the same three services remain. If services change, update `socialLinks` in `nav-data.js:22-38` and add/remove matching symbols in both `app/components/icon/icons.svg` and `app/components/icon/manifest.json`. Preserve anchor `aria-label`, `_blank`, and `noopener noreferrer` behavior in `NavbarIcons`.
6. **Presentation:** adapt `app/layouts/navbar/navbar.module.css` without separating desktop/mobile data. Preserve the fixed stacking context, mobile width-and-height breakpoints, focus indication, and the `[data-navbar-item]`/`data-invert` contract unless their dependent contrast algorithm is intentionally replaced and verified.
7. **Menu accessibility:** the behavior seam is `Navbar`/`NavToggle`, not `nav-data.js`. Any future focus management must be verified against `Transition`'s delayed unmount and responsive resize behavior before release.

All seven locations and dependencies are **CONFIRMED BY LOCAL REPOSITORY**. The statement that they are the safest edit points is a **STRONG INFERENCE** based on their import/consumer graph and the requirement to preserve existing architecture.

## Required later verification

- Verify every final Work/About/Contact target from the homepage and from a non-home route, including back/forward history and reduced-motion scrolling. **Evidence classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION.**
- Verify current browser support/fallback for Remix's `unstable_viewTransition`; the flags are present, but exact native crossfade behavior cannot be established statically and there are no repository-defined `::view-transition-*` styles. **Evidence classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION.**
- Test keyboard order, Escape, focus containment/return, focus visibility, and scroll lock in the mobile overlay. Human accessibility review is required. **Evidence classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION.**
- Verify social destination ownership and final platform choices with Daniel; repository evidence only establishes the current Hamish-configured links. **Evidence classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION.**
- Test nav contrast while dynamically loaded media changes section height and while more than one `data-invert` section is near the viewport. **Evidence classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION.**

## Audit disposition

Preserve the shared data-driven navbar and floating responsive shell. Adapt content through `nav-data.js`, retain `/contact`, and treat focus management plus inverse-section measurement as deliberate hardening work. Do not fork desktop and mobile navigation or replace the route/hash behavior before its contracts are tested. **Evidence classification: STRONG INFERENCE.**
