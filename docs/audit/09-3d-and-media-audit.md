# 09 — 3D and media audit

## Executive finding

The repository has five production Three/WebGL owners: the homepage displacement sphere, the reusable device `Model`, Smart Sparrow `Earth`, Volkihar `Armor`, and the image `Carousel`. They share loaders/disposal helpers but do not share a scene abstraction, renderer error boundary, or non-WebGL visual fallback. **Classification: CONFIRMED BY LOCAL REPOSITORY.**

The 3D laptop is the best-supported future HaircutDone gateway foundation. Its GLB, camera, light rig, contact-shadow passes, lid spring, pointer tilt, and screen-texture pipeline are already separated from the homepage project content, and a later change can supply HaircutDone screen assets through `ProjectSummary.model.textures`; no implementation is performed here. **Classification: STRONG INFERENCE** for the reuse recommendation, grounded in the confirmed separation at `app/routes/home/project-summary.jsx:101-170`, `app/components/model/model.jsx:57-527`, and `app/routes/home/home.jsx:94-170`.

## Dependencies and build path

- `three` `^0.161.0`, `three-stdlib` `^2.29.4`, and Framer Motion `11.0.5` are declared in `package.json:25,32-33`. Framer springs/`animate()` drive device, Earth, Armor, and Carousel motion. **Classification: CONFIRMED BY LOCAL REPOSITORY.**
- `vite.config.js:15-18` includes `.glb`, `.hdr`, and `.glsl` as assets and sets the inline limit to 1,024 bytes. The exact emitted names/URLs cannot be confirmed without the forbidden build command. **Classification: CONFIRMED BY LOCAL REPOSITORY** for configuration; **Classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION** for emitted output.
- `app/utils/three.js:1-16` enables the global Three `Cache`, configures one `GLTFLoader` with a `DRACOLoader` rooted at `/draco/`, and exports a shared `TextureLoader`. Homepage `links()` prefetches `/draco/draco_wasm_wrapper.js` and `/draco/draco_decoder.wasm` (`app/routes/home/home.jsx:22-39`). **Classification: CONFIRMED BY LOCAL REPOSITORY.**
- `scripts/draco.cjs:1-13`, invoked by `postinstall` (`package.json:13`), copies decoder files from Three into `public/draco`. This is an installation dependency, not something this audit ran or regenerated. **Classification: CONFIRMED BY LOCAL REPOSITORY.**

## Canvas ownership matrix

