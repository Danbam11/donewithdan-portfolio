# Contact system audit

## Scope and locked future requirements

This document records the current `/contact` route, its transition and form stack, and the backend/security decisions that remain open. It implements nothing.

The DonewithDan constraints used for evaluation are:

- Contact remains a separate route or connected-page/window experience, never an inline homepage form.
- Desktop/mobile navigation Contact and the Profile CTA **Send me a message →** must reach the same Contact destination.
- The visible heading remains **Say hello** with no period and retains the existing katakana-to-English decode where technically feasible.
- The final visible controls are **Email**, **Message**, and **Send message**.
- Destination email, delivery provider/method, and visitor auto-confirmation remain unresolved; the current implementation is evidence, not approval of those future choices.

Evidence classifications used below are exactly: **CONFIRMED BY LOCAL REPOSITORY**, **STRONG INFERENCE**, and **UNRESOLVED / NEEDS RUNTIME VERIFICATION**.

For compact line citations below, `contact.jsx` means the exact path `app/routes/contact/contact.jsx`, `contact.module.css` means `app/routes/contact/contact.module.css`, `input.jsx` means `app/components/input/input.jsx`, `decoder-text.jsx` means `app/components/decoder-text/decoder-text.jsx`, `decoder-text.module.css` means `app/components/decoder-text/decoder-text.module.css`, `transition.jsx` means `app/components/transition/transition.jsx`, `progress.module.css` means `app/components/progress/progress.module.css`, `loader.module.css` means `app/components/loader/loader.module.css`, and `root.jsx` means `app/root.jsx`.

## Executive finding

Contact is already a separate Remix route at `/contact`. Its UI and server `action` are colocated in `app/routes/contact/contact.jsx`, re-exported through `app/routes/contact/route.js`. The visible form already has only an email field, message field, and submit button; a CSS-hidden honeypot is the sole extra control. Submission currently sends one plain-text message through Amazon SES using Cloudflare environment bindings. The route has useful entrance/success animations and a reusable accessible decoder, but server-error association, focus management, abuse controls, provider failure handling, and deployment configuration need hardening or verification before production reuse. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY** for the architecture; **STRONG INFERENCE** for the production-hardening assessment.

## Route, entry points, and ownership

| Concern | Exact repository evidence | Imports/consumers | Evidence classification |
| --- | --- | --- | --- |
| Route module | `app/routes/contact/route.js:1` re-exports `Contact` as default plus `meta` and `action` from `./contact`. Under the repository's Remix route-folder convention this is `/contact`. | The route implementation is `app/routes/contact/contact.jsx:21-241`. Vite registers the root index explicitly at `vite.config.js:29-35`; other route folders remain convention-based. | CONFIRMED BY LOCAL REPOSITORY |
| Global navigation | `app/layouts/navbar/nav-data.js:16-19` defines `Contact` → `/contact`; both desktop and mobile map the same `navLinks` array in `app/layouts/navbar/navbar.jsx:158-171,178-196`. | `Navbar` is mounted globally in `app/root.jsx:119-134`. | CONFIRMED BY LOCAL REPOSITORY |
| Profile CTA | `app/routes/home/profile.jsx:58-66` renders `Button href="/contact"` with “Send me a message.” | `Button` converts internal `href` values to a Remix `Link` with intent prefetch and `unstable_viewTransition` in `app/components/button/button.jsx:13-27`. | CONFIRMED BY LOCAL REPOSITORY |
| Additional current entry | `app/routes/uses/uses.jsx:56` links “message me” to `/contact`. | It uses the shared `Link`, which creates a Remix link for internal destinations at `app/components/link/link.jsx:14-43`. | CONFIRMED BY LOCAL REPOSITORY |
| Page metadata | `meta` returns `baseMeta` with title `Contact` and a contact description at `app/routes/contact/contact.jsx:21-27`. | `baseMeta` is imported at line 15 and consumed by Remix `<Meta />` in `app/root.jsx:115`. | CONFIRMED BY LOCAL REPOSITORY |

