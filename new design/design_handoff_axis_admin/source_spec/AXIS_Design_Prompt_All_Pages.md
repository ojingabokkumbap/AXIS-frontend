# AXIS Certification System — Complete Claude Design Prompt
## All Pages: User Site (axisexam.com) + Admin Portal + CBT Exam System

---

> **How to use this document:** Copy any individual page prompt below and paste it directly into Claude. Each prompt is self-contained and includes all design context needed to generate a pixel-perfect, production-ready HTML/CSS/JS prototype.

---

## ═══ GLOBAL DESIGN SYSTEM (Include in every prompt) ═══

```
GLOBAL DESIGN RULES — apply to every page unless overridden:

Brand: AXIS — AI practical skills certification by AiNex Inc.
Domain: axisexam.com

Color System:
  --primary:    #0F172A  (deep navy — text, headings)
  --blue:       #2563EB  (AXIS General brand color — buttons, links)
  --green:      #16A34A  (AXIS-C Coding brand color)
  --purple:     #7C3AED  (AXIS-H Healthcare brand color)
  --accent:     #00B4D8  (cyan accent — highlights, dividers)
  --orange:     #F97316  (warning states)
  --red:        #DC2626  (danger, fail states)
  --gray:       #64748B  (muted text)
  --gray-text:  #374151  (body text)
  --gray-light: #F8FAFC  (backgrounds)
  --gray-border:#E2E8F0  (borders, dividers)
  --white:      #FFFFFF

Typography: Noto Sans KR (Google Fonts) — weights 400, 500, 600, 700, 800
Benchmark design reference: CompTIA.org certification site style

Site theme: LIGHT (white base, clean, data-dense, trustworthy)
Language: Korean UI
Responsive: Mobile-first, breakpoints at 768px and 1200px
Min desktop width: 1280px

GNB (Global Navigation Bar) — fixed top, white background, 1px bottom border:
  Left: AXIS logo (bold, navy + cyan accent dot)
  Center menu items: 자격안내 ▾ | 시험접수 | 시험응시 (highlighted blue pill) | 합격자 발표 | 자격검증 | 소개 | 고객센터
  Right: 로그인 / 마이페이지

Footer: dark navy (#0F172A), 3-column layout
  Col 1: AXIS logo + AiNex Inc. company info
  Col 2: Quick links (자격안내, 시험접수, 합격자발표, 자격검증)
  Col 3: Contact + social links
  Bottom strip: Copyright © 2026 AiNex Inc. All rights reserved.
```

---

## ═══ PART 1: USER SITE — axisexam.com ═══

---

### PAGE A — 메인 홈 (Home)
**URL:** axisexam.com/

```
Design a full homepage for AXIS — Korea's AI practical skills certification platform.

[Apply Global Design Rules above]

Page sections in scroll order (8 total):

SECTION 1 — Hero Banner
  Layout: Full-width, min-height 600px
  Background: Deep navy gradient (#0F172A → #1E3A5F) with subtle grid pattern overlay
  Left content (60%):
    - Eyebrow tag: "AI 실무역량 국가공인 민간자격" in cyan pill badge
    - H1: "AI를 쓰는 사람이 아니라\nAI로 결과를 만드는 사람"
    - Subtext: "AXIS는 실무에서 AI를 활용해 성과를 낼 수 있는지 검증합니다"
    - Next exam date chip: "🗓 다음 시험: 2026년 6월 14일 (접수중)"
    - CTA buttons: [시험 접수하기] (blue filled) + [자격 안내 보기] (white outline)
  Right side (40%): 3D-style floating certification card mockup with AXIS logo, holographic shine effect

SECTION 2 — 3 Certification Cards
  Title: "3가지 전문 자격"
  Card grid (3 columns, equal width):
    Card 1 — AXIS (일반): Blue #2563EB left border, icon 🧠
      Title: "AXIS", Subtitle: "AI 실무역량검정 (일반)"
      Tags: L3 Starter / L2 Practitioner / L1 Expert
      CTA: [자세히 보기 →]
    Card 2 — AXIS-C (코딩): Green #16A34A left border, icon 💻
      Title: "AXIS-C", Subtitle: "AI 코딩·자동화 실무역량검정"
      Tags: L3 / L2 / L1
      CTA: [자세히 보기 →]
    Card 3 — AXIS-H (의료): Purple #7C3AED left border, icon 🏥
      Title: "AXIS-H", Subtitle: "의료기관 AI 실무역량검정"
      Tags: L3 / L2 / L1
      CTA: [자세히 보기 →]
  Cards have hover lift animation (translateY -4px, shadow deepens)

SECTION 3 — Level System Overview
  Title: "3단계 등급 체계"
  Horizontal step display:
    L3 Starter (기초): "AI 도구를 이해하고 활용할 수 있는 사람" — gray background
    L2 Practitioner (실무): "AI로 실무 성과를 낼 수 있는 사람" — blue background
    L1 Expert (전문): "AI 전략을 설계하고 조직을 이끄는 사람" — dark navy background
  Arrows between levels. Right side: small pass criteria table.

SECTION 4 — [시험 응시하기] CTA Banner
  Full-width cyan/blue gradient band
  Center: "지금 바로 응시하세요" + [시험 응시하기] large white button
  Note: "PC 환경에서 온라인으로 응시 · AI 감독 시스템 운영"

SECTION 5 — Upcoming Exam Schedule
  Title: "시험 일정"
  Table or card list showing next 4 sessions:
    Columns: 자격, 등급, 회차, 접수기간, 시험일, 합격발표, 응시료, 상태(접수중/접수예정)
  Blue badge for "접수중", gray for "접수예정"
  [전체 일정 보기] text link

SECTION 6 — Pass Announcements (합격자 발표)
  Title: "최근 합격자 발표"
  Card list (3 latest announcements):
    Session name + date + [발표 보기] link
  Blurred name list preview (privacy — show 홍**  김** etc.)
  [전체 합격자 조회] button

SECTION 7 — Notices (공지사항)
  Title: "공지사항"
  Simple list: 5 latest notices with date chips
  [더 보기] link

SECTION 8 — Bottom CTA
  Split 2 columns:
    Left: "자격증이 필요하신가요?" + [시험 접수] button
    Right: "기업 인증 조회" + [자격 검증] button
  Background: light gray

Style notes:
- Use Noto Sans KR
- Cards: 12px border-radius, subtle box-shadow
- Section padding: 80px top/bottom desktop, 48px mobile
- Smooth scroll animations on section entry (IntersectionObserver)
- All hover states: 200ms ease transitions
```

---

### PAGE B — 소개 (About AXIS)
**URL:** axisexam.com/about

