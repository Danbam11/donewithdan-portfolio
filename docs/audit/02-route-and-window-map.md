# 02 — Route and window map

## Scope and terminology

This document maps all Remix routes discovered statically, their data functions, entry points, and the actual page-transition mechanism. In this repository, “connected page” means a normal Remix route navigation enhanced with the browser View Transitions API. No separate browser window, modal route, portal route, or window-manager abstraction was found.

Evidence classifications used below are exactly:

- **CONFIRMED BY LOCAL REPOSITORY**
- **STRONG INFERENCE**
- **UNRESOLVED / NEEDS RUNTIME VERIFICATION**

## Route construction

Remix Vite performs normal filesystem route discovery and the repository also registers the homepage implementation manually as the root index:

- `vite.config.js:29-35` calls `route('/', 'routes/home/route.js', { index: true })`.
- `app/routes/home/route.js:1` re-exports `Home`, `meta`, and `links` from `home.jsx`.
- Folder routes such as `app/routes/contact/route.js` and dotted folders such as `app/routes/projects.slice/route.js` follow Remix flat-route naming.
- `app/routes/articles_._index/route.jsx` uses the trailing underscore on `articles_` to keep the `/articles` index out of the `routes/articles` layout; article detail files remain children of `app/routes/articles/route.jsx`.

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY** for the explicit index and file structure. The resulting flat-route parentage is corroborated by source imports and `public/sitemap.xml:1-38`; the framework-convention interpretation is a **STRONG INFERENCE** because the authorized audit did not run the Remix route/build command.

## Route hierarchy

```text
root — app/root.jsx
├── /                                  manual index → routes/home/route.js
├── /contact                           routes/contact/route.js
├── /uses                              routes/uses/route.js
├── /projects/smart-sparrow            routes/projects.smart-sparrow/route.js
├── /projects/slice                    routes/projects.slice/route.js
├── /projects/volkihar-knight          routes/projects.volkihar-knight/route.js
├── /articles                          routes/articles_._index/route.jsx
├── /articles                          routes/articles/route.jsx (detail-page parent/layout)
│   ├── /articles/hello-world          routes/articles.hello-world.mdx
│   └── /articles/modern-styling-in-react
│                                       routes/articles.modern-styling-in-react.mdx
├── /api/set-theme                     routes/api.set-theme.js (action/resource)
├── /home                              likely conventional alias → routes/home/route.js
└── /*                                 routes/$.jsx (404 splat)
```

All visible page routes are children of the root document. The two `/articles` entries serve different roles: the escaped standalone index renders the listing, while `routes/articles` is the parent layout for concrete MDX children.

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY** for the root, `/`, sitemap-listed destinations, action endpoint, article parent/children, and splat. The undocumented `/home` alias is a **STRONG INFERENCE** explained separately below.

## Complete route inventory

