# Handoff: AXIS Admin Portal

> Korean AI practical-skills certification system — internal admin/operator portal for AiNex Inc. (`axisexam.com/admin`)

---

## Overview

This bundle contains the complete UI design for the **AXIS Admin Portal** — the internal back-office tool used by operators, graders, proctors, and super-admins to run the AXIS certification program (a Korean civil certification for AI practical skills, with three certs: **AXIS** general / **AXIS-C** coding / **AXIS-H** healthcare, each with three levels L1/L2/L3).

The portal covers 9 top-level admin pages:

1. **Dashboard** (`#dashboard`) — operational overview with live KPIs
2. **Schedule Management** (`#schedule`) — list + calendar of exam sessions
3. **Question Bank** (`#questions`) — written items + practical task templates
4. **Registrations & Payments** (`#registrations`) — funnel, refund handling
5. **Examinees** (`#examinees`) — candidate profiles, history, sanctions, **proctoring evidence**
6. **Live Monitor** (`#monitor`) — dark-themed real-time proctor view (webcam grid + alert feed)
7. **Grading** (`#grading`) — AI 1st-pass review, expert assignment, audit log
8. **Results & Pass Announcement** (`#results`) — final scoring + publish flow
9. **Content** (`#content`) — notices, FAQs, 1:1 inquiries
10. **Stats & Reports** (`#stats`) — 5-tab analytics with charts

---

## About the Design Files

**The files in this bundle are design references created in HTML.** They are interactive prototypes built with React + Babel-in-the-browser to demonstrate intended look, layout, and behavior — they are **NOT production code to ship directly**.

Your task is to **recreate these designs in the target codebase's existing environment** (e.g. Next.js + your component library, a Vue/Nuxt app, etc.) using its established patterns: real router, real data layer, real auth, the team's accessibility conventions, and the team's icon/UI primitives.

If no codebase exists yet, choose the most appropriate stack for an admin portal of this kind. A reasonable default would be:

- **Next.js 14+ (App Router)** with TypeScript
- **TanStack Query** (or RTK Query) for server state
- **shadcn/ui** primitives + **Tailwind CSS** for styling (port the tokens below into `tailwind.config.ts`)
- **Recharts** or **ECharts** for analytics charts
- **lucide-react** for icons (the bundled `icons.jsx` is custom inline SVG — names map ~1:1)
- **react-hook-form + zod** for forms
- **next-intl** for Korean i18n (UI copy is all Korean)

## Fidelity

**High-fidelity (hifi).** Colors, spacing, typography, status chip colors, table styles, modal/panel chrome, button hierarchy, and interaction patterns are all final. Recreate pixel-perfectly using the codebase's primitives — don't approximate.

Notable design choices that must be preserved:

- **Light theme everywhere EXCEPT `/admin/monitor`**, which uses the CBT dark theme (`--cbt-bg: #0B1220`) for proctor focus / reduced eye strain during long sessions.
- **Korean UI throughout** — `font-family: 'Noto Sans KR'`.
- **Cert color coding** (used in tags, chips, left-border accents): AXIS blue `#2563EB` / AXIS-C green `#16A34A` / AXIS-H purple `#7C3AED`.
- **Status chip palette** is semantic, not decorative — don't remap colors:
  - green = 합격 / 정상 / 진행중
  - blue = 접수중 / 결제완료
  - orange = 경고 / 부분합격 / 환불요청
  - red = 위험 / 불합격 / 무효
  - teal = 완료 / 발표완료
  - gray = 취소 / 대기

---

## Design Tokens

Lift these from `styles.css` (lines 1–55) into the target framework's theme config.

### Colors

```
--primary:    #0F172A   /* navy text, headings */
--blue:       #2563EB   /* AXIS brand, primary CTAs, links */
--blue-50:    #EFF6FF
--blue-100:   #DBEAFE
--green:      #16A34A   /* AXIS-C brand, pass/success */
--green-50:   #F0FDF4
--purple:     #7C3AED   /* AXIS-H brand */
--purple-50:  #F5F3FF
--teal:       #0D9488   /* completed/published */
--teal-50:    #F0FDFA
--accent:     #00B4D8   /* cyan accents */
--orange:     #F97316   /* warnings, partial pass */
--orange-50:  #FFF7ED
--red:        #DC2626   /* danger, fail, void */
--red-50:     #FEF2F2
--gray:       #64748B
--gray-50…900             /* full Tailwind-ish gray ramp */
--gray-border: #E2E8F0    /* default border */
--gray-light:  #F8FAFC    /* page background */
--white:       #FFFFFF
```