```
Design the "About AXIS" page for the AXIS certification system.

[Apply Global Design Rules above]

Page sections:

SECTION 1 — Page Hero
  Background: navy gradient (same as home hero but shorter, ~320px)
  Title: "AXIS 소개"
  Breadcrumb: 홈 > 소개

SECTION 2 — Certification Philosophy
  Title: "우리의 철학"
  Large pull-quote centered:
    "AI를 쓰는 사람이 아니라, AI로 결과를 만드는 사람"
  Body paragraph explaining the vision: AI literacy beyond tool usage, focusing on real-world outcomes

SECTION 3 — Why AXIS
  3-column icon cards:
    🎯 "실무 중심 평가" — scenario-based real-task evaluation
    🏆 "3단계 등급" — L3 Starter through L1 Expert progression
    🔒 "엄격한 감독" — AI-powered online proctoring system
  Each card: icon top, title, 2-line description

SECTION 4 — Operating Organization
  Title: "운영 기관"
  2-column: Left = AiNex Inc. logo area + company description
  Right = AiNexEdu platform info + link
  Bottom note: KRIVET PQI 민간자격 등록 번호

SECTION 5 — Level Structure Deep Dive
  Title: "등급 체계"
  3 cards stacked or side by side:
    Each shows: Level badge (L3/L2/L1) + Korean name + English name + Target audience + Exam format + Pass criteria
    L3: 원격 객관식 40분 / 60점 이상
    L2: 객관식 + AI 실습 60-75분 / 60점 이상 + 실기 50% 이상
    L1: 산출물+서술 90분 / 70점 이상 + 산출물 60% 이상

SECTION 6 — Validity & Renewal
  Title: "자격 유효기간"
  Info box: 3년 유효 → 갱신 가능 (계속교육 이수)

SECTION 7 — Certificate Preview
  Title: "자격증 예시"
  Mockup of a certificate card with AXIS branding, holographic seal
```

---

### PAGE C — 자격안내 AXIS (Certification Guide — General)
**URL:** axisexam.com/cert/axis

```
Design the Certification Guide page for AXIS (General AI Skills certification).

[Apply Global Design Rules above]
Accent color for this page: Blue #2563EB

SECTION 1 — Cert Header
  Blue gradient banner (~240px height)
  Left: AXIS logo badge (large, blue) + "AXIS" title + "AI 실무역량검정 (일반)" subtitle
  Right: quick facts chips — "3개 등급" "온라인 CBT" "연 4회" "응시료 44,000~88,000원"

SECTION 2 — Overview & Target Audience
  2 columns:
    Left: What is AXIS? (3 bullet points on who it's for)
    Right: Target audience tags — 직장인, 취업준비생, 대학생, 비개발자, 전 국민

SECTION 3 — Level Details (Tab or 3-card layout)
  Each level card (L3 / L2 / L1):
    - Level badge + name (Starter / Practitioner / Expert)
    - 시험 코드, 시험 형식, 시험 시간, 응시료, 합격 기준
    - 핵심 역량 (bullet list)
    - PQI 직무내용 (formatted)
  
  L3 Starter details:
    형식: 객관식 50문항 / 시간: 40분 / 응시료: 44,000원 / 합격: 60점 이상 (과목별 40% 이상)
    과목: AI 기초이해(15) + AI 도구활용기초(15) + 프롬프트 기초(10) + AI 윤리·리터러시(10)
  
  L2 Practitioner details:
    형식: 객관식 40문항 + AI 실습 2과제 / 시간: 60-75분 / 응시료: 66,000원
    합격: 총점 60점 + 실기 50% 이상 (부분합격제 있음)
    과목: AI 실무활용(15) + 프롬프트 심화(10) + AI 산출물 품질관리(15) + 실기(별도)
  
  L1 Expert details:
    형식: 산출물 제출 + 서술형 / 시간: 90분 / 응시료: 88,000원
    합격: 총점 70점 + 산출물 60% 이상
    과목: AI 전략 기획(30) + AI 거버넌스·윤리(20) + 조직·변화관리(20) + 산출물(30)

SECTION 4 — Exam Scope Accordion
  Title: "검정 범위"
  Accordion per subject: click to expand syllabus detail

SECTION 5 — Skills Acquired
  Title: "취득 후 할 수 있는 것"
  Icon list of practical skills by level

SECTION 6 — Study Guide
  Title: "학습 가이드"
  Cards linking to AiNexEdu courses (per level)
  Note: "자격 취득 전 학습을 권장하나, 코스 이수는 응시 요건이 아닙니다."

SECTION 7 — FAQ Accordion
  5 common questions: 응시 자격, 부분합격, 유효기간, 재응시, 기업 활용 등

Bottom sticky CTA bar: "AXIS 시험 접수하기" [접수 →] button
```

---

### PAGE C2 — 자격안내 AXIS-C (Certification Guide — Coding)
**URL:** axisexam.com/cert/axis-c

```
Design the Certification Guide page for AXIS-C (AI Coding & Automation certification).

[Apply Global Design Rules above]
Accent color for this page: Green #16A34A

Same 7-section structure as AXIS Cert Guide page above, but with AXIS-C specific content:

Cert Header: Green gradient, AXIS-C badge
Target audience: 비개발 직군 재직자, 코딩 입문자, 전 국민 (no prior dev experience required)

L3 details: 객관식 + 코드 읽기형 실습 / 40분 / 코딩 도구 기초 사용 능력
L2 details: 객관식 + AI 코딩 실습 / 60분 / 실제 작동하는 코드 결과물 완성
L1 details: 산출물(자동화 시스템) + 서술형 / 90분 / AI 활용 업무 자동화 시스템 설계

Special L2/L1 note: "코드 에디터 내장 — 브라우저에서 직접 코드 실행"
L2 sandbox badge: "AXIS-C Code Sandbox" with green chip

Style: Green accents throughout, code-aesthetic touches (monospace font for code examples)
```

---

### PAGE C3 — 자격안내 AXIS-H (Certification Guide — Healthcare)
**URL:** axisexam.com/cert/axis-h

```
Design the Certification Guide page for AXIS-H (Healthcare AI certification).

[Apply Global Design Rules above]
Accent color for this page: Purple #7C3AED

Same 7-section structure, AXIS-H specific content:

Cert Header: Purple gradient, AXIS-H badge with medical cross icon
Target audience: 의료기관 전 직종 종사자 (행정·운영·CS·감염안전·문서보고·보안·윤리·홍보)
Key note: "임상 진단·치료 영역은 제외 — 비임상 업무 AI 활용에 집중"

L3: 객관식 / 40분 / 의료기관 업무 맥락의 기초 프롬프트 작성, 환자정보보호·저작권·보안 기초
L2: 객관식 + AI 실습 2과제 / 60-75분 / 의료행정 시나리오 기반 실무 산출물
L1: 산출물(AI 도입 실행계획서) + 서술형 / 90분 / 의료기관 AI 운영체계 설계

Special callout box: "⚕ 의료기관 특화 자격 — 비임상 행정·운영 영역만 평가합니다"
Style: Purple accents, medical/healthcare iconography
```

---

### PAGE D — 시험 접수 (Exam Registration)
**URL:** axisexam.com/registration

