# Theme system audit

## Scope

This document traces the existing light/dark system from token definitions through server rendering, cookie persistence, client toggling, nested inverse sections, responsive placement, and theme-sensitive consumers. It records preservation requirements for the future DonewithDan adaptation and makes no code or configuration changes.

Evidence classifications used below are exactly: **CONFIRMED BY LOCAL REPOSITORY**, **STRONG INFERENCE**, and **UNRESOLVED / NEEDS RUNTIME VERIFICATION**.

For compact line citations below, `root.jsx` means the exact path `app/root.jsx`, `theme.js` means `app/components/theme-provider/theme.js`, `theme-provider.jsx` means `app/components/theme-provider/theme-provider.jsx`, `theme-toggle.jsx` means `app/layouts/navbar/theme-toggle.jsx`, `theme-toggle.module.css` means `app/layouts/navbar/theme-toggle.module.css`, `navbar.jsx` means `app/layouts/navbar/navbar.jsx`, `api.set-theme.js` means `app/routes/api.set-theme.js`, and `smart-sparrow.jsx` means `app/routes/projects.smart-sparrow/smart-sparrow.jsx`.

## Executive finding

The repository has a server-first two-theme system. A Remix root loader reads an HTTP-only signed session cookie, defaults to dark, and server-renders both `data-theme` and an inline token/font stylesheet before body content. The client `ThemeProvider` exposes the selected theme and a `useFetcher` toggle; the action writes the same cookie, while fetcher form data supplies an optimistic theme during submission. This is a valuable anti-flash foundation and should be preserved as a unit. The main weaknesses are duplicated cookie configuration, an unsafe blank secret fallback, lack of allowed-theme validation, no operating-system preference mode, a dark-only error boundary, theme-dependent media/WebGL behavior, and runtime contrast/performance questions. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY** for the architecture and gaps; **STRONG INFERENCE** for the preservation recommendation.

## System map

| Stage | Owner and symbol | Exact repository evidence | Downstream consumers | Evidence classification |
| --- | --- | --- | --- | --- |
| Options/tokens | `themes`, `tokens` | `app/components/theme-provider/theme.js:3-56` defines base design tokens; lines 58-107 define responsive overrides; lines 109-143 define and export `dark`, `light`, and `themes`. | Generated CSS, component timings/layout, theme-aware components, Three.js scenes. | CONFIRMED BY LOCAL REPOSITORY |
| CSS generation | `themeStyles`, `createThemeProperties`, `createMediaTokenProperties` | `app/components/theme-provider/theme-provider.jsx:48-116,176-183`; local font declarations at lines 118-174. | Injected in the normal document and error document by `app/root.jsx:114,152`. | CONFIRMED BY LOCAL REPOSITORY |
| Server initialization | Root `loader` | `app/root.jsx:49-78` creates cookie-session storage, reads `theme`, falls back to `dark`, and returns it with `Set-Cookie`. | `App` receives it through `useLoaderData` at `root.jsx:80-81`. | CONFIRMED BY LOCAL REPOSITORY |
| Document application | `App` | `app/root.jsx:103-139` emits theme metadata, inline `themeStyles`, `<body data-theme={theme}>`, and root `ThemeProvider`. | All normal routes beneath `<Outlet />`. | CONFIRMED BY LOCAL REPOSITORY |
| Client toggle | `toggleTheme` | `app/root.jsx:82-93` uses `useFetcher`; form data optimistically overrides loader theme at lines 85-87 and POSTs to `/api/set-theme` at lines 89-93. | `ThemeToggle`; the Smart Sparrow case-study segmented control. | CONFIRMED BY LOCAL REPOSITORY |
| Persistence action | `/api/set-theme` `action` | `app/routes/api.set-theme.js:3-30` reads form data, writes `theme` to the same `__session` cookie, and returns JSON plus `Set-Cookie`. | Future document requests/root-loader revalidation. | CONFIRMED BY LOCAL REPOSITORY |
| Context | `ThemeProvider`, `useTheme` | `app/components/theme-provider/theme-provider.jsx:12-46`; barrel exports at `app/components/theme-provider/index.js:1-2`. | Navbar/toggle, Intro/WebGL, images, code, project summaries, Smart Sparrow. | CONFIRMED BY LOCAL REPOSITORY |
| Toggle UI | `ThemeToggle` | `app/layouts/navbar/theme-toggle.jsx:6-41`; appearance in `theme-toggle.module.css:1-97`. | Desktop and mobile placements in `app/layouts/navbar/navbar.jsx:175-203`. | CONFIRMED BY LOCAL REPOSITORY |
| Inverse-section/nav contrast | Nested `ThemeProvider` + `Navbar` inversion effect | Nested provider wrapper behavior at `theme-provider.jsx:22-39`; current `data-invert` uses at `app/routes/projects.smart-sparrow/smart-sparrow.jsx:218-256,343-523`; navbar geometry logic at `app/layouts/navbar/navbar.jsx:39-113`. | Fixed logo, desktop social icons, desktop theme toggle, and desktop nav links marked `data-navbar-item`. | CONFIRMED BY LOCAL REPOSITORY |

