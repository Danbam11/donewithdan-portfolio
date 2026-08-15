# 01 — Repository map

## Scope and evidence convention

This is a static map of the repository at `C:\Users\DanBam\Documents\GitHub\donewithdan-portfolio` on branch `wireframe-prototype`. It records the current Hamish Williams application as the technical foundation; it does not describe an implemented DonewithDan redesign.

Every conclusion uses one of the required evidence classifications:

- **CONFIRMED BY LOCAL REPOSITORY** — directly expressed by tracked source, configuration, assets, or reference material.
- **STRONG INFERENCE** — supported by source structure or framework convention, but not exercised in a browser or build during this audit.
- **UNRESOLVED / NEEDS RUNTIME VERIFICATION** — static inspection cannot settle the behavior; the safest later verification is stated.

## Architecture at a glance

| Concern | Finding | Definition and consumers | Evidence classification |
| --- | --- | --- | --- |
| Application framework | Remix 2 on React 18, built through Vite | Dependencies are declared in `package.json:19-33`; `vite.config.js:1-38` installs the Remix, Cloudflare dev-proxy, MDX, and jsconfig-path plugins. `app/root.jsx:80-140` is the document/application shell and renders the route `<Outlet />`. | CONFIRMED BY LOCAL REPOSITORY |
| Runtime and hosting | Cloudflare Pages/Workers is the server target | `functions/[[path]].js:1-5` creates a Cloudflare Pages handler from `build/server`; `package.json:12-17` uses Wrangler for local serving and deployment; `wrangler.toml:1-3` declares a KV binding. | CONFIRMED BY LOCAL REPOSITORY |
| Package manager | npm with lockfile format 3 | `package-lock.json:1-3` names the package and records `lockfileVersion: 3`; all scripts in `package.json:9-17` use npm-compatible commands. | CONFIRMED BY LOCAL REPOSITORY |
| JavaScript module model | ESM application with CommonJS tooling where required | `package.json:8` sets `"type": "module"`; PostCSS, ESLint, and helper scripts remain `.cjs` (`postcss.config.cjs`, `.eslintrc.cjs`, `scripts/*.cjs`). | CONFIRMED BY LOCAL REPOSITORY |
| Styling | CSS Modules plus PostCSS custom media and global token data | `postcss.config.cjs:1-8` loads `app/global.module.css`; nearly every component/route imports a colocated `*.module.css`. `app/global.module.css:1-10` defines shared responsive/motion media aliases. | CONFIRMED BY LOCAL REPOSITORY |
| Design tokens and themes | JavaScript token objects are serialized into inline CSS custom properties | `app/components/theme-provider/theme.js:3-143` defines base, responsive, dark, and light tokens; `createThemeProperties`, `createMediaTokenProperties`, and `themeStyles` in `app/components/theme-provider/theme-provider.jsx:48-183` generate the CSS consumed by `app/root.jsx:114-120`. | CONFIRMED BY LOCAL REPOSITORY |
| Motion | Framer Motion, CSS transitions/keyframes, Intersection Observer, and native View Transitions are combined | `package.json:25` supplies Framer Motion. `app/components/transition/transition.jsx:1-103` provides presence/status orchestration, `app/routes/home/home.jsx:58-92` reveals sections with Intersection Observer, and internal link wrappers opt into `unstable_viewTransition` (`app/components/button/button.jsx:13-27`, `app/components/link/link.jsx:14-42`). | CONFIRMED BY LOCAL REPOSITORY |
| 3D/media | Three.js and `three-stdlib` power shared device models and route-specific scenes | Dependencies are in `package.json:32-33`; shared loaders/cleanup are in `app/utils/three.js:1-83`; `app/components/model/model.jsx:57-528` owns the reusable device renderer. | CONFIRMED BY LOCAL REPOSITORY |
| Content | Homepage/project content is source-authored JSX/config; articles are source-authored MDX | Homepage content is passed inline from `Home` (`app/routes/home/home.jsx:94-172`) and from `app/config.json:1-10`; the two article documents are `app/routes/articles.hello-world.mdx` and `app/routes/articles.modern-styling-in-react.mdx`, discovered by `getPosts` at `app/routes/articles_._index/posts.server.js:3-25`. | CONFIRMED BY LOCAL REPOSITORY |