| URL or pattern | Route file and symbols | Parent/child relationship | Loader/action | Known entry points | Evidence classification |
| --- | --- | --- | --- | --- | --- |
| Root document (all routes) | `app/root.jsx`; `loader` at lines 49-78, `App` at 80-140, `ErrorBoundary` at 142-163 | Root of every branch | Loader reads URL/theme session and commits the session cookie | Cloudflare handler `functions/[[path]].js:1-5` sends all application requests into the Remix build | CONFIRMED BY LOCAL REPOSITORY |
| `/` | `app/routes/home/route.js:1` → `Home`, `meta`, `links` in `app/routes/home/home.jsx:22-174` | Manual root index, child of root | No route loader/action; `links` prefetches Draco; `meta` uses `baseMeta` | Navbar logo from non-home routes (`navbar.jsx:144-154`); root links and error/contact return buttons; direct URL | CONFIRMED BY LOCAL REPOSITORY |
| `/home` | Same `app/routes/home/route.js:1` | Conventionally discovered sibling of manual root index | Same as `/` | No navbar, component, sitemap, or content link targets it | STRONG INFERENCE |
| `/contact` | `app/routes/contact/route.js:1` → `Contact`, `meta`, `action` in `contact.jsx` | Leaf child of root | `action` validates and sends via SES (`contact.jsx:29-94`) | Desktop/mobile `Contact` nav item (`nav-data.js:16-19`); Profile “Send me a message” (`profile.jsx:58-66`); `/uses` inline link (`uses.jsx:53-57`) | CONFIRMED BY LOCAL REPOSITORY |
| `/uses` | `app/routes/uses/route.js:1` → `Uses`, `meta` in `uses.jsx:20-166` | Leaf child of root | None | Profile prose “uses page” (`profile.jsx:23-29`) | CONFIRMED BY LOCAL REPOSITORY |
| `/projects/smart-sparrow` | `app/routes/projects.smart-sparrow/route.js:1` → `SmartSparrow`, `meta` | Leaf child of root; there is no `projects` parent route | None | Homepage project 01 internal button (`home.jsx:101-120`) | CONFIRMED BY LOCAL REPOSITORY |
| `/projects/slice` | `app/routes/projects.slice/route.js:1` → `Slice`, `meta` | Leaf child of root; there is no `projects` parent route | None | Homepage project 03 internal button (`home.jsx:146-165`) | CONFIRMED BY LOCAL REPOSITORY |
| `/projects/volkihar-knight` | `app/routes/projects.volkihar-knight/route.js:1` → `VolkiharKnight`, `meta` | Leaf child of root; there is no `projects` parent route | None | Profile prose “make mods” (`profile.jsx:30-33`) | CONFIRMED BY LOCAL REPOSITORY |
| `/projects` | No matching source route exists | Would not be a project index; expected to fall through to `*` | Splat loader would throw 404 | No current entry point | STRONG INFERENCE |
| `/articles` | `app/routes/articles_._index/route.jsx`; `loader`, `meta`, default re-export (`route.jsx:1-21`) | Standalone root child because `articles_` breaks layout nesting | Loader calls `getPosts`, selects featured item, returns JSON (`route.jsx:5-10`) | Desktop/mobile `Articles` nav item (`nav-data.js:12-15`) | CONFIRMED BY LOCAL REPOSITORY |
| `/articles` detail parent | `app/routes/articles/route.jsx`; `loader`, `meta`, `Articles` layout (`route.jsx:1-38`) | Root child and parent of both MDX routes; its `<Outlet />` is wrapped by `MDXProvider` and `Post` | Loader derives the last URL segment, dynamically imports matching MDX and raw text, calculates timecode/OG image (`route.jsx:9-20`) | Entered through child links from the listing | CONFIRMED BY LOCAL REPOSITORY |
| `/articles/hello-world` | `app/routes/articles.hello-world.mdx:1-56` | Child of `routes/articles`; renders inside its `<Outlet />` | Parent loader supplies frontmatter/timecode; MDX frontmatter supplies title, abstract, date, and banner (`lines 1-6`) | Article card generated by `getPosts` and `ArticlesPost` (`posts.server.js:3-25`; `articles.jsx:58-86`) | CONFIRMED BY LOCAL REPOSITORY |
| `/articles/modern-styling-in-react` | `app/routes/articles.modern-styling-in-react.mdx:1-297` | Child of `routes/articles`; renders inside its `<Outlet />` | Parent loader; MDX frontmatter also marks the post featured (`lines 1-6`) | Featured article card from `/articles` (`articles.jsx:17-93,165-180`) | CONFIRMED BY LOCAL REPOSITORY |
| `POST /api/set-theme` | `app/routes/api.set-theme.js`; `action` at lines 3-30 | Action/resource leaf under root; no default UI export | Reads `theme`, updates `__session`, returns JSON and `Set-Cookie` | `App.toggleTheme` submits with root `useFetcher` (`app/root.jsx:81-93`); Navbar `ThemeToggle` consumes the context callback | CONFIRMED BY LOCAL REPOSITORY |
| `/*` | `app/routes/$.jsx`; `loader`, `meta`, route `ErrorBoundary` | Splat leaf under root | Loader always throws 404 (`lines 4-5`) | Any unmatched path, including likely `/projects` | CONFIRMED BY LOCAL REPOSITORY |

### The probable `/home` alias

`app/routes/home/route.js` is in a conventionally discoverable route folder, which normally maps to `/home`. `vite.config.js:29-35` separately adds the same file as a manual `/` index rather than excluding the conventional route. The public sitemap includes `/` but not `/home` (`public/sitemap.xml:2-5`), and all internal home links use `/`.