## Theme options and semantic tokens

The only exported theme options are literal keys `dark` and `light` (`app/components/theme-provider/theme.js:109-143`). Each provides the semantic variables `background`, `backgroundLight`, `primary`, `accent`, `error`, `text`, `textTitle`, `textBody`, and `textLight` (`theme.js:110-132`). Shared typography, spacing, timing, easing, and z-index tokens live in `baseTokens` (`theme.js:3-56`), while responsive typography/spacing/max-width overrides are emitted for desktop, laptop, tablet, mobile, and small-mobile widths (`theme.js:58-107`; breakpoint values `app/utils/style.js:4-10`). **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

`themeStyles` creates a `@layer theme, base, components, layout` order, defines base variables on `:root`, emits max-width token media queries, defines theme variables under `[data-theme='dark']` and `[data-theme='light']`, and declares seven local fonts (`app/components/theme-provider/theme-provider.jsx:79-183`). It is inserted directly into `<head>` with `dangerouslySetInnerHTML` before `<Meta />` and `<Links />` in both the normal and error documents (`app/root.jsx:103-118,145-155`). The string is generated entirely from checked-in token/font imports, not user input. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

The theme vocabulary is broadly consumed through CSS variables: global background/text/selection/focus in `app/global.module.css:17-49`; buttons in `app/components/button/button.module.css`; inputs in `app/components/input/input.module.css`; headings/text/links/dividers; route styles; and navigation. Renaming or removing semantic token keys would therefore be a cross-repository breaking change, whereas changing their approved values preserves the existing contract. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY** for consumption; **STRONG INFERENCE** for the safe-change boundary.

## Default theme and initialization

The normal-document default is dark in two places:

- The root loader uses `session.get('theme') || 'dark'` (`app/root.jsx:67-69`).
- `ThemeProvider` has a defensive `theme = 'dark'` default (`app/components/theme-provider/theme-provider.jsx:14-20`).

The root always passes the loader value, so the loader is authoritative during normal SSR. The root error boundary separately hard-codes dark metadata and `<body data-theme="dark">` (`app/root.jsx:142-160`). **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

There is no `matchMedia('(prefers-color-scheme: ...)')`, `prefers-color-scheme` theme-selection logic, local-storage initialization, or client boot script in `app`. First-time visitors therefore receive dark regardless of system preference. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

Two peripheral assets behave independently:

- `public/favicon.svg:2-8` changes its fill using `prefers-color-scheme: dark`, so the favicon follows the operating system/browser chrome rather than the saved site theme.
- `public/manifest.json:22-24` fixes both PWA `theme_color` and `background_color` to dark.