```
Design the Exam Registration page for AXIS certification system.

[Apply Global Design Rules above]

This page has 2 main views — show both:

VIEW 1 — Schedule Calendar & List (default view)
  SECTION 1: Page header "시험 접수"
  SECTION 2: Filter bar
    Dropdowns: [자격 전체 ▾] [등급 전체 ▾] [연도·월 ▾]
    Toggle: [캘린더 보기] [목록 보기]
  
  SECTION 3: Calendar View
    Full month calendar grid
    Exam dates shown as colored dots/chips on calendar cells:
      Blue dot = AXIS, Green = AXIS-C, Purple = AXIS-H
    Click date → shows exam card below calendar
  
  SECTION 4: Upcoming Exams List (below calendar or in list mode)
    Card per session:
      Left: Date badge (large day number + month)
      Center: Cert badge (colored) + session name + 등급 + 접수기간
      Right: 응시료 + 잔여석 progress bar + [접수하기] button
      Status chip: 접수중(blue) / 접수예정(gray) / 마감(red) / 합격발표(green)

VIEW 2 — Registration Funnel (3-step wizard, shown as mockup)
  Progress bar: ① 시험 선택 → ② 정보 확인 → ③ 결제
  
  Step 1 — Select Exam:
    Already selected from schedule: shows AXIS L3 제5회 chip
    Confirm details table: 시험일, 시험시간, 접수마감, 응시료
    [다음 →] button
  
  Step 2 — Info Confirmation:
    User info read-only display: 이름, 생년월일, 이메일, 연락처
    Admission ticket delivery method: 이메일 발송 (auto)
    Consent checkboxes: 개인정보 수집·이용 동의
    [결제하기 →] button
  
  Step 3 — Payment:
    Payment method selection: 신용카드 / 계좌이체 / 카카오페이
    Order summary right sidebar
    [결제 완료] button → Success screen with admission ticket download

Design notes:
- Calendar: clean grid, weekday headers, today highlighted
- Progress steps: numbered circles connected by line
- Mobile: step wizard becomes full-screen modal flow
```

---

### PAGE E — 시험 응시 (Take Exam Entry)
**URL:** axisexam.com/take-exam

```
Design the "Take Exam" entry page for AXIS.

[Apply Global Design Rules above]

This is a critical CTA page — it redirects to the CBT system.

SECTION 1 — Page Header
  Title: "시험 응시"
  Subtitle: "시험 당일, 이 페이지에서 응시를 시작하세요."

SECTION 2 — 3 Status Branches (Card Grid)

  Card A — 응시 가능 (Active, Blue):
    Icon: ✅ 초록 체크
    Title: "응시 가능한 시험이 있습니다"
    Exam info: AXIS L3 제5회 | 오늘 14:00~14:40
    [시험 응시하기 →] large blue button (→ opens cbt.axisexam.com)
    Note: "PC 환경 필수 · Chrome 권장"

  Card B — 접수했지만 시험일 아님 (Gray):
    Icon: 🗓
    Title: "접수된 시험이 있습니다"
    "시험일: 2026년 6월 14일 (토) 14:00"
    Countdown timer widget showing D-12 etc.
    [입장 가이드 보기] secondary button

  Card C — 미접수 (Outline):
    Icon: 📋
    Title: "접수된 시험이 없습니다"
    [시험 접수하러 가기 →]

SECTION 3 — Environment Check Guide
  Title: "응시 환경 확인"
  Checklist cards (4 items with icons):
    💻 PC 환경 (노트북/데스크탑) — 필수
    🌐 Chrome 최신버전 — 필수
    📷 웹캠 정상 작동 확인
    🔒 풀스크린 환경 허용

SECTION 4 — 7 Cheating Criteria Warning Box
  Red-bordered warning box:
    Title: "⚠ 부정행위 기준 (자동 감지)"
    List: 화면 이탈, 다른 탭 전환, 외부 프로그램 실행, 타인 대리응시, 웹캠 이탈, 음성 유출, AI 도구 사용
  Note: "적발 시 즉시 시험 종료 및 2년간 응시 제한"
```

---

### PAGE F — 합격자 발표 (Results / Pass Announcements)
**URL:** axisexam.com/results

```
Design the Pass Announcements page.

[Apply Global Design Rules above]

SECTION 1 — Header
  "합격자 발표"

SECTION 2 — Session Selector
  Dropdown: [자격 선택 ▾] [회차 선택 ▾] [조회하기] button
  Or: tabbed filter by AXIS / AXIS-C / AXIS-H

SECTION 3 — Pass List Table
  When session selected, show:
    Announcement date + session info header
    Table: 번호 | 이름(마스킹: 홍**) | 등급 | 합격여부
    Pass = green "합격" chip, Fail = gray "불합격"
    Pagination: 20 per page
  
  My Result shortcut box (if logged in):
    "내 결과 바로 보기" → [마이페이지 성적 조회] link

SECTION 4 — Recent Announcements List
  5 latest session announcements as list items:
    Session name + 발표일 + [보기] button
  Shows when no session selected

SECTION 5 — Appeal Notice
  Box: "이의신청 안내"
  "합격 발표일로부터 7일 이내 이의신청 가능"
  [이의신청 바로가기] button
```

---

### PAGE G — 자격 검증 (Credential Verification)
**URL:** axisexam.com/verify

```
Design the Credential Verification page.

[Apply Global Design Rules above]

SECTION 1 — Header + Search Form
  Title: "자격 검증"
  Subtitle: "AXIS 자격증 진위 여부를 확인하세요"
  
  Verification form (centered, max-width 480px):
    Input: 자격증 번호 (placeholder: AXIS-2026-L3-000123)
    Input: 생년월일 (YYYYMMDD)
    [조회하기] blue button
  
  After successful lookup → Result card:
    Green border box:
      ✅ "유효한 자격증입니다"
      Name: 홍*동
      Cert: AXIS L2 Practitioner
      발급일: 2025-09-15
      유효기간: 2028-09-14
      자격증 번호: AXIS-2025-L2-000089
      [PDF 다운로드] button

SECTION 2 — Enterprise Verification Guide
  Title: "기업 채용·인사담당자 안내"
  Info cards:
    API 조회 방법 (brief guide)
    문의처: verify@axisexam.com
  [API 문서 요청] button
```

---

### PAGE H — 고객센터 (Support)
**URL:** axisexam.com/support

```
Design the Support (Customer Center) page.

[Apply Global Design Rules above]

Left sidebar navigation (desktop): 공지사항 | FAQ | 1:1 문의

DEFAULT VIEW — FAQ:

SECTION 1 — Header
  "고객센터" with search bar: "궁금한 것을 검색하세요"

SECTION 2 — FAQ Category Tabs
  All | 시험 접수 | 응시 환경 | 합격·성적 | 자격증 발급 | 환불·취소 | 기타

SECTION 3 — FAQ Accordion List
  Each item: question text + chevron → expands to answer
  10 sample questions shown (3 open by default)

ANNOUNCEMENTS VIEW:
  List of announcements with: 제목 | 날짜 | [NEW] chip if recent
  Click → opens notice detail (same page, article format)

1:1 INQUIRY VIEW:
  Form:
    카테고리 dropdown
    제목 text input
    내용 textarea (min 100 chars)
    첨부파일 upload (optional)
    [제출하기] button
  
  Inquiry history table (if logged in):
    접수번호 | 제목 | 접수일 | 상태(처리중/완료)
```

---

### PAGE I — 마이페이지 (My Page)
**URL:** axisexam.com/mypage

```
Design the My Page / Dashboard for a logged-in AXIS exam candidate.

[Apply Global Design Rules above]

Layout: Left sidebar (200px) + right content area

SIDEBAR:
  User avatar + name + email
  Menu items (with icons):
    📋 접수 내역 (active)
    📄 성적 조회
    🏆 자격증 발급
    🔔 알림 설정
    👤 프로필 수정

TAB 1 — 접수 내역 (Registration History):
  Table or cards:
    Row: 자격·등급 | 회차 | 접수일 | 시험일 | 응시료 | 상태 | 수험표
    Status chips: 접수완료(blue) / 응시완료(green) / 환불(gray)
    [수험표 출력] button for upcoming exams

TAB 2 — 성적 조회 (Scores):
  Card per exam taken:
    Header: AXIS L3 제4회 | 시험일: 2026-03-15
    Score breakdown:
      필기 총점: 78/100 → 합격 ✅
      과목별 점수 bar chart (4 subjects)
    [성적 확인서 다운로드] button

TAB 3 — 자격증 발급 (Certificates):
  Certificate card per passed exam:
    Cert name + grade + 발급일 + 유효기간
    [PDF 발급] button + [자격 검증 링크 복사] button

TAB 4 — 알림 설정:
  Toggle switches for: 이메일 알림 / SMS 알림
  Notification categories: 시험 일정, 합격 발표, 자격증 만료 알림

TAB 5 — 프로필 수정:
  Form: 이름, 이메일, 연락처, 비밀번호 변경
  [저장하기] button

Design: Clean data-focused layout, tabs with blue active underline, score bars in brand colors
```