| Owner / consumer | Scene, camera, materials/shaders | Render policy and interaction | Mobile / reduced motion | Cleanup / risk | Classification |
|---|---|---|---|---|---|
| `DisplacementSphere`, lazy in `Intro` | Transparent `WebGLRenderer`; `PerspectiveCamera(54)` at z=52; directional/ambient lights; `SphereGeometry(32,128,128)`; `MeshPhongMaterial` replaced with custom vertex/fragment GLSL (`app/routes/home/displacement-sphere.jsx:51-110`; shader files `:1-244`/`:1-80`). | Continuous rAF while visible; time uniform, slow z rotation, throttled global mouse springs (`displacement-sphere.jsx:137-183`). | Object x/y branches at 696/1040; static single frame and no pointer listener under reduced motion. Canvas is `aria-hidden` (`:185-195`). | `cleanScene`/`cleanRenderer` and light removal run. No renderer-construction fallback. | CONFIRMED BY LOCAL REPOSITORY |
| Reusable `Model`, consumed by homepage `ProjectSummary` | Transparent renderer at pixel ratio 2; `PerspectiveCamera(36)`; ambient/key/fill lights; group of GLTF devices; 512² depth target plus a second blur target, orthographic shadow camera, modified `MeshDepthMaterial`, and horizontal/vertical blur shaders (`app/components/model/model.jsx:91-223`). | Event-driven two-pass contact-shadow + final render; Framer springs render on change. Global mousemove is throttled to 100 ms (`:225-325`). | Same camera pipeline; no touch/gyro interaction. Reduced motion skips pointer and model entrance/lid spring, then renders final state. | Explicitly disposes two targets, lights, scene, renderer, and spring subscriptions (`:213-221`). Async device loading and texture crossfade are not cancellation-safe. | CONFIRMED BY LOCAL REPOSITORY |
| Smart Sparrow `Earth`, lazy in its project route | Transparent renderer at ratio 1; `PerspectiveCamera(54)`; ACES tone mapping; ambient/directional lights; Draco GLTF; six-face HDR environment via `HDRCubeTextureLoader`/PMREM; JPG scene background; `OrbitControls` (`app/routes/projects.smart-sparrow/earth.jsx:190-240,330-405`). | Continuous rAF while visible updates GLTF mixer, controls, render, and projected DOM labels. Scroll chapters drive camera/meshes/clips/labels; desktop drag rotates (`:154-188,242-323,482-651`). | Controls disabled at ≤1040 and canvas ignores coarse-pointer events. Reduced motion skips clips and assigns camera directly, but rAF and some springs remain. | Cleans scene/renderer/lights and cancels main rAF; controls are not disposed, queued scroll rAF is not stored, and async loads can continue after unmount. | CONFIRMED BY LOCAL REPOSITORY |
| Volkihar `Armor`, consumed by `VolkiharKnight` | Transparent ratio-2 renderer; `PerspectiveCamera(36)`; ACES; three directional lights; GLB; six JPG cubemap faces converted through PMREM (`app/routes/projects.volkihar-knight/armor.jsx:59-149`). | Event-driven render on load, spring changes, and resize; mouse springs while in viewport (`:151-203`). | Mouse disabled for reduced motion; static final object. No touch motion. | Scene/renderer/lights/subscriptions cleaned, but delayed loader timer is not stored/cleared and async GLB/environment work has no mounted guard. | CONFIRMED BY LOCAL REPOSITORY |
| `Carousel`, consumed by `VolkiharKnight` | Opaque ratio-2 renderer; `OrthographicCamera`; textured plane with custom vertex/fragment shaders (`app/components/carousel/carousel.jsx:68-151`; shader files in `app/components/carousel/`). | A perpetual scheduler renders only while a Framer transition is active; buttons/dots/keys/swipe queue transitions (`carousel.jsx:153-242,261-410`). | Arrow controls hide at 696; swipe/dots remain. Reduced motion changes shader to crossfade but still springs progress. | Scene/renderer clean and loop cancels. Textures loaded after unmount are not disposed; interrupted drag listeners lack `pointercancel`/unmount cleanup. | CONFIRMED BY LOCAL REPOSITORY |

## Homepage hero scene

`Intro` lazy-loads `DisplacementSphere` only after hydration (`app/routes/home/intro.jsx:16-18,31,66-69`). The canvas is decorative and separate from the semantic hero text. Theme changes recreate the outer `Intro` transition and replace scene lights through the sphere's `[theme]` effect (`displacement-sphere.jsx:96-110`). **Classification: CONFIRMED BY LOCAL REPOSITORY.**

The vertex shader includes classic/perlin noise functions and computes turbulence/displacement (`app/routes/home/displacement-sphere-vertex.glsl:1-244`); the fragment shader incorporates Three's Phong chunks and custom procedural color (`displacement-sphere-fragment.glsl:1-80`). The visual is therefore not a video/image asset. **Classification: CONFIRMED BY LOCAL REPOSITORY.**

`WebGLRenderer` uses `failIfMajorPerformanceCaveat:true` but is created without `try/catch`; there is no alternate hero image or local error state. A disabled/failed WebGL context can therefore interrupt this component rather than deliberately falling back. Exact error-boundary behavior must be tested because React/route boundaries may catch it outside this component. **Classification: CONFIRMED BY LOCAL REPOSITORY** for the missing local fallback; **Classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION** for final user experience.

## Reusable laptop architecture

### Ownership and lazy boundary

`ProjectSummary` lazy-imports `Model` (`app/routes/home/project-summary.jsx:17-19`) and renders it only after hydration and after its section is visible (`:101-170`). Laptop uses camera `{x:0,y:0,z:8}`, a 700 ms show delay, and `deviceModels.laptop`; phone uses z=11.5, 300 ms, and two device records. `Home` owns project copy and texture records (`app/routes/home/home.jsx:94-170`). **Classification: CONFIRMED BY LOCAL REPOSITORY.**