This can produce icon/install-surface colors that do not match a user-selected light site theme. Whether that mismatch is perceptible on target browsers/PWA installs requires visual verification. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY** for the independent rules; **STRONG INFERENCE** for the mismatch risk.

## Storage and persistence

Both the root loader and theme action independently create Cloudflare cookie-session storage with the same configuration:

- Cookie name `__session`.
- `httpOnly: true`.
- `maxAge: 604_800` seconds (seven days).
- `path: '/'`.
- `sameSite: 'lax'`.
- `secure: true`.
- Signing secret read from `context.cloudflare.env.SESSION_SECRET`, with a literal single-space fallback.

Evidence: `app/root.jsx:55-65` and `app/routes/api.set-theme.js:7-17`. `.dev.vars.example:16` names `SESSION_SECRET`, and `.gitignore:8` excludes a real `.dev.vars`. No secret value is included here. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

The loader reads the incoming `Cookie` header, then calls `commitSession(session)` and emits `Set-Cookie` even when the visitor did not change theme (`app/root.jsx:67-76`). The action reads the same cookie, sets `theme`, and commits it (`api.set-theme.js:19-28`). The preference therefore persists server-side across routes/reloads and is inaccessible to ordinary client JavaScript because it is HTTP-only. Because the loader refreshes the cookie on responses, its seven-day expiry likely behaves as a rolling lifetime; the exact header behavior should be confirmed against the installed Remix/Cloudflare runtime. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY** for persistence/configuration; **STRONG INFERENCE** for rolling-expiry semantics.

The literal `' '` secret fallback means a missing `SESSION_SECRET` does not fail closed and makes the signing key predictable. The cookie currently stores only theme, but the session mechanism is shared infrastructure and could later hold more sensitive state. Production must verify that `SESSION_SECRET` exists and is appropriately managed without exposing it. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY** for the fallback; **STRONG INFERENCE** for the security risk.

The storage configuration is duplicated rather than imported from one module. A later change to name, secret, flags, or expiry can drift between reading and writing paths. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY** for duplication; **STRONG INFERENCE** for drift risk.

## Server/client interaction and hydration

The normal first render is server-consistent:

1. `loader` reads the cookie and returns `theme` (`app/root.jsx:49-78`).
2. `App` reads that value through `useLoaderData` (`root.jsx:80-81`).
3. `<meta name="theme-color">`, `<meta name="color-scheme">`, `<body data-theme>`, and root `ThemeProvider` all use the same variable (`root.jsx:103-120`).
4. The client hydrates from serialized loader data; there is no client-only theme lookup that chooses a competing initial value.

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

On toggle, `toggleTheme` submits either the requested `newTheme` or the opposite of current dark/light (`root.jsx:89-93`). While the fetcher holds form data, `App` replaces the loader theme with that submitted value (`root.jsx:85-87`), so body, metadata, context, and consumers can update before the action/revalidation round trip. Remix is expected to revalidate loader data after the action and leave the cookie-backed value authoritative; exact timing and failure rollback need runtime inspection. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY** for the optimistic code path; **STRONG INFERENCE** for the expected revalidation flow.

`api.set-theme` accepts whatever `formData.get('theme')` returns and stores it without checking membership in `themes` (`app/routes/api.set-theme.js:3-20`). An arbitrary POST can therefore persist a value for which no `[data-theme='…']` semantic variables exist, potentially leaving theme-dependent CSS unresolved. The toggle UI itself only generates `dark` or `light`, and Smart Sparrow uses a fixed `['dark', 'light']` array (`app/routes/projects.smart-sparrow/smart-sparrow.jsx:88-94`), so ordinary UI interaction stays inside the valid set. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY** for lack of validation/UI values; **STRONG INFERENCE** for broken styling from a crafted value.

## Wrong-theme flash prevention

The repository's primary flash-prevention mechanism is server selection, not a client head script:

- The saved preference is read before rendering.
- Both theme token sets are in an inline `<style>` in the initial head.
- The chosen `data-theme` is present on the server-emitted `<body>`.
- `theme-color` and `color-scheme` metadata are emitted from that same value.

Evidence: `app/root.jsx:49-78,103-120`; generated styles `app/components/theme-provider/theme-provider.jsx:98-116,176-183`. This avoids waiting for hydration to apply a returning visitor's cookie-backed theme and is the key system to preserve. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY** for the mechanism; **STRONG INFERENCE** for its anti-flash effectiveness.

Important boundaries:

- A first-time visitor intentionally sees the dark default, not the OS preference. This is not a flash, but it may not match user expectation. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**
- The error boundary always renders dark and does not read the saved preference (`app/root.jsx:142-160`), so entering an error document from light mode can visibly switch theme. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**
- `html, body` always transition background and opacity for `durationM` (`app/global.module.css:17-26`), so a theme change is animated even in reduced-motion mode. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**
- Cookie acceptance on local HTTP, action failure rollback, response-cache interactions, and actual paint sequencing cannot be certified statically. Test with hard reloads, disabled JavaScript, throttled JavaScript/network, blocked cookies, tampered/expired cookies, and both normal/error responses. **Evidence classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION.**

## `ThemeProvider` behavior

`ThemeProvider` creates a context value containing `theme` and either its own `toggleTheme` or the parent toggle (`app/components/theme-provider/theme-provider.jsx:14-30`). It detects the root provider by checking whether the parent context has a theme. At the root it returns children directly because `<body>` already carries `data-theme`; nested providers add a wrapper element with their `data-theme` and forward other props such as `data-invert` (`theme-provider.jsx:22-39`). **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

This design supports local forced-theme regions while retaining the global toggle function. The Smart Sparrow route uses two nested `ThemeProvider theme="dark" data-invert` regions (`app/routes/projects.smart-sparrow/smart-sparrow.jsx:218-256,343-523`). Because CSS theme variables inherit from the nearest `data-theme`, descendants of those wrappers render dark even when the body is light. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

The fixed navbar sits outside nested wrappers, so it cannot inherit their variables. `Navbar` compensates in light mode by measuring fixed items and inverse wrappers, then applying the inverse theme directly to overlapping nav items (`app/layouts/navbar/navbar.jsx:39-113`). This behavior depends on literal `dark`/`light` keys and the `data-invert` marker. It should be treated as part of the theme contract, not as unrelated navbar styling. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

The measurement is refreshed on global theme, `windowSize`, and route `location.key`, but not explicitly on font/image layout completion; it uses an unthrottled document scroll listener and each inverse wrapper iteration can clear a match made by an earlier wrapper (`navbar.jsx:40-113`). Dynamic DonewithDan sections and multiple nearby inverse regions could therefore expose stale or conflicting contrast state. Runtime geometry/contrast testing is required. **Evidence classification: STRONG INFERENCE.**

## Toggle component and icon behavior

`ThemeToggle` is a shared icon-only native button. It reads only `toggleTheme` from context and calls it with no argument (`app/layouts/navbar/theme-toggle.jsx:6-18`), causing root `toggleTheme` to choose the opposite theme (`app/root.jsx:89-93`). It has `aria-label="Toggle theme"`; the SVG is `aria-hidden` (`theme-toggle.jsx:12-20`). **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

The icon is a single SVG with a uniquely generated mask ID (`useId`) to avoid collisions (`theme-toggle.jsx:7-9,20-37`):

- In light mode, the central circle is scaled, the subtractive mask is translated away, and ray strokes are visible (`app/layouts/navbar/theme-toggle.module.css:29-44,54-62,72-86`). It reads visually as a sun.
- Under `body[data-theme='dark']`, the circle grows, the black mask cuts a crescent, and ray strokes hide through dash offset/opacity (`theme-toggle.module.css:45-51,63-69,88-95`). It reads visually as a moon.
- Shape/stroke transitions run only inside `--mediaUseMotion` (`theme-toggle.module.css:34-39,48-50,58-60,66-68,81-94`).

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

