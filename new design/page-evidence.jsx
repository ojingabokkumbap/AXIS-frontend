// AXIS Admin — Cheating / Proctor Evidence

function Evidence() {
  const [sel, setSel] = React.useState(0);
  const [filter, setFilter] = React.useState("all");

  const cases = [
    {
      id: "EV-2026-0512-003", name: "응시자03**", realName: "홍*동",
      cert: "axis", certLabel: "AXIS", lvl: "L3 제5회", date: "2026.05.12 14:32",
      verdict: "void", verdictLabel: "시험 무효 (강제종료)", restrict: "2026.05.12 ~ 2028.05.11 (2년)",
      severity: "high",
      reasons: ["화면 이탈 3회", "외부 프로그램 감지 1회"],
      events: [
        { t: "14:08:22", type: "warning", icon: "alert", label: "시선 이탈", note: "정면 미주시 12초", evidenceId: 0 },
        { t: "14:14:47", type: "warning", icon: "monitor", label: "화면 전환 시도", note: "Alt+Tab 키 입력 감지", evidenceId: 1 },
        { t: "14:21:03", type: "warning", icon: "user", label: "타인 감지", note: "백그라운드 인물 감지 (8초)", evidenceId: 2 },
        { t: "14:28:11", type: "danger", icon: "monitor", label: "외부 프로그램 실행", note: "ChatGPT 데스크탑 앱 프로세스 감지", evidenceId: 3 },
        { t: "14:32:18", type: "danger", icon: "stop", label: "강제종료", note: "위반 3회 누적 — 시스템 자동 종료" },
      ],
      ai: { score: 0.94, summary: "외부 AI 도구 사용 의심 (높은 신뢰도). 시선 추적과 키 입력 패턴이 다중 위반 패턴과 일치합니다." }
    },
    {
      id: "EV-2026-0512-002", name: "응시자11**", realName: "박*영",
      cert: "axis", certLabel: "AXIS", lvl: "L3 제5회", date: "2026.05.12 14:28",
      verdict: "warning", verdictLabel: "경고 (응시 계속)", restrict: "-",
      severity: "medium",
      reasons: ["외부 프로그램 감지 1회"],
      events: [
        { t: "14:28:03", type: "warning", icon: "monitor", label: "프로세스 감지", note: "Discord.exe — 알림창 노출", evidenceId: 0 },
      ],
      ai: { score: 0.42, summary: "백그라운드 알림창 노출. 의도적 사용 흔적 없음. 1차 경고 발송 후 정상 응시 지속 중." }
    },
    {
      id: "EV-2026-0512-001", name: "응시자22**", realName: "이*수",
      cert: "axis", certLabel: "AXIS", lvl: "L3 제5회", date: "2026.05.12 14:19",
      verdict: "warning", verdictLabel: "경고 2회 (응시 계속)", restrict: "-",
      severity: "medium",
      reasons: ["웹캠 이탈 2회"],
      events: [
        { t: "13:52:11", type: "warning", icon: "monitor", label: "웹캠 이탈", note: "프레임 밖 6초", evidenceId: 0 },
        { t: "14:19:38", type: "warning", icon: "monitor", label: "웹캠 이탈", note: "프레임 밖 9초", evidenceId: 1 },
      ],
      ai: { score: 0.31, summary: "신체 일시 이탈로 판단. 화장실/물 마심 등 일반적 행동 가능성. 추가 위반 시 강제 종료." }
    },
    {
      id: "EV-2026-0511-008", name: "응시자07**", realName: "김*래",
      cert: "axisc", certLabel: "AXIS-C", lvl: "L2 제3회", date: "2026.05.11 15:42",
      verdict: "void", verdictLabel: "시험 무효 (대리응시)", restrict: "2026.05.11 ~ 2031.05.10 (5년)",
      severity: "high",
      reasons: ["본인 인증 실패", "안면 불일치"],
      events: [
        { t: "15:02:11", type: "warning", icon: "user", label: "안면 인식 점수 저하", note: "사전등록 사진 대비 신뢰도 0.62" },
        { t: "15:38:44", type: "danger", icon: "user", label: "대리응시 의심", note: "AI 안면 비교 → 다른 인물 (신뢰도 0.91)", evidenceId: 0 },
        { t: "15:42:02", type: "danger", icon: "stop", label: "강제종료", note: "대리응시 확정 — 운영자 수동 종료" },
      ],
      ai: { score: 0.91, summary: "응시 도중 인물 교체 정황. 사전등록 사진과 시험 시작 시 캡처본은 일치하나, 중반 이후 캡처에서 안면이 변경됨." }
    },
    {
      id: "EV-2026-0508-012", name: "응시자31**", realName: "정*민",
      cert: "axis", certLabel: "AXIS", lvl: "L2 제5회", date: "2026.05.08 14:11",
      verdict: "cleared", verdictLabel: "검토 후 정상 처리", restrict: "-",
      severity: "low",
      reasons: ["오탐 — 가족 입실"],
      events: [
        { t: "14:11:08", type: "warning", icon: "user", label: "타인 감지", note: "백그라운드 인물 통과 3초" },
      ],
      ai: { score: 0.28, summary: "단순 통과로 판단. 운영자 검토 후 위반 사항 없음으로 종결." }
    },
  ];

  const filtered = filter === "all" ? cases : cases.filter(c => c.verdict === filter);
  const c = filtered[Math.min(sel, filtered.length - 1)] || cases[0];

  const verdictTones = { void: "red", warning: "orange", cleared: "green", review: "blue" };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">부정행위 증거</h1>
          <p className="page-sub">실시간 감독 시스템이 기록한 위반 이벤트와 증거 자료 (웹캠·화면·이벤트 로그)</p>
        </div>
        <div className="page-actions">
          <button className="btn"><Icon name="download" size={14}/> 증거 패키지 (.zip)</button>
          <button className="btn"><Icon name="file" size={14}/> 위반 리포트 PDF</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
        <div className="kpi red"><div className="kpi-label">시험 무효</div><div className="kpi-value">8<span className="unit">건</span></div><div className="kpi-sub">최근 30일</div></div>
        <div className="kpi orange"><div className="kpi-label">경고 (응시 계속)</div><div className="kpi-value">31<span className="unit">건</span></div><div className="kpi-sub">평균 1.2회/응시</div></div>
        <div className="kpi green"><div className="kpi-label">검토 후 정상</div><div className="kpi-value">12<span className="unit">건</span></div><div className="kpi-sub">오탐 처리율 28%</div></div>
        <div className="kpi blue"><div className="kpi-label">제재 진행중</div><div className="kpi-value">14<span className="unit">명</span></div><div className="kpi-sub">응시 제한 누계</div></div>
      </div>

      <div className="filter-bar">
        <div style={{ display: "flex", gap: 4 }}>
          {[["all","전체"],["void","무효"],["warning","경고"],["cleared","정상처리"]].map(([id, lbl]) => (
            <span key={id} className={"chip " + (filter === id ? "blue" : "gray")} style={{ padding: "5px 12px", cursor: "pointer" }} onClick={() => { setFilter(id); setSel(0); }}>{lbl}</span>
          ))}
        </div>
        <select className="select"><option>자격 전체</option></select>
        <select className="select"><option>회차 전체</option></select>
        <select className="select"><option>심각도 전체</option></select>
        <div className="search"><span className="search-ic"><Icon name="search" size={14}/></span><input className="input" placeholder="응시자/케이스 ID 검색"/></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 16 }}>
        {/* List */}
        <div className="card" style={{ padding: 0, alignSelf: "start" }}>
          <div className="card-header"><h3 className="card-title">위반 케이스 ({filtered.length})</h3></div>
          <div>
            {filtered.map((cs, i) => (
              <div key={cs.id} onClick={() => setSel(i)} style={{
                padding: "14px 16px",
                borderBottom: "1px solid var(--gray-100)",
                cursor: "pointer",
                background: sel === i ? "var(--blue-50)" : "white",
                borderLeft: sel === i ? "3px solid var(--blue)" : "3px solid transparent",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "center" }}>
                  <span className="cell-mono muted" style={{ fontSize: 11 }}>{cs.id}</span>
                  <span className={"chip " + verdictTones[cs.verdict]} style={{ fontSize: 10 }}><span className="chip-dot"/>{cs.verdictLabel}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)" }}>{cs.name} <span style={{ fontWeight: 400, color: "var(--gray-500)" }}>· {cs.realName}</span></div>
                <div style={{ fontSize: 11, color: "var(--gray-500)", marginTop: 2 }}>
                  <span className={"cert-tag " + cs.cert} style={{ fontSize: 9 }}>{cs.certLabel}</span> {cs.lvl} · {cs.date}
                </div>
                <div style={{ marginTop: 6, fontSize: 11, color: "var(--gray-600)" }}>
                  {cs.reasons.map((r, ri) => <span key={ri} style={{ marginRight: 6 }}>· {r}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail */}
        <CaseDetail c={c}/>
      </div>
    </div>
  );
}

function CaseDetail({ c }) {
  const [evIdx, setEvIdx] = React.useState(0);
  React.useEffect(() => { setEvIdx(0); }, [c.id]);
  const evidenceEvents = c.events.filter(e => e.evidenceId != null);
  const cur = evidenceEvents[evIdx] || evidenceEvents[0];
  const verdictTones = { void: "red", warning: "orange", cleared: "green" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Header card */}
      <div className="card" style={{ padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 16 }}>
          <div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
              <span className="cell-mono muted" style={{ fontSize: 11 }}>{c.id}</span>
              <span className={"chip " + verdictTones[c.verdict]}><span className="chip-dot"/>{c.verdictLabel}</span>
            </div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "var(--primary)", letterSpacing: "-0.01em" }}>
              {c.name} <span style={{ color: "var(--gray-500)", fontWeight: 500, fontSize: 16 }}>· {c.realName}</span>
            </h2>
            <div style={{ fontSize: 13, color: "var(--gray-600)", marginTop: 6 }}>
              <span className={"cert-tag " + c.cert}>{c.certLabel}</span> {c.lvl} · 응시일 {c.date}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn"><Icon name="user" size={13}/> 응시자 프로필</button>
            {c.verdict === "void" && <button className="btn btn-danger"><Icon name="alert" size={13}/> 제재 관리</button>}
            {c.verdict === "warning" && <button className="btn btn-blue">처분 결정</button>}
          </div>
        </div>
        {c.restrict !== "-" && (
          <div style={{ marginTop: 14, padding: "10px 14px", background: "var(--red-50)", border: "1px solid #FECACA", borderRadius: 8, display: "flex", gap: 12, alignItems: "center" }}>
            <Icon name="alert" size={16} color="#DC2626"/>
            <div style={{ flex: 1, fontSize: 12 }}>
              <b style={{ color: "var(--red)" }}>응시 제한 기간:</b> <span style={{ color: "var(--gray-700)" }}>{c.restrict}</span>
            </div>
          </div>
        )}
      </div>

      {/* Evidence viewer */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">증거 자료 — 웹캠·화면 캡처</h3>
          <span className="muted" style={{ fontSize: 11 }}>{evidenceEvents.length}건 중 {evIdx + 1}번째</span>
        </div>
        <div style={{ padding: 18 }}>
          {evidenceEvents.length > 0 ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <EvidenceFrame label="웹캠 (응시자)" type="cam" event={cur} caseId={c.id}/>
                <EvidenceFrame label="화면 (응시자 PC)" type="screen" event={cur} caseId={c.id}/>
              </div>
              <div style={{ marginTop: 10, padding: "10px 14px", background: "var(--gray-50)", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                <div>
                  <b style={{ color: "var(--primary)" }}>{cur.label}</b>
                  <span style={{ color: "var(--gray-500)", margin: "0 8px" }}>·</span>
                  <span style={{ color: "var(--gray-600)" }}>{cur.note}</span>
                </div>
                <span className="cell-mono muted">{cur.t}</span>
              </div>

              {/* thumbnails */}
              <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
                {evidenceEvents.map((e, i) => (
                  <div key={i} onClick={() => setEvIdx(i)} style={{
                    width: 100, height: 64, borderRadius: 6, cursor: "pointer",
                    border: evIdx === i ? "2px solid var(--blue)" : "2px solid var(--gray-200)",
                    overflow: "hidden", position: "relative", background: "var(--gray-900)"
                  }}>
                    <FakeFrame seed={c.id + i} type="cam" small/>
                    <span style={{ position: "absolute", bottom: 2, left: 4, fontSize: 9, color: "white", fontFamily: "monospace", textShadow: "0 1px 2px black" }}>{e.t}</span>
                    {e.type === "danger" && <span style={{ position: "absolute", top: 2, right: 2, width: 6, height: 6, borderRadius: "50%", background: "var(--red)" }}/>}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 14, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button className="btn btn-sm"><Icon name="download" size={12}/> 영상 다운로드 (전체 회차)</button>
                <button className="btn btn-sm"><Icon name="download" size={12}/> 캡처 이미지 (.zip)</button>
              </div>
            </>
          ) : (
            <div style={{ padding: 24, textAlign: "center", color: "var(--gray-500)", fontSize: 13 }}>이 케이스는 화면/웹캠 캡처가 없습니다 (이벤트 로그만 존재)</div>
          )}
        </div>
      </div>

      {/* AI assessment */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title"><Icon name="sparkle" size={14}/> AI 감독 분석</h3>
          <span className={"chip " + (c.ai.score > 0.7 ? "red" : c.ai.score > 0.4 ? "orange" : "green")}>
            <span className="chip-dot"/>의심도 {(c.ai.score * 100).toFixed(0)}%
          </span>
        </div>
        <div style={{ padding: 18, display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ width: 80, textAlign: "center" }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: c.ai.score > 0.7 ? "var(--red)" : c.ai.score > 0.4 ? "var(--orange)" : "var(--green)", letterSpacing: "-0.02em" }}>
              {(c.ai.score * 100).toFixed(0)}<span style={{ fontSize: 14, color: "var(--gray-500)" }}>%</span>
            </div>
            <div style={{ fontSize: 10, color: "var(--gray-500)", marginTop: 2 }}>AI 신뢰도</div>
          </div>
          <div style={{ flex: 1, fontSize: 13, color: "var(--gray-700)", lineHeight: 1.7 }}>{c.ai.summary}</div>
        </div>
      </div>

      {/* Timeline */}
      <div className="card">
        <div className="card-header"><h3 className="card-title">이벤트 타임라인</h3></div>
        <div style={{ padding: "8px 18px 18px" }}>
          {c.events.map((e, i) => (
            <div key={i} style={{ display: "flex", gap: 14, padding: "12px 0", borderBottom: i < c.events.length - 1 ? "1px solid var(--gray-100)" : "none", alignItems: "start" }}>
              <span className="cell-mono" style={{ fontSize: 11, color: "var(--gray-500)", minWidth: 60, paddingTop: 4 }}>{e.t}</span>
              <div style={{
                width: 28, height: 28, borderRadius: 8, display: "grid", placeItems: "center", flexShrink: 0,
                background: e.type === "danger" ? "var(--red-50)" : e.type === "warning" ? "var(--orange-50)" : "var(--gray-100)",
                color: e.type === "danger" ? "var(--red)" : e.type === "warning" ? "var(--orange)" : "var(--gray-500)",
              }}>
                <Icon name={e.icon} size={14}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)" }}>{e.label}</div>
                <div style={{ fontSize: 12, color: "var(--gray-600)", marginTop: 2 }}>{e.note}</div>
              </div>
              {e.evidenceId != null && <span className="chip blue" style={{ fontSize: 10 }}>📸 증거 있음</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EvidenceFrame({ label, type, event, caseId }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--gray-500)", marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
        <span>{label}</span>
        <span className="cell-mono">{event.t}</span>
      </div>
      <div style={{
        position: "relative", aspectRatio: "16/10", borderRadius: 10, overflow: "hidden",
        border: event.type === "danger" ? "2px solid var(--red)" : "2px solid var(--gray-200)",
        background: "#0F1724",
      }}>
        <FakeFrame seed={caseId + event.t + type} type={type}/>
        <span style={{ position: "absolute", top: 8, left: 10, fontSize: 10, fontWeight: 700, color: "white", background: event.type === "danger" ? "var(--red)" : "rgba(0,0,0,0.5)", padding: "2px 8px", borderRadius: 4, letterSpacing: "0.05em" }}>
          ● REC
        </span>
        <span style={{ position: "absolute", top: 8, right: 10, fontSize: 10, color: "rgba(255,255,255,0.8)", fontFamily: "monospace", background: "rgba(0,0,0,0.5)", padding: "2px 6px", borderRadius: 4 }}>{event.t}</span>
        {event.type === "danger" && (
          <div style={{ position: "absolute", bottom: 10, left: 10, right: 10, padding: "6px 10px", background: "rgba(220,38,38,0.9)", borderRadius: 6, fontSize: 11, fontWeight: 600, color: "white" }}>
            <Icon name="alert" size={11}/> {event.label}
          </div>
        )}
      </div>
    </div>
  );
}

function FakeFrame({ seed, type, small }) {
  // Deterministic "ghost" frame placeholder — no real images
  const hash = [...(seed || "")].reduce((a, c) => a + c.charCodeAt(0), 0);
  if (type === "cam") {
    return (
      <svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%" }}>
        <defs>
          <radialGradient id={"bg" + hash} cx="50%" cy="40%">
            <stop offset="0%" stopColor="#3B4660"/>
            <stop offset="100%" stopColor="#0B1220"/>
          </radialGradient>
        </defs>
        <rect width="160" height="100" fill={`url(#bg${hash})`}/>
        {/* desk lamp glow */}
        <ellipse cx={120 + (hash % 8)} cy="20" rx="22" ry="14" fill="#F4D77A" opacity="0.18"/>
        {/* person silhouette */}
        <ellipse cx={80 + (hash % 12) - 6} cy={62} rx="22" ry="26" fill="#1F2937"/>
        <circle cx={80 + (hash % 12) - 6} cy={36} r="14" fill="#374151"/>
        {/* face highlight */}
        <ellipse cx={78 + (hash % 12) - 6} cy={34} rx="4" ry="2" fill="#4B5563" opacity="0.7"/>
        <ellipse cx={84 + (hash % 12) - 6} cy={34} rx="4" ry="2" fill="#4B5563" opacity="0.7"/>
        {/* scanlines for "evidence" feel */}
        {[...Array(20)].map((_, i) => <line key={i} x1="0" x2="160" y1={i*5} y2={i*5} stroke="white" strokeOpacity="0.02"/>)}
        {!small && (
          <text x="8" y="94" fontSize="6" fill="rgba(255,255,255,0.4)" fontFamily="monospace">AXIS-CAM-{(hash * 7 % 9999).toString().padStart(4, "0")}</text>
        )}
      </svg>
    );
  }
  // screen capture - exam UI mock
  return (
    <svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%" }}>
      <rect width="160" height="100" fill="#0F1724"/>
      <rect x="0" y="0" width="160" height="8" fill="#1A2438"/>
      <rect x="4" y="3" width="20" height="2.5" fill="#2563EB" rx="0.5"/>
      <text x="80" y="6" fontSize="3" fill="rgba(255,255,255,0.6)" textAnchor="middle">AXIS L3 · Q.{(hash % 40) + 1}/50</text>
      <text x="150" y="6" fontSize="3" fill="#F97316" textAnchor="end" fontFamily="monospace">38:24</text>
      {/* sidebar */}
      <rect x="0" y="8" width="22" height="92" fill="rgba(255,255,255,0.03)"/>
      {[...Array(15)].map((_, i) => (
        <rect key={i} x={3 + (i % 5) * 4} y={14 + Math.floor(i / 5) * 4} width="3" height="3" fill={i < (hash % 12) ? "#2563EB" : "rgba(255,255,255,0.1)"} rx="0.5"/>
      ))}
      {/* question */}
      <rect x="28" y="14" width="100" height="3" fill="rgba(255,255,255,0.7)" rx="1"/>
      <rect x="28" y="20" width="80" height="2" fill="rgba(255,255,255,0.4)" rx="1"/>
      <rect x="28" y="24" width="90" height="2" fill="rgba(255,255,255,0.4)" rx="1"/>
      {/* choices */}
      {[0,1,2,3].map(i => (
        <g key={i}>
          <circle cx="32" cy={40 + i * 12} r="2" fill="none" stroke={i === (hash % 4) ? "#2563EB" : "rgba(255,255,255,0.3)"} strokeWidth="0.6"/>
          {i === (hash % 4) && <circle cx="32" cy={40 + i * 12} r="1" fill="#2563EB"/>}
          <rect x="38" y={39 + i * 12} width={50 + i * 6} height="2" fill="rgba(255,255,255,0.5)" rx="0.5"/>
        </g>
      ))}
      {/* suspicious overlay - chat window */}
      {hash % 3 === 0 && (
        <g>
          <rect x="100" y="55" width="55" height="35" fill="#10B981" opacity="0.15" rx="2"/>
          <rect x="100" y="55" width="55" height="6" fill="#10B981" rx="2"/>
          <text x="103" y="59.5" fontSize="3" fill="white" fontWeight="bold">ChatGPT</text>
          {[0,1,2].map(i => <rect key={i} x="103" y={64 + i * 5} width={20 + i * 8} height="1.5" fill="rgba(255,255,255,0.6)" rx="0.5"/>)}
        </g>
      )}
      {/* webcam pip */}
      <rect x="138" y="84" width="18" height="12" fill="#1F2937" rx="1"/>
      <circle cx="147" cy="89" r="2.5" fill="#374151"/>
      {!small && <text x="155" y="98" fontSize="3" fill="rgba(255,255,255,0.3)" textAnchor="end" fontFamily="monospace">SCREEN-{(hash * 3 % 9999).toString().padStart(4, "0")}</text>}
    </svg>
  );
}

window.Evidence = Evidence;