---

### PAGE J — 회원가입 / 로그인 (Auth)
**URL:** axisexam.com/login | /signup

```
Design the Login and Sign-Up pages for AXIS.

[Apply Global Design Rules above]

LOGIN PAGE (centered card, max-width 400px):
  Top: AXIS logo
  Title: "로그인"
  Fields:
    이메일 (ID)
    비밀번호
    [로그인] blue full-width button
  Links: 비밀번호 찾기 | 회원가입
  Divider: "또는"
  Social: [카카오 로그인] [네이버 로그인] [Google] (pending decision — show as gray disabled if needed)
  Note: "CBT 시험 시스템과 통합 계정입니다"

SIGN-UP PAGE (centered card, max-width 480px):
  Title: "회원가입"
  Step indicator: ① 기본정보 → ② 약관동의 → ③ 완료
  
  Step 1 fields:
    이름 (실명)
    이메일 (ID로 사용)
    비밀번호 + 확인
    연락처
    생년월일 (본인 확인용)
  
  Step 2 — Terms:
    약관 체크박스 (전체동의 + 개별 3개)
  
  Step 3 — Success:
    ✅ "가입 완료" 
    [시험 접수하러 가기] CTA
```

---

## ═══ PART 2: CBT EXAM SYSTEM — cbt.axisexam.com ═══

---

### CBT B-1 — 시험 입장 (Exam Entry)
**URL:** cbt.axisexam.com/

```
Design the Exam Entry screen for the AXIS CBT (Computer-Based Testing) system.

IMPORTANT DESIGN OVERRIDE — CBT DARK THEME:
  Background: #0F1724 (deep navy-black)
  Surface cards: rgba(255,255,255,0.05)
  Borders: rgba(255,255,255,0.08)
  Primary text: #F1F5F9
  Secondary text: rgba(255,255,255,0.6)
  Accent: #2563EB (blue) or cert-specific color
  Font: Noto Sans KR
  PC Only — min 1280×720 — no mobile support
  Theme rationale: Focus, reduced eye strain, exam-dedicated environment

TOP BAR (fixed):
  Left: AXIS EXAM logo (white)
  Right: 로그인된 사용자명 | 로그아웃

MAIN CONTENT (centered, max-width 720px):
  Title: "응시 가능한 시험"
  
  Exam card list (2-3 cards showing available/registered exams):
    Card per exam:
      Left: Cert badge chip (AXIS blue / AXIS-C green / AXIS-H purple)
      Body: 자격명 + 등급 + 회차 + 시험일시
      Right: Status + [입장하기] button (active) or [시험일 아님] (disabled gray)
    
    Active exam card: blue left border glow, white text
    Inactive: muted appearance
  
  Empty state (no exams): "접수된 시험이 없습니다. axisexam.com에서 접수해주세요."

BOTTOM NOTE:
  "시험 환경 안내: PC + Chrome 필수 · 웹캠·마이크·화면공유 허용 필요"
```

---

### CBT B-2 — 시험 준비 (Pre-Exam Preparation / Waiting Room)
**URL:** cbt.axisexam.com/prep/{exam_id}

```
Design the Pre-Exam Preparation and Waiting Room screen for AXIS CBT.

[Apply CBT Dark Theme from B-1 above]

This screen has 4 sequential steps shown as a progress flow:

STEP INDICATOR (top):
  ① 환경 확인 → ② 본인 인증 → ③ AI 감독 연결 → ④ 대기실
  Current step highlighted in blue

STEP 1 — 환경 확인 (Environment Check):
  Checklist with real-time status icons:
    ✅ 브라우저: Chrome 최신 버전
    ✅ 화면 해상도: 1440×900 (1280×720 이상)
    ⏳ 웹캠: 감지 중... → ✅ 정상
    ⏳ 마이크: 감지 중... → ✅ 정상
    ⚠ 풀스크린: 허용 필요 → [허용하기] button
  [다음 단계 →] button (enabled only when all pass)

STEP 2 — 본인 인증 (Identity Verification):
  Left: Live webcam feed (large preview box, dark border)
  Right:
    Instructions: "정면을 바라보고 얼굴이 잘 보이도록 해주세요"
    [얼굴 촬영] button
    After capture: "AI가 신원을 확인합니다..." loading state
    Success: ✅ "본인 확인 완료"
  [다음 단계 →] button

STEP 3 — AI 감독 연결:
  Status animation: pulsing connection indicator
  Items connecting:
    🎥 웹캠 모니터링 연결 중... ✅
    🖥 화면 공유 연결 중... ✅
    🔒 보안 환경 설정 중... ✅
  Success state: "AI 감독 시스템이 연결되었습니다"
  [대기실로 이동 →]

STEP 4 — 대기실 (Waiting Room):
  Center card:
    Exam info summary (cert, level, session, duration)
    Countdown to start time (large digital clock style: 00:03:47 remaining)
    "시험이 곧 시작됩니다. 준비하세요."
    Webcam small preview (top-right corner, always visible)
  
  Rules reminder box:
    "시험 중 화면 이탈 금지 · AI 도구 사용 금지 · 자리 이탈 금지"
  
  [시험 시작] button activates at scheduled time
```

---

### CBT B-3 — 시험화면 L3 (MCQ Exam — Starter Level)
**URL:** cbt.axisexam.com/exam/{exam_id}

```
Design the L3 Starter Level exam screen for AXIS CBT.

[Apply CBT Dark Theme]
This is FULLSCREEN — no browser chrome visible.

LAYOUT (fixed, no scroll):
  Top Bar (fixed 52px):
    Left: AXIS EXAM logo (small, white)
    Center: "AXIS L3 Starter — 제5회 — 2026.06.14"
    Right: Countdown timer "⏱ 38:24" (turns orange <10min, red <5min)
    Far right: Webcam tiny preview (64×48px circle, always visible, cannot close)

  Left Side Panel (fixed 180px width):
    Title: "문제 목록"
    5×10 grid of question number chips (Q.1–Q.50):
      Empty (not yet answered): dark translucent
      Answered: blue filled
      Current: bright blue with glow border
      Flagged: orange
    Legend below grid: ■ 답변완료 ■ 현재 ■ 깃발표시
    Subject dividers in grid: 과목 1 (1-15), 과목 2 (16-30), etc.

  Center Main Area (flex 1):
    Question header: "Q.23 / 50 — 과목 2: AI 도구활용 기초"
    Subject badge chip (colored by subject)
    
    Question text (large, readable):
      "다음 중 생성형 AI 도구를 활용하여 업무 효율을 높이는 방법으로 가장 적절하지 않은 것은?"
    
    4 Answer choices (radio button style, custom dark UI):
      Each choice: number circle (①②③④) + choice text
      Hover: lighter background
      Selected: blue border + blue number circle
    
    Large padding, comfortable reading space

  Bottom Bar (fixed 52px):
    Left: [← 이전 문제]
    Center: 깃발 toggle button [🚩 표시] 
    Right: [다음 문제 →]
    Far right: [제출하기] button (red/orange)

SUBMIT FLOW (show as overlay modal):
  Pre-submit Review popup:
    "제출 전 확인"
    Table: 미답변 문제 3개 — Q.11, Q.33, Q.47 (links to jump)
    깃발 표시 문제 2개 — Q.5, Q.28
    Warning: "제출 후 수정 불가합니다"
    Buttons: [계속 풀기] [최종 제출]
  
  Final confirm popup:
    "정말 제출하시겠습니까?"
    [취소] [제출]

Design notes:
- No header/footer from main site — completely isolated UI
- Font size for question text: 16-17px for readability
- Side panel question grid: compact 24×24px chips
- Transitions: smooth slide when going prev/next question
```