### CBT Dark Theme (Monitor page only)

```
--cbt-bg:          #0B1220
--cbt-surface:     rgba(255,255,255,0.04)
--cbt-surface-2:   rgba(255,255,255,0.07)
--cbt-border:      rgba(255,255,255,0.10)
--cbt-text:        #F1F5F9
--cbt-text-muted:  rgba(241,245,249,0.55)
```

### Radii

```
--r-sm:   6px
--r-md:   10px
--r-lg:   14px
--r-xl:   20px
--r-full: 9999px
```

### Shadows

```
--shadow-sm: 0 1px 2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.05);
--shadow-md: 0 2px 4px rgba(15,23,42,0.04), 0 6px 16px rgba(15,23,42,0.06);
--shadow-lg: 0 8px 24px rgba(15,23,42,0.10);
```

### Spacing scale (px)

`4 / 8 / 12 / 16 / 20 / 24 / 32 / 48 / 64 / 80`

### Typography

- Family: **Noto Sans KR**, weights 400 / 500 / 600 / 700 / 800
- Body: 14px / 1.5
- Page title (`.page-title`): 22px / 800 / letter-spacing -0.02em
- Page subtitle (`.page-sub`): 13px / 400 / `var(--gray-500)`
- Card title (`.card-title`): 14px / 700
- Table header: 12px / 600 / uppercase-ish / `var(--gray-600)` on `var(--gray-50)` background
- KPI value: 32px / 800 / -0.025em
- Numeric/tabular cells: `font-feature-settings: "tnum"`
- Mono (timestamps, code, IDs): `'JetBrains Mono', monospace`

### Layout constants

- Sidebar width: **232px**
- Top bar height: **56px**
- Min desktop width: 1280px (no mobile/responsive required for admin)
- Content area padding: 24px

---

## Shell / Global Layout

See `shell.jsx`.

### TopBar (`.topbar`)
- Fixed, 56px, white background, 1px bottom border `--gray-border`
- Left: "AXIS **Admin**" wordmark (navy 800), with cyan accent dot.
- Center: breadcrumb (driven by active route — e.g. `시험 운영 / 응시자 모니터링`)
- Right: 🔍 global search input (placeholder: `시험·응시자·문제 검색`), 🔔 notification bell with red dot badge (badge count: 3), divider, admin avatar (initials), admin name + role badge chip, [로그아웃] ghost button.

### Sidebar (`.sidebar`, 232px)
- White background, 1px right border.
- Top: role badge block (e.g. `super_admin` gold pill, `홍관리자`, `admin@ainex.co.kr`).
- Menu grouped with small uppercase group labels:
  - **개요** — 📊 대시보드
  - **시험 운영** — 📅 시험일정 / 📚 문제은행 / 👥 접수·결제 / 🧑 응시자 관리
  - **시험 진행** — 🖥 응시자 모니터링 (with live red dot when sessions are active) / ✍ 채점 관리 / 🏆 성적·합격
  - **컨텐츠** — 📢 공지·FAQ / 📈 통계·리포트
- Active item: blue (`--blue`) left bar (3px), `--blue-50` background, primary text.
- Hover: `--gray-50` background.
- Bottom block: small footer with build version (`v1.2.0`) and logged-in role.

### Routing
Mocks use hash routing (`location.hash` → `dashboard | schedule | questions | registrations | examinees | monitor | grading | results | content | stats`). Replace with the target framework's router. Each page is one route.

---

## Shared Primitives

All defined in `styles.css`. Map these to the codebase's component library:

| Mock class | Purpose | Suggested shadcn/ui equivalent |
|---|---|---|
| `.btn`, `.btn-primary`, `.btn-blue`, `.btn-danger`, `.btn-ghost`, `.btn-sm` | Buttons | `Button` with variants |
| `.input`, `.select` | Form inputs | `Input`, `Select` |
| `.search` (wrapper with `.search-ic` icon + `.input`) | Search box | `Input` with leading icon slot |
| `.card`, `.card-header`, `.card-body`, `.card-title` | Surface containers | `Card` |
| `.tbl-wrap`, `.tbl` | Data tables | `Table` |
| `.chip` + tone (`.green` `.blue` `.orange` `.red` `.teal` `.purple` `.gray`) with `.chip-dot` | Status pills | `Badge` with custom variants |
| `.cert-tag.axis` / `.axisc` / `.axish` | Cert color tags | Custom `<CertTag>` |
| `.kpi-grid` + `.kpi.{tone}` | KPI cards w/ left color bar | Custom `<KpiCard>` |
| `.tabs` > `.tab.active` | Underlined tabs | `Tabs` |
| `.filter-bar` | Row of filter selects + search | Layout wrapper |
| `.bar` > `<span>` | Inline progress bar | `Progress` |
| `.side-panel` + `.panel-overlay` + `.panel-head` / `.panel-body` / `.panel-foot` | Right-side drawer | `Sheet` (shadcn) |
| `.modal-overlay` + centered card | Confirm modals | `Dialog` |
| `.icon-btn` | Square icon button | `Button` variant=`ghost` size=`icon` |
| `.count` | Numeric pill next to tab label / heading | small Badge |

### Status chip API

```tsx
<Chip tone="green">합격</Chip>
<Chip tone="orange" dot>경고</Chip>
```

Tones: `blue | green | orange | red | teal | purple | gray`. Always include a 6px round dot before text on operational/status chips (not on cert tags).

### Table conventions
- Header row: `--gray-50` bg, 12px / 600 text, `--gray-600` color, 1px bottom border `--gray-border`.
- Cell padding: 12px 16px.
- Row hover: `--blue-50` at 50% (very subtle).
- Striping: NO zebra stripes — clean white.
- Numeric/score cells: right-aligned, tabular figures.
- `.cell-strong`: 600 weight, `--primary` color (use for names, IDs).
- `.cell-mono`: monospace (timestamps).
- `.muted`: `--gray-500`.

---

## Pages

For each page, the canonical source is the JSX file listed; full layout, copy, and mock data live there. Below is a high-level spec.

### 1. Dashboard — `page-dashboard.jsx`

**Purpose:** Operational snapshot at admin login. Auto-refresh KPIs every 30s.

**Layout** (single column inside content area, ~12px gaps):
1. Page header — title `대시보드`, sub `실시간 운영 현황 · 30초 자동 갱신`, right actions: `[새로고침]`, `[데이터 내보내기]`
2. **KPI grid** — 4 cards across, each with colored left border (`--blue` / `--green` / `--orange` / `--red`):
   - 오늘 응시자 — 247명 (`진행중 183 / 완료 64`)
   - 이번달 접수 — 1,284건 (`▲ 전월 대비 +12.3%`)
   - 채점 대기 — 38건 (`AI 22 + 전문가 16`)
   - 부정행위 알림 — 3건 (`오늘 발생`) — clickable, navigates to `#monitor`
3. **Two-column row (60/40):**
   - Left card "현재 진행 중인 시험" — mini table (시험명 / 등급 / 응시중 / 시작시간 / 진행률 bar / [모니터링→])
   - Right card "다가오는 시험 (7일 이내)" — list rows with date pill, cert tag, capacity progress bar
4. **Two-column row (50/50):**
   - Left card "최근 알림 피드" — timeline list (8 items, colored pip per tone), [전체 알림 보기]
   - Right card "합격률 요약" — mini table with trend deltas (▲ green / ▼ red)
5. **Full-width chart card** "최근 30일 응시 현황" — stacked bar chart by level (L3 blue / L2 teal / L1 purple) with total line overlay

**Behaviors:**
- KPI cards: subtle hover lift (translateY -1px, deeper shadow)
- "부정행위 알림" card → navigates to monitor route
- "[모니터링 →]" on session row → monitor route with session id query

### 2. Schedule Management — `page-schedule-questions.jsx` (export `Schedule`)

**Purpose:** CRUD exam sessions across all certs/levels.

**Header:** title `시험일정 관리`, right action `[+ 새 시험 등록]` (primary blue).

**Filter bar:** selects for `자격`, `등급`, `상태`, `연도·월` + search.

