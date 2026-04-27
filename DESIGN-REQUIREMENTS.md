# AXIS Series — Design Requirements

Extracted from the project planning documents. This is the authoritative design spec for anyone working on the frontend, design system, or publishing.

Source documents:
- `0_AXIS_Sitemap_Final_EN.html`
- `0_AXIS_CBT_System_Design_Specification_v1_1.html`
- `1_AXIS_MainHome_PageSpec_v2_EN.html`
- `2_0_CertPages_CommonTechGuidelines_EN.html`
- `3_AXIS_Exam_Registration_Page_Plan_v2.html`
- `4_AXIS_Remaining_Pages_Plan_v2.html`
- `AXIS_Series_Integrated_Specification.html`

---

## 1. Two sites, two themes

This is the most important decision to internalize. You are building **two separate front-end applications** with deliberately different visual personalities:

| | `axisexam.com` | `cbt.axisexam.com` |
|---|---|---|
| **Theme** | Light (white base) | Dark (deep navy → charcoal) |
| **Purpose** | Marketing, info, registration | Exam-dedicated environment |
| **Feel** | Trust · modern · readable | Focus · trust · intensity · clarity |
| **Devices** | Mobile-first responsive | PC only (min 1280×720) |
| **Benchmark** | CompTIA main site | CompTIA CertMaster, Pearson VUE, PSI |
| **Fullscreen** | Normal browser | Fullscreen API locked |

The dark theme on CBT is not a style choice — it's a **cognitive signal** that the candidate has entered a controlled, proctored environment. Never let the two themes blend.

**Design references to avoid** (called out explicitly in the docs):
- Q-net — avoid the public-institution feel
- JDLA — clunky
- TOEIC — outdated

---

## 2. Brand colors

### Series brand colors (used on BOTH sites)

Each of the three certifications has its own accent color. These colors run everywhere — cert cards, headers, level badges, CTA accents in CBT.

| Series | Hex | Name | Usage |
|---|---|---|---|
| **AXIS** (General) | `#2563EB` | Blue | AXIS brand accent |
| **AXIS-C** (Coding) | `#16A34A` | Green | AXIS-C brand accent |
| **AXIS-H** (Healthcare) | `#7C3AED` | Purple | AXIS-H brand accent |

### Supporting palette (axisexam.com light theme)

From `2_0_CertPages_CommonTechGuidelines_EN.html`:

```css
:root {
  /* Primary */
  --primary:       #0B1D3A;   /* Deep navy — headings, GNB bg */
  --accent:        #0077B6;   /* Ocean blue — secondary accent */
  --accent-light:  #00B4D8;   /* Highlight, decorative */

  /* Neutrals */
  --gray:          #6B7280;   /* Muted text */
  --gray-text:     #4B5563;   /* Body text */
  --gray-light:    #F5F7FA;   /* Surface bg */
  --gray-border:   #E2E8F0;   /* Dividers */

  /* Series */
  --blue:          #2563EB;   /* AXIS */
  --green:         #16A34A;   /* AXIS-C */
  --purple:        #7C3AED;   /* AXIS-H */

  /* Semantic */
  --orange:        #F59E0B;   /* Warning */
  --red:           #EF4444;   /* Error / danger */
  --teal:          #0D9488;   /* Info / success secondary */
}
```

### CBT dark theme palette

From `0_AXIS_CBT_System_Design_Specification_v1_1.html`:

- Base: deep navy `#0B1D3A` → charcoal `#0f1724`
- Series accents retained (blue / green / purple) but at higher saturation for dark-mode contrast
- Timer warning: red `#EF4444` on `rgba(239,68,68,0.15)` background
- Proctoring 1st warning: yellow/orange banner
- Proctoring 2nd re-warning: orange banner
- 3rd forced termination: full red screen

### Color contrast rule

All text must meet **WCAG AA** — 4.5:1 for body, 3:1 for large text (18px+). Brand colors on white are already verified AA-compliant. When placing text on a colored brand surface, darken the brand color until contrast passes.