Both locked future Contact entry points already converge on `/contact`. This should remain one route contract rather than two destination implementations. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

## Contact page composition

`Contact` is rendered inside a shared `Section` and consists of two mutually coordinated states plus a footer (`app/routes/contact/contact.jsx:96-237`):

1. The form state, wrapped by `Transition unmount in={!actionData?.success}` at lines 107-199.
2. The completion state, wrapped by `Transition unmount in={actionData?.success}` at lines 200-233.
3. The shared `Footer` at line 234.

The route-level `Section` defaults to a `<div>` (`app/components/section/section.jsx:5-10`), but it sits inside the global `<main id="main-content">` (`app/root.jsx:126-133`). The Contact CSS uses a full-viewport, two-row grid so the state occupies the main row and the footer the lower row (`app/routes/contact/contact.module.css:1-16`). The form is capped at `var(--maxWidthS)` and centered (`contact.module.css:18-28`). **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

On mobile width, the outer top padding is removed and the form aligns toward the top with larger top padding (`contact.module.css:13-15,24-27`). General horizontal spacing comes from `Section`'s mobile/mobile-landscape rules (`app/components/section/section.module.css:14-30`). There is no alternate mobile form component or backend path. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

## Contact transition and connected-page behavior

### Route entry/exit

- Navbar Contact links opt into Remix's `unstable_viewTransition` (`app/layouts/navbar/navbar.jsx:159-168,179-187`).
- The Profile CTA reaches `/contact` through `Button`, which adds `unstable_viewTransition` to internal links (`app/components/button/button.jsx:18-26`).
- The generic internal `Link` used on `/uses` also opts in (`app/components/link/link.jsx:38-41`).
- During Remix navigation, `App` sets `data-loading` on the route `<main>` from `useNavigation` (`app/root.jsx:80-94,126-133`), and `app/root.module.css:2-10` fades that container to zero opacity while loading.
- The root `Progress` indicator independently tracks navigation state (`app/components/progress/progress.jsx:5-58`; styles `progress.module.css:1-46`).

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

No route-specific connected-window component, shared-element naming, or `::view-transition-*` CSS is present for Contact. The static implementation requests the browser/Remix view-transition path and combines it with the global loading fade; the exact visual result and fallback vary with runtime browser support and cannot be established by inspection alone. Verify later in supported and unsupported browsers, forward/back navigation, and reduced-motion mode. **Evidence classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION.**

### Local form-state transition

The shared `Transition` component is a Framer Motion `AnimatePresence`-backed state machine that drives ordinary CSS through `entering`, `entered`, `exiting`, and `exited` states (`app/components/transition/transition.jsx:1-103`). Contact imports it at `contact.jsx:11` and uses it to:

- Keep the form mounted while it exits after success, with a 1600 ms timeout (`contact.jsx:107-199`).
- Stagger the heading, divider, inputs, and button by writing custom `--delay` values through `getDelay` (`contact.jsx:100,115-196,239-241`).
- Expand/collapse a server-error region (`contact.jsx:160-183`).
- Enter the completion state containing “Message Sent,” explanatory copy, and a home link (`contact.jsx:200-233`).

The associated opacity and transform rules are in `app/routes/contact/contact.module.css:30-138,144-277`; error-height motion is at lines 279-306. Spatial transforms are generally restricted to `--mediaUseMotion`, but opacity transitions and `Transition` timers remain under reduced motion (`contact.module.css:30-138,144-201,215-277`; custom media definition `app/global.module.css:7-8`). **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

The form itself sets `unstable_viewTransition` (`contact.jsx:109-114`). Whether this produces a browser-native transition on action submission, and how it composes with the 1600 ms local exit, requires runtime verification. **Evidence classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION.**

## “Say hello” heading and katakana decode

The visible heading is exactly `Say hello`, with no period, at `app/routes/contact/contact.jsx:115-123`. `Heading` is visually level 3 but explicitly emits an `<h1>` through `as="h1"`; the component's `as` override is implemented at `app/components/heading/heading.jsx:5-28`. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