**View toggle tabs:** `[목록 보기]` / `[캘린더 보기]`

**List view table columns:** 회차 / 자격 / 등급 / 접수기간 / 시험일시 / 정원·접수수 (with progress bar) / 상태 chip / 관리 (`[상세] [수정] [마감]`).

**Calendar view:** month grid; exams appear as cert-colored pills on date cells (max 3 visible, "+N more").

**New exam panel** (right-side drawer, ~440px):
- 자격 dropdown (AXIS/C/H)
- 등급 dropdown (L1/L2/L3)
- 회차 number (auto-incremented)
- 접수 시작/마감 date pickers
- 시험일시 datetime
- 정원 number
- 응시료 (auto from cert/level, editable)
- L3 상시 toggle (when on, registration period grays out)
- Footer: `[취소]` ghost / `[등록하기]` primary

### 3. Question Bank — `page-schedule-questions.jsx` (export `Questions`)

**Tabs:** `필기 문항` / `실기 과제 템플릿`

**Filter bar:** 자격 / 등급 / 과목 / 난이도 / 출제여부 + text search.

**Written items table:** ID / 자격 (cert tag) / 등급 / 과목 / 문항 요약 (truncated 60ch) / 난이도 chip (하 green / 중 orange / 상 red) / 정답률 (with bar) / 출제횟수 / 상태 chip / 관리.

**Detail drawer:** full question + 4 choices (correct one highlighted green with check), 해설, usage history list, per-session accuracy mini chart, action buttons.

**Add/Edit modal:** form fields per the spec; rich textarea for body/explanation; choice rows with radio for correct answer.

### 4. Registrations & Payments — `page-reg-examinees.jsx` (export `Registrations`)

**Header summary chips** (3 inline): 총 접수 / 결제 완료 / 환불 요청.

**Filter bar:** 자격 / 등급 / 회차 / 결제상태 / 기간(date range) / search + `[Excel 다운로드]` action.

**Table:** 번호 / 이름 / 이메일 / 자격·등급·회차 (cert tag) / 접수일 / 결제금액 / 결제방법 / 결제상태 chip / 관리.

**Refund modal:** registration summary + refund-policy callout (`시험 7일 전: 전액 / 시험 당일: 환불 불가`) + reason dropdown + free-text + `[환불 확정]` red button.

### 5. Examinees — `page-reg-examinees.jsx` (export `Examinees`)

**Purpose:** Master candidate list. Clicking a row opens a right drawer with tabs.

**Table columns:** 이름 / 이메일 / 생년월일 / 총 응시 / 보유 자격 (cert tags inline) / 제재 상태 chip / 최근 접속 / 관리.

**Profile drawer tabs:**
1. **기본 정보** — read-only profile fields, contact info, terms acceptance log
2. **응시 이력** — table of all past registrations + score summaries
3. **보유 자격** — certificate cards with issue date, validity (3년), [발급 PDF]
4. **제재 이력** — list of sanctions with start/end dates, reason
5. **감독 증거 (Proctoring Evidence)** — see §5a below. **Key feature.**

#### 5a. Proctoring Evidence tab — `page-evidence.jsx`

Reachable only from inside an examinee profile (not in sidebar).

**Layout:**
1. **Case selector chips** — one chip per violation case; tones split between `무효` (red) and `경고` (orange). Active chip has filled background.
2. **Summary banner** — for the active case:
   - Top: case ID (`EV-2026-0512-003`), session, timestamp range
   - Center: large outcome label (`시험 무효`), AI suspicion score (e.g. `의심도 0.94`)
   - Right: sanction window (`응시 제한: 2026.06.14 ~ 2028.06.13`)
   - Right action: **`[PDF 다운로드]`** button (generates PDF client-side in mock; replace with server-issued URL in production — endpoint suggestion: `GET /api/admin/evidence/{caseId}.pdf`)
3. **Side-by-side media row** — Webcam capture frame (with timestamp overlay) + Screen capture frame, each with a thumbnail strip of 4 timepoints below.
4. **Event timeline** — chronological list: time / event type (chip: 화면이탈 / 외부프로그램 / 웹캠이탈 / 다중얼굴감지 / 음성유출 / 탭전환 / AI도구사용) / evidence-attached flag / `[증거 보기]` button.