`app/components/model/device-models.js:1-23` maps `macbook-pro.glb` to `LaptopOpen` and `iphone-11.glb` to `SpringUp`, including model scale/position. This is the scene's data boundary. **Classification: CONFIRMED BY LOCAL REPOSITORY.**

### Scene and contact shadow

`Model` creates one device group and a custom contact shadow. It renders scene depth into a 512×512 target, applies horizontal and vertical blur passes (twice), then restores normal materials/background and renders to screen (`app/components/model/model.jsx:123-208,225-280`). The shadow system depends on `WebGLRenderTarget`, `OrthographicCamera`, a modified `MeshDepthMaterial`, and `HorizontalBlurShader`/`VerticalBlurShader` from three-stdlib. **Classification: CONFIRMED BY LOCAL REPOSITORY.**

The renderer is hard-coded to pixel ratio 2 rather than clamped to `window.devicePixelRatio` or adjusted by device class (`model.jsx:94-106`). That provides predictable sharpness but can be expensive on large canvases; the contact-shadow targets add two more GPU surfaces. Impact needs profiling on the final viewport sizes. **Classification: CONFIRMED BY LOCAL REPOSITORY** for configuration; **Classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION** for cost.

### Screen texture source and replacement seam

Current laptop textures are supplied by `Home`, not embedded as final portfolio content:

- Smart Sparrow: `app/assets/spr-lesson-builder-dark.jpg`, `spr-lesson-builder-dark-large.jpg`, and `spr-lesson-builder-dark-placeholder.jpg`, imported at `app/routes/home/home.jsx:10-12` and passed at `:110-119`.
- Slice: `app/assets/slice-app.jpg`, `slice-app-large.jpg`, and `slice-app-placeholder.jpg`, imported at `home.jsx:7-9` and passed at `:155-164`.

**Classification: CONFIRMED BY LOCAL REPOSITORY.**

`Device` loads the placeholder and then the GLB sequentially: each loader call is individually awaited while constructing the `Promise.all` inputs (`app/components/model/model.jsx:392-395`). It traverses the GLB for a mesh named `Screen`, clones that mesh 0.001 units forward, applies the placeholder, resolves the browser-selected full-resolution source, applies it to the original screen, and fades the cloned placeholder from opacity 1 to 0 (`:371-428`). Texture settings include sRGB, `flipY=false`, maximum anisotropy, and no mipmap generation (`:372-384`). **Classification: CONFIRMED BY LOCAL REPOSITORY.**

This is the safest future HaircutDone seam: retain `Model`/`deviceModels.laptop` and supply a HaircutDone placeholder/srcset/sizes record from the future homepage content. The audit does not select or create that asset. **Classification: STRONG INFERENCE.**

### GLB structural contract

The screen replacement requires a traversed node exactly named `Screen` (`model.jsx:399-428`). The laptop lid spring searches only `gltf.scene.children` for a top-level node exactly named `Frame` (`:463-487`). If either name/hierarchy changes, `loadFullResTexture`, `playAnimation`, or `frameNode` can be undefined and the load path has no defensive fallback. **Classification: CONFIRMED BY LOCAL REPOSITORY.**

Any replacement MacBook GLB must first be inspected for node names, screen UV orientation, axis, scale, and lid pivot. Reusing the existing `macbook-pro.glb` avoids that structural migration. Human visual review is still required for screen aspect/crop and material color in both themes. **Classification: STRONG INFERENCE.**

### Motion, pointer, resize, and load lifecycle