The heading wraps `DecoderText` with `start={status !== 'exited'}` and a 300 ms delay (`contact.jsx:122`). The decoder implementation is shared:

- `app/components/decoder-text/decoder-text.jsx:8-25` defines the Japanese katakana glyph pool.
- `shuffle` at lines 32-45 progressively replaces glyphs with the target characters.
- `DecoderText` at lines 47-100 uses Framer Motion `useSpring(0, { stiffness: 8, damping: 5 })`, waits through `delay` from `app/utils/delay.js:1-3`, and renders spring updates into its visual span.
- The target text is duplicated as `VisuallyHidden` while the changing visual characters are `aria-hidden` (`decoder-text.jsx:94-98`), preventing screen readers from announcing every mutation.
- `useReducedMotion` bypasses the spring and immediately renders final characters (`decoder-text.jsx:51,77-87`).
- Glyph typography uses the local `IPA Gothic` stack in `decoder-text.module.css:9-14`; that font is imported and declared by `app/components/theme-provider/theme-provider.jsx:7,167-173` from `app/assets/fonts/ipa-gothic.woff2`.

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

The decoder writes character markup through `innerHTML` (`decoder-text.jsx:59-65`). The current Contact input is a hard-coded trusted string, so no user-controlled content reaches it. If the component is ever fed CMS/user content, escaping must be reviewed before reuse. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY** for the implementation/current static text; **STRONG INFERENCE** for the future injection risk.

## Form component and current fields

| Order | Control | Exact implementation | Current validation hooks | Future treatment | Evidence classification |
| --- | --- | --- | --- | --- | --- |
| Hidden | Honeypot `name` | `Input` with label `Name`, name `name`, and max length 512 at `contact.jsx:129-135`; wrapper hidden with `display: none` at `contact.module.css:140-142`. | Server treats any non-empty value as a bot at `contact.jsx:42-49`. | Keep non-visible or replace only as part of an approved spam strategy; it does not violate the locked visible three-control structure. | CONFIRMED BY LOCAL REPOSITORY |
| 1 | Email | `Input required`, label `Your email`, `type="email"`, name `email`, autocomplete email, max length 512 at `contact.jsx:136-147`. | Controlled by `useFormInput`; browser validity plus server regex/length checks. | Content-only change from `Your email` to locked label **Email**; preserve `name="email"` unless the action contract changes in the same phase. | CONFIRMED BY LOCAL REPOSITORY |
| 2 | Message | Multiline `Input required`, label `Message`, name `message`, autocomplete off, max length 4096 at `contact.jsx:148-159`. | Controlled by `useFormInput`; browser required/max length plus server presence/length checks. | Preserve visible label and textarea behavior. | CONFIRMED BY LOCAL REPOSITORY |
| 3 | Submit | `Button type="submit"`, icon `send`, label `Send message`, disabled/loading during submission at `contact.jsx:184-196`. | `sending` is `useNavigation().state === 'submitting'` at lines 101-103. | Preserve locked label and single-submit guard. | CONFIRMED BY LOCAL REPOSITORY |

`Input` owns the label/control relationship, generated IDs, local error description, focus/filled styling, and optional `TextArea` selection (`app/components/input/input.jsx:9-97`). `TextArea` auto-grows by calculating line-height, padding, and scroll height (`app/components/input/text-area.jsx:5-58`). Contact imports `Input`, not `TextArea` directly (`contact.jsx:7`); `Input` selects it when `multiline` is true (`input.jsx:32`). **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

## Validation behavior

### Client/browser validation

`useFormInput` tracks value, dirty state, and the browser `validationMessage`; it suppresses the browser popup on `invalid`, validates on blur after a change, and clears a local error when validity is restored (`app/hooks/useFormInput.js:3-38`). The hook objects are created in Contact at `contact.jsx:97-99` and spread into the two visible `Input` components at lines 146 and 158. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

