# DonewithDan implementation guardrails

## Repository safety

- Work only in `C:\Users\DanBam\Documents\GitHub\donewithdan-portfolio` and on the task-approved branch. Never modify `master`; do not switch branches unless explicitly instructed.
- Start each task with `git branch --show-current` and `git status --short`. Preserve unrelated working-tree changes.
- Do not commit, push, open a pull request, stage files, install dependencies, run `npm audit fix`, or use force options unless explicitly instructed.

## Sources of truth

- Read `docs/audit/` before editing. It is the technical source of truth for the Hamish Williams foundation.
- Read `docs/project/approved-decisions.md`, `current-status.md`, and `integration-register.md` before planning an affected section.
- `docs/audit/` describes the current repository and Hamish systems; `docs/project/approved-decisions.md` describes what DonewithDan must become. If an old planning document conflicts with approved decisions, approved decisions govern intended behavior while repository evidence still governs existing-code facts.
- Final Penpot pages `03B — Final Portfolio Wireframe`, `03C — Contact Route Wireframe`, and `03D — HaircutDone Case Study Wireframe` are design blueprints. Earlier Page 03 is historical only.
- Preserve before replacing: reuse proven repository systems where they meet the approved behavior; adapt deliberately rather than copy candidate/demo code wholesale.

## Implementation discipline

- Work one section/task at a time. Do not bundle unrelated redesign, route, dependency, or cleanup changes.
- Never invent deferred assets, URLs, workflow data, screenshots, legal rights, or product content. Never silently alter frozen copy or behavior.
- Keep native scrolling as the sole global scroll authority; do not add Lenis or another global smooth-scroll controller.
- Require explicit approval before adding or changing dependencies. Candidate-source packages are not automatically approved.

## Quality, accessibility, and performance

- Semantic HTML is the primary experience; WebGL and heavy visuals are progressive enhancements with usable fallbacks.
- Respect reduced motion, touch/mobile constraints, keyboard use, focus behavior, contrast, responsive/lazy media, and natural page scrolling.
- Visibility-gate continuous work. Clean up RAF loops, listeners, observers, and WebGL geometries/materials/textures/renderers explicitly. Bound DPR and avoid unnecessary post-processing.
- Validate the changed scope before any commit. Report every changed file, validation run, unresolved runtime verification, and any deviation from the source-of-truth documents.