- `LaptopOpen` places the model at its target, rotates `Frame.x` from 90° to 0° using a spring, and includes show/index delays (`model.jsx:463-487`). `SpringUp` offsets phone y by -1 and springs upward (`:436-461`). **Classification: CONFIRMED BY LOCAL REPOSITORY.**
- Global mouse position maps to ±roughly one-quarter radian group rotation through two Framer springs; the listener exists only in viewport and without reduced motion (`model.jsx:282-303`). There is no touch, device-orientation, or magnetic translation path. **Classification: CONFIRMED BY LOCAL REPOSITORY.**
- Resize reads the container, updates renderer size/camera aspect, and renders (`model.jsx:305-325`). **Classification: CONFIRMED BY LOCAL REPOSITORY.**
- Reduced motion places the GLB at its target, skips `playAnimation`, and performs a final render after full texture load (`model.jsx:430-435,498-517`). The placeholder-to-full screen `animate(1,0)` is outside that guard and the CSS canvas fade in `model.module.css:1-8` also continues. **Classification: CONFIRMED BY LOCAL REPOSITORY.**
- The load effect cleanup stops only the returned entrance animation (`model.jsx:498-525`). GLB/texture promises, `setLoaded`, `onLoad`, full-resolution application, and placeholder crossfade have no mounted/abort guard; the crossfade animation handle is not retained. Post-unmount work against disposed renderer/scene refs is therefore possible. **Classification: STRONG INFERENCE.**

## Decorative depth and 3D relationship

The homepage project's katakana SVG is a DOM sibling immediately before the model wrapper (`app/routes/home/project-summary.jsx:50-63,101-170`). It has one opacity value (0.7 light/1 dark), and source order lets the later device visually cover it (`project-summary.module.css:151-190`; reference capture `references/screenshots/sections/02-project-01.png`). There is no depth-buffer exchange between the WebGL canvas and SVG, no CSS mask, and no duplicate high/low-contrast layers. **Classification: CONFIRMED BY LOCAL REPOSITORY.**

Earth projects DOM labels every frame and dims an entire label to 0.2 based on a camera-distance heuristic (`earth.jsx:154-187`; `earth.module.css:52-80`), but it also does not provide partial glyph occlusion. Neither implementation alone satisfies the locked future rule for SYSTEM/GAPS/CASE STUDY/PROFILE words. **Classification: CONFIRMED BY LOCAL REPOSITORY.**

Which later technique—duplicated layers plus object mask, CSS clipping, or a render/depth-derived mask—best preserves pointer motion and responsive overlap cannot be selected until the final object geometry/layout exists. Prototype and compare edge stability, contrast, GPU cost, and fallback behavior; human creative review is required. **Classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION.**

## Earth scene detail

Earth imports `earth.glb`, six directional Milky Way HDR files, and `milkyway.jpg` at `app/routes/projects.smart-sparrow/earth.jsx:1-8`. It loads model/environment/background concurrently, assigns the PMREM texture to every model material, and adds the model once loaded (`:330-423`). `smart-sparrow.jsx:68-71,343-520` supplies the lazy boundary, labels, camera chapter data, visible mesh names, and animation identifiers. **Classification: CONFIRMED BY LOCAL REPOSITORY.**

Label “occlusion” compares the camera-to-scene-origin distance with camera-to-sprite distance (`earth.jsx:166-186`); the `Raycaster` is used only for development click readouts (`:449-480`), not label visibility. A label can therefore dim when farther than the model center even if no mesh actually covers it. **Classification: CONFIRMED BY LOCAL REPOSITORY** for the algorithm; **Classification: STRONG INFERENCE** for possible visual false positives.

Cleanup removes lights, traverses/disposes the scene, and disposes the renderer, but does not call `controls.dispose()`. The HDR source cube, PMREM render target reference (`envMap.current`), and background texture do not have explicit, owner-local disposal; some may be reached through scene/material cleanup, but ownership is not unambiguous. Async functions only gate `setLoaded` with `mounted.current` after completing; they can still access a disposed renderer/scene before that check. The 1-second loader `setTimeout` at `earth.jsx:401-403` is not retained or cleared, so it can call `setLoaderVisible` after unmount. **Classification: STRONG INFERENCE** for post-unmount/resource impact; the missing timer cleanup is **Classification: CONFIRMED BY LOCAL REPOSITORY.**

Earth is a specialized project narrative rather than the reusable laptop gateway. Its camera/mesh/label chapter schema can be studied, but should not be copied into the future HaircutDone structure unless the supplied case-study specification calls for a scroll-synchronized 3D story. **Classification: STRONG INFERENCE.**

## Armor and Carousel detail