---

### CBT B-4 — 시험화면 L2 (Mixed Exam — Practitioner)
**URL:** cbt.axisexam.com/exam/{exam_id}

```
Design the L2 Practitioner exam screen for AXIS CBT.

[Apply CBT Dark Theme + L3 base layout]

L2 has TWO PARTS — show Part switching UI:

PART SELECTOR (below top bar):
  Segmented tabs: [Part 1: 필기 (40문항)] [Part 2: AI 실기 (2과제)]
  Current part highlighted in teal/green (#0D9488)

PART 1 — 필기 (same as L3 but 40 questions, 30min):
  Same layout as B-3 but:
    Left panel: Q.1–Q.40 grid
    Timer: 30:00
    Subject dividers: 3 subjects

PART 2 — AI 실기 (show this view):
  Layout: Full center panel (no left question grid — only 2 tasks)
  
  Task tab bar: [과제 1] [과제 2]
  
  TASK 1 (selected):
    Task header: "과제 1 / 2 — AI 산출물 품질관리"
    Timer: 45:00 (shared with task 2)
    
    Scenario box (amber tinted):
      "📋 시나리오: 당신은 마케팅팀 직원입니다. 아래 ChatGPT 프롬프트와 결과물을 검토하고, 지시에 따라 답변하세요."
    
    Given prompt box (code-style, dark monospace):
      Shows a sample AI prompt text
    
    AI Output box:
      Shows a sample AI response
    
    Sub-questions (2-3 items):
      A) 위 AI 산출물에서 발견되는 문제점을 2가지 서술하시오. (객관식 or short text)
      B) 개선된 프롬프트를 작성하시오. (textarea, 300자 이내)
    
  Right panel (200px): AI Chat Window
    Title: "AI 도우미" (allowed tool)
    Chat interface (dark themed)
    Input field + send button
    Note: "시험 범위 내 질문만 허용"

  Bottom bar: [← 과제 1] [과제 2 →] [최종 제출]
```

---

### CBT B-5 — 시험화면 L1 (Expert Level)
**URL:** cbt.axisexam.com/exam/{exam_id}

```
Design the L1 Expert exam screen for AXIS CBT.

[Apply CBT Dark Theme]

L1 is deliverable-based — no MCQ. Layout is document editor style.

TOP BAR: Same as other screens, timer 90:00

MAIN LAYOUT (2-panel split):
  Left panel (40%):
    "📋 시험 지시사항"
    Scenario document (scrollable, readable):
      "귀사는 중견 제조업체입니다. 경영진은 생산·품질 관리 부서에 AI를 도입하기로 결정했습니다. 당신은 AI 도입 전략 기획을 담당하는 팀장입니다."
    
    Tasks:
      과제 A (40점): "AI 도입 실행계획서를 작성하시오" (pre-submission deliverable upload)
      과제 B (30점): "AI 거버넌스 체계를 설계하시오" (in-exam text response)
      과제 C (30점): "조직 변화관리 전략을 기술하시오" (in-exam text response)
    
    Evaluation criteria box (collapsible)
  
  Right panel (60%):
    Tab bar: [과제 A — 파일 업로드] [과제 B — 서술] [과제 C — 서술]
    
    TASK A tab:
      Upload area (drag & drop or click):
        "실행계획서 파일을 업로드하세요 (PDF, DOCX, PPTX)"
        Accepted: ≤10MB
        After upload: file chip with delete option
    
    TASK B tab:
      Rich textarea (dark background, white text):
        Character counter: 0/1000자
        Formatting note: "서술 형식으로 작성 (표, 목록 허용)"
    
    TASK C tab:
      Same textarea layout

  Bottom: [초안 저장] (auto-save indicator) + [최종 제출]

Left sidebar narrow strip (40px): quick jump tabs A/B/C
```

---

### CBT B-6 — 예외처리 (Exception Handling)
**URL:** cbt.axisexam.com/exception

```
Design the Exception Handling screens for AXIS CBT.

[Apply CBT Dark Theme]

Show 4 exception scenarios as separate full-screen overlays:

OVERLAY 1 — 네트워크 끊김 (Network Disconnection):
  Full-screen dark overlay
  Center card (white border, amber accent):
    Icon: 🔴 (pulsing)
    Title: "네트워크 연결이 끊어졌습니다"
    "자동으로 재연결을 시도합니다... (5/300초 경과)"
    Progress spinner
    Note: "시험 데이터는 자동 저장되었습니다"
    "재연결 실패 시: [고객센터 긴급 연결] 버튼"
    Auto-reconnect countdown

OVERLAY 2 — 부정행위 감지 1차 경고 (Cheating Warning):
  Red-tinted dark overlay
  Center card (red border):
    Icon: ⚠️ (large)
    Title: "경고: 화면 이탈이 감지되었습니다"
    "1차 경고입니다. 2회 이상 적발 시 시험이 자동 종료됩니다."
    "경고 횟수: 1 / 2"
    [확인하고 계속하기] red button
    Timestamp of detection

OVERLAY 3 — 부정행위 최종 적발 (Exam Forced End):
  Full red overlay
  Center:
    "시험이 강제 종료되었습니다"
    "부정행위 기준 위반으로 시험이 무효 처리됩니다."
    "응시 제한 기간: 2년 (2026.06.14 ~ 2028.06.13)"
    [결과 확인] button → goes to B-7 with "무효" status

OVERLAY 4 — 긴급 문의 (Emergency Contact):
  Modal panel (right side slide-in):
    "긴급 문의"
    Chat interface with proctor admin
    "평균 응답: 2분 이내"
    Input: 문의 내용
    [전송]
```

---

### CBT B-7 — 시험 종료 (Exam Completion)
**URL:** cbt.axisexam.com/result/{exam_id}