---

## 3. Typography

### Font
**Noto Sans KR** — single font for both sites, all weights. Loaded from Google Fonts:

```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

Fallbacks: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`

### Weights in use
- **400** — body
- **500** — emphasis, table labels
- **600** — subtitles, secondary headings
- **700** — strong emphasis, button labels
- **800** — page titles, hero copy

### Scale (inferred from the planning docs)

| Use | Size | Weight | Line height |
|---|---|---|---|
| Hero H1 | 28–44px (clamp) | 800 | 1.25 |
| Page H2 | 20–26px | 800 | 1.3 |
| Section H3 | 15–16px | 700 | 1.4 |
| Body | 14–14.5px | 400 | 1.7–1.8 |
| Small / meta | 12–12.5px | 400–500 | 1.6 |
| Label / badge | 10–11px | 700 | 1.4 |

Body line-height of **1.7–1.8** is the project default — Korean text needs more line-spacing than Latin for readability.

### Case rule
**Sentence case** for all Korean and English copy. No Title Case. No ALL CAPS (except for short tags/badges like `GNB`, `CBT`, `FAB`).

---

## 4. Responsive breakpoints

**Three-tier system, consistent across every page:**

| Tier | Range | Layout |
|---|---|---|
| **Mobile** | ~767px | 1 column, hamburger GNB, FAB |
| **Tablet** | 768–1023px | 1–2 columns, desktop GNB, no FAB |
| **Desktop** | 1024px+ | Full grid, max-width centered |

**Max-widths:**
- Main home, registration, certification guide: `max-width: 860px` centered
- Hero section: full-width with `1200px` content container

### Per-section responsive conversion (main home)

| Section | Desktop | Mobile |
|---|---|---|
| GNB | Full horizontal, sticky | Logo + [Take Exam] + hamburger |
| Hero | CTA horizontal, 480px fixed | CTA vertical stack, auto height ≥ 360px |
| Certifications | 3-column grid | Horizontal swipe carousel with dots |
| Take Exam | Full-width banner | Full-width + "PC required" warning |
| Exam Schedule | Status + info + button horizontal | Status + info on top, button bottom full-width |
| Results | Same as schedule | Same as schedule |
| Notices | Tag + title + date horizontal | Tag + title on top, date wraps below |
| Footer | 3-column | Vertical stack, centered |

---

## 5. Component specifications

### Touch targets
- **Minimum 48×48px** per WCAG 2.5.8
- Minimum **8px gap** between adjacent tappable elements
- Form inputs: **height 48px+**, with floating labels
- Step navigation: bottom-sticky, full-width, **height 56px**

### Buttons

| Type | Background | Text | Use |
|---|---|---|---|
| Primary | Series brand color | White | Main CTA |
| Secondary | `--gray-light` with `--gray-border` | `--gray-text` | Secondary action |
| Danger | `--red` | White | Destructive / final submit |
| Disabled | `--gray-light` | `--gray` | Unavailable state |

Radius: `6px` (standard), `100px` (pills for badges and status chips).

### Cards
- Border radius **8–12px**
- Border: `1px solid var(--gray-border)` (light) or `rgba(255,255,255,0.08)` (dark)
- Subtle shadow on hover only (no default shadow — avoids heavy feel)
- Padding: 12–24px depending on density

### Cert cards (main home ② Certifications)
Reference: CompTIA category card pattern, recolored per series.

Each card includes:
1. Cert badge (AXIS / AXIS-C / AXIS-H) in the series color
2. Cert full name + abbreviation
3. One-line description
4. Target audience line
5. Three level rows (L3 / L2 / L1) with format · time · fee
6. [Learn More] link

Cards use the series color as top border accent or background of the badge — not as the full card background.

### FAB — Take Exam
- Bottom-right fixed
- Diameter **56px**
- Shadow elevation 6dp
- Always visible on mobile (no fade-in/out on scroll)
- Desktop: hidden (GNB highlighted button instead)