**Evidence classification: STRONG INFERENCE.** Static parsing of the locked Remix route convention indicates both route records can exist, but no build/server command was permitted. Safest later verification: after testing is authorized, run the framework's route-listing command without changing files, then request `/home` in a local browser. Human review is needed to decide whether an alias/redirect is intended before route configuration changes.

## Root loader, route outlet, and global surfaces

`App` renders the following in order:

1. `ThemeProvider`
2. navigation progress bar
3. skip link
4. global `Navbar`
5. `<main id="main-content">` containing `<Outlet />`
6. Remix `ScrollRestoration` and `Scripts`

This ownership is explicit at `app/root.jsx:103-139`. The navbar is therefore not a homepage section and does not unmount with the route outlet. The root main gets `data-loading={state === 'loading'}` at lines 126-133; `app/root.module.css:2-10` fades it to opacity zero while loading.

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

The root loader's canonical URL construction contains a conditional defect: `app/root.jsx:50-53` uses the full request `url` when the pathname does not end in `/`, then prefixes `config.url`. A request such as `/contact` can therefore produce a value shaped like `https://hamishw.comhttps://…/contact`. Whether an upstream redirect always masks that branch in production is **UNRESOLVED / NEEDS RUNTIME VERIFICATION**; inspect actual response HTML for slash and non-slash URLs later. The unsafe code path itself is **CONFIRMED BY LOCAL REPOSITORY**.

Article detail loading has a related slash sensitivity: `app/routes/articles/route.jsx:9-13` derives `slug` with `request.url.split('/').at(-1)`. A trailing-slash detail request can therefore supply an empty final segment to the dynamic import if no upstream/framework normalization occurs. **Evidence classification: STRONG INFERENCE.** Safest later verification is to request both slash forms and inspect response/redirect behavior; do not change the loader until that behavior is known.

## Navigation entry-point map

| Source | Destination behavior | Consumer/call site | Evidence classification |
| --- | --- | --- | --- |
| `navLinks` in `app/layouts/navbar/nav-data.js:3-20` | `Projects` → `/#project-1`; `Details` → `/#details`; `Articles` → `/articles`; `Contact` → `/contact` | Both desktop links (`navbar.jsx:156-174`) and mobile links (`navbar.jsx:175-201`) map the same array | CONFIRMED BY LOCAL REPOSITORY |
| Navbar monogram | On `/`, links to `/#intro`; elsewhere, links to `/` | `navbar.jsx:144-154` | CONFIRMED BY LOCAL REPOSITORY |
| Same-page hash navigation | Intercepts hash clicks on `/`, smooth-scrolls to an element, then updates the URL without normal scroll reset; reduced motion uses `auto` | `Navbar.handleNavItemClick` (`navbar.jsx:126-140`) → `useScrollToHash` (`app/hooks/useScrollToHash.js:5-42`); hero indicators use the same hook (`intro.jsx:30,48-51,114-140`) | CONFIRMED BY LOCAL REPOSITORY |
| Homepage project 01 | `/projects/smart-sparrow` via generic `ProjectSummary`/`Button` | Data at `home.jsx:101-120`; button call at `project-summary.jsx:92-96` | CONFIRMED BY LOCAL REPOSITORY |
| Homepage project 02 | External `https://gamestack.hamishw.com`, not a local route | `home.jsx:121-145`; `Button` chooses a normal anchor for external URLs (`button.jsx:9-16`) | CONFIRMED BY LOCAL REPOSITORY |
| Homepage project 03 | `/projects/slice` | `home.jsx:146-165` | CONFIRMED BY LOCAL REPOSITORY |
| Profile CTA | `/contact` | `profile.jsx:58-66` → internal `Button` | CONFIRMED BY LOCAL REPOSITORY |
| Profile inline links | `/uses`, `/projects/volkihar-knight`, and external Qwilr | `profile.jsx:23-33` → shared `Link` | CONFIRMED BY LOCAL REPOSITORY |
| Article cards | `/articles/${slug}` | `ArticlesPost` at `articles.jsx:58-86`; slugs come from the route manifest in `posts.server.js:3-21` | CONFIRMED BY LOCAL REPOSITORY |
| Error/contact return buttons | `/` | `error.jsx:111-121`; `contact.jsx:220-230` | CONFIRMED BY LOCAL REPOSITORY |