Armor imports `volkihar-knight.glb` and six JPG cube faces (`app/routes/projects.volkihar-knight/armor.jsx:1-7`), builds PMREM environment lighting, and renders only on load/spring/resize (`:59-203`). The owner wrapper supplies `role="img"`/`aria-label` (`:205-228`). **Classification: CONFIRMED BY LOCAL REPOSITORY.**

Armor's delayed loader `setTimeout` at lines 126-128 is neither retained nor cleared. `load()` has no mounted flag, rejection path, or error fallback; a slow load can update state or renderer after cleanup. PMREM is disposed only after successful environment processing. **Classification: STRONG INFERENCE.**

Carousel resolves each responsive image to a Three texture, constructs a shader plane, and exposes an accessible live-region image plus buttons/dots while hiding the canvas (`app/components/carousel/carousel.jsx:94-151,340-410`). Its rAF schedules continuously even when not animating, although rendering is conditional (`:227-242`). If unmounted after textures load but before the mounted check, those textures are not added to the scene and are not explicitly disposed. **Classification: STRONG INFERENCE.**

The fragment shader switches liquid distortion to a simple crossfade when `reduceMotion` is true, but the Framer spring and render scheduling continue (`carousel.jsx:153-184`; `carousel-fragment.glsl:1-40`). **Classification: CONFIRMED BY LOCAL REPOSITORY.**

## Shared disposal behavior

`cleanScene()` traverses meshes, disposes geometry, material, texture-like material properties, and closes GLTF bitmap sources when supported; `cleanRenderer()` calls only `renderer.dispose()` (`app/utils/three.js:18-60`). Lights are detached separately (`:62-69`). **Classification: CONFIRMED BY LOCAL REPOSITORY.**

The helper does not call `renderer.forceContextLoss()`, clear the global Three cache, dispose `OrbitControls`, cancel async loaders, or know about render targets not attached to materials. Those resources must be handled by owners. `Model` explicitly disposes its two targets; other owners are less complete. **Classification: CONFIRMED BY LOCAL REPOSITORY.**

`Model` also does not explicitly dispose `depthMaterial.current` or `horizontalBlurMaterial.current`. The depth material is used only through `scene.overrideMaterial` and that property is reset to null before cleanup (`app/components/model/model.jsx:188-208,255-264`); the blur plane ends each pass holding the vertical blur material after replacing the horizontal one (`:225-245`). `cleanScene()` therefore cannot reach the depth or horizontal shader material at `:213-221`. The absent `dispose()` calls are **Classification: CONFIRMED BY LOCAL REPOSITORY**; retained GPU-resource impact is **Classification: STRONG INFERENCE** pending memory/context profiling.

Whether explicit context loss is desirable for route changes, and whether Three's global cache deliberately retains the four GLBs/textures for back navigation, is a tradeoff requiring memory traces rather than a blanket cleanup change. **Classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION.**

## Image and video pipeline

### Shared `Image`

`app/components/image/image.jsx:11-55` owns visibility and loaded state. It uses `useInViewport`; non-video images receive no full `src`/`srcSet` until visible, while the placeholder uses native `loading="lazy"` (`:175-207`). `decoding="async"`, explicit `sizes`, and optional width/height are forwarded. CSS crossfades the placeholder/content and can run the accent block reveal (`image.module.css:1-101`). **Classification: CONFIRMED BY LOCAL REPOSITORY.**

Video is detected by `.mp4` in the source string (`image.jsx:213-215`). The component renders muted, looping, `playsInline` video after hydration; it pauses out of viewport or when reduced motion is requested and offers a Pause/Play button unless `noPauseButton` is set (`:57-174`). **Classification: CONFIRMED BY LOCAL REPOSITORY.**

Video `onLoadStart` marks media loaded (`:153-164`), before `loadeddata`/a decoded frame. On constrained networks, the placeholder can fade before a visible video frame is ready. This needs throttled runtime verification. **Classification: STRONG INFERENCE.**

### Responsive source resolver

`resolveSrcFromSrcSet()` generates transparent blob URLs matching each candidate width, asks a temporary `Image` which candidate the browser selects, then returns the corresponding real source (`app/utils/image.js:43-80`). This lets video and WebGL textures reuse HTML `srcset` selection. **Classification: CONFIRMED BY LOCAL REPOSITORY.**