### Tables
- Header background: `--primary` (navy), white text, 600 weight
- Rows: alternating `#fff` and `--gray-light`
- Border: `1px solid var(--gray-border)` on bottom of each row
- Mobile: horizontal scroll with `overflow-x: auto`, scrollbar styled to 4px rounded

### FAQ accordion
- Each item is a native `<button>` — no ARIA role needed
- `aria-expanded` toggles on click
- `aria-controls` points to the panel
- Only one item open at a time (others auto-close)
- Transition: `0.2s ease`
- Open state: border changes to series brand color + subtle background highlight

### Status badges
Pill shape (border-radius 100px), font-size 10–11px, weight 700, padding 2–4px × 8–14px.

| State | Background | Text |
|---|---|---|
| Active / Registration open | `--green` | White |
| Registered | `--blue` | White |
| Warning / Closing soon | `--orange` | White |
| Closed / Inactive | `--gray` | White |
| Exam pending | `--teal` | White |
| Voided / Failed | `--red` | White |

---

## 6. GNB (global navigation bar)

### axisexam.com

**8 menu items**, Korean-style action-oriented exposure:

1. About AXIS
2. Certifications (dropdown — AXIS, AXIS-C, AXIS-H)
3. Exam Registration
4. **Take Exam** (highlighted button, different color — accent)
5. Results
6. Credential Verify
7. Support (dropdown — Notices, FAQ, 1:1 Inquiry)
8. My Page (after login) / Log In

Rule: **[Take Exam] is always accessible within 2 clicks from anywhere.** It's the site's primary conversion.

### CBT GNB
Minimal — just "AXIS EXAM" branding top-left, session info center, timer top-right. No navigation. The candidate cannot leave.

---

## 7. CBT exam screen layout

This is the most safety-critical screen in the project. Reference: `2_AXIS_CBT_B3_L3_Exam_Screen_Spec.html`.

### Layout structure (PC only, min 1280×720, Fullscreen locked)

```
┌─────────────────────────────────────────────────┐
│  AXIS EXAM    AXIS L3 Starter · Session 1    ⏱ 39:42  │  ← top bar
├─────────┬───────────────────────────────────────┤
│         │                                        │
│ Subject │         Question stem                  │
│  1      │                                        │
│ 1 2 3 4 │   ○ Choice A                          │
│ 5 6 ... │   ○ Choice B                          │
│         │   ○ Choice C                          │
│ Subject │   ○ Choice D                          │
│  2      │                                        │
│ ...     │                                        │
│         │                           [webcam    ] │  ← proctor preview
├─────────┴───────────────────────────────────────┤
│ ← Prev          🚩 Flag     [Final Submit]  Next → │  ← bottom bar
└─────────────────────────────────────────────────┘
```

### Question sidebar
- Fixed left, ~160px wide
- Grouped by subject with small section labels
- 5-column grid of numbered cells, each 24×24px, gap 3px
- Cell states:
  - **Empty** — `rgba(255,255,255,0.08)` bg, muted text
  - **Answered** — series brand color bg, white text
  - **Current** — brighter brand color bg, white text, outer ring/shadow
  - **Flagged** — `--orange` bg, white text

### Timer (top right)
- Red text `--red`, red-tinted background `rgba(239,68,68,0.15)`
- Padding 4px × 12px, radius 6px, size 13px, weight 800
- At 5-minute remaining: pulse animation + warning toast
- At 0: auto-submit

### Per-level layout differences

**L3 (MCQ only):** single question area + choices. Simplest layout.

**L2:** Part 1 written → Part 2 practical (auto-transition). Practical uses a 3-pane layout:
- **Left** — task scenario (fixed)
- **Upper right** — AI chat panel (in-platform LLM)
- **Lower right** — deliverable editor (or code sandbox for AXIS-C)

**L1:** Part A (written) → Part B (practical). Part B is richest: scenario + rich editor + AI panel + similarity-check preview.