The approved future navbar labels (`Work`, `About`, `Contact`) and removal of `Articles` have not been applied. The current array remains the single shared desktop/mobile edit point.

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

## Connected-page and transition behavior

### What actually connects pages

Internal shared links opt into Remix/React Router's View Transitions integration:

- `Button` adds `unstable_viewTransition` and `prefetch="intent"` when `href` is internal (`app/components/button/button.jsx:13-27`).
- `Link` does the same for non-anchor/non-file internal destinations (`app/components/link/link.jsx:6-42`).
- Navbar desktop, mobile, and logo links opt in directly (`app/layouts/navbar/navbar.jsx:144-181`).
- Article cards opt in directly (`app/routes/articles_._index/articles.jsx:58-65`).
- The contact `<Form>` also opts in (`app/routes/contact/contact.jsx:107-114`).

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

No `view-transition-name`, `::view-transition-*`, or `document.startViewTransition` rule/call exists in `app/`. Consequently, the repository opts navigation into the browser/React Router mechanism but does not define named shared elements or a custom “connected window” choreography.

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY** for the absence of custom source and the opt-in attributes. The exact default crossfade and unsupported-browser fallback are **UNRESOLVED / NEEDS RUNTIME VERIFICATION** because they depend on the installed router and browser implementation. Safest later verification: keyboard- and pointer-navigate between `/`, `/contact`, and a project route in supported and unsupported browsers, with reduced motion enabled and disabled; human visual review is required.

### Loading layer around route transitions

`useNavigation` feeds two independent global responses:

- `App` fades the route outlet container through `data-loading` (`app/root.jsx:83,126-133`; `app/root.module.css:2-10`).
- `Progress` waits 500 ms before showing, tracks CSS animation completion, then hides 300 ms after completion (`app/components/progress/progress.jsx:5-58`; styles in `progress.module.css`).

`ScrollRestoration` remains mounted at the document level (`app/root.jsx:135,158`). There is no custom route-exit cache, scroll container, or manually retained previous route.

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

### Local transitions are not route windows

`app/components/transition/transition.jsx:1-103` uses Framer Motion `AnimatePresence`/`usePresence` only to provide lifecycle statuses to CSS. It controls hero words, mobile nav, contact success/error UI, image/model entrance, project decoration, and error screens. It does not own routing or retain a previous route tree.

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

## Contact destination

The current Contact experience is a separate `/contact` page, not an inline homepage form:

- Navbar entry: `app/layouts/navbar/nav-data.js:16-19`.
- Profile CTA: `app/routes/home/profile.jsx:58-66`.
- Route/action export: `app/routes/contact/route.js:1`.
- Visible heading: `DecoderText text="Say hello"` with no period (`contact.jsx:115-123`).
- Form and server action: `contact.jsx:29-94,96-237`.

Both required future entry points can continue targeting `/contact`; the Profile CTA already does, and both desktop/mobile nav render the same Contact data entry.

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

Whether `/contact` should retain that exact public path versus another connected-page slug is a product choice, but changing it is not required by repository evidence. Backend destination/provider/confirmation decisions remain outside this route map and are intentionally unresolved.

## Project and HaircutDone destination possibilities

### Existing case-study pattern

Each current project is an independent root-child leaf route named with Remix's dotted convention:

- `app/routes/projects.smart-sparrow/route.js:1`
- `app/routes/projects.slice/route.js:1`
- `app/routes/projects.volkihar-knight/route.js:1`

The thin route files re-export a colocated page and `meta`. All pages compose `ProjectContainer`, `ProjectBackground`, `ProjectHeader`, `ProjectSection`, responsive section/content/column primitives, images, and `Footer` from `app/layouts/project/project.jsx:15-188`. `ProjectBackground` includes reduced-motion-aware parallax via `useParallax` (`project.jsx:106-129`; `app/hooks/useParallax.js:4-38`), while `ProjectImage` delegates intersection-based reveal/loading to the shared `Image` component (`project.jsx:132-135`).

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

The future HaircutDone connected page has a clear architectural host: another independent `projects.<slug>` leaf using these shared project primitives, entered by an internal `Button`/`Link` so it receives the same View Transition, loading, navbar, theme, and scroll-restoration systems. A likely file convention would be `app/routes/projects.haircutdone/route.js`, but that exact slug and filename are not present.