The accessible label does not state the current theme or the result of activation, and the button does not expose `aria-pressed`. Screen-reader clarity should be tested; a later label improvement can preserve the same SVG and toggle mechanism. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY** for current semantics; **UNRESOLVED / NEEDS RUNTIME VERIFICATION** for assistive-technology clarity.

## Desktop and mobile behavior

On desktop, `Navbar` renders `ThemeToggle` as a separate fixed top-right control and marks it `data-navbar-item` for inverse-section contrast (`app/layouts/navbar/navbar.jsx:202`; `theme-toggle.module.css:2-16`). On mobile or short landscape height, that desktop instance is hidden by CSS; the full-screen mobile nav contains a second `ThemeToggle isMobile` fixed at its bottom-right (`navbar.jsx:175-199`; `theme-toggle.module.css:12-26`). **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

`Navbar`'s JS mobile boundary is width ≤696 px or height ≤696 px (`navbar.jsx:21-25`), matching CSS custom media in `app/global.module.css:4-6`. The mobile toggle is available only while the menu is mounted/open, while the desktop instance is CSS-hidden in that mode. Theme access therefore requires opening the menu on small/short viewports. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

No alternate storage or system-preference logic is used on mobile. Verify safe-area positioning, orientation changes, zoom, keyboard focus, and whether the theme button remains reachable when the mobile menu content overflows at very small heights. **Evidence classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION.**

## Reduced-motion interaction

| Behavior | Exact evidence | Reduced-motion result | Evidence classification |
| --- | --- | --- | --- |
| Toggle icon | `theme-toggle.module.css:34-39,48-50,58-60,66-68,81-94` gates transitions under `--mediaUseMotion`. | Sun/moon state changes without those shape animations. | CONFIRMED BY LOCAL REPOSITORY |
| Global page colors | `app/global.module.css:17-26` applies background/opacity transition unconditionally. | A 400 ms (`durationM`) background transition remains. | CONFIRMED BY LOCAL REPOSITORY |
| Navbar/mobile placement | Movement transitions are largely gated by `--mediaUseMotion` in navbar/toggle styles. | Spatial menu/icon movement is reduced, but opacity/color/background transitions and delayed unmount remain. | CONFIRMED BY LOCAL REPOSITORY |
| Intro theme transition | `Transition in key={theme} timeout={3000}` in `app/routes/home/intro.jsx:63-143`; discipline resets on theme change at lines 42-46. | JS transition timing/state still occurs; CSS decides which spatial effects remain. | CONFIRMED BY LOCAL REPOSITORY |
| Hero WebGL | `DisplacementSphere` reads `theme` and `useReducedMotion` (`app/routes/home/displacement-sphere.jsx:32-49`); lights are recreated on theme at lines 96-110 and reduced motion renders single resize frames at lines 112-123. | Theme still changes scene lighting; animation policy is partially motion-aware. | CONFIRMED BY LOCAL REPOSITORY |

Because Intro keys its transition by theme, a toggle can replace that transition subtree and may recreate its lazy WebGL child in addition to changing lights. The exact remount/GPU cost and visual result should be profiled rather than assumed. **Evidence classification: STRONG INFERENCE.**

## Theme-dependent consumers

Direct context/token consumers that constrain preservation include:

| Consumer | Dependency and effect | Exact evidence | Evidence classification |
| --- | --- | --- | --- |
| Root document | Body, metadata, provider, loading UI | `app/root.jsx:80-139` | CONFIRMED BY LOCAL REPOSITORY |
| Navbar | Reads theme for inverse value and contrast scanning | `app/layouts/navbar/navbar.jsx:16-25,39-113` | CONFIRMED BY LOCAL REPOSITORY |
| Theme toggle | Calls context toggle; appearance keys off body data attribute | `app/layouts/navbar/theme-toggle.jsx:6-41`; CSS `theme-toggle.module.css:29-95` | CONFIRMED BY LOCAL REPOSITORY |
| Intro | Keys entrance transition by theme, resets rotating discipline | `app/routes/home/intro.jsx:20-46,63-143` | CONFIRMED BY LOCAL REPOSITORY |
| Displacement sphere | Rebuilds directional/ambient lights with theme-specific intensity | `app/routes/home/displacement-sphere.jsx:32-49,96-110` | CONFIRMED BY LOCAL REPOSITORY |
| Project summary | Adjusts katakana opacity/`data-light` from theme | `app/routes/home/project-summary.jsx:34-62` | CONFIRMED BY LOCAL REPOSITORY |
| Shared image | Reads theme and writes `data-theme` on image wrapper | `app/components/image/image.jsx:11-53` | CONFIRMED BY LOCAL REPOSITORY |
| Code block | Reads theme and selects dark/light syntax rules | `app/components/code/code.jsx:9-29`; `app/components/code/code.module.css:31-63` | CONFIRMED BY LOCAL REPOSITORY |
| Smart Sparrow route | Selects light/dark screenshots, background opacity, segmented-control state; can toggle global theme | `app/routes/projects.smart-sparrow/smart-sparrow.jsx:87-128,147-174,269-338`; further keyed theme assets occur later in the same file. | CONFIRMED BY LOCAL REPOSITORY |
| Nested inverse sections | Force dark descendants and signal navbar inversion | `smart-sparrow.jsx:218-256,343-523`; provider wrapper `theme-provider.jsx:22-39` | CONFIRMED BY LOCAL REPOSITORY |
| Progress bar | Changes height under a light-theme ancestor | `app/components/progress/progress.module.css:20-22` | CONFIRMED BY LOCAL REPOSITORY |
| Error document | Forces dark and injects red error overrides for both theme selectors | `app/root.jsx:142-160`; `app/layouts/error/error.jsx:40-56` | CONFIRMED BY LOCAL REPOSITORY |

This graph means theme changes are not cosmetic token swaps only: they can select media, update Three.js lighting, restart animation state, and alter navbar intersection behavior. A future redesign must regression-test those consumers when adapting brand colors or persistence. **Evidence classification: STRONG INFERENCE.**

## Accessibility, resilience, and security findings

| Finding | Evidence | Assessment | Evidence classification |
| --- | --- | --- | --- |
| Native, focusable toggle | `ThemeToggle` renders shared `Button`; global focus ring at `app/global.module.css:42-49`. | Good keyboard baseline. | CONFIRMED BY LOCAL REPOSITORY |
| Ambiguous accessible state | Label is always “Toggle theme”; no current state/result is announced (`theme-toggle.jsx:12-18`). | Needs assistive-technology review and likely semantic copy adaptation. | UNRESOLVED / NEEDS RUNTIME VERIFICATION |
| No system option | Only dark/light keys; no theme-selection `matchMedia` code. | Do not claim “system” support. A future system option would be a new product/architecture decision. | CONFIRMED BY LOCAL REPOSITORY |
| Invalid values accepted | Theme action stores unvalidated form data (`api.set-theme.js:3-20`). | Validate against the exported theme set during future hardening. | STRONG INFERENCE |
| Weak missing-secret behavior | Both cookie configurations fall back to a single space (`root.jsx:62`; `api.set-theme.js:14`). | Production should fail closed or otherwise guarantee a managed secret; no secret should enter source/docs. | STRONG INFERENCE |
| Error-theme discontinuity | Error boundary hard-codes dark (`root.jsx:142-160`). | Light users can lose their preference during error rendering. | CONFIRMED BY LOCAL REPOSITORY |
| Color contrast unknown | Semantic colors use OKLCH/color-mix (`theme.js:109-132`) across many component states. | Static tokens alone are insufficient to certify contrast after future brand changes. Render and measure both themes, including focus, disabled, error, inverse, and selection states. | UNRESOLVED / NEEDS RUNTIME VERIFICATION |
| Browser feature support | Tokens use OKLCH and `color-mix`; mobile nav uses backdrop filtering. | Target-browser fallback behavior is not established by source and was not run in audit mode. | UNRESOLVED / NEEDS RUNTIME VERIFICATION |