```
Design the Exam Completion screen for AXIS CBT.

[Apply CBT Dark Theme]

Show 3 result states:

STATE 1 — L3 즉시 합격 결과:
  Center card (large, white border):
    Top: "시험 완료" + confetti animation (subtle)
    
    Result badge (large):
      Green circle: "합격" ✅
      Or Red circle: "불합격" ✗
    
    Score display:
      Total: 82점 / 100점 (large number)
      Pass line indicator: ——●——[60점]—————[82점]
    
    Subject breakdown table:
      과목 1: AI 기초이해 — 13/15 (87%)  ✅
      과목 2: AI 도구활용 — 11/15 (73%)  ✅
      과목 3: 프롬프트 기초 — 8/10 (80%) ✅
      과목 4: AI 윤리·리터러시 — 9/10 (90%) ✅
    
    Note: "상세 성적은 마이페이지에서 확인하세요"
    
    Buttons:
      [응시 확인서 출력]
      [axisexam.com으로 이동]

STATE 2 — L2 채점 대기 중:
  Title: "시험이 제출되었습니다"
  Status card:
    필기: 즉시 채점 완료 (32/40점 — 80점)
    실기: ⏳ "AI 1차 채점 후 전문가 검수 예정 (약 2-3일 소요)"
  Note: "최종 합격 발표: axisexam.com 공지 예정"

STATE 3 — 시험 무효 (Void):
  Red-tinted card:
    "시험이 무효 처리되었습니다"
    사유: 부정행위 감지
    응시 제한: 2028년 6월 14일까지

All states: small webcam session summary (monitoring was active, duration shown)
```

---

## ═══ PART 3: ADMIN PORTAL — axisexam.com/admin ═══

---

### ADMIN — 전체 레이아웃 (Global Admin Layout)
```
Design the Admin Portal shell/layout for AXIS.

GLOBAL ADMIN DESIGN:
  Theme: Light (same tone as axisexam.com) — admins work long hours, minimize eye strain
  Layout: Fixed left sidebar (220px) + top bar + right content area
  Benchmark: Notion Admin, Linear, Vercel Dashboard — clean, data-dense
  
  TOP BAR (fixed 56px, white, 1px bottom border):
    Left: "AXIS Admin" logo (navy bold)
    Center: Breadcrumb navigation
    Right: 🔔 notification bell (with red dot badge) + Admin name + Role badge chip + [로그아웃]

  LEFT SIDEBAR (fixed 220px, #F8FAFC background):
    Top: Role badge (super_admin = gold / exam_admin = blue / grading_admin = green / proctor = teal / expert = purple)
    
    Menu groups:
    
    OVERVIEW:
      📊 대시보드          /admin
    
    EXAM MANAGEMENT:
      📅 시험일정 관리      /admin/schedule
      📚 문제은행 관리      /admin/questions
      👥 접수·결제 관리     /admin/registrations
    
    OPERATIONS:
      🖥 응시자 모니터링    /admin/monitor
      ✍ 채점 관리         /admin/grading
      🏆 성적·합격 관리    /admin/results
    
    CONTENT:
      📢 공지·FAQ 관리     /admin/notices
    
    ANALYTICS:
      📈 통계·리포트       /admin/stats
    
    SYSTEM:
      ⚙ 설정             /admin/settings
    
    Active item: blue background, white text, left blue bar indicator
    Inactive: gray text, hover = light blue tint
    
    Bottom: 현재 로그인: 홍관리자 | super_admin | v1.2.0
  
  CONTENT AREA:
    Padding: 24px
    Page title + description at top
    White card-based content sections
    
  DATA TABLE STANDARD:
    Header: navy background, white text
    Even rows: white, odd rows: #F8FAFC
    Row hover: light blue tint
    Sortable columns: sort arrow icon
    Pagination: bottom, "총 247건 | ← 1 2 3 ... 13 →"
    Row click: → navigate to detail page
    
  STATUS CHIP COLORS:
    진행중 / 합격: green (#16A34A)
    접수중 / 정상: blue (#2563EB)  
    대기 / 경고: orange (#F97316)
    위험 / 불합격 / 무효: red (#DC2626)
    완료 / 확정: teal (#0D9488)
    취소 / 환불: gray (#64748B)
```

---

### ADMIN PAGE 1 — 대시보드 (Dashboard)
**URL:** /admin

```
Design the Admin Dashboard for AXIS.

[Apply Admin Global Layout]

Dashboard = first screen after admin login. Shows real-time operational overview.
Auto-refresh: 30 seconds for KPI cards.

LAYOUT (4 sections in grid):

SECTION 1 — KPI Cards (4 cards, top row):
  Card 1 (blue border-left): 
    Label: "오늘 응시자"
    Value: "247명"
    Sub: "진행중 183 / 완료 64"
    
  Card 2 (green border-left):
    Label: "이번달 접수"
    Value: "1,284건"
    Sub: "▲ 전월 대비 +12.3%"
    
  Card 3 (orange border-left):
    Label: "채점 대기"
    Value: "38건"
    Sub: "AI 채점 대기 22 + 전문가 검수 16"
    
  Card 4 (red border-left):
    Label: "부정행위 알림"
    Value: "3건"
    Sub: "오늘 발생 · [확인하기 →]"

SECTION 2 — Two-column grid:

  Left (60%): 현재 진행 중인 시험
    Mini table:
      시험명 | 등급 | 응시중 | 시작시간 | 진행률
      AXIS L3 제5회 | L3 | 183명 | 14:00 | ████░ 73% | [모니터링 →]
      AXIS-C L2 제3회 | L2 | 42명 | 14:00 | ███░░ 51% | [모니터링 →]
    "실시간 데이터 · 30초 자동 갱신" note

  Right (40%): 다가오는 시험 (7일 이내)
    List:
      06.21(토) AXIS L3 · 접수 284/300명 ██████░ [상세]
      06.22(일) AXIS-H L2 · 접수 67/100명 ██████░ [상세]
      06.28(토) AXIS-C L1 · 접수 23/50명 ███░░ [상세]

SECTION 3 — Two-column grid:

  Left: 최근 알림 피드
    Timeline-style list (last 8 alerts):
      🔴 14:23 부정행위 감지 — AXIS L3 제5회 홍**
      🟡 14:05 채점 완료 — AXIS L2 AI 1차 24건
      🔵 13:47 환불 요청 — AXIS-C L2 김**
      🟢 13:30 합격 발표 완료 — AXIS L3 제4회
    [전체 알림 보기] link

  Right: 합격률 요약
    Mini table:
      자격·등급 | 최근 회차 | 응시 | 합격 | 합격률 | 전회 대비
      AXIS L3 | 제4회 | 98 | 71 | 72.4% | ▲+3.2%
      AXIS L2 | 제4회 | 85 | 42 | 49.4% | ▼-2.1%
      AXIS L1 | 제2회 | 40 | 14 | 35.0% | —
    [통계 상세 보기] link

SECTION 4 — 최근 30일 응시 현황 차트(full width):
  Bar chart placeholder (clearly labeled):
    X-axis: dates (last 30 days)
    Y-axis: count
    Stacked bars by level: L3 blue / L2 teal / L1 purple
    Total line overlay
```

---

### ADMIN PAGE 2 — 시험일정 관리 (Schedule Management)
**URL:** /admin/schedule