**Evidence classification: STRONG INFERENCE.** Safest later verification is to agree the public URL with Daniel, then validate the proposed route against the authorized Remix route list before creating it. Human approval is required for the URL and content structure.

The homepage generic `ProjectSummary` receives its route as `buttonLink` and sends it to `Button` (`app/routes/home/project-summary.jsx:21-31,92-96`). Therefore “View the full system →” and “Explore HaircutDone →” can technically target one identical internal path without a routing rewrite. The current source has only one CTA per project summary; the second future action's owner has not yet been specified.

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY** for the link plumbing; the final two call sites are **UNRESOLVED / NEEDS RUNTIME VERIFICATION** until the approved section implementation identifies both owners.

No HaircutDone route, screenshot compilation, Loom embed, or “return to portfolio” control exists in application source. `references/section-inventory.md:9-10` only records “Adapt for HaircutDone introduction.”

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.** The precise chapter components, media sources, Loom URL/embed policy, and return target require Daniel's content/specification. The current Volkihar `Carousel` is a user-controlled route-local carousel, not a homepage or HaircutDone continuous photo strip (`volkihar-knight.jsx:44-46,158-184`); it should not be mistaken for the prohibited future strip.

## Error and fallback routes

- Unmatched paths reach `app/routes/$.jsx`; its `loader` throws a `404 Response`, and its route `ErrorBoundary` renders shared `Error` (`$.jsx:1-16`). Because this is a child route boundary, it appears in the normal root outlet with global root surfaces intact. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**
- `Error` distinguishes missing status (“flatlined”), 404, 405, and a default anomaly, and supplies media plus a return action (`app/layouts/error/error.jsx:14-38,40-163`). **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**
- Unexpected root failures use `app/root.jsx:142-163`, which emits a replacement HTML document containing `Error`, `ScrollRestoration`, and `Scripts` but not the normal `Navbar`/`ThemeProvider` tree. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**
- No dedicated `/404`, `/500`, project-index fallback, or route-level loading/skeleton module exists. The application uses the splat, root/route boundaries, global progress, and component-local loaders. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

## Public non-Remix endpoints

Files under `public/` are served directly rather than through route modules: `/manifest.json`, `/robots.txt`, `/sitemap.xml`, `/humans.txt`, favicons/icons, `/social-image.png`, `/site-preview.png`, and `/static/*` article media. Root link descriptors consume the manifest/icons/humans file (`app/root.jsx:26-47`), and `baseMeta` references `/social-image.png` (`app/utils/meta.js:1-10`).

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

## Verification boundaries

| Unknown | Why static inspection cannot settle it | Safest later verification | Human review | Evidence classification |
| --- | --- | --- | --- | --- |
| Whether `/home` is publicly reachable | It is implied by route discovery but omitted from all authored navigation and sitemap data | Run the Remix route lister and request `/home` after testing is authorized | Yes, to choose alias/redirect/removal policy | UNRESOLVED / NEEDS RUNTIME VERIFICATION |
| Exact native connected-page animation | No named transition CSS exists; behavior varies with router/browser support | Navigate representative routes in Chromium, Firefox, and Safari, with reduced motion on/off | Yes, visual sign-off | UNRESOLVED / NEEDS RUNTIME VERIFICATION |
| Focus destination after route changes | Links are semantic and main has `tabIndex={-1}`, but no explicit route-change focus effect was found | Keyboard-only route navigation with a screen reader; inspect active element | Yes, accessibility sign-off | UNRESOLVED / NEEDS RUNTIME VERIFICATION |
| Canonical URLs in deployed responses | Source has a malformed non-trailing-slash branch; upstream redirect behavior is not represented | Inspect rendered `<link rel="canonical">` for slash/non-slash requests | Yes, SEO decision if redirect/canonical policy changes | UNRESOLVED / NEEDS RUNTIME VERIFICATION |
| Article detail trailing-slash behavior | The loader takes the final raw URL segment, which may be empty after a slash | Request both forms of each article URL and inspect redirects/errors | Yes, before changing URL policy or loader logic | UNRESOLVED / NEEDS RUNTIME VERIFICATION |
| Final HaircutDone URL | No route or product decision exists | Daniel approves the public path before route creation | Yes | UNRESOLVED / NEEDS RUNTIME VERIFICATION |