The generated blob URLs are never passed to `URL.revokeObjectURL`, and `loadImageFromSrcSet()` listens only for `load`, not `error` (`image.js:5-37,43-80`). A failed candidate can leave the promise pending and repeated calls can retain object URLs. **Classification: CONFIRMED BY LOCAL REPOSITORY.**

The async video resolver in `Image` has no mounted/abort guard before `setVideoSrc` (`image.jsx:87-98`). The model/carousel use the same resolver and inherit its failure behavior. **Classification: STRONG INFERENCE.**

## Asset inventory

Static inventory of `app/assets`:

| Type | Count | Total bytes | Notable files |
|---|---:|---:|---|
| GLB | 4 | 2,120,176 | `earth.glb` 1,002,980; `volkihar-knight.glb` 1,032,640; `macbook-pro.glb` 57,032; `iphone-11.glb` 27,524 |
| HDR | 7 | 79,938 | Six directional `milkyway-{n/p}{x/y/z}.hdr` files plus `milkyway.hdr` 39,220 |
| JPG | 61 | 5,590,878 | Project backgrounds, responsive images, placeholders, and environment faces |
| PNG | 46 | 3,949,103 | Project UI/screenshot assets |
| MP4 | 6 | 14,052,868 | `notfound.mp4` 4,781,340; `spr-motion-large.mp4` 3,902,106; `flatline.mp4` 2,352,914; `spr-motion.mp4` 2,226,973; `uses-background.mp4` 706,864; `flatline-alt.mp4` 82,671 |

**Classification: CONFIRMED BY LOCAL REPOSITORY.** Counts/sizes come from read-only file enumeration; no assets were generated.

Static import search finds the six directional Earth HDRs but no importer for `app/assets/milkyway.hdr`; whether that file is intentionally retained or orphaned requires owner confirmation before deletion. **Classification: CONFIRMED BY LOCAL REPOSITORY** for no discovered importer; **Classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION** for intent.

No `.webp` or `.avif` asset was found. Current responsive variants are predominantly JPG/PNG plus placeholders. Converting formats is a later performance option, not an audit change, and visual fidelity/transparency support must be reviewed per asset. **Classification: CONFIRMED BY LOCAL REPOSITORY.**

`public/_headers:11-26` gives one-year immutable caching to CSS, WOFF2, GLB, SVG, JPG, PNG, JS, and WASM patterns but has no explicit MP4 or HDR rule. Actual deployed caching can also be affected by the host/build output, so response headers must be checked on the deployed artifact. **Classification: CONFIRMED BY LOCAL REPOSITORY** for config; **Classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION** for production responses.

## Fallback and performance risks

1. All five owners request `failIfMajorPerformanceCaveat:true`; none wraps renderer creation in a local fallback/error UI. Test WebGL disabled, blocked, context-lost, low-power, and server/hydration scenarios. **Classification: CONFIRMED BY LOCAL REPOSITORY.**
2. Model, Armor, and Carousel hard-code pixel ratio 2; sphere/Earth use 1. Final canvas dimensions and mid-range mobile GPU cost are unknown. **Classification: CONFIRMED BY LOCAL REPOSITORY** for settings; **Classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION** for impact.
3. Hero's 128×128 sphere, Earth's continuous scene/DOM label loop, and Carousel's perpetual scheduler are likely the highest ongoing GPU/CPU costs. Measure frame time, long tasks, memory, thermal behavior, and battery on actual devices. **Classification: STRONG INFERENCE.**
4. No owner listens for `webglcontextlost`/`webglcontextrestored`. The user-visible recovery path is unknown. **Classification: CONFIRMED BY LOCAL REPOSITORY** for absence; **Classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION** for browser behavior.
5. Async loads have no shared abort/error contract. Broken URLs/decoder failures can leave loaders or throw unhandled errors. Simulate offline, 404, corrupted GLB/texture, and slow decoder responses before reuse. **Classification: STRONG INFERENCE.**
6. Earth's loader render callback does not destructure the `Transition` payload, so `data-visible` receives an object instead of literal `true` (`app/routes/projects.smart-sparrow/earth.jsx:675-683` versus `earth.module.css:8-19`). The intended delayed loader visibility rule cannot match. **Classification: CONFIRMED BY LOCAL REPOSITORY.**
7. `Image` video autoplay calls do not handle the returned `play()` promise; muted/inline improves autoplay eligibility, but actual policy behavior is browser-dependent. **Classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION.**

