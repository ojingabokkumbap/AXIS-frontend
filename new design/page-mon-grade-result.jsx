// AXIS Admin — Monitoring (dark) + Grading + Results

function Monitoring() {
  const [selected, setSelected] = React.useState(2);
  const cands = Array.from({ length: 30 }, (_, i) => {
    const tones = ["ok","ok","ok","ok","ok","ok","ok","ok","warning","ok","ok","danger","ok","ok","ok","warning","ok","ok","ok","ok","ok","warning","ok","ok","danger","ok","ok","ok","ok","ok"];
    return {
      name: `응시자${(i+1).toString().padStart(2,"0")}**`,
      q: 10 + (i*7) % 40,
      time: `${(38 - (i*3)%30).toString().padStart(2,"0")}:${((i*17)%60).toString().padStart(2,"0")}`,
      tone: tones[i] || "ok"
    };
  });
  const sel = cands[selected];
  return (
    <div className="mon-shell">
      <div className="page-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--red)", display: "inline-block", boxShadow: "0 0 0 5px rgba(220,38,38,0.2)" }}/>
            <h1 className="page-title" style={{ margin: 0 }}>응시자 모니터링</h1>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "var(--red)", border: "1px solid rgba(220,38,38,0.4)", padding: "2px 6px", borderRadius: 4 }}>LIVE</span>
          </div>
          <p className="page-sub" style={{ marginTop: 6 }}>실시간 감독 · WebSocket 연결됨 · 14:32:18</p>
        </div>
        <div className="page-actions">
          <button className="btn" style={{ background: "rgba(255,255,255,0.05)", borderColor: "var(--cbt-border)", color: "white" }}><Icon name="clock" size={14}/> 시간 보정</button>
          <button className="btn btn-blue">긴급 공지</button>
        </div>
      </div>

      {/* Session selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
        {[
          { name: "AXIS L3 제5회", n: 183, active: true },
          { name: "AXIS-C L2 제3회", n: 42, active: false },
        ].map((s, i) => (
          <div key={i} style={{
            padding: "8px 14px",
            border: s.active ? "1px solid var(--accent)" : "1px solid var(--cbt-border)",
            borderRadius: 10,
            background: s.active ? "rgba(0,180,216,0.08)" : "rgba(255,255,255,0.03)",
            display: "flex", alignItems: "center", gap: 10,
            cursor: "pointer"
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green)" }}/>
            <span style={{ color: "white", fontWeight: 600, fontSize: 13 }}>{s.name}</span>
            <span style={{ color: "var(--cbt-text-muted)", fontSize: 12 }}>{s.n}명</span>
          </div>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: 24, fontSize: 12, color: "var(--cbt-text-muted)" }}>
          <span><b style={{ color: "white", fontSize: 16, fontFeatureSettings: '"tnum"' }}>183</b> 응시 중</span>
          <span><b style={{ color: "var(--green)", fontSize: 16, fontFeatureSettings: '"tnum"' }}>64</b> 제출 완료</span>
          <span><b style={{ color: "var(--orange)", fontSize: 16, fontFeatureSettings: '"tnum"' }}>15</b> 경고</span>
          <span><b style={{ color: "var(--red)", fontSize: 16, fontFeatureSettings: '"tnum"' }}>3</b> 강제종료</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 14 }}>
        {/* Left: grid */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">응시자 화면</h3>
            <div style={{ display: "flex", gap: 6 }}>
              {[
                ["전체", 183, null],
                ["정상", 164, "green"],
                ["경고", 12, "orange"],
                ["위험", 7, "red"],
              ].map(([l, n, c], i) => (
                <span key={i} className={"chip " + (c || "gray")} style={{ fontSize: 11, padding: "3px 8px", cursor: "pointer" }}>
                  {l} <b style={{ marginLeft: 4 }}>{n}</b>
                </span>
              ))}
            </div>
          </div>
          <div className="card-body" style={{ padding: 12 }}>
            <div className="mon-grid">
              {cands.map((c, i) => (
                <div key={i}
                  onClick={() => setSelected(i)}
                  className={"cam-card" + (c.tone === "warning" ? " warning" : c.tone === "danger" ? " danger" : "") + (selected === i ? " selected" : "")}>
                  <div className="cam-feed">
                    <div className="cam-avatar"><Icon name="user" size={16}/></div>
                  </div>
                  <div className="cam-info">
                    <div className="cam-name">{c.name}</div>
                    <div className="cam-progress">
                      <span>Q.{c.q}/50</span>
                      <span style={{ color: c.tone === "danger" ? "var(--red)" : c.tone === "warning" ? "var(--orange)" : "var(--cbt-text-muted)" }}>{c.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: inspector + alerts */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">응시자 상세</h3>
              <span className="chip red"><span className="chip-dot"/>위험</span>
            </div>
            <div className="card-body">
              <div style={{ background: "rgba(0,0,0,0.4)", borderRadius: 8, aspectRatio: "16/10", display: "grid", placeItems: "center", marginBottom: 12, position: "relative", border: "1px solid var(--cbt-border)" }}>
                <Icon name="user" size={32} color="rgba(255,255,255,0.25)"/>
                <span style={{ position: "absolute", top: 8, left: 10, fontSize: 10, fontWeight: 700, color: "var(--red)", letterSpacing: "0.05em" }}>● REC 1080p</span>
                <span style={{ position: "absolute", bottom: 8, right: 10, fontSize: 10, color: "var(--cbt-text-muted)", fontFeatureSettings: '"tnum"' }}>14:32:18</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{sel.name}</div>
              <div style={{ fontSize: 12, color: "var(--cbt-text-muted)", marginTop: 2 }}>AXIS L3 제5회 · Q.{sel.q}/50 · 잔여 {sel.time}</div>
              <div style={{ marginTop: 12, fontSize: 11, color: "var(--cbt-text-muted)" }}>진행률</div>
              <div className="bar" style={{ background: "rgba(255,255,255,0.08)", marginTop: 4 }}><span style={{ width: `${sel.q * 2}%`, background: "var(--accent)" }}/></div>
              <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                <button className="btn" style={{ background: "rgba(255,255,255,0.06)", borderColor: "var(--cbt-border)", color: "white", fontSize: 12 }}><Icon name="alert" size={13}/> 경고</button>
                <button className="btn" style={{ background: "rgba(255,255,255,0.06)", borderColor: "var(--cbt-border)", color: "white", fontSize: 12 }}><Icon name="pause" size={12}/> 일시정지</button>
                <button className="btn" style={{ background: "rgba(255,255,255,0.06)", borderColor: "var(--cbt-border)", color: "white", fontSize: 12 }}><Icon name="mail" size={13}/> 채팅</button>
                <button className="btn btn-danger" style={{ fontSize: 12 }}><Icon name="stop" size={12}/> 강제종료</button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">실시간 알림</h3>
              <span style={{ fontSize: 10, color: "var(--cbt-text-muted)" }}>최근 5분</span>
            </div>
            <div className="alert-feed">
              {[
                { t: "14:32", tone: "red", text: "<b style='color:white'>응시자03**</b> 화면 이탈 3회 (강제종료 대기)" },
                { t: "14:28", tone: "orange", text: "<b style='color:white'>응시자11**</b> 외부 프로그램 감지" },
                { t: "14:19", tone: "orange", text: "<b style='color:white'>응시자22**</b> 웹캠 이탈 2회" },
                { t: "14:14", tone: "blue", text: "<b style='color:white'>응시자08**</b> 시험 제출 완료" },
              ].map((a, i) => (
                <div key={i} className={"alert-row " + a.tone}>
                  <span className="alert-pip"/>
                  <div style={{ flex: 1 }}>
                    <div className="alert-time" style={{ color: "rgba(255,255,255,0.4)" }}>{a.t}</div>
                    <div className="alert-text" style={{ color: "rgba(255,255,255,0.8)" }} dangerouslySetInnerHTML={{ __html: a.text }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Grading ---------- */
function Grading() {
  const [tab, setTab] = React.useState("ai");
  const [reviewing, setReviewing] = React.useState(null);
  const rows = [
    { name: "홍길동", cert: "axis", certLabel: "AXIS", lvl: "L2 제5회", task: "과제 1", aiScore: "38/50", conf: 0.91, status: "ai-done", statusLabel: "AI 채점완료" },
    { name: "김미래", cert: "axis", certLabel: "AXIS", lvl: "L2 제5회", task: "과제 1", aiScore: "29/50", conf: 0.65, status: "review", statusLabel: "검수필요" },
    { name: "이철수", cert: "axis", certLabel: "AXIS", lvl: "L2 제5회", task: "과제 2", aiScore: "—", conf: 0.31, status: "expert", statusLabel: "전문가배정필요" },
    { name: "박지영", cert: "axisc", certLabel: "AXIS-C", lvl: "L2 제3회", task: "과제 1", aiScore: "42/50", conf: 0.88, status: "ai-done", statusLabel: "AI 채점완료" },
    { name: "정수민", cert: "axis", certLabel: "AXIS", lvl: "L1 제2회", task: "산출물 A", aiScore: "—", conf: null, status: "expert-progress", statusLabel: "전문가 채점중" },
  ];
  const tones = { "ai-done": "blue", review: "orange", expert: "red", "expert-progress": "purple", confirmed: "green" };
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">채점 관리</h1>
          <p className="page-sub">AI 1차 채점 검수 · 전문가 배정 · 점수 조정 이력</p>
        </div>
        <div className="page-actions">
          <button className="btn"><Icon name="download" size={14}/> 채점 리포트</button>
          <button className="btn btn-primary"><Icon name="sparkle" size={14}/> AI 일괄 채점</button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi blue"><div className="kpi-label">AI 채점 대기</div><div className="kpi-value">22</div><div className="kpi-sub">평균 처리 8초/건</div></div>
        <div className="kpi orange"><div className="kpi-label">검수 필요</div><div className="kpi-value">16</div><div className="kpi-sub">신뢰도 0.7 미만</div></div>
        <div className="kpi red"><div className="kpi-label">전문가 배정</div><div className="kpi-value">7</div><div className="kpi-sub">L1 산출물 평가</div></div>
        <div className="kpi green"><div className="kpi-label">금일 확정</div><div className="kpi-value">142</div><div className="kpi-sub">SLA 평균 2.1일</div></div>
      </div>

      <div className="tabs">
        <div className={"tab" + (tab === "ai" ? " active" : "")} onClick={() => setTab("ai")}>AI 채점 결과 검수 <span className="count">38</span></div>
        <div className={"tab" + (tab === "expert" ? " active" : "")} onClick={() => setTab("expert")}>전문가 배정·채점 <span className="count">14</span></div>
        <div className={"tab" + (tab === "audit" ? " active" : "")} onClick={() => setTab("audit")}>점수 조정 이력</div>
      </div>

      <div className="filter-bar">
        <select className="select"><option>자격 전체</option></select>
        <select className="select"><option>회차 전체</option></select>
        <select className="select"><option>채점상태 전체</option></select>
        <select className="select"><option>신뢰도 전체</option></select>
        <div className="search"><span className="search-ic"><Icon name="search" size={14}/></span><input className="input" placeholder="응시자 검색"/></div>
      </div>

      {tab === "ai" && (
        <div className="card">
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr><th>응시자</th><th>자격·등급·회차</th><th>과제</th><th>AI 점수</th><th>신뢰도</th><th>상태</th><th></th></tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td className="cell-strong">{r.name}</td>
                    <td><span className={"cert-tag " + r.cert}>{r.certLabel}</span> {r.lvl}</td>
                    <td className="muted">{r.task}</td>
                    <td className="cell-strong">{r.aiScore}</td>
                    <td>
                      {r.conf != null ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div className="bar" style={{ width: 60 }}>
                            <span style={{ width: `${r.conf * 100}%`, background: r.conf > 0.8 ? "var(--green)" : r.conf > 0.5 ? "var(--orange)" : "var(--red)" }}/>
                          </div>
                          <span style={{ fontFeatureSettings: '"tnum"', fontSize: 12, color: "var(--gray-600)" }}>{r.conf.toFixed(2)}</span>
                        </div>
                      ) : <span className="muted">—</span>}
                    </td>
                    <td><span className={"chip " + tones[r.status]}><span className="chip-dot"/>{r.statusLabel}</span></td>
                    <td><button className="btn btn-sm" onClick={() => setReviewing(r)}>검수</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "expert" && (
        <div className="grid-2-eq">
          <div className="card">
            <div className="card-header"><h3 className="card-title">미배정 제출물 <span className="count" style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "var(--red-50)", color: "var(--red)", marginLeft: 6 }}>7</span></h3></div>
            <div style={{ padding: 12 }}>
              {[
                { n: "이철수", cert: "axis", lvl: "L2 제5회", task: "AI 실기 과제 2", t: "2일 전" },
                { n: "정수민", cert: "axis", lvl: "L1 제2회", task: "산출물 A: 실행계획서", t: "1일 전" },
                { n: "김주현", cert: "axisc", lvl: "L1 제1회", task: "자동화 시스템 설계", t: "3시간 전" },
              ].map((s, i) => (
                <div key={i} style={{ padding: "12px 14px", border: "1px solid var(--gray-border)", borderRadius: 10, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--primary)" }}>{s.n}</div>
                    <div style={{ fontSize: 12, color: "var(--gray-500)" }}><span className={"cert-tag " + s.cert}>{s.cert === "axis" ? "AXIS" : "AXIS-C"}</span> {s.lvl} · {s.task}</div>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--gray-400)" }}>제출 {s.t}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-header"><h3 className="card-title">전문가 풀</h3></div>
            <div style={{ padding: 12 }}>
              {[
                { n: "박교수", spec: "AI 거버넌스", load: "3/8", avail: true },
                { n: "이박사", spec: "AI 자동화", load: "5/8", avail: true },
                { n: "최교수", spec: "AI 윤리", load: "8/8", avail: false },
                { n: "정전문가", spec: "의료 AI", load: "2/6", avail: true },
              ].map((e, i) => (
                <div key={i} style={{ padding: "10px 14px", borderBottom: "1px solid var(--gray-100)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--primary)" }}>{e.n}</div>
                    <div style={{ fontSize: 12, color: "var(--gray-500)" }}>{e.spec} · 진행 {e.load}</div>
                  </div>
                  <span className={"chip " + (e.avail ? "green" : "gray")}><span className="chip-dot"/>{e.avail ? "배정 가능" : "포화"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "audit" && (
        <div className="card">
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>시각</th><th>대상</th><th>과제</th><th>변경 전</th><th>변경 후</th><th>변경자</th><th>사유</th></tr></thead>
              <tbody>
                {[
                  { t: "05.10 16:22", n: "홍길동", task: "L2 실기1", b: "32/50", a: "38/50", by: "박교수", r: "AI 점수 과소평가 보정" },
                  { t: "05.10 14:11", n: "김주현", task: "L1 산출물A", b: "70/100", a: "65/100", by: "이박사", r: "거버넌스 항목 재평가" },
                  { t: "05.09 19:47", n: "이철수", task: "L2 필기", b: "32/40", a: "33/40", by: "홍관리자", r: "복수정답 인정 (Q.18)" },
                ].map((r, i) => (
                  <tr key={i}>
                    <td className="cell-mono muted">{r.t}</td>
                    <td className="cell-strong">{r.n}</td>
                    <td className="muted">{r.task}</td>
                    <td><span className="chip gray">{r.b}</span></td>
                    <td><span className="chip green">{r.a}</span></td>
                    <td>{r.by}</td>
                    <td className="muted">{r.r}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reviewing && <GradingReviewPanel r={reviewing} onClose={() => setReviewing(null)}/>}
    </div>
  );
}

function GradingReviewPanel({ r, onClose }) {
  return (
    <>
      <div className="panel-overlay" onClick={onClose}/>
      <div className="side-panel" style={{ width: 720 }}>
        <div className="panel-head">
          <div>
            <h3>{r.name} · {r.task} 검수</h3>
            <div style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 4 }}>{r.certLabel} {r.lvl} · AI 신뢰도 <b>{r.conf}</b></div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="close" size={14}/></button>
        </div>
        <div className="panel-body" style={{ padding: 0 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            <div style={{ padding: 18, borderRight: "1px solid var(--gray-border)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>응시자 답안</div>
              <div style={{ fontSize: 12, color: "var(--gray-500)", marginBottom: 8 }}>A) 위 AI 산출물의 문제점:</div>
              <div style={{ padding: 12, background: "var(--gray-50)", borderRadius: 8, fontSize: 12, lineHeight: 1.7, marginBottom: 14 }}>
                위 산출물은 마케팅 카피로서 1) 타겟 고객을 명시하지 않아 메시지의 초점이 흐립니다. 2) 구체적인 수치 근거 없이 "최고", "최상" 등 주관적 표현이 반복되어 광고심의 기준에 부합하지 않을 수 있습니다.
              </div>
              <div style={{ fontSize: 12, color: "var(--gray-500)", marginBottom: 8 }}>B) 개선된 프롬프트:</div>
              <div style={{ padding: 12, background: "var(--gray-50)", borderRadius: 8, fontSize: 12, lineHeight: 1.7, fontFamily: "'JetBrains Mono', monospace" }}>
                "30대 직장인 여성을 타겟으로 한 비건 스킨케어 신제품 런칭 카피를 작성해주세요. 핵심 메시지는 '민감성 피부 보호'이며, 광고법 규제(과장표현 금지)에 부합해야 합니다. 결과는 헤드라인 1개 + 부제 1개로 제시해주세요."
              </div>
            </div>
            <div style={{ padding: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>AI 채점 결과</div>
              {[
                ["논리성", 8, 10],
                ["완성도", 7, 10],
                ["실무 적용", 9, 10],
                ["정확성", 14, 20],
              ].map(([l, s, t], i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--gray-700)", marginBottom: 4 }}>
                    <span>{l}</span>
                    <span><b style={{ color: "var(--primary)" }}>{s}</b><span className="muted"> / {t}</span></span>
                  </div>
                  <div className="bar"><span style={{ width: `${(s/t)*100}%` }}/></div>
                </div>
              ))}
              <div style={{ padding: 12, background: "var(--blue-50)", borderRadius: 8, marginTop: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--blue)", marginBottom: 4 }}>AI 총점</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "var(--primary)", letterSpacing: "-0.02em" }}>38<span style={{ fontSize: 14, color: "var(--gray-500)" }}>/50</span></div>
                <div style={{ fontSize: 11, color: "var(--gray-600)", marginTop: 8, lineHeight: 1.6 }}>
                  <b>AI 근거:</b> 응시자는 산출물의 핵심 문제점(타겟 부재, 주관적 표현)을 정확히 식별하였고, 개선 프롬프트에서 타겟·메시지·규제·결과형식을 구체화하였음. 다만 윤리 검토 항목이 명시되지 않아 정확성 점수에서 감점.
                </div>
              </div>
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-500)", marginBottom: 8 }}>검수자 점수 조정 (선택)</div>
                <input className="input" placeholder="조정 점수 (예: 40)" style={{ width: "100%" }}/>
                <textarea className="input" placeholder="조정 사유" rows="3" style={{ width: "100%", marginTop: 8, resize: "vertical", padding: 10 }}/>
              </div>
            </div>
          </div>
        </div>
        <div className="panel-foot">
          <button className="btn" onClick={onClose}>취소</button>
          <button className="btn">전문가 재배정</button>
          <button className="btn btn-primary"><Icon name="check" size={13}/> AI 점수 확정</button>
        </div>
      </div>
    </>
  );
}

/* ---------- Results ---------- */
function Results() {
  const [publishOpen, setPublishOpen] = React.useState(false);
  const rows = [
    { name: "홍길동", cert: "axis", certLabel: "AXIS", lvl: "L2 제5회", written: 80, prac: 74, total: 77, pass: "pass", passLabel: "합격", pub: "published", pubLabel: "발표완료" },
    { name: "김미래", cert: "axis", certLabel: "AXIS", lvl: "L2 제5회", written: 72, prac: 44, total: 58, pass: "fail", passLabel: "불합격", pub: "published", pubLabel: "발표완료" },
    { name: "이철수", cert: "axis", certLabel: "AXIS", lvl: "L2 제5회", written: 78, prac: 52, total: 65, pass: "partial", passLabel: "부분합격", pub: "published", pubLabel: "발표완료" },
    { name: "박지영", cert: "axisc", certLabel: "AXIS-C", lvl: "L2 제3회", written: 85, prac: 78, total: 81, pass: "pass", passLabel: "합격", pub: "pending", pubLabel: "발표 대기" },
    { name: "정수민", cert: "axis", certLabel: "AXIS", lvl: "L1 제2회", written: 75, prac: 68, total: 71, pass: "pass", passLabel: "합격", pub: "pending", pubLabel: "발표 대기" },
    { name: "최영호", cert: "axis", certLabel: "AXIS", lvl: "L3 제4회", written: 88, prac: null, total: 88, pass: "pass", passLabel: "합격", pub: "published", pubLabel: "발표완료" },
  ];
  const passTones = { pass: "green", fail: "red", partial: "orange", void: "gray" };
  const pubTones = { published: "teal", pending: "orange" };
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">성적·합격 관리</h1>
          <p className="page-sub">최종 성적 검토 · 합격 발표 · 이의신청 처리</p>
        </div>
        <div className="page-actions">
          <button className="btn"><Icon name="download" size={14}/> 일괄 Excel</button>
          <button className="btn">이의신청 ({2})</button>
          <button className="btn btn-blue" onClick={() => setPublishOpen(true)}><Icon name="megaphone" size={14}/> 합격 발표 공개</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16, padding: 0 }}>
        <div style={{ display: "flex", gap: 0, padding: "4px 8px" }}>
          {[
            { lbl: "총 응시", v: 247, c: "gray" },
            { lbl: "합격", v: 178, sub: "72.1%", c: "green" },
            { lbl: "불합격", v: 69, sub: "27.9%", c: "red" },
            { lbl: "부분합격", v: 12, sub: "L2 한정", c: "orange" },
            { lbl: "이의신청", v: 2, c: "purple" },
          ].map((s, i) => (
            <div key={i} style={{ padding: "16px 20px", flex: 1, borderRight: i < 4 ? "1px solid var(--gray-border)" : "none" }}>
              <div style={{ fontSize: 11, color: "var(--gray-500)", fontWeight: 500, marginBottom: 4 }}>{s.lbl}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: "var(--primary)", letterSpacing: "-0.02em" }}>{s.v}</span>
                {s.sub && <span style={{ fontSize: 12, color: `var(--${s.c})`, fontWeight: 600 }}>{s.sub}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="filter-bar">
        <select className="select"><option>자격 전체</option></select>
        <select className="select"><option>등급 전체</option></select>
        <select className="select"><option>회차 전체</option></select>
        <select className="select"><option>합격여부 전체</option></select>
        <select className="select"><option>발표상태 전체</option></select>
        <div className="search"><span className="search-ic"><Icon name="search" size={14}/></span><input className="input" placeholder="응시자 검색"/></div>
      </div>

      <div className="card">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr>
              <th><input type="checkbox"/></th>
              <th>응시자</th><th>자격·등급·회차</th>
              <th style={{ textAlign: "right" }}>필기</th>
              <th style={{ textAlign: "right" }}>실기</th>
              <th style={{ textAlign: "right" }}>총점</th>
              <th>합격</th><th>발표</th><th></th>
            </tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td><input type="checkbox"/></td>
                  <td className="cell-strong">{r.name}</td>
                  <td><span className={"cert-tag " + r.cert}>{r.certLabel}</span> {r.lvl}</td>
                  <td style={{ textAlign: "right" }}>{r.written}</td>
                  <td style={{ textAlign: "right" }}>{r.prac != null ? r.prac : <span className="muted">—</span>}</td>
                  <td style={{ textAlign: "right" }} className="cell-strong">{r.total}</td>
                  <td><span className={"chip " + passTones[r.pass]}><span className="chip-dot"/>{r.passLabel}</span></td>
                  <td><span className={"chip " + pubTones[r.pub]}><span className="chip-dot"/>{r.pubLabel}</span></td>
                  <td><button className="btn btn-sm btn-ghost"><Icon name="eye" size={13}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {publishOpen && (
        <>
          <div className="panel-overlay" onClick={() => setPublishOpen(false)}/>
          <div style={{ position: "fixed", left: "50%", top: "50%", transform: "translate(-50%, -50%)", width: 480, background: "white", borderRadius: 14, boxShadow: "var(--shadow-lg)", zIndex: 40, overflow: "hidden" }}>
            <div style={{ padding: 22 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--blue-50)", display: "grid", placeItems: "center", marginBottom: 14 }}>
                <Icon name="megaphone" size={20} color="#2563EB"/>
              </div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--primary)" }}>합격 발표를 공개하시겠습니까?</h3>
              <p style={{ color: "var(--gray-600)", fontSize: 13, lineHeight: 1.6, marginTop: 8 }}>
                <b>AXIS-C L2 제3회 · 35명</b>의 결과가 axisexam.com 합격자 발표 페이지와 개인 마이페이지에 즉시 공개됩니다. 응시자에게 발표 이메일이 자동 발송됩니다.
              </p>
              <div style={{ padding: 12, background: "var(--orange-50)", border: "1px solid #FED7AA", borderRadius: 8, marginTop: 14, fontSize: 12, color: "var(--gray-700)", lineHeight: 1.6 }}>
                <b style={{ color: "var(--orange)" }}>⚠ 공개 후 점수 수정은 super_admin만 가능합니다.</b><br/>
                이의신청 기간: 발표일로부터 7일
              </div>
            </div>
            <div style={{ padding: 16, background: "var(--gray-50)", display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button className="btn" onClick={() => setPublishOpen(false)}>취소</button>
              <button className="btn btn-blue">발표 공개</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

window.Monitoring = Monitoring;
window.Grading = Grading;
window.Results = Results;