Each local field error is rendered by `Input` with `role="alert"` and is connected using `aria-describedby` (`app/components/input/input.jsx:29-31,59-94`). Labels use `htmlFor` and `aria-labelledby` (`input.jsx:49-73`). Required/type/max-length constraints are applied to the actual input/textarea, not only to the wrapper. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

### Server validation

The Remix `action` reads `request.formData()` and converts `name`, `email`, and `message` to strings (`app/routes/contact/contact.jsx:33-46`). It checks:

- Honeypot non-empty → return `{ success: true }` without sending (`contact.jsx:48-49`).
- Email non-empty and matching `EMAIL_PATTERN` (`contact.jsx:29-31,51-54`).
- Message non-empty (`contact.jsx:56-58`).
- Email length at most 512 and message length at most 4096 (`contact.jsx:29-30,60-66`).
- Any errors → JSON `{ errors }` (`contact.jsx:68-70`).

**Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

The email expression `/(.+)@(.+){2,}\.(.+){2,}/` is not anchored, values are not trimmed or normalized, and the server does not require that form entries be strings rather than uploaded `File` values before coercion. Client HTML constraints can be bypassed by direct requests. The present checks are therefore basic input filtering, not robust address validation. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY** for the exact checks; **STRONG INFERENCE** for their insufficiency as production abuse/security controls.

Server validation responses use the default JSON status (no explicit 4xx status) and Contact displays both possible messages in one standalone block (`contact.jsx:68-70,160-183`). That block has neither `role="alert"`/`aria-live` nor an ID associated back to the invalid fields; if both messages exist, they are rendered as adjacent text nodes without an explicit separator (`contact.jsx:174-179`). **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

## Submission destination and server action

The `<Form method="post">` has no explicit `action`, so it posts to the current Contact route; `app/routes/contact/route.js:1` exports the colocated `action`. Remix progressive enhancement should retain a normal same-route POST without client JavaScript, although the animated loading/error treatment is client-enhanced and must be verified in a no-JS browser. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY** for markup/action ownership; **STRONG INFERENCE** for progressive-enhancement behavior.

The current delivery flow is:

1. Create `SESClient` in hard-coded region `us-east-1` using Cloudflare environment credential bindings (`contact.jsx:33-40`).
2. Parse and validate form data (`contact.jsx:42-70`).
3. Call `ses.send(new SendEmailCommand(...))` (`contact.jsx:72-91`).
4. Send to the address configured by `EMAIL`, from the identity configured by `FROM_EMAIL`, with the visitor email in `ReplyToAddresses` (`contact.jsx:74-90`).
5. Place the visitor email and message in a plain-text body and return `{ success: true }` after `await` resolves (`contact.jsx:78-93`).

The AWS SDK dependency is declared as `@aws-sdk/client-ses` in `package.json:20`; the Cloudflare Pages function handler supplies the Remix server build in `functions/[[path]].js:1-5`. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

No second `SendEmailCommand` addresses the visitor, so the current system does **not** send an automatic visitor confirmation. The visible success screen is browser UI only. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

## Environment variables and configuration locations

No secret values are reproduced here.

| Variable | Use | Configuration evidence | Evidence classification |
| --- | --- | --- | --- |
| `AWS_ACCESS_KEY_ID` | SES client credential identifier | Read at `app/routes/contact/contact.jsx:37`; named in `.dev.vars.example:12`; local `.dev.vars` is ignored at `.gitignore:8`. | CONFIRMED BY LOCAL REPOSITORY |
| `AWS_SECRET_ACCESS_KEY` | SES client secret credential | Read at `contact.jsx:38`; named in `.dev.vars.example:13`; local `.dev.vars` is ignored. | CONFIRMED BY LOCAL REPOSITORY |
| `EMAIL` | Recipient/destination address | Read at `contact.jsx:76`; named in `.dev.vars.example:6`. | CONFIRMED BY LOCAL REPOSITORY |
| `FROM_EMAIL` | SES sender identity | Read at `contact.jsx:88`; named in `.dev.vars.example:9`. | CONFIRMED BY LOCAL REPOSITORY |
| `SESSION_SECRET` | Signs the shared theme session cookie; not used to send Contact mail | Read in `app/root.jsx:62` and `app/routes/api.set-theme.js:14`; named in `.dev.vars.example:16`. | CONFIRMED BY LOCAL REPOSITORY |