### Runtime-version inconsistency

`package.json:66-68` requires Node `>=19.9.0`, and `README.md:10-21` also tells contributors to use Node 19.9.0 or newer, while `.node-version:1` pins `18.0.0`.

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.** The source files disagree. Which value the current deployment or developer machine actually uses is **UNRESOLVED / NEEDS RUNTIME VERIFICATION**. After implementation work is authorized, verify with the selected runtime manager and the Cloudflare build settings; human review is required before changing either constraint.

## Top-level directory and file map

```text
donewithdan-portfolio/
├── .storybook/             Storybook manager, preview, decorators, and Vite setup
├── app/                    Remix application source
│   ├── assets/             Bundled fonts, images, videos, GLB models, and HDR maps
│   ├── components/         Reusable UI, media, motion, theme, and 3D primitives
│   ├── hooks/              Browser, viewport, scrolling, interval, and form hooks
│   ├── layouts/            Error, navbar, article-post, and project-page compositions
│   ├── routes/             Remix route modules and route-owned source/assets/styles
│   ├── config.json         Site identity, role, disciplines, social handles, and URL
│   ├── global.module.css   Global media aliases/base rules
│   ├── reset.module.css    Element reset
│   ├── root.jsx            Root loader, document shell, providers, global navigation
│   └── root.module.css     Route-loading fade and skip-link styles
├── functions/              Cloudflare Pages request adapter
├── public/                 Public metadata, icons, static article media, headers
├── references/             Approved source screenshots and section decisions
├── scripts/                Development banner and Draco-copy helpers
├── docs/audit/             Audit-only documentation output
├── package.json            Scripts and dependency declarations
├── package-lock.json       npm dependency lock
├── vite.config.js          Remix/Vite/MDX route and asset configuration
├── postcss.config.cjs      PostCSS configuration
├── wrangler.toml           Cloudflare binding configuration
├── jsconfig.json           `~/*` → `app/*` import alias
├── .eslintrc.cjs           ESLint/React/hooks/JSX-a11y rules
├── .prettierrc             Formatting policy
├── .node-version           Local runtime hint (currently inconsistent)
├── .dev.vars.example       Environment-variable names and placeholders
└── README.md               Project identity and operational instructions
```

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.** The map comes from tracked paths. Two additional local directories, `node_modules/` and `.wrangler/`, were observed but are excluded by `.gitignore:1-8`; they are installed/generated state, not application source. `build/`, `public/draco/`, and `storybook-static/` are also excluded (`.gitignore:4,10-11`) and were not generated during this audit.

## Application entry and ownership flow

```text
Cloudflare request
  → functions/[[path]].js::onRequest
    → generated build/server
      → app/root.jsx::loader + App
        ├── ThemeProvider
        ├── Progress
        ├── global Navbar
        └── <main><Outlet /></main>
              ├── home route → Intro → three ProjectSummary instances → Profile → Footer
              ├── contact route → Contact form/success state → Footer
              ├── project routes → shared layouts/project primitives → Footer
              ├── uses route → shared layouts/project primitives → Footer
              ├── article index → article cards → Footer
              └── article children → layouts/post + MDX provider → Footer
```

The Cloudflare handler imports generated output (`functions/[[path]].js:1-5`); `app/root.jsx:49-78` performs root data loading and `app/root.jsx:103-139` owns the HTML document. Global navigation and route-loading UI are deliberately outside the route outlet at `app/root.jsx:120-133`. Route compositions import shared primitives through `~/*`, whose mapping is defined by `jsconfig.json:2-8` and activated in `vite.config.js:6,36`.

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

No repository-owned `entry.client.*` or `entry.server.*` file exists. The use of Remix defaults is therefore a **STRONG INFERENCE** based on the missing overrides and the Remix Vite setup. If entry behavior needs modification later, first inspect the effective generated/default entry for the locked dependency version; do not create an override merely because one is absent.

## `app/` source areas

| Area | Purpose and important relationships | Evidence classification |
| --- | --- | --- |
| `app/root.jsx` | Root loader creates the theme session and canonical URL (`loader`, lines 49-78). `App` mounts `ThemeProvider`, `Progress`, skip link, `Navbar`, route outlet, `ScrollRestoration`, and scripts (lines 80-140). `ErrorBoundary` replaces the normal shell on root failures (lines 142-163). | CONFIRMED BY LOCAL REPOSITORY |
| `app/routes/` | Flat-route modules. Route folders colocate a thin `route.js`/`route.jsx`, implementation JSX, CSS Module, and route-specific scene files. Exact URL hierarchy is in `02-route-and-window-map.md`. | CONFIRMED BY LOCAL REPOSITORY |
| `app/components/` | Reusable presentation and behavior. Each directory exposes a barrel `index.js`; fifteen components also have `*.stories.jsx` files. Consumers span routes and layouts rather than being route-private. | CONFIRMED BY LOCAL REPOSITORY |
| `app/layouts/` | Higher-level reusable compositions: `navbar` is owned by root; `project` is consumed by all three project routes and `/uses`; `post` is consumed by the article parent; `error` is consumed by root and the splat route. Import call sites: `app/root.jsx:17-20`, `app/routes/projects.slice/slice.jsx:26-37`, `app/routes/projects.smart-sparrow/smart-sparrow.jsx:51-62`, `app/routes/projects.volkihar-knight/volkihar-knight.jsx:26-37`, `app/routes/uses/uses.jsx:7-16`, and `app/routes/articles/route.jsx:4`. | CONFIRMED BY LOCAL REPOSITORY |
| `app/hooks/` | Shared client behavior: form state, mounted/hydrated state, interval, Intersection Observer, parallax, previous value, hash scrolling, and viewport measurement. `app/hooks/index.js:1-8` barrels all except `useHydrated`, which homepage files import directly. | CONFIRMED BY LOCAL REPOSITORY |
| `app/utils/` | Pure helpers plus browser/Three loaders: style conversion, metadata, image source resolution, Three cleanup/loading, throttle, date/timecode, clamp, and delay. Concrete consumers are mapped below. | CONFIRMED BY LOCAL REPOSITORY |
| `app/assets/` | Vite-bundled assets imported from JSX: 61 JPG, 46 PNG, 7 HDR, 6 MP4, 4 GLB, and 7 WOFF2 files were discovered. Naming groups assets by feature (`spr-*`, `slice-*`, `volkihar-*`, `gamestack-*`, `profile-*`). | CONFIRMED BY LOCAL REPOSITORY |
| `app/global.module.css` / `app/reset.module.css` | Global base layer, focus rules, shared keyframes, touch/motion media aliases, and reset. Imported once by `app/root.jsx:23-24`; also imported into Storybook by `.storybook/preview.jsx:2-5`. | CONFIRMED BY LOCAL REPOSITORY |
| `app/config.json` | Central original identity/role/discipline/social/repository data. Consumers include homepage (`app/routes/home/home.jsx:19`, `intro.jsx:12`), navbar data/layout (`app/layouts/navbar/nav-data.js:1`, `navbar.jsx:13`), footer (`app/components/footer/footer.jsx:4`), root (`app/root.jsx:21`), and metadata (`app/utils/meta.js:1`). | CONFIRMED BY LOCAL REPOSITORY |

## Route-source organization

| Route source | Composition | Related styles/assets | Evidence classification |
| --- | --- | --- | --- |
| `app/routes/home/` | `route.js` re-exports `Home`; `home.jsx` composes `Intro`, `ProjectSummary`, `Profile`, and `Footer` (`home.jsx:13-20,49-174`). | Four CSS Modules/GLSL pair plus `katakana.svg`; homepage images are imported from `app/assets/`. | CONFIRMED BY LOCAL REPOSITORY |
| `app/routes/contact/` | `route.js:1` re-exports `Contact`, `meta`, and `action`; `contact.jsx` contains the server action and client form. | `contact.module.css`; shared input/button/decoder/footer primitives. | CONFIRMED BY LOCAL REPOSITORY |
| `app/routes/projects.slice/` | Thin route export plus one case-study component built from `layouts/project` (`slice.jsx:24-41,52-202`). | `slice.module.css`; `app/assets/slice-*`. | CONFIRMED BY LOCAL REPOSITORY |
| `app/routes/projects.smart-sparrow/` | Thin route export plus a long case study; lazily imports `Earth`/`EarthSection` (`smart-sparrow.jsx:68-70`) and nests theme-aware content. | `smart-sparrow.module.css`, `earth.jsx`, `earth.module.css`; `app/assets/spr-*`, `earth.glb`, Milky Way maps. | CONFIRMED BY LOCAL REPOSITORY |
| `app/routes/projects.volkihar-knight/` | Thin route export plus case study; lazily imports shared `Carousel` and route-owned `Armor` (`volkihar-knight.jsx:44-48`). | Three CSS Modules/SVG; `app/assets/volkihar-*` and `volkihar-knight.glb`. | CONFIRMED BY LOCAL REPOSITORY |
| `app/routes/uses/` | Thin route export plus project-layout-based tools page (`uses.jsx:7-18,27-166`). | `uses.module.css`; `uses-background.mp4` and placeholder. | CONFIRMED BY LOCAL REPOSITORY |
| `app/routes/articles_._index/` | Standalone `/articles` index with server loader. `getPosts` uses `import.meta.glob` and the Remix server build to enumerate MDX (`posts.server.js:3-25`). | `articles.module.css`; article banners live under `public/static/`. | CONFIRMED BY LOCAL REPOSITORY |
| `app/routes/articles/` plus `articles.*.mdx` | Parent loader dynamically loads the requested MDX/frontmatter and wraps `<Outlet />` in `Post` and `MDXProvider` (`app/routes/articles/route.jsx:1-38`). | `app/layouts/post/*`; two current MDX documents and matching `public/static/*` banners/placeholders/OG images. | CONFIRMED BY LOCAL REPOSITORY |
| `app/routes/api.set-theme.js` | Action-only resource route updates the theme session cookie (`action`, lines 3-30); root calls it with `useFetcher` (`app/root.jsx:82-93`). | No route UI/style. | CONFIRMED BY LOCAL REPOSITORY |
| `app/routes/$.jsx` | Catch-all loader throws a 404 and its route boundary renders the shared error layout (`$.jsx:1-16`). | `app/layouts/error/*`; `app/assets/notfound.*`, `flatline.*`. | CONFIRMED BY LOCAL REPOSITORY |

## Reusable component map

| Component group | Definitions | Principal consumers and relationship | Evidence classification |
| --- | --- | --- | --- |
| Layout/content primitives | `section`, `heading`, `text`, `divider`, `list`, `table`, `visually-hidden` | Used throughout homepage, contact, project, post, error, and article index. `Section` supplies responsive outer padding (`app/components/section/section.module.css:2-31`); typography/layout components keep route JSX semantic. | CONFIRMED BY LOCAL REPOSITORY |
| Navigation/actions | `button`, `link`, `icon`, `monogram`, `segmented-control` | `Button` selects native anchor/button or Remix Link and adds View Transition/prefetch for internal destinations (`button.jsx:9-27,30-100`). `Link` makes external destinations safe and also opts internal links into View Transitions (`link.jsx:6-42`). Navbar consumes icons/monogram and project routes consume segmented control. | CONFIRMED BY LOCAL REPOSITORY |
| Motion/loading | `transition`, `decoder-text`, `loader`, `progress` | `Transition` maps presence to `entering`/`entered`/`exiting`/`exited` for CSS consumers (`transition.jsx:37-103`). `DecoderText` drives katakana-to-value glyph decoding (`decoder-text.jsx:8-100`). `Progress` reflects Remix navigation state (`progress.jsx:5-58`). | CONFIRMED BY LOCAL REPOSITORY |
| Responsive media | `image` | Intersection-gates full-resolution images, swaps placeholders, controls MP4 play/pause, honors reduced motion, and provides the accent block reveal (`image.jsx:11-215`; `image.module.css:14-39,49-102`). Consumed by profile, projects, articles, post, and error layouts. | CONFIRMED BY LOCAL REPOSITORY |
| 3D device preview | `model` and `model/device-models.js` | `deviceModels` maps laptop/phone to `macbook-pro.glb`/`iphone-11.glb` and animation types (`device-models.js:1-23`). Homepage `ProjectSummary` lazy-loads `Model` (`project-summary.jsx:17-19,101-170`). | CONFIRMED BY LOCAL REPOSITORY |
| WebGL carousel | `carousel` | Lazy-loaded only by the Volkihar project (`volkihar-knight.jsx:44-46,158-184`); it owns separate carousel shaders and pointer/keyboard controls. | CONFIRMED BY LOCAL REPOSITORY |
| Theme context | `theme-provider` | Root supplies the session theme (`app/root.jsx:119-134`), Navbar toggles it, homepage sphere/model decoration reads it, and Smart Sparrow nests it for inverse sections (`smart-sparrow.jsx:49-50,87-94`). | CONFIRMED BY LOCAL REPOSITORY |

The Storybook configuration only discovers `app/**/*.stories.*` (`.storybook/main.js:3-11`). Fifteen story files are present across shared components; there are no `*.test.*` or `*.spec.*` files under `app/` and no test script in `package.json:9-17`.

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.** This establishes absence in the inspected tree, not proof that behavior is correct. Future interaction/accessibility verification still requires browser tests.

## Hooks and utility relationships

| Definition | What it supplies | Direct consumers | Evidence classification |
| --- | --- | --- | --- |
| `app/hooks/useInViewport.js:3-34` | Intersection Observer state with optional one-shot unobserve | `Image`, `Model`, `Carousel`, hero `DisplacementSphere`, Smart Sparrow `Earth`, Volkihar `Armor`. | CONFIRMED BY LOCAL REPOSITORY |
| `app/hooks/useWindowSize.js:3-60` | Resize state with an iOS `100vh` ruler | Navbar, homepage project ordering, hero sphere, article grid, Smart Sparrow Earth. | CONFIRMED BY LOCAL REPOSITORY |
| `app/hooks/useScrollToHash.js:5-42` | Reduced-motion-aware `scrollIntoView`, delayed hash update, and callback | Navbar, hero scroll indicators, article post header. | CONFIRMED BY LOCAL REPOSITORY |
| `app/hooks/useParallax.js:4-38` | rAF-throttled window-scroll offset disabled for reduced motion | Shared `ProjectBackground` and article `Post` banner. | CONFIRMED BY LOCAL REPOSITORY |
| `app/hooks/useInterval.js:3-19` / `usePrevious.js:3-11` | Timer and previous-value helpers | Hero discipline cycling and theme-reset logic (`app/routes/home/intro.jsx:23-46`). | CONFIRMED BY LOCAL REPOSITORY |
| `app/hooks/useHydrated.js:3-13` / `useHasMounted.js:3-11` | SSR/client gates | Homepage lazy WebGL (`intro.jsx:31,66-70`; `project-summary.jsx:38,111-129,141-168`) and video output in `Image` (`image.jsx:85,151-174`). | CONFIRMED BY LOCAL REPOSITORY |
| `app/hooks/useFormInput.js:3-38` | Controlled input value plus native-validity handoff | Contact form (`app/routes/contact/contact.jsx:96-103,136-159`) and its Input story. | CONFIRMED BY LOCAL REPOSITORY |
| `app/utils/style.js:4-79` | Breakpoints, unit conversion, CSS custom-property adapter, class joining, Three color conversion | Imported broadly across shared components/layouts and all visually complex routes. | CONFIRMED BY LOCAL REPOSITORY |
| `app/utils/three.js:1-83` | Cached Draco GLTF/texture loaders and renderer/scene/material cleanup | Shared device `Model`, hero sphere, carousel, Earth, and Armor. | CONFIRMED BY LOCAL REPOSITORY |
| `app/utils/image.js:5-80` | Browser-native responsive source selection for textures/video | `Image`, `Model`, and `Carousel`. | CONFIRMED BY LOCAL REPOSITORY |
| `app/utils/meta.js:1-34` | Shared Open Graph/Twitter/document metadata arrays | Home, contact, uses, projects, and articles. | CONFIRMED BY LOCAL REPOSITORY |
| `app/utils/timecode.js:4-27`, `date.js:1-7` | Reading-duration and date formatting | Article index, article parent loader, and post layout. | CONFIRMED BY LOCAL REPOSITORY |
| `app/utils/clamp.js:1-10`, `delay.js:1-3`, `throttle.js`, `timecode.js` | Small animation/input helpers | Post/Earth, DecoderText, Three pointer listeners, and articles respectively. | CONFIRMED BY LOCAL REPOSITORY |
| `app/utils/mdx.js:1-11` | Legacy filesystem lookup aimed at `src/posts` | No imports or call sites were found, and `src/posts` does not exist. Current article discovery instead uses `app/routes/articles_._index/posts.server.js`. | CONFIRMED BY LOCAL REPOSITORY |

`app/utils/mdx.js` should not be treated as the current article source of truth. Whether it can be removed is **UNRESOLVED / NEEDS RUNTIME VERIFICATION** because external tooling not represented in the repository could theoretically import it; the safest later check is a full import graph plus authorized build before removal, with human review if article infrastructure is changing.

## Styles, breakpoints, and fonts

- Shared custom media are `desktop 2080`, `laptop 1680`, `tablet 1040`, `mobile 696`, `mobile landscape height 696`, and `mobile small 400`, plus motion and pointer-capability queries (`app/global.module.css:1-10`). The same numeric width breakpoints are exported to JavaScript by `media` (`app/utils/style.js:1-10`). **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**
- Global background, horizontal-overflow prevention, selection, and focus-ring behavior are in `app/global.module.css:12-49`; global `fade-in` and accent `reveal` keyframes are at lines 51-81. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**
- Theme CSS is injected in the document head before linked styles (`app/root.jsx:103-117`), and responsive token media rules are generated by `createMediaTokenProperties` (`theme-provider.jsx:79-116`). **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**
- Seven font files live in `app/assets/fonts/`. `theme-provider.jsx:1-7,118-173` maps six Gotham faces plus IPA Gothic; root preloads Gotham Medium and Book (`app/root.jsx:14-15,26-40`). **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**
- The CSS is organized into declared cascade layers `theme`, `base`, `components`, and `layout` (`theme-provider.jsx:98-100`), and individual modules explicitly join the appropriate layer. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

## Asset map and pipelines

| Asset area | Source → consumer chain | Evidence classification |
| --- | --- | --- |
| Homepage project screens | `app/assets/spr-lesson-builder-dark*`, `gamestack-login*`, `gamestack-list*`, and `slice-app*` → imports in `app/routes/home/home.jsx:1-12` → texture props at lines 101-165 → `ProjectSummary` → `Model` → GLTF node named `Screen` (`app/components/model/model.jsx:388-427`). | CONFIRMED BY LOCAL REPOSITORY |
| Shared device models | `app/assets/macbook-pro.glb`, `iphone-11.glb` → `device-models.js:1-23` → homepage `ProjectSummary:104-170`. | CONFIRMED BY LOCAL REPOSITORY |
| Homepage portrait | `app/assets/profile.jpg`, `profile-large.jpg`, `profile-placeholder.jpg` → `Profile` imports (`profile.jsx:1-3`) → shared `Image` at lines 80-90. | CONFIRMED BY LOCAL REPOSITORY |
| Homepage decoration | `app/routes/home/katakana.svg` defines `katakana-project` and `katakana-profile` symbols (lines 1-9) → `ProjectSummary:14,50-62` and `Profile:15,91-93`. | CONFIRMED BY LOCAL REPOSITORY |
| Hero shaders | `app/routes/home/displacement-sphere-vertex.glsl` and `displacement-sphere-fragment.glsl` → raw imports in `displacement-sphere.jsx:22-23` → `MeshPhongMaterial.onBeforeCompile` at lines 70-80. | CONFIRMED BY LOCAL REPOSITORY |
| Project media | `app/assets/spr-*`, `slice-*`, and `volkihar-*` → their route components. Small/large/placeholder variants are supplied through `srcSet`, `sizes`, and `Image`; videos are local MP4s. | CONFIRMED BY LOCAL REPOSITORY |
| Route-specific 3D | `earth.glb` plus `milkyway*` maps → `projects.smart-sparrow/earth.jsx`; `volkihar-knight.glb` → `projects.volkihar-knight/armor.jsx`; carousel GLSL lives with `app/components/carousel/`. | CONFIRMED BY LOCAL REPOSITORY |
| Public article media | `public/static/*-banner.jpg`, placeholders, and `*-og.jpg` → MDX frontmatter (`articles.hello-world.mdx:1-6`, `articles.modern-styling-in-react.mdx:1-6`) and article loaders/layout. | CONFIRMED BY LOCAL REPOSITORY |
| Public metadata/PWA | `public/manifest.json`, icons/favicons, `social-image.png`, `site-preview.png`, `robots.txt`, `sitemap.xml`, `humans.txt`, and `_headers` → root link tags (`app/root.jsx:26-47`) and hosting. | CONFIRMED BY LOCAL REPOSITORY |
| Draco decoder | `scripts/draco.cjs:1-13` copies decoder files from Three into ignored `public/draco/`; home prefetches those URLs (`home.jsx:22-39`); `app/utils/three.js:7-15` configures the loader path. | CONFIRMED BY LOCAL REPOSITORY |

Vite explicitly includes `.glb`, `.hdr`, and `.glsl` and limits asset inlining to 1024 bytes (`vite.config.js:14-18`). Public caching rules mark built CSS/fonts/models/images/scripts/WASM immutable for one year (`public/_headers:11-26`).

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

## 3D and WebGL source map

| System | Owner and key symbols | Consumers/relationships | Evidence classification |
| --- | --- | --- | --- |
| Shared device renderer | `Model` and `Device` in `app/components/model/model.jsx:57-528`; `deviceModels` and `ModelAnimationType` in `device-models.js:4-23` | Homepage project previews. Scene/camera/lights/shadow render targets are initialized at `model.jsx:91-223`; responsive texture selection and GLTF loading occur at lines 371-427; phone spring-up and laptop-open animations are lines 430-488. | CONFIRMED BY LOCAL REPOSITORY |
| Hero sphere | `DisplacementSphere` in `app/routes/home/displacement-sphere.jsx:32-198` | Lazy-loaded by `Intro` only after hydration (`intro.jsx:16-18,66-70`); uses raw shaders, theme-dependent lighting, pointer springs, viewport pausing, resize, and Three cleanup. | CONFIRMED BY LOCAL REPOSITORY |
| Smart Sparrow Earth | `Earth`/`EarthSection` in `app/routes/projects.smart-sparrow/earth.jsx` | Lazy-loaded by Smart Sparrow (`smart-sparrow.jsx:68-70`); consumes Earth model, HDR maps, scroll/viewport/window hooks, and shared Three cleanup. | CONFIRMED BY LOCAL REPOSITORY |
| Volkihar armor | `Armor` in `app/routes/projects.volkihar-knight/armor.jsx` | Lazy-loaded by Volkihar (`volkihar-knight.jsx:48,115-120`); consumes route GLB, pointer/viewport motion, and shared Three utilities. | CONFIRMED BY LOCAL REPOSITORY |
| Image carousel | `Carousel` in `app/components/carousel/carousel.jsx` with colocated vertex/fragment shaders | Lazy-loaded only in Volkihar (`volkihar-knight.jsx:44-46,158-184`). | CONFIRMED BY LOCAL REPOSITORY |

Actual GPU fallback appearance, WebGL-context failure handling, and device performance were not run during this audit. They are **UNRESOLVED / NEEDS RUNTIME VERIFICATION**. The safest later method is browser testing on representative desktop, iOS, and Android devices with reduced-motion and forced WebGL failure, after implementation/testing is authorized; human visual review is required.

## Configuration, commands, Storybook, and quality tooling

| File/area | Static finding | Evidence classification |
| --- | --- | --- |
| `package.json:9-17` | Available scripts: Remix Vite build; dev banner plus Remix Vite dev; Wrangler Pages start; build+Wrangler deploy; Storybook dev/build/deploy. No lint or test script is declared. | CONFIRMED BY LOCAL REPOSITORY |
| `vite.config.js:14-38` | Vite port 7777; special binary/shader assets; MDX with image sizing, slugs, Prism, and frontmatter; Cloudflare proxy; manual `/` route registration; jsconfig paths. | CONFIRMED BY LOCAL REPOSITORY |
| `.storybook/main.js:3-34` | React-Vite Storybook with essentials, links, interactions, and accessibility addons; mirrors the special asset settings. | CONFIRMED BY LOCAL REPOSITORY |
| `.storybook/preview.jsx:1-40` | Reuses application reset/global/theme styles and exposes light/dark toolbar state. | CONFIRMED BY LOCAL REPOSITORY |
| `.eslintrc.cjs:7-62` | ESLint recommended + React, hooks, JSX-a11y, and Storybook rules. The config exists even though no npm lint script is declared. | CONFIRMED BY LOCAL REPOSITORY |
| `.prettierrc:1-8` | Formatting policy only; no formatting script is declared. | CONFIRMED BY LOCAL REPOSITORY |
| `references/` | One decision inventory and desktop/mobile/section screenshots provide a preserved baseline (`references/section-inventory.md:1-22`). Recordings are intentionally ignored (`.gitignore:12`). | CONFIRMED BY LOCAL REPOSITORY |

No build, lint, test, Storybook, formatter, development server, postinstall, or deploy command was run during this audit.

## Repository-map findings that require later care

1. `app/utils/mdx.js` points at nonexistent `src/posts` while the real article system uses route-local MDX discovery. Treat it as legacy until an authorized import/build verification proves otherwise. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY** for the mismatch; deletion safety is **UNRESOLVED / NEEDS RUNTIME VERIFICATION**.
2. Runtime documentation conflicts (`.node-version:1` versus `package.json:66-68` and `README.md:12`). Resolve before depending on a clean-environment build. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY**.
3. `app/config.json` remains an original-site identity hub with many consumers. DonewithDan replacement will require coordinated edits across metadata, navbar/socials, hero, footer, manifest/public metadata, and Storybook metadata; changing only the visible homepage would leave Hamish identity behind. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY**.
4. The repository contains mature reusable systems, but no source implementation for the frozen tool-strip/GAPS/HaircutDone requirements or the specified SYSTEM workflow. Only `references/section-inventory.md:9-16` names the future HaircutDone introduction and workflow-board replacements. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY** for absence/presence in the inspected tree. Remaining asset inputs and SYSTEM workflow behavior remain **UNRESOLVED / NEEDS RUNTIME VERIFICATION**.
5. `app/utils/meta.js:3,31` destructures and emits `twitter`, but `app/config.json:1-10` defines no `twitter` key (it defines Bluesky, Figma, and GitHub instead). The current `twitter:creator` content is consequently undefined unless an unrepresented transform supplies it. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY** for the source mismatch; emitted browser markup remains **UNRESOLVED / NEEDS RUNTIME VERIFICATION** until rendered metadata is inspected later.