```
Design the Exam Schedule Management page for AXIS Admin.

[Apply Admin Global Layout]

TOP: Page title "시험일정 관리" + [+ 새 시험 등록] button (blue, right-aligned)

FILTER BAR:
  [자격 전체 ▾] [등급 전체 ▾] [상태 전체 ▾] [연도·월 ▾] [검색] button

TAB ROW: [목록 보기] [캘린더 보기]

LIST VIEW:
  Table (sortable columns):
    회차 | 자격 | 등급 | 접수기간 | 시험일시 | 정원 | 접수수 | 상태 | 관리
    
    Row example:
      제5회 | AXIS | L3 | 06.01~06.10 | 06.14 14:00 | 300명 | 284명 (██████░ 95%) | [접수중](blue chip) | [상세] [수정] [마감]
    
    Status chips: 준비중(gray) / 접수중(blue) / 접수마감(orange) / 진행중(green) / 완료(teal) / 취소(red)
    
    Actions per row: [상세 보기] [수정] [마감처리] [삭제(취소)]

EXAM REGISTRATION MODAL (show as side panel):
  Title: "새 시험 등록"
  Form fields:
    자격 (dropdown: AXIS / AXIS-C / AXIS-H)
    등급 (dropdown: L3 / L2 / L1)
    회차 (auto-incremented, editable)
    접수 시작일 / 접수 마감일
    시험일시 (date + time)
    정원 (number input)
    응시료 (auto-filled from cert, editable)
    L3 상시 여부 (toggle — if on, no registration period needed)
  
  [취소] [등록하기] buttons

CALENDAR VIEW:
  Month grid calendar
  Each exam as colored pill on date
  Click → shows exam details popup
```

---

### ADMIN PAGE 3 — 문제은행 관리 (Question Bank)
**URL:** /admin/questions

```
Design the Question Bank Management page for AXIS Admin.

[Apply Admin Global Layout]

TOP: "문제은행 관리" + [+ 문항 추가] button

FILTER/SEARCH BAR:
  [자격 ▾] [등급 ▾] [과목 ▾] [난이도 ▾] [출제여부 ▾] + Text search input

TAB ROW: [필기 문항] [실기 과제 템플릿] (L1 산출물 과제)

WRITTEN QUESTIONS TABLE:
  Columns: ID | 자격 | 등급 | 과목 | 문항 요약 (truncated) | 난이도 | 정답률 | 출제횟수 | 상태 | 관리
  
  Row: Q-2341 | AXIS | L3 | AI기초이해 | "다음 중 생성형 AI의 특징..." | 중(orange) | 67.3% | 4회 | [활성](green) | [보기] [수정] [비활성화]
  
  Difficulty chips: 하(green) / 중(orange) / 상(red)

QUESTION DETAIL (click [보기]):
  Side panel or modal:
    Full question text
    4 answer choices (correct one highlighted green)
    Explanation text
    Subject + difficulty metadata
    Usage history: "제2회, 제3회, 제4회, 제5회 출제"
    Per-session accuracy rates mini chart
    [수정] [복제] [비활성화] buttons

ADD/EDIT QUESTION MODAL:
  자격 / 등급 / 과목 dropdowns
  난이도 radio: 하 / 중 / 상
  문항 textarea (rich text)
  4 choice fields + "정답" radio selector
  해설 textarea
  [저장] button

PRACTICAL TASK TEMPLATES TAB:
  List of L2 practical task templates:
    Template ID | 자격 | 시나리오 요약 | 과제수 | 최근 사용 | [보기] [수정]
```

---

### ADMIN PAGE 4 — 접수·결제 관리 (Registration & Payment)
**URL:** /admin/registrations

```
Design the Registration and Payment Management page.

[Apply Admin Global Layout]

TOP: "접수·결제 관리"

FILTER BAR:
  [자격 ▾] [등급 ▾] [회차 ▾] [결제상태 ▾] [기간 날짜 범위] [이름/이메일 검색]

SUMMARY CARDS (3 small):
  총 접수: 1,284건 | 결제 완료: 1,261건 | 환불 요청: 23건

MAIN TABLE:
  Columns: 번호 | 이름 | 이메일 | 자격·등급·회차 | 접수일 | 결제금액 | 결제방법 | 결제상태 | 관리
  
  Rows:
    1024 | 홍길동 | hong@... | AXIS L3 제5회 | 06.02 | 44,000원 | 신용카드 | [결제완료](green) | [상세] [환불]
    1023 | 김미래 | kim@... | AXIS-C L2 제3회 | 06.01 | 66,000원 | 카카오페이 | [환불요청](orange) | [상세] [환불처리]
  
  Export button: [Excel 다운로드]

REFUND PROCESSING MODAL:
  Shows registration info + refund policy
  Refund reason dropdown + [환불 확정] button
  Policy note: "시험 7일 전: 전액 환불 / 시험 당일: 환불 불가"
```

---

### ADMIN PAGE 5 — 응시자 모니터링 (Live Proctor Monitor)
**URL:** /admin/monitor

```
Design the Real-Time Candidate Monitoring dashboard for AXIS Admin.

[Apply Admin Global Layout — but this page is darker, monitoring-focused]
Background for content area: #0F1724 (dark) — special exception for monitoring feel

TOP BAR ADDITION: "● LIVE" red pulsing badge + "현재 진행 중인 시험: AXIS L3 제5회 — 183명 응시 중"

EXAM SESSION SELECTOR:
  Chips row: [AXIS L3 제5회 (183명) ●] [AXIS-C L2 제3회 (42명) ●]

MAIN CONTENT (split layout):

LEFT SIDE (70%): Candidate Grid
  Grid of candidate cards (5 per row):
    Each card (small, ~140×100px):
      Top: Webcam frame (live feed placeholder — show gray with person icon)
      Bottom: Name (마스킹: 홍**) + Q.23/50 progress + Time remaining
      Border color: green = normal / orange = warning / red = alert
    
  Status filters above grid: [전체] [정상(164)] [경고(12)] [위험(7)]

RIGHT SIDE (30%): Alert Feed + Actions Panel
  
  ALERT FEED:
    "⚠ 실시간 알림"
    Timeline:
      🔴 14:32 홍** — 화면 이탈 3회 감지 (시험 강제종료 대상) [조치하기]
      🟡 14:28 박** — 외부 프로그램 감지 1회 [경고 발송]
      🟡 14:19 이** — 웹캠 이탈 2회 [확인]
  
  CANDIDATE DETAIL (click on a card):
    Name + session info
    Webcam live feed (larger)
    Alert history list
    Buttons:
      [경고 메시지 발송]
      [시간 보정 (+5분)]
      [시험 강제종료]
      [긴급 채팅 연결]
  
  STATS SUMMARY:
    응시 중: 183명
    제출 완료: 64명
    이탈/종료: 3명
    경고 발생: 15건
```

---

### ADMIN PAGE 6 — 채점 관리 (Grading Management)
**URL:** /admin/grading

```
Design the Grading Management page for AXIS Admin.

[Apply Admin Global Layout]

TOP: "채점 관리" + status summary

TAB ROW: [AI 채점 결과 검수] [전문가 배정·채점] [점수 조정 이력]

TAB 1 — AI 채점 결과 검수:
  
  FILTER: [자격 ▾] [회차 ▾] [채점상태 ▾]
  
  Table:
    응시자 | 자격·등급·회차 | 과제 | AI 채점 점수 | 신뢰도 | 상태 | 관리
    
    홍길동 | AXIS L2 제5회 | 과제 1 | 38/50점 | 🟢 높음 (0.91) | [AI채점완료](blue) | [검수] [확정]
    김미래 | AXIS L2 제5회 | 과제 1 | 29/50점 | 🟡 보통 (0.65) | [검수필요](orange) | [검수]
    이철수 | AXIS L2 제5회 | 과제 2 | — | 🔴 낮음 (0.31) | [전문가배정필요](red) | [배정]
  
  GRADING REVIEW PANEL (click [검수]):
    Split view:
      Left: Original candidate answer (full text)
      Right: 
        AI Rubric scores (per criterion):
          논리성: 8/10 | 완성도: 7/10 | 실무적용: 9/10 | 정확성: 14/20
          AI 총점: 38/50
          AI 근거: "프롬프트 개선안이 명확하나 윤리 검토 부재..."
        
        Reviewer score override fields (editable)
        [AI 점수 확정] or [점수 수정 후 확정]

TAB 2 — 전문가 배정:
  Expert assignment interface:
    Unassigned submissions list (left)
    Available experts list (right, with specialty tags)
    Drag-and-drop or dropdown assignment
    [배정 완료] button per item

TAB 3 — 점수 조정 이력:
  Audit log table: 누가 / 언제 / 어떤 점수를 / 어떻게 바꿨는지
```

