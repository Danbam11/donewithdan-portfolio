# DonewithDan Visual Implementation Source of Truth

## Purpose

`TASTE.md` is the DonewithDan portfolio's visual implementation source of truth.

It does **not** replace:

- repository evidence in `docs/audit/`;
- frozen behavior and content in `docs/project/approved-decisions.md`;
- Penpot 03B, 03C, and 03D.

It governs visual execution where those sources leave room for implementation judgment.

Objectives:

- Preserve Hamish's strong technical and motion foundation.
- Make the final result clearly DonewithDan.
- Avoid generic AI-generated styling and visual improvisation between sections.
- Maintain consistency across desktop, mobile, dark, and light themes.

## Visual Character

- Technical but approachable.
- Polished rather than flashy.
- Dark-mode-first and cinematic.
- Cyan is the recognizable DonewithDan signature.
- Generous whitespace, strong typographic hierarchy, restrained depth, and purposeful motion.
- Interfaces should feel engineered, not decorated.
- Avoid generic SaaS/dashboard styling, excessive glassmorphism, neon everywhere, gratuitous gradients, random rounded cards, and heavy shadows unless depth requires them.
- Do not visually redesign approved Penpot compositions.

## Color Status

### Frozen signature family

| Token | Value |
| --- | --- |
| DonewithDan signature cyan | `#21F1FF` |
| Electric cyan | `#00F5FF` |
| Soft cyan / glow | `#B2FFFF` |

Use signature cyan primarily for highlights, focus and active states, small borders/rules, WorkflowBoard continuity, signal/glow language, and selected animation moments. Do not cover large portions of the site in saturated cyan.

### Dark mode — default working palette

| Role | Value |
| --- | --- |
| Canvas | `#0A0F10` |
| Surface 1 | `#11191A` |
| Surface 2 | `#172224` |
| Primary text | `#F7FFFF` |
| Secondary text | `#AAB5B8` |
| Deep cyan | `#005F6A` |
| Supporting teal | `#259797` |
| Signature cyan | `#21F1FF` |
| Electric highlight | `#00F5FF` |
| Soft glow | `#B2FFFF` |

Dark mode is the default product behavior. These values are the approved visual direction, subject only to small contrast or tuning adjustments during rendered testing. Do not introduce unrelated blues or purples merely for variety.

### Light mode — WorkflowBoard-aligned palette

| Role | Value |
| --- | --- |
| Canvas / warm base | `#F3F1EA` |
| Primary surface | `#FFFFFF` |
| Soft cyan surface / Foam | `#D0EAE8` |
| Subtle border / Breeze | `#CCD8D9` |
| Primary text | Near-black / repository-compatible charcoal |
| Readable dark cyan | `#005F6A` |
| Supporting teal | `#259797` |
| Signature accent | `#21F1FF` |
| Soft cyan | `#B2FFFF` |

Bright signature cyan must not automatically be used for small text on light surfaces. Prefer deep cyan or dark text for readable links and content; use bright cyan as an accent only where contrast is sufficient.

## Typography

- Do not introduce a new global portfolio font without explicit approval.
- Preserve the existing Hamish typography and font architecture where appropriate.
- WorkflowBoard is the exception: Nunito is required for its approved internal text metrics and remains scoped to WorkflowBoard unless separately approved for wider use.
- Maintain clear hierarchy, strong large headings, restrained tracking, and readable body widths.
- Do not use decorative font experimentation that conflicts with Penpot, or choose a trendy font solely to imply a premium feel.

## Depth and Layering

Frozen decorative words: `SYSTEM`, `GAPS`, `CASE STUDY`, and `PROFILE`.

Covered portions must become darker/lower contrast while exposed portions remain stronger. Never apply one flat opacity across an entire word. Use a repository-compatible approach—such as masks, clipping, duplicated `aria-hidden` layers, or equivalent—so depth feels spatial and deliberate rather than like a generic drop shadow.

## Surfaces

Prefer clean, flat surfaces, subtle tonal separation, restrained borders, and depth created by composition and overlap before shadow.

Avoid excessive cardification, thick glowing borders, universal rounded rectangles, and oversized shadows copied from component demos. Candidate/demo styling never overrides this document.

## Motion Taste

Motion should communicate hierarchy, cause and effect, continuity, physical depth, and progress.

Prefer transform/opacity, restrained springs or easing, clear entrance-to-settled states, interruptible interaction, subtle magnetic attraction, and purposeful scroll-linked motion.

Avoid animation merely because an element can animate, excessive bounce, slow cinematic delays that block reading, multiple competing continuous ambient systems, large exaggerated rotations, and a different animation vocabulary for every section.

Reduced motion is a first-class presentation, not an afterthought. Detailed animation values remain subject to per-component and runtime-spike validation.

## Section-Specific Visual Notes

### Hero

- Preserve Hamish block-cover language.
- Twisted Blob is a decorative enhancement.
- Cyan should connect Hero visually to WorkflowBoard without turning the entire Hero cyan.

### Tool strip

- Logo-only and a quiet visual rhythm.
- It is not a second hero.

### SYSTEM

- WorkflowBoard remains the visual focus.
- Keep outer perspective treatment restrained.
- Container styling must not resemble a generic laptop, browser, or device mockup.

### GAPS

- Semantic card content remains dominant.
- Supplied illustrations support, not replace, the text.
- Stacking depth stays restrained.

### HaircutDone gateway

- Hamish's 3D laptop remains a premium focal object.
- Avoid competing decoration around it.

### HaircutDone case study

- Screenshots are the content.
- Layout and motion should support viewing them rather than overpowering them.

### Profile

- A warmer, more personal visual rhythm while remaining part of the same system.

## Responsive Taste

Mobile is not a shrunken desktop. Prioritize readable type, natural vertical scrolling, touch-safe targets, reduced pinning, fewer simultaneously visible decorative elements, and intentional horizontal interaction only where approved.

Do not compress complex visual systems until they become unreadable.

## Authority Rule

When sources disagree, apply this hierarchy:

1. Repository facts: `docs/audit/`
2. Frozen product/design behavior: `docs/project/approved-decisions.md`
3. Final Penpot 03B, 03C, and 03D
4. Visual implementation judgment: `TASTE.md`

External component demos and design/motion skills are advisory only. They may improve execution but may not silently override frozen DonewithDan decisions.