`README.md:52-55` instructs operators to configure SES values locally through a renamed `.dev.vars` and in the Cloudflare dashboard for production. `wrangler.toml:1-3` declares only a KV binding and does not declare the mail variables. Only `.dev.vars.example` is present at repository root; an actual `.dev.vars` is not present in the inspected working tree. Whether production variables, SES verification, IAM permissions, sandbox/production status, and recipient identity are currently configured cannot be proven from the repository. The safest later verification is a permission-scoped review of variable **names/presence** in Cloudflare and SES configuration, followed by a controlled staging send; values must not be copied into audit output. Human owner approval is required. **Evidence classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION.**

## Success, error, and failure states

| State | Current behavior | Evidence | Evidence classification |
| --- | --- | --- | --- |
| Submitting | `sending` becomes true; the button disables and visually hides its icon/text (`contact.jsx:101-103,184-196`; `app/components/button/button.jsx:55-96`). The shared loader shows an animated bar normally and renders its `Sending...` text only under reduced motion (`app/components/loader/loader.jsx:7-33`; `loader.module.css:21-49`). | Prevents ordinary repeated button activation while Remix reports `submitting`; it does not expose `aria-busy` or a live status. | CONFIRMED BY LOCAL REPOSITORY |
| Validation error | Local browser errors appear per field; server errors appear in the expanding aggregate block (`contact.jsx:160-183`; `input.jsx:76-94`). | Controlled input values remain in component state. | CONFIRMED BY LOCAL REPOSITORY |
| Honeypot trip | Returns `{ success: true }` without mail (`contact.jsx:43,48-49`). | Bot sees the same completion state. | CONFIRMED BY LOCAL REPOSITORY |
| Send success | Returns `{ success: true }`; form exits and completion content says “Message Sent,” then offers “Back to homepage” (`contact.jsx:93,107-200,200-233`). | Completion wrapper has `aria-live="polite"` (`contact.jsx:202`). | CONFIRMED BY LOCAL REPOSITORY |
| SES/config/network failure | `ses.send` has no `try/catch`; thrown errors escape the route action (`contact.jsx:72-93`) to the root error boundary (`app/root.jsx:142-162`). | No inline retryable failure message or preserved-contact recovery path is defined. Exact production error serialization is runtime-dependent. | CONFIRMED BY LOCAL REPOSITORY |

No explicit focus is sent to the first invalid field, aggregate error, success heading, or success container. When success unmounts the form, focus may be lost with the removed submit button even though the new region is polite-live. The exact screen-reader/browser result requires keyboard and assistive-technology testing. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY** for absence of focus code; **UNRESOLVED / NEEDS RUNTIME VERIFICATION** for runtime outcome.

## Spam protection and security review