---

### ADMIN PAGE 7 — 성적·합격 관리 (Results & Pass Management)
**URL:** /admin/results

```
Design the Results and Pass Management page.

[Apply Admin Global Layout]

TOP: "성적·합격 관리"

FILTER: [자격 ▾] [등급 ▾] [회차 ▾] [합격여부 ▾] [이름 검색]

SUMMARY ROW:
  총 응시: 247명 | 합격: 178명 (72.1%) | 불합격: 69명 | 부분합격: 12명

MAIN TABLE:
  이름 | 자격·등급·회차 | 필기점수 | 실기점수 | 총점 | 합격여부 | 발표상태 | 관리
  
  홍길동 | AXIS L2 제5회 | 80점 | 74점 | 77점 | [합격](green) | [발표완료](teal) | [상세] [수정]
  김미래 | AXIS L2 제5회 | 72점 | 44점 | 58점 | [불합격](red) | [발표완료](teal) | [상세]
  이철수 | AXIS L2 제5회 | 78점 | 52점 | 65점 | [부분합격](orange) | [발표완료](teal) | [상세]

BATCH ACTIONS (top of table):
  [합격 발표 공개] button (publishes results to axisexam.com) — requires confirmation modal
  [이의신청 목록 보기] button
  [성적 일괄 다운로드] Excel

INDIVIDUAL DETAIL MODAL:
  All scores shown + per-subject breakdown
  Score adjustment log (if any)
  [점수 수정] button (only super_admin / grading_admin)
  [이의신청 처리] section
  [자격증 발급] toggle
```

---

### ADMIN PAGE 8 — 공지·FAQ 관리 (Content Management)
**URL:** /admin/notices

```
Design the Announcements and FAQ Management page.

[Apply Admin Global Layout]

TAB ROW: [공지사항] [FAQ] [1:1 문의]

TAB 1 — 공지사항:
  [+ 공지 등록] button (top right)
  Table: 번호 | 제목 | 등록일 | 조회수 | 상태 | 관리
  [수정] [삭제] [비공개] per row
  
  Create/Edit Form (side panel):
    제목 input
    내용 rich text editor (minimal: bold, italic, link, list)
    공개/비공개 toggle
    상단 고정 toggle
    [저장] button

TAB 2 — FAQ:
  Category tabs: [전체] [시험접수] [응시환경] [합격·성적] [자격증] [환불] [기타]
  [+ FAQ 등록] button
  List with drag-handle for reordering
  Each: Q text | 카테고리 | [수정] [삭제]
  
  FAQ Edit Modal:
    카테고리 dropdown
    질문 (Q) input
    답변 (A) textarea
    공개여부 toggle

TAB 3 — 1:1 문의:
  Filter: [전체] [처리중] [완료] [미답변]
  Table: 번호 | 제목 | 작성자 | 접수일 | 카테고리 | 상태
  
  INQUIRY DETAIL (side panel):
    원본 문의 내용 (full)
    첨부파일 (if any)
    답변 textarea
    [답변 저장·발송] button
    Status auto-updates to "완료" on reply
```

---

### ADMIN PAGE 9 — 통계·리포트 (Statistics & Reports)
**URL:** /admin/stats

```
Design the Statistics and Reports page for AXIS Admin.

[Apply Admin Global Layout]
This page is data-visualization heavy.

TOP: "통계·리포트" + Filter [자격 ▾] [기간 ▾] [등급 ▾]

5 INNER TABS:

TAB 1 — 종합 현황:
  Top: 6 KPI cards (2 rows of 3):
    누적 응시자: 12,847명 | 전체 합격률: 64.2% | 이번달 접수: 1,284건
    채점 진행률: 94.3% | 평균 필기점수: 71.3점 | 평균 실기점수: 68.7점
  
  Chart row (2 charts side by side):
    Left: Line chart — 월별 응시자 수 (12개월)
    Right: Donut chart — 자격별 응시 비율 (AXIS/AXIS-C/AXIS-H)

TAB 2 — 합격률 분석:
  Chart 1: Line chart — 회차별 합격률 추이 (최근 10회)
    3 lines: L3 blue / L2 teal / L1 purple
  
  Chart 2: Grouped bar chart — 등급별 합격률 비교
    X: 자격(AXIS/C/H), Grouped by level
  
  Chart 3: Donut — L2 L1 부분합격 비율

TAB 3 — 과목별 분석:
  Heatmap: 문항별 정답률 (rows = subjects, cols = questions)
    Color: green (high accuracy) → red (low accuracy)
  
  Bar chart: 과목별 평균 점수 comparison

TAB 4 — 응시 현황:
  Stacked bar: 회차별 접수/실응시/제출/강제종료
  Line: 응시율 (실응시/접수) per session

TAB 5 — 회원 통계:
  Line chart: 신규 가입자 월별 추이
  Numbers: 재응시율 / 부분합격 면제 사용률 / 제재 현황

EXPORT:
  [PDF 리포트 생성] [Excel 다운로드] buttons (top right of each tab)

Design: Use placeholder chart containers with clear labels. Charts use brand colors. Clean data-table supplementing each chart.
```

---

## ═══ DESIGN TOKENS REFERENCE ═══

```
QUICK COPY — Design System Variables:

/* Colors */
--primary: #0F172A;
--blue: #2563EB;
--green: #16A34A;
--purple: #7C3AED;
--teal: #0D9488;
--accent: #00B4D8;
--orange: #F97316;
--red: #DC2626;
--gray: #64748B;
--gray-text: #374151;
--gray-light: #F8FAFC;
--gray-border: #E2E8F0;

/* CBT Dark Theme */
--cbt-bg: #0F1724;
--cbt-surface: rgba(255,255,255,0.05);
--cbt-border: rgba(255,255,255,0.08);
--cbt-text: #F1F5F9;
--cbt-text-muted: rgba(255,255,255,0.6);

/* Typography */
font-family: 'Noto Sans KR', sans-serif;
/* Weights: 400 (body), 500 (label), 600 (semibold), 700 (bold), 800 (heavy heading) */

/* Spacing scale */
4 / 8 / 12 / 16 / 20 / 24 / 32 / 48 / 64 / 80px

/* Border radius */
--radius-sm: 6px;
--radius-md: 10px;
--radius-lg: 16px;
--radius-xl: 24px;
--radius-full: 9999px;

/* Shadows */
--shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
--shadow-md: 0 4px 12px rgba(0,0,0,0.10);
--shadow-lg: 0 8px 24px rgba(0,0,0,0.12);

/* Transitions */
transition: all 200ms ease;
```

---

*Document prepared for AiNex Inc. / AXIS Certification System — May 2026*
*Total pages covered: 10 user-facing + 7 CBT screens + 9 admin pages = 26 pages*