### Proctoring UI overlay
- Webcam preview **top-right**, small, cannot be hidden
- 1st warning banner: yellow, top, auto-dismiss 5s
- 2nd re-warning banner: orange, top, manual [OK] required
- 3rd: forced termination full-screen

---

## 8. Accessibility (A11y) requirements

**Target: WCAG AA.** Non-negotiable — this is a government-registered certification.

| Item | Rule |
|---|---|
| Color contrast | Body 4.5:1, large text (18px+) 3:1 |
| Keyboard nav | All interactives Tab-accessible, `:focus-visible` ring |
| Skip links | "Skip to main content" + "Skip to FAQ" on every page |
| Screen reader | Images need `alt`; decorative images `aria-hidden="true"` |
| Status badges | `aria-label` with plain-language state ("Registration open") |
| CTA buttons | `aria-label` specifies destination |
| Forms | Required fields `aria-required`, errors `aria-invalid` + `aria-describedby` |
| Modals | `aria-modal="true"` + focus trap |
| Dynamic content | Verification results, alert subscription: `aria-live="polite"` |
| Motion | Respect `prefers-reduced-motion` — disable all animation/transition |
| Color-only info | Never convey meaning by color alone. Level badges always include "L3"/"L2"/"L1" text |
| Tables | Every table needs `<caption>`, `<th scope="col">`. Mobile horizontal scroll: `role="region"` + `tabindex="0"` |
| FAQ | Native `<button>` elements with `aria-expanded` + `aria-controls` |

---

## 9. SEO & metadata

Each page needs unique title, meta description, and OG tags. Base template:

```html
<title>{Page-specific} | AXIS Certification - axisexam.com</title>
<meta name="description" content="{2-sentence page summary}">
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:image" content="/og-cert-{type}.png">
<meta property="og:type" content="website">
```

**Per-page titles (confirmed):**
- `/` → `AXIS Certification | AI Practical Competency | axisexam.com`
- `/about` → `About AXIS | AI Practical Skills Certification`
- `/cert/axis` → `AXIS Certification | AI Practical Competency Assessment - Exam Info · Scope · Fees`
- `/cert/axis-c` → `AXIS-C Certification | AI Coding & Automation - Exam Info · Scope · Fees`
- `/cert/axis-h` → `AXIS-H Certification | Healthcare AI Practical - Exam Info · Scope · Fees`
- `/apply` → `Exam Registration | AXIS Certification`
- `/exam` → `Take Exam | AXIS Certification`
- `/result` → `Results | AXIS Certification`
- `/verify` → `Credential Verification | AXIS Certification`
- `/mypage` → `My Page | AXIS Certification`
- `/signup` → `Sign Up | AXIS Certification`
- `/support/*` → `Support | AXIS Certification`

**Structured data:**
- Organization JSON-LD on home and footer
- Course schema on each `/cert/*` page
- BreadcrumbList on deep pages

**Performance target:** Lighthouse FCP ≤ 1.5s.

---

## 10. Page-by-page deliverables (axisexam.com)

~13 pages for the main site:

1. **Home** — 7 scroll sections + footer (Hero, Certifications, Take Exam, Exam Schedule, Results, Notices, CTA)
2. **About** — AXIS series intro, philosophy, operating org (AiNex), level overview
3. **Cert Guide — AXIS** (`/cert/axis`)
4. **Cert Guide — AXIS-C** (`/cert/axis-c`)
5. **Cert Guide — AXIS-H** (`/cert/axis-h`)
6. **Exam Registration** (`/apply`) — 4-step flow: cert & level → session → info review → payment
7. **Take Exam** (`/exam`) — environment guide + redirect to CBT
8. **Results** (`/result`) — pass list by session + score check
9. **Credential Verify** (`/verify`) — cert number → authenticity check + enterprise verification guide
10. **Support — Notices** (`/support/notice`)
11. **Support — FAQ** (`/support/faq`)
12. **Support — 1:1 Inquiry** (`/support/ask`)
13. **My Page** (`/mypage`) — registrations, scores, certificates, profile
14. **Sign up / Log in** (`/signup`, `/login`) — with Kakao, Naver, Google social login