| Finding | Repository evidence | Risk/interpretation | Evidence classification |
| --- | --- | --- | --- |
| Honeypot only | `name` field at `contact.jsx:129-135`, hidden at `contact.module.css:140-142`, fake success at `contact.jsx:43,48-49`. | Useful low-friction signal, but trivial for targeted automation to omit or leave empty. | STRONG INFERENCE |
| Missing-name coercion | `String(formData.get('name'))` at `contact.jsx:43` turns an omitted field into the truthy string `"null"`, causing fake success. Normal browser form posts include an empty named control, so ordinary UI submission is not affected. | Direct clients that omit the honeypot are silently discarded; this is behavior to preserve or change deliberately. | CONFIRMED BY LOCAL REPOSITORY |
| No rate/volume control | No rate limiter, CAPTCHA/challenge, timestamp trap, proof-of-work, queue, IP/origin policy, or abuse-monitoring call appears in the route action or Cloudflare wrapper. | A scripted client can submit with `name` empty and consume mail quota/cost. | STRONG INFERENCE |
| No explicit CSRF/origin check | The public action accepts form POST data without a token or `Origin`/`Referer` validation (`contact.jsx:33-93`). | Cross-site form spam remains possible if the attacker includes an empty `name`; there is no privileged user data at risk, but delivery abuse is. | STRONG INFERENCE |
| Length checks occur after parsing | `request.formData()` precedes the field length checks (`contact.jsx:42-66`). | Application-level limits do not cap total request-body parsing; an edge/platform body-size limit was not located. | STRONG INFERENCE |
| Plain-text message | SES body uses `Body.Text.Data`, not HTML (`contact.jsx:78-86`). | Reduces HTML injection risk in the generated mail body. | CONFIRMED BY LOCAL REPOSITORY |
| Visitor address used as Reply-To | `ReplyToAddresses: [email]` (`contact.jsx:89`) after only the custom regex/length checks. | Provider-side address/header validation should not be assumed to replace stricter application validation. | STRONG INFERENCE |
| Static cloud credentials | The action reads access-key variables directly (`contact.jsx:34-40`). | Least privilege, key rotation, and whether platform-native/temporary credentials are available cannot be assessed from source. | UNRESOLVED / NEEDS RUNTIME VERIFICATION |
| No exception handling | Awaited SES send is not caught (`contact.jsx:72-93`). | Transient/provider failures become route errors instead of a recoverable form state. | CONFIRMED BY LOCAL REPOSITORY |
| Potential error detail rendering | Root `Error` falls back to `error.statusText || error.data || error.toString()` (`app/layouts/error/error.jsx:14-38`). | Whether SES details reach users depends on Remix's production error sanitization; verify production behavior without provoking a real credential leak. | UNRESOLVED / NEEDS RUNTIME VERIFICATION |

No evidence of logging or analytics around message contents was found in the Contact action. Cloudflare/AWS platform logging and retention are external configuration, so privacy behavior remains unknown. Review provider and platform logs with human approval before collecting real submissions. **Evidence classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION.**

## Accessibility audit

### Preserved strengths

- The page has one explicit `<h1>` (“Say hello”) and sits in the global `<main>` (`contact.jsx:115-123`; `root.jsx:126-133`). **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**
- Decoder mutations are hidden from assistive technology while the stable final string is visually hidden (`decoder-text.jsx:94-98`). **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**
- Visible controls have programmatic labels and generated unique IDs (`input.jsx:27-31,49-73`). **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**
- Local validity messages use `role="alert"` and `aria-describedby` (`input.jsx:62-64,76-94`). **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**
- The submit control is a native button and disables during submission (`contact.jsx:184-196`; `app/components/button/button.jsx:55-96`). **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**
- Reduced motion skips decoder scrambling and removes most Contact translation transforms (`decoder-text.jsx:51,77-87`; `contact.module.css` rules guarded by `--mediaUseMotion`). **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**

### Gaps to address during adaptation

- Aggregate server errors are not live, focused, or associated with fields, and two errors have no structural separator (`contact.jsx:160-183`). **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**
- Inputs do not set `aria-invalid` in either local or server-error state (`app/components/input/input.jsx:59-73`). **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**
- The submitting control does not set `aria-busy` or publish a live status. With motion enabled, `Loader` renders only a visual bar; with reduced motion it renders `Sending...` alongside the original opacity-hidden text in the accessibility tree (`app/components/button/button.jsx:55-96,132-156`; `app/components/loader/loader.jsx:7-33`). The resulting accessible name/status requires assistive-technology verification. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY** for markup; **UNRESOLVED / NEEDS RUNTIME VERIFICATION** for announcement behavior.
- No focus transfer occurs after server validation or successful form removal (`contact.jsx:96-233`). **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**
- Success uses `<Heading as="h3">` even though the original `<h1>` is unmounted (`contact.jsx:203-210`), leaving the success state without an `h1`. **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**
- Opacity transitions and state-machine delays remain for reduced-motion users even when movement is suppressed (`contact.module.css:30-277`; `Transition` timers in `transition.jsx:58-100`). **Evidence classification: CONFIRMED BY LOCAL REPOSITORY.**
- Color contrast for theme-dependent labels, errors, and disabled/loading states cannot be certified from token/source inspection alone; render both themes and check WCAG contrast, zoom, forced colors, and autofill. **Evidence classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION.**