## Safest preservation strategy

The following is a future implementation strategy, not an implementation:

1. **Preserve the server-first chain atomically:** root loader → cookie theme → SSR metadata/body attribute → inline `themeStyles` → root `ThemeProvider`. Do not replace it with a client-only local-storage effect, because that would discard the present first-paint advantage.
2. **Keep the keys `dark` and `light` while adapting palette values.** Many JS branches and CSS selectors use the literals. Change approved semantic token values in `app/components/theme-provider/theme.js` before scattering new color literals through components.
3. **Keep the semantic token names.** They are the stable consumer interface across global, component, layout, and route styles.
4. **Centralize and validate the cookie contract during hardening.** The loader and `/api/set-theme` action must continue to share name/flags/secret/expiry, and only exported theme keys should be persisted. Require a real `SESSION_SECRET`; never write its value to source or audit artifacts.
5. **Preserve optimistic toggling and test failure rollback.** Keep body metadata/context in sync and verify action failure, blocked cookie, expired/tampered cookie, and back/forward behavior before release.
6. **Preserve nested-provider and `data-invert` semantics** until the new section backgrounds and fixed-nav contrast are tested. If the geometry algorithm changes, verify every fixed navbar item over every inverse section in both themes.
7. **Audit non-token surfaces together:** root hard-coded `theme-color` hexes (`app/root.jsx:108-113`), dark-only error document, favicon system query, manifest colors, theme-specific project images, and WebGL lighting.
8. **Retain mobile access and reduced-motion gating.** Verify the toggle in short landscape layouts and decide explicitly whether the remaining global color transition is acceptable under reduced motion.
9. **Use a release matrix:** SSR/no JS, hydration, hard reload, internal route navigation, browser back/forward, both themes, mobile portrait/landscape, reduced motion, forced colors, error boundary, cookie disabled/tampered, slow network, and WebGL-capable/incapable devices.

The existing seams named in steps 1-8 are **CONFIRMED BY LOCAL REPOSITORY**. The ordering and “preserve as a unit” recommendation are **STRONG INFERENCE** based on the consumer graph and flash-regression risk.

## Unresolved findings and safest verification

- **Production secret/config health:** verify only the presence/rotation policy of `SESSION_SECRET` in Cloudflare, without revealing it. Human owner/security review is required. **Evidence classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION.**
- **Actual wrong-theme flash:** record first paint and hydration with dark/light cookies, cold cache, throttling, JS disabled, and blocked cookies. Visual/browser review is required. **Evidence classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION.**
- **View-transition composition:** observe theme toggles during route transitions and Contact/form submissions across supporting/fallback browsers. **Evidence classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION.**
- **Color contrast:** calculate rendered contrast for text, light text, links, errors, disabled states, focus outlines, selected controls, nav inversion, and browser autofill in both themes. Human accessibility sign-off is required. **Evidence classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION.**
- **WebGL/theme cost:** profile sphere initialization, frame behavior, memory, and theme toggling under reduced motion and low-power/mobile devices. **Evidence classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION.**
- **System-preference product choice:** repository evidence says it is unsupported; whether DonewithDan should add “system” is a future Daniel decision, not an inferred requirement. Existing dark/light work can continue without it. **Evidence classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION.**

## Audit disposition

Reuse the server-rendered cookie theme system and token architecture, then adapt palette/content and harden its validation/configuration. Do not move theme initialization into a post-hydration effect, rename theme keys casually, or remove nested provider/inversion behavior before testing all consumers. **Evidence classification: STRONG INFERENCE.**