The **3 cert guide pages share identical structure** — only content (subjects, target, scenarios) differs. Build once, theme three times.

## 11. Page-by-page deliverables (cbt.axisexam.com)

~8 screens for the CBT:

- **B-1** Exam Entry — login + available exams list
- **B-2** Pre-Exam Prep — 5 sequential steps (Env Check → ID Verify → AI Proctor → Guidelines → Waiting Room)
- **B-3** Exam — L3 (MCQ 40 min)
- **B-4** Exam — L2 (MCQ + practical 75 min)
- **B-5** Exam — L1 (written + deliverable + essay 90 min)
- **B-6** Exception Handling — network, cheating, emergency (overlay, not separate page)
- **B-7** Exam Completion — submission confirmation + results notice + return button
- **B-8** Admin Monitoring — real-time status, AI proctor alerts, candidate management

---

## 12. Design system deliverables (Sprint 1 — Feb 23 to Mar 8)

Per the development plan, by end of Sprint 1 the design team delivers:

**Designer A:**
- axisexam.com design system — colors, typography, components
- Home page design
- GNB

**Designer B:**
- cbt.axisexam.com dark theme design system
- Begin publishing for Home and About pages

The two design systems are **separate files** but share:
- Noto Sans KR
- Series brand colors (Blue / Green / Purple)
- Core component shapes (buttons, cards, badges, forms)

They differ in:
- Background palette (white vs deep navy)
- Elevation (shadow vs border glow)
- Imagery style (photography-friendly vs flat/minimal)

---

## 13. Motion & interaction

- Hover effects: **disabled on mobile** via `@media (hover: hover)`
- Respect `prefers-reduced-motion` globally — drop all transitions, scroll animations, carousel auto-play
- Standard transition: `0.2s ease`
- Swipe (cert carousel on mobile): velocity threshold **200ms**
- No heavy parallax, no video backgrounds, no decorative animation on CBT

---

## 14. Assets (pending at time of planning)

Items explicitly marked pending in the docs — flag these with your PM:

- Final logo / wordmark files
- Brand illustration / icon set
- `og-image` for each of the 3 certs (`/og-cert-axis.png`, `-axis-c.png`, `-axis-h.png`)
- Organization JSON-LD details (address, phone, registered CEO, business number)
- Footer legal info (CEO name, business registration number, e-commerce registration number)
- Hero background: currently CSS gradient + decorative glow as a placeholder, replace when brand assets ready

---

## 15. Browser support

**axisexam.com:**
- Chrome 90+, Safari 15+, Edge 90+, Firefox 90+
- IE not supported
- Mobile: iOS Safari 15+, Chrome Android latest

**cbt.axisexam.com:**
- Chrome latest strongly recommended (Fullscreen API, MediaDevices, Page Visibility all need modern browser)
- Mobile access: blocked — shows "Please use a PC environment" notice
- Minimum resolution: **1280 × 720**

---

## 16. Quick design sanity checklist

Before shipping any screen, verify:

- [ ] Does it meet the series brand color assignment? (AXIS Blue / AXIS-C Green / AXIS-H Purple)
- [ ] Does body text hit 4.5:1 contrast?
- [ ] Is every interactive element ≥ 48×48px on mobile?
- [ ] Is there a focus ring on every interactive element?
- [ ] Does it work at 767px, 1023px, and 1440px widths?
- [ ] Does `prefers-reduced-motion: reduce` disable the animations?
- [ ] Is there a skip link on the page?
- [ ] Do level badges say "L3"/"L2"/"L1" as text, not just color?
- [ ] If it's the CBT, is the page locked to Fullscreen?
- [ ] If it's axisexam.com, is [Take Exam] reachable in ≤ 2 clicks?