Human review is required with keyboard-only navigation, at least one screen reader/browser combination, 200%/400% zoom, forced colors, reduced motion, slow network, validation of both fields at once, SES failure simulation in staging, and success focus/announcement checks. **Evidence classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION.**

## Backend decisions requiring Daniel's input

These are deliberately unresolved and must not be inferred from the legacy Hamish configuration.

1. **Destination email address.** It will populate the deployment binding currently named `EMAIL`; the repository cannot establish Daniel's intended inbox, alias, routing rules, or privacy/retention policy. Decision required before production contact testing. Work on UI and provider-neutral validation can continue beforehand. **Evidence classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION.**
2. **Delivery provider or method.** Current evidence is Amazon SES in `us-east-1` with `@aws-sdk/client-ses` (`contact.jsx:18,33-40,72-91`; `package.json:20`). Daniel must decide whether to retain SES or authorize a different provider/method. This decision controls credentials, sender verification, runtime compatibility, error semantics, rate limits, and deployment setup. Decision required before backend integration/hardening. **Evidence classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION.**
3. **Automatic visitor confirmation.** Current code sends only to `EMAIL` and uses the visitor address only as Reply-To (`contact.jsx:74-90`). Daniel must decide whether a second transactional message is wanted and approve its copy, consent/privacy implications, and anti-abuse constraints. Decision required before final success-flow acceptance; the base form can continue without it. **Evidence classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION.**
4. **Acceptable spam-control friction.** The current hidden honeypot is the only control. Daniel must approve whether the final experience may introduce rate limiting and/or a user-visible challenge, because provider cost, accessibility, privacy, and conversion tradeoffs differ. A server-side rate limit can be designed after the provider/platform choice; any visible challenge requires UX approval. **Evidence classification: UNRESOLVED / NEEDS RUNTIME VERIFICATION.**

## Safest preservation/adaptation strategy

1. Preserve `/contact`, `app/routes/contact/route.js`, and the two existing `/contact` entry points as one atomic routing contract.
2. Preserve `DecoderText` and the exact `Say hello` string; do not replace it with a separate animation. Verify the local IPA Gothic font continues to load.
3. Keep the visible field structure and names while changing only `Your email` to the locked label `Email`; treat the hidden honeypot as infrastructure, not a visible field.
4. Separate provider-neutral UI/validation hardening from the provider decision. Do not populate production variables or replace SES until Daniel chooses the destination and delivery method.
5. Preserve the plain-text mail body unless an approved requirement needs HTML; never inject untrusted content into `DecoderText.innerHTML`.
6. Add future error/focus/abuse handling at the current seams—the colocated `action`, `Contact`, `Input`, and deployment bindings—and regression-test both progressive-enhanced and client-enhanced submission.
7. Preserve view-transition flags, global loading feedback, and local form/success transitions until runtime comparison proves an intentional change is safe.

The component and action seams in steps 1-7 are **CONFIRMED BY LOCAL REPOSITORY**; this sequence is a **STRONG INFERENCE** based on minimizing change to the existing Remix architecture.

## Audit disposition

The separate Contact experience is structurally reusable and already matches most locked visible requirements. It should be **adapted**, not replaced: retain the route, decoder, form primitives, and transition language; change content minimally; then harden validation, error/focus behavior, abuse protection, and provider integration after Daniel resolves the three locked backend decisions. **Evidence classification: STRONG INFERENCE.**