**Data model (suggested):**
```ts
interface EvidenceCase {
  id: string;
  examineeId: string;
  sessionId: string;
  outcome: 'void' | 'warning';
  aiSuspicion: number; // 0-1
  sanctionStart?: string; sanctionEnd?: string;
  events: Array<{
    at: string; type: ViolationType; mediaUrls?: string[]; aiNote?: string;
  }>;
  webcamUrl: string; screenUrl: string;
}
```

### 6. Live Monitor — `page-mon-grade-result.jsx` (export `Monitoring`)

**THIS PAGE USES CBT DARK THEME.** Wrap the route's content area in a class that swaps `--bg`, `--text`, and surface tokens to the CBT variants.

**Header:** pulsing red dot + `응시자 모니터링` + `LIVE` red pill; sub `실시간 감독 · WebSocket 연결됨 · {clock}`. Right: `[시간 보정]` ghost (dark variant) / `[긴급 공지]` primary blue.

**Session selector row:** chips per active session (border-cyan when selected, pulsing green dot for live status). Right side: 4 inline numeric stats (응시 중 / 제출 완료 / 경고 / 강제종료) with colored bold numbers.

**Two-column layout (1fr / 380px):**

- **Left card "응시자 화면"** with filter chips (전체 / 정상 / 경고 / 위험), then a **5-column grid of webcam cards**. Each card (140×100):
  - top: faux webcam frame with placeholder avatar icon
  - bottom: masked name (`응시자03**`) + `Q.{n}/50` + remaining time
  - border tone: green/orange/red depending on alert status; selected card has cyan glow

- **Right column:**
  - **Inspector card** — selected examinee detail: large webcam frame with `● REC 1080p` and live timestamp overlay, name, exam info, progress bar (cyan fill), 2×2 action grid: `[경고]` `[일시정지]` `[채팅]` `[강제종료]` (danger red).
  - **Real-time alerts feed card** — timeline rows, each with colored pip, `HH:MM` + masked name + violation type. Auto-scroll to top on new alert.

**Required infra (real implementation):**
- WebSocket connection (`wss://admin.axisexam.com/proctor`) push of per-examinee alerts.
- WebRTC or HLS for live webcam/screen feeds — never store raw streams beyond exam duration; only persist incident clips.

### 7. Grading — `page-mon-grade-result.jsx` (export `Grading`)

**Header summary KPIs (4):** AI 채점 대기 22 / 검수 필요 16 / 전문가 배정 7 / 금일 확정 142.

**Tabs:** `AI 채점 결과 검수` / `전문가 배정·채점` / `점수 조정 이력`

**Tab 1 — AI Review** table columns: 응시자 / 자격·등급·회차 / 과제 / AI 점수 / 신뢰도 (bar: >0.8 green / 0.5-0.8 orange / <0.5 red) / 상태 chip / `[검수]` button.

**Review side panel** (720px wide) — **split view:**
- Left: candidate's full answer (verbatim text in `--gray-50` boxes, monospace for prompt content)
- Right: AI rubric breakdown (4 criteria with progress bars), AI total in blue-50 callout, AI rationale paragraph, reviewer override fields (score input + reason textarea)
- Footer: `[취소]` / `[전문가 재배정]` / `[AI 점수 확정]` primary

**Tab 2 — Expert assignment** — two columns:
- Left card: "미배정 제출물" list (name, cert tag, level, task, time-since-submission)
- Right card: "전문가 풀" list (name, specialty, workload `3/8`, availability chip)
- Drag-and-drop or dropdown assignment (in production, prefer drag with keyboard alternative for a11y)

**Tab 3 — Audit log** table: 시각 (mono) / 대상 / 과제 / 변경 전 (gray chip) / 변경 후 (green chip) / 변경자 / 사유.

### 8. Results & Pass Announcement — `page-mon-grade-result.jsx` (export `Results`)

**Header actions:** `[일괄 Excel]` / `[이의신청 (2)]` / `[합격 발표 공개]` primary.

**Summary strip card** (5 stats inline, dividers between): 총 응시 / 합격 (+rate%) / 불합격 (+rate%) / 부분합격 / 이의신청.

**Table** with checkbox column (for batch publish): 응시자 / 자격·등급·회차 / 필기 / 실기 / 총점 / 합격 chip / 발표 chip / 행 액션.