## Preservation strategy (future target only)

- Preserve `app/components/model/model.jsx`, `device-models.js`, `app/utils/three.js`, and the existing `macbook-pro.glb` as one versioned subsystem until HaircutDone screen assets are validated. **Classification: STRONG INFERENCE.**
- Adapt at `app/routes/home/home.jsx`/future data composition by supplying HaircutDone `srcSet`, placeholder, sizes, alt, destination, and copy; do not fork the renderer merely to change the screen. **Classification: STRONG INFERENCE.**
- Add a later verification gate for GLB node names, WebGL fallback, async cancellation, reduced-motion texture behavior, touch static state, context/memory cleanup, and responsive crop before changing any 3D asset. **Classification: STRONG INFERENCE.**
- None of the existing Three scenes implements a SYSTEM workflow container, nodes, connectors, tracers, glow, or mobile-workflow contract. **Classification: CONFIRMED BY LOCAL REPOSITORY.** Those future behaviors are supplied separately under the audit brief and remain **Classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION**; this audit does not invent them.

## Completion-pass delta — renderer, shader, cache, and media facts

- **CONFIRMED BY LOCAL REPOSITORY:** Hero, Model, Earth, Armor, and Carousel construct `WebGLRenderer` with antialiasing off and high-performance/caveat flags. Hero/Earth use DPR 1; Model/Armor/Carousel force DPR 2 without capping device DPR. Earth/Armor set ACES filmic tone mapping; Hero/Model/Carousel do not. No `EffectComposer` or postprocessing framework is imported (`app/routes/home/displacement-sphere.jsx:51-63`; `app/components/model/model.jsx:91-104`; `app/routes/projects.smart-sparrow/earth.jsx:190-203`; `app/routes/projects.volkihar-knight/armor.jsx:59-74`; `app/components/carousel/carousel.jsx:68-91`).
- **CONFIRMED BY LOCAL REPOSITORY:** Model performs one depth, four blur, and one final scene render per `renderFrame`, with two 512×512 targets; cleanup disposes targets, traversed mesh resources, renderer, lights, and spring subscriptions (`app/components/model/model.jsx:129-142,213-280`; `app/utils/three.js:21-60`). This does not prove browser memory reclamation.
- **CONFIRMED BY LOCAL REPOSITORY:** `THREE.Cache.enabled` and shared GLTF/Draco/texture loaders are module-global, with no local `Cache.clear`/`Cache.remove` path (`app/utils/three.js:1-16`). GPU disposal therefore does not prove cache eviction; retained-memory impact is **UNRESOLVED / NEEDS RUNTIME VERIFICATION**.
- **CONFIRMED BY LOCAL REPOSITORY:** Hero injects raw GLSL into `MeshPhongMaterial`, with one `time` uniform and `SphereGeometry(32,128,128)` (`displacement-sphere.jsx:70-84`). Its vertex shader has classic/periodic Perlin noise and exactly ten turbulence iterations; its fragment shader has no explicit texture-sampling call or precision qualifier (`displacement-sphere-vertex.glsl:40-188,191-244`; `displacement-sphere-fragment.glsl:1-80`). Necessity of the segmentation is **UNRESOLVED / NEEDS RUNTIME VERIFICATION**.
- **CONFIRMED BY LOCAL REPOSITORY:** `app/assets/macbook-pro.glb` is 57,032 bytes. The Draco-configured GLTF path requires `Screen`/`Frame`, uses placeholder then responsive `srcSet` texture replacement, and has no abort controller for Device loading (`app/utils/three.js:7-16`; `app/components/model/model.jsx:371-525`; `app/routes/home/project-summary.jsx:43-44,111-130`). Shared `Image` lazily loads images and viewport-controls video play/pause (`app/components/image/image.jsx:61-205`); Loom remains absent/deferred.