**Publish confirmation modal** — centered 480px:
- Megaphone icon in blue-50 circle
- Title: `합격 발표를 공개하시겠습니까?`
- Body explaining: results will publish to `axisexam.com/results` + user mypage + auto-send email
- Orange callout: `공개 후 점수 수정은 super_admin만 가능 / 이의신청 기간: 발표일로부터 7일`
- Footer: `[취소]` / `[발표 공개]` primary

### 9. Content Management — `page-content-stats.jsx` (export `Content`)

**Tabs:** `공지사항` / `FAQ` / `1:1 문의`

**공지사항 tab:** `[+ 공지 등록]` + table (번호 / 제목 / 등록일 / 조회수 / 상태 chip / 관리). Edit drawer with rich text editor area (placeholder note: minimal toolbar — bold/italic/link/list), 공개·비공개 toggle, 상단 고정 toggle.

**FAQ tab:** category sub-tabs (전체 / 시험접수 / 응시환경 / 합격·성적 / 자격증 / 환불 / 기타), draggable list (drag handle on hover), each item editable inline or via drawer.

**1:1 문의 tab:** filter chips (전체 / 처리중 / 완료 / 미답변) + table. Click row → detail drawer with full original inquiry, attachments, reply textarea, `[답변 저장·발송]` button (auto-marks complete).

### 10. Stats & Reports — `page-content-stats.jsx` (export `Stats`)

**5 sub-tabs:** 종합 현황 / 합격률 분석 / 과목별 분석 / 응시 현황 / 회원 통계.

Each tab combines KPI cards + charts. Charts in the mock are hand-rolled SVG; **replace with a real chart library** (Recharts recommended). Required chart types:

- Stacked bar (time series — by level)
- Line + multi-line
- Grouped bar (by cert × level)
- Donut/pie (cert distribution, partial-pass ratio)
- Heatmap (subject × question accuracy)

Right-aligned per-tab actions: `[PDF 리포트 생성]` / `[Excel 다운로드]`.

**Chart color mapping** (use everywhere):
- L3 = `--blue` `#2563EB`
- L2 = `--teal` `#0D9488`
- L1 = `--purple` `#7C3AED`
- Cert: AXIS blue / AXIS-C green / AXIS-H purple

---

## Interactions & Behavior

- **Transitions:** `all 160-200ms ease` on hover/active state changes. Drawer slide-in: 240ms ease-out. Modal fade-in: 150ms.
- **Hover states:** rows tint to `--blue-50` (alpha), buttons darken ~6%, cards lift `translateY(-1px)` + deeper shadow.
- **Focus rings:** 2px `--blue` outline at 2px offset (a11y — keep this!).
- **Loading states:** skeleton blocks in `--gray-100`. KPI cards show shimmer while refresh fetching.
- **Empty states:** centered icon + 2-line copy + relevant CTA inside the card.
- **Error states:** red callout banner at top of section with retry button.
- **Toasts** (not in mock — please add): top-right, auto-dismiss 4s, for save/publish/refund confirmations.
- **Keyboard:** all drawers/modals close on Esc; tab order through filter bar → table → pagination.
- **Pagination:** standard `← 1 2 3 ... 13 →` with page size selector (default 20).

---

## State Management

Suggested server-state contract (TanStack Query keys):

```
['dashboard.kpis']                       → refetch 30s
['dashboard.activeSessions']             → refetch 30s
['schedule.list', filters]
['questions.list', filters]
['questions.detail', id]
['registrations.list', filters]
['examinees.list', filters]
['examinees.detail', id]
['examinees.evidence', id]
['monitor.session', sessionId]           → WebSocket
['grading.aiQueue', filters]
['grading.expertPool']
['grading.audit', filters]
['results.list', filters]
['content.notices'] / ['content.faqs'] / ['content.inquiries']
['stats.{tabName}', filters]
```

Mutations: registerExam, refundPayment, publishResults, assignExpert, confirmAiScore, overrideScore, replyInquiry, banExaminee, downloadEvidence.

---

## Internationalization

All UI copy is Korean. Even if the team is bilingual, **don't translate** — these are legal/regulatory terms specific to the Korean certification context (e.g., `부분합격`, `이의신청`, `자격검정`). Put strings in a `ko.json` namespace and gate any future English version behind a separate file.

---

## Accessibility notes

- Status chips also include a colored dot — don't rely on color alone for state.
- Webcam grid uses border color for alert tone — ADD an `aria-label` like "응시자03**, 위험 상태" so screen readers can navigate.
- Live monitor sounds (if you add audio alerts): provide a mute toggle in the topbar.
- Dark monitor page contrast ratios pass WCAG AA on body text but check chips you redesign against `--cbt-bg`.

---

## Assets

- **Icons:** see `icons.jsx` — custom inline SVG (chevron, search, bell, alert, check, close, user, eye, megaphone, sparkle, download, mail, clock, pause, stop, plus, etc.). Recommended swap: `lucide-react` (1:1 name match for almost all). Standard size 14–16px.
- **Fonts:** Google Fonts → Noto Sans KR (weights 400, 500, 600, 700, 800).
- **No raster assets** in this design — the AXIS wordmark is text + cyan dot accent. If a logo SVG is delivered later, replace the wordmark in `TopBar` and the Sidebar.

---

## Files in this bundle

| File | Contents |
|---|---|
| `AXIS Admin.html` | Entry HTML — loads React, Babel, Noto Sans KR, then all jsx files. Open in browser to run the prototype as reference. |
| `styles.css` | All design tokens + component CSS. **Lift tokens from lines 1–55 first.** |
| `shell.jsx` | TopBar + Sidebar + hash router + active-route plumbing |
| `icons.jsx` | Inline SVG icon set |
| `page-dashboard.jsx` | Dashboard |
| `page-schedule-questions.jsx` | Schedule + Question Bank |
| `page-reg-examinees.jsx` | Registrations + Examinees (incl. evidence tab entry) |
| `page-evidence.jsx` | Proctoring Evidence tab (rendered inside Examinee drawer) |
| `page-mon-grade-result.jsx` | Live Monitor + Grading + Results |
| `page-content-stats.jsx` | Content (notices/FAQs/inquiries) + Stats (5 tabs) |
| `source_spec/AXIS_Design_Prompt_All_Pages.md` | Original full spec covering user site + CBT + admin (admin is Part 3) — useful for cross-context understanding of what data flows into the admin from the public site and CBT system. |

## Screenshots

Reference renders of every page, in the `screenshots/` folder:

| # | File | Page |
|---|---|---|
| 01 | `screenshots/01-dashboard.png` | Dashboard |
| 02 | `screenshots/02-schedule.png` | Schedule Management |
| 03 | `screenshots/03-questions.png` | Question Bank |
| 04 | `screenshots/04-registrations.png` | Registrations & Payments |
| 05 | `screenshots/05-examinees.png` | Examinees |
| 06 | `screenshots/06-monitor.png` | Live Monitor (dark theme) |
| 07 | `screenshots/07-grading.png` | Grading |
| 08 | `screenshots/08-results.png` | Results & Pass Announcement |
| 09 | `screenshots/09-content.png` | Content (Notices / FAQ / Inquiries) |
| 10 | `screenshots/10-stats.png` | Stats & Reports |

## How to view the reference

Open `AXIS Admin.html` directly in a modern browser (Chrome). Navigate via the sidebar or the URL hash: e.g. `AXIS Admin.html#monitor`, `#grading`, `#examinees`. Default route is `#dashboard`.

---

## Suggested implementation order

1. **Tokens + shell + 1 simple page (Dashboard).** Prove the design system port (tokens → Tailwind config, primitives → shadcn equivalents, sidebar/topbar layout, routing).
2. **Tables-heavy pages:** Schedule, Registrations, Examinees, Results. They all share the same table + filter-bar + drawer patterns.
3. **Question Bank + Content.** CRUD with drawers and modals.
4. **Grading.** Most complex form interactions (split panel, rubric overrides).
5. **Stats.** Plug real chart library.
6. **Live Monitor.** Needs WebSocket + WebRTC/HLS infra — leave for last, behind a feature flag if needed.
7. **Evidence + PDF export.** Build server endpoint for PDF; the client-side `downloadPdf` in `page-reg-examinees.jsx` is a placeholder only.

Good luck — ping back with any clarifications.
