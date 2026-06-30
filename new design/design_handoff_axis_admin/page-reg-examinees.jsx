// AXIS Admin — Registrations + Examinees

function Registrations() {
  const [refundOpen, setRefundOpen] = React.useState(null);
  const rows = [
    { no: 1024, name: "홍길동", email: "hong@example.com", cert: "axis", certLabel: "AXIS", lvl: "L3 제5회", date: "06.02", amount: "44,000", method: "신용카드", status: "paid", statusLabel: "결제완료" },
    { no: 1023, name: "김미래", email: "kim@example.com", cert: "axisc", certLabel: "AXIS-C", lvl: "L2 제3회", date: "06.01", amount: "66,000", method: "카카오페이", status: "refund-req", statusLabel: "환불요청" },
    { no: 1022, name: "이철수", email: "lee@example.com", cert: "axis", certLabel: "AXIS", lvl: "L2 제5회", date: "06.01", amount: "66,000", method: "신용카드", status: "paid", statusLabel: "결제완료" },
    { no: 1021, name: "박지영", email: "park@example.com", cert: "axish", certLabel: "AXIS-H", lvl: "L3 제2회", date: "05.30", amount: "44,000", method: "계좌이체", status: "paid", statusLabel: "결제완료" },
    { no: 1020, name: "정수민", email: "jung@example.com", cert: "axis", certLabel: "AXIS", lvl: "L1 제2회", date: "05.29", amount: "88,000", method: "신용카드", status: "refunded", statusLabel: "환불완료" },
    { no: 1019, name: "최영호", email: "choi@example.com", cert: "axisc", certLabel: "AXIS-C", lvl: "L3 제2회", date: "05.28", amount: "44,000", method: "카카오페이", status: "pending", statusLabel: "입금대기" },
    { no: 1018, name: "강민지", email: "kang@example.com", cert: "axis", certLabel: "AXIS", lvl: "L3 제5회", date: "05.28", amount: "44,000", method: "신용카드", status: "paid", statusLabel: "결제완료" },
  ];
  const tones = { paid: "green", "refund-req": "orange", refunded: "gray", pending: "blue", cancelled: "red" };
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">접수·결제 관리</h1>
          <p className="page-sub">전체 접수 내역 · 결제 상태 · 환불 처리</p>
        </div>
        <div className="page-actions">
          <button className="btn"><Icon name="download" size={14}/> Excel 다운로드</button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi blue"><div className="kpi-label">총 접수</div><div className="kpi-value">1,284<span className="unit">건</span></div><div className="kpi-sub">이번달</div></div>
        <div className="kpi green"><div className="kpi-label">결제 완료</div><div className="kpi-value">1,261<span className="unit">건</span></div><div className="kpi-sub">98.2% 결제율</div></div>
        <div className="kpi orange"><div className="kpi-label">환불 요청</div><div className="kpi-value">23<span className="unit">건</span></div><div className="kpi-sub">평균 처리 1.2일</div></div>
        <div className="kpi red"><div className="kpi-label">총 매출</div><div className="kpi-value">68.4<span className="unit">M원</span></div><div className="kpi-sub"><span className="delta-up">▲ 14.2%</span> 전월 대비</div></div>
      </div>

      <div className="filter-bar">
        <select className="select"><option>자격 전체</option></select>
        <select className="select"><option>등급 전체</option></select>
        <select className="select"><option>회차 전체</option></select>
        <select className="select"><option>결제상태 전체</option></select>
        <input className="input" type="date" defaultValue="2026-05-01" style={{ minWidth: 0 }}/>
        <span className="muted" style={{ fontSize: 12 }}>~</span>
        <input className="input" type="date" defaultValue="2026-06-11" style={{ minWidth: 0 }}/>
        <div className="search"><span className="search-ic"><Icon name="search" size={14}/></span><input className="input" placeholder="이름·이메일 검색"/></div>
      </div>

      <div className="card">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>번호</th><th>이름</th><th>이메일</th><th>자격·등급·회차</th><th>접수일</th>
                <th style={{ textAlign: "right" }}>금액</th><th>결제방법</th><th>상태</th><th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className="cell-mono">{r.no}</td>
                  <td className="cell-strong">{r.name}</td>
                  <td className="muted">{r.email}</td>
                  <td><span className={"cert-tag " + r.cert}>{r.certLabel}</span> {r.lvl}</td>
                  <td className="muted">2026.{r.date}</td>
                  <td style={{ textAlign: "right" }} className="cell-strong" >{r.amount}원</td>
                  <td className="muted">{r.method}</td>
                  <td><span className={"chip " + tones[r.status]}><span className="chip-dot"/>{r.statusLabel}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button className="btn btn-sm btn-ghost"><Icon name="eye" size={13}/></button>
                      {r.status === "refund-req" ? (
                        <button className="btn btn-sm btn-danger" onClick={() => setRefundOpen(r)}>환불처리</button>
                      ) : (
                        <button className="btn btn-sm btn-ghost"><Icon name="edit" size={13}/></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <span>총 1,284건 · 표시: 1-7</span>
          <div className="pager-nav">
            <button><Icon name="chevronL" size={12}/></button>
            <button className="active">1</button><button>2</button><button>3</button><button>...</button><button>184</button>
            <button><Icon name="chevronR" size={12}/></button>
          </div>
        </div>
      </div>

      {refundOpen && <RefundModal r={refundOpen} onClose={() => setRefundOpen(null)}/>}
    </div>
  );
}

function RefundModal({ r, onClose }) {
  return (
    <>
      <div className="panel-overlay" onClick={onClose}/>
      <div className="side-panel">
        <div className="panel-head">
          <h3>환불 처리</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" size={14}/></button>
        </div>
        <div className="panel-body">
          <div style={{ padding: "12px 14px", background: "var(--gray-50)", borderRadius: 8, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)" }}>{r.name} · {r.email}</div>
            <div style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 4 }}>{r.certLabel} {r.lvl} · 접수일 2026.{r.date} · {r.amount}원</div>
          </div>
          <div className="field-grp">
            <label>환불 사유</label>
            <select className="select"><option>응시자 단순 변심</option><option>일정 변경 불가</option><option>건강 사유</option><option>기타</option></select>
          </div>
          <div className="field-grp"><label>환불 메모</label><textarea className="input" rows="3" style={{ minWidth: 0, width: "100%", resize: "vertical", padding: 10 }} defaultValue="응시자 요청, 환불 정책 적용"/></div>
          <div className="field-grp">
            <label>환불 금액</label>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--orange-50)", border: "1px solid #FED7AA", borderRadius: 8 }}>
              <Icon name="alert" size={16} color="#F97316"/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: "var(--gray-700)" }}>시험일 13일 전 · 전액 환불 대상</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "var(--orange)", marginTop: 2 }}>{r.amount}원 (100%)</div>
              </div>
            </div>
          </div>
          <div style={{ padding: 12, background: "var(--gray-50)", borderRadius: 8, fontSize: 12, color: "var(--gray-600)", lineHeight: 1.7 }}>
            <b style={{ color: "var(--primary)" }}>환불 정책</b><br/>
            · 시험 7일 전까지: 전액 환불 (100%)<br/>
            · 시험 6~3일 전: 50% 환불<br/>
            · 시험 2일 전~당일: 환불 불가
          </div>
        </div>
        <div className="panel-foot">
          <button className="btn" onClick={onClose}>취소</button>
          <button className="btn btn-danger">환불 확정</button>
        </div>
      </div>
    </>
  );
}

/* ---------- Examinees ---------- */
function Examinees() {
  const [selected, setSelected] = React.useState(0);
  const [tab, setTab] = React.useState("profile");
  const list = [
    { id: "M-08412", name: "홍길동", email: "hong@example.com", phone: "010-****-1234", cert: "axis", lvl: "L2", status: "active", statusLabel: "정상" },
    { id: "M-08411", name: "김미래", email: "kim@example.com", phone: "010-****-2345", cert: "axisc", lvl: "L3", status: "active", statusLabel: "정상" },
    { id: "M-08410", name: "이철수", email: "lee@example.com", phone: "010-****-3456", cert: "axis", lvl: "L1", status: "suspended", statusLabel: "응시제한" },
    { id: "M-08409", name: "박지영", email: "park@example.com", phone: "010-****-4567", cert: "axish", lvl: "L3", status: "active", statusLabel: "정상" },
    { id: "M-08408", name: "정수민", email: "jung@example.com", phone: "010-****-5678", cert: "axis", lvl: "L2", status: "active", statusLabel: "정상" },
    { id: "M-08407", name: "최영호", email: "choi@example.com", phone: "010-****-6789", cert: "axisc", lvl: "L2", status: "withdrawn", statusLabel: "탈퇴" },
  ];
  const sel = list[selected];
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">응시자 관리</h1>
          <p className="page-sub">총 12,847명 · 활성 12,213명 · 응시제한 28명</p>
        </div>
        <div className="page-actions">
          <button className="btn"><Icon name="download" size={14}/> 명단 내보내기</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 16 }}>
        {/* List */}
        <div className="card">
          <div className="card-header" style={{ padding: 12 }}>
            <div className="search" style={{ flex: 1 }}>
              <span className="search-ic"><Icon name="search" size={14}/></span>
              <input className="input" placeholder="이름·이메일·회원ID" style={{ width: "100%", minWidth: 0 }}/>
            </div>
          </div>
          <div style={{ padding: "0 12px 12px", display: "flex", gap: 6 }}>
            <select className="select" style={{ flex: 1, fontSize: 12, padding: "5px 8px" }}><option>자격 전체</option></select>
            <select className="select" style={{ flex: 1, fontSize: 12, padding: "5px 8px" }}><option>상태 전체</option></select>
          </div>
          <div style={{ borderTop: "1px solid var(--gray-border)", maxHeight: 580, overflowY: "auto" }}>
            {list.map((m, i) => (
              <div key={i}
                onClick={() => setSelected(i)}
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--gray-100)",
                  cursor: "pointer",
                  background: selected === i ? "var(--blue-50)" : "white",
                  borderLeft: selected === i ? "3px solid var(--blue)" : "3px solid transparent",
                }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ fontWeight: 600, color: "var(--primary)" }}>{m.name}</div>
                  <span className={"chip " + (m.status === "active" ? "green" : m.status === "suspended" ? "red" : "gray")}>
                    <span className="chip-dot"/>{m.statusLabel}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "var(--gray-500)", display: "flex", gap: 8 }}>
                  <span className="cell-mono">{m.id}</span>
                  <span>·</span>
                  <span className={"cert-tag " + m.cert} style={{ padding: "0 4px", fontSize: 10 }}>{m.cert === "axis" ? "AXIS" : m.cert === "axisc" ? "AXIS-C" : "AXIS-H"}</span>
                  <span>{m.lvl}</span>
                </div>
                <div style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 2 }}>{m.email}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail */}
        <div className="card">
          <div style={{ padding: 20, borderBottom: "1px solid var(--gray-border)", display: "flex", alignItems: "center", gap: 16 }}>
            <div className="avatar" style={{ width: 56, height: 56, fontSize: 22, borderRadius: 14 }}>{sel.name.charAt(0)}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "var(--primary)" }}>{sel.name}</h2>
                <span className={"chip " + (sel.status === "active" ? "green" : sel.status === "suspended" ? "red" : "gray")}>
                  <span className="chip-dot"/>{sel.statusLabel}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 4, display: "flex", gap: 12 }}>
                <span className="cell-mono">{sel.id}</span>
                <span>{sel.email}</span>
                <span>{sel.phone}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn btn-sm">메시지</button>
              <button className="btn btn-sm btn-danger">제재</button>
            </div>
          </div>
          <div style={{ padding: "0 20px" }}>
            <div className="tabs" style={{ marginBottom: 0 }}>
              {[
                ["profile","프로필"],["history","응시 이력"],["cert","발급 자격증"],["penalty","제재 이력"],["evidence","감독 증거"]
              ].map(([id, label]) => (
                <div key={id} className={"tab" + (tab === id ? " active" : "")} onClick={() => setTab(id)}>{label}</div>
              ))}
            </div>
          </div>
          <div style={{ padding: 20 }}>
            {tab === "profile" && <ProfileTab/>}
            {tab === "history" && <HistoryTab/>}
            {tab === "cert" && <CertTab/>}
            {tab === "penalty" && <PenaltyTab/>}
            {tab === "evidence" && <EvidenceTab/>}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", padding: "10px 0", borderBottom: "1px solid var(--gray-100)", fontSize: 13 }}>
      <span style={{ color: "var(--gray-500)", fontWeight: 500 }}>{label}</span>
      <span style={{ color: "var(--primary)", fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function ProfileTab() {
  return (
    <div>
      <InfoRow label="회원 ID" value="M-08412"/>
      <InfoRow label="이름" value="홍길동 (洪吉童)"/>
      <InfoRow label="생년월일" value="1992년 4월 15일 (만 34세)"/>
      <InfoRow label="이메일" value="hong@example.com (인증 완료)"/>
      <InfoRow label="연락처" value="010-****-1234"/>
      <InfoRow label="가입일" value="2024년 11월 02일"/>
      <InfoRow label="최근 로그인" value="2026.05.11 14:18 · Chrome / Mac"/>
      <InfoRow label="마케팅 수신" value="이메일 동의 · SMS 비동의"/>
      <InfoRow label="총 응시 횟수" value="4회 (합격 2 · 불합격 2)"/>
      <InfoRow label="총 결제 금액" value="220,000원"/>
    </div>
  );
}

function HistoryTab() {
  const hist = [
    { date: "2026.03.15", cert: "axis", certLabel: "AXIS", lvl: "L2 제4회", regDate: "2026.02.20", status: "passed", statusLabel: "합격", score: "77/100" },
    { date: "2025.12.07", cert: "axis", certLabel: "AXIS", lvl: "L2 제3회", regDate: "2025.11.15", status: "failed", statusLabel: "불합격", score: "58/100" },
    { date: "2025.09.14", cert: "axis", certLabel: "AXIS", lvl: "L3 제3회", regDate: "2025.08.20", status: "passed", statusLabel: "합격", score: "82/100" },
    { date: "2025.06.08", cert: "axis", certLabel: "AXIS", lvl: "L3 제2회", regDate: "2025.05.12", status: "failed", statusLabel: "불합격", score: "54/100" },
  ];
  const tones = { passed: "green", failed: "red", void: "gray" };
  return (
    <table className="tbl">
      <thead><tr><th>시험일</th><th>자격·등급</th><th>접수일</th><th>점수</th><th>결과</th><th></th></tr></thead>
      <tbody>
        {hist.map((h, i) => (
          <tr key={i}>
            <td className="cell-strong">{h.date}</td>
            <td><span className={"cert-tag " + h.cert}>{h.certLabel}</span> {h.lvl}</td>
            <td className="muted">{h.regDate}</td>
            <td className="cell-strong">{h.score}</td>
            <td><span className={"chip " + tones[h.status]}><span className="chip-dot"/>{h.statusLabel}</span></td>
            <td><button className="btn btn-sm btn-ghost">상세</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CertTab() {
  return (
    <div className="grid-2-eq">
      {[
        { cert: "axis", certLabel: "AXIS", level: "L2 Practitioner", no: "AXIS-2026-L2-008412", issued: "2026.03.30", expires: "2029.03.29" },
        { cert: "axis", certLabel: "AXIS", level: "L3 Starter", no: "AXIS-2025-L3-006128", issued: "2025.09.28", expires: "2028.09.27" },
      ].map((c, i) => (
        <div key={i} style={{ border: "1px solid var(--gray-border)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ height: 70, background: c.cert === "axis" ? "linear-gradient(135deg, #2563EB 0%, #00B4D8 100%)" : "linear-gradient(135deg, #16A34A 0%, #84CC16 100%)", display: "flex", alignItems: "center", padding: "0 16px", color: "white" }}>
            <div>
              <div style={{ fontSize: 11, opacity: 0.85, fontWeight: 600, letterSpacing: "0.05em" }}>CERTIFICATE</div>
              <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>{c.certLabel} · {c.level}</div>
            </div>
          </div>
          <div style={{ padding: 14, fontSize: 12 }}>
            <div className="cell-mono" style={{ color: "var(--gray-500)" }}>{c.no}</div>
            <div style={{ marginTop: 6, display: "flex", justifyContent: "space-between" }}>
              <span className="muted">발급 {c.issued}</span>
              <span className="muted">유효 {c.expires}</span>
            </div>
            <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
              <button className="btn btn-sm" style={{ flex: 1 }}><Icon name="download" size={12}/> PDF</button>
              <button className="btn btn-sm" style={{ flex: 1 }}>검증링크</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function downloadPdf(name, caseId) {
  // Minimal valid PDF generated client-side (text only, no external deps)
  const title = `AXIS 감독 증거 리포트 — ${name} (${caseId})`;
  const lines = [
    title,
    "",
    "발급일: 2026-05-12",
    "사건 ID: " + caseId,
    "응시자: " + name,
    "자격: AXIS L3 제5회",
    "처분: 시험 무효 (강제 종료)",
    "응시 제한: 2026-05-12 ~ 2028-05-11 (2년)",
    "",
    "위반 이벤트 요약:",
    "- 14:08:22 시선 이탈 (12s)",
    "- 14:14:47 Alt+Tab 키 입력 감지",
    "- 14:21:03 타인 감지 (8s)",
    "- 14:28:11 ChatGPT 데스크탑 앱 프로세스 감지",
    "- 14:32:18 시스템 자동 강제 종료",
    "",
    "AI 의심도: 94%",
    "",
    "본 문서는 AXIS 운영팀에 의해 자동 생성되었습니다.",
    "AiNex Inc. · axisexam.com",
  ];
  let stream = "BT /F1 12 Tf 50 780 Td 14 TL\n";
  lines.forEach((l, i) => {
    const safe = l.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
    stream += (i === 0 ? "" : "T* ") + "(" + safe + ") Tj\n";
  });
  stream += "ET";
  const objs = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    "<< /Length " + stream.length + " >>\nstream\n" + stream + "\nendstream",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [];
  objs.forEach((o, i) => {
    offsets.push(pdf.length);
    pdf += (i + 1) + " 0 obj\n" + o + "\nendobj\n";
  });
  const xrefStart = pdf.length;
  pdf += "xref\n0 " + (objs.length + 1) + "\n0000000000 65535 f \n";
  offsets.forEach(off => { pdf += off.toString().padStart(10, "0") + " 00000 n \n"; });
  pdf += "trailer\n<< /Size " + (objs.length + 1) + " /Root 1 0 R >>\nstartxref\n" + xrefStart + "\n%%EOF";
  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "AXIS_증거리포트_" + caseId + ".pdf";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function EvidenceTab() {
  const [caseSel, setCaseSel] = React.useState(0);
  const cases = [
    {
      id: "EV-2026-0512-003", date: "2026.05.12 14:32",
      exam: "AXIS L3 제5회", verdict: "void", verdictLabel: "시험 무효",
      restrict: "2028.05.11까지",
      events: [
        { t: "14:08:22", type: "warning", icon: "alert", label: "시선 이탈 (12초)", hasShot: true },
        { t: "14:14:47", type: "warning", icon: "monitor", label: "Alt+Tab 키 입력 감지", hasShot: true },
        { t: "14:21:03", type: "warning", icon: "user", label: "백그라운드 인물 감지 (8초)", hasShot: true },
        { t: "14:28:11", type: "danger", icon: "monitor", label: "ChatGPT 데스크탑 앱 실행", hasShot: true },
        { t: "14:32:18", type: "danger", icon: "stop", label: "강제 종료 (위반 3회 누적)" },
      ],
      ai: 0.94,
    },
    {
      id: "EV-2025-1128-014", date: "2025.11.28 10:15",
      exam: "AXIS L3 제3회", verdict: "warning", verdictLabel: "1차 경고",
      restrict: "-",
      events: [
        { t: "10:15:22", type: "warning", icon: "monitor", label: "웹캠 이탈 (5초)", hasShot: true },
      ],
      ai: 0.34,
    },
  ];
  const c = cases[caseSel];
  const verdictTones = { void: "red", warning: "orange", cleared: "green" };
  const shots = c.events.filter(e => e.hasShot);
  const [shot, setShot] = React.useState(0);
  React.useEffect(() => { setShot(0); }, [caseSel]);
  const cur = shots[shot] || shots[0];

  return (
    <div>
      {/* Case selector chips */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {cases.map((cs, i) => (
          <div key={cs.id} onClick={() => setCaseSel(i)} style={{
            padding: "10px 14px", borderRadius: 10, cursor: "pointer",
            border: caseSel === i ? "1.5px solid var(--blue)" : "1px solid var(--gray-border)",
            background: caseSel === i ? "var(--blue-50)" : "white",
            display: "flex", gap: 10, alignItems: "center",
          }}>
            <span className={"chip " + verdictTones[cs.verdict]} style={{ fontSize: 10 }}><span className="chip-dot"/>{cs.verdictLabel}</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--primary)" }}>{cs.exam}</div>
              <div style={{ fontSize: 11, color: "var(--gray-500)" }}>{cs.date}</div>
            </div>
            <span className="cell-mono muted" style={{ fontSize: 10 }}>{cs.id}</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={{ padding: "12px 16px", background: c.verdict === "void" ? "var(--red-50)" : "var(--orange-50)", borderRadius: 10, marginBottom: 14, display: "flex", gap: 12, alignItems: "center" }}>
        <Icon name="alert" size={18} color={c.verdict === "void" ? "#DC2626" : "#F97316"}/>
        <div style={{ flex: 1, fontSize: 12, color: "var(--gray-700)" }}>
          <b style={{ color: c.verdict === "void" ? "var(--red)" : "var(--orange)" }}>{c.verdictLabel}</b>
          {" · "}응시 제한: <b>{c.restrict}</b>
          {" · "}AI 의심도: <b>{(c.ai * 100).toFixed(0)}%</b>
        </div>
        <button className="btn btn-sm btn-danger" onClick={() => downloadPdf("홍길동", c.id)}>
          <Icon name="download" size={12}/> PDF 다운로드
        </button>
      </div>

      {/* Evidence frames */}
      {shots.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <MiniFrame label="웹캠" event={cur} kind="cam" caseId={c.id}/>
            <MiniFrame label="화면" event={cur} kind="screen" caseId={c.id}/>
          </div>
          <div style={{ marginTop: 8, padding: "8px 12px", background: "var(--gray-50)", borderRadius: 8, fontSize: 12, display: "flex", justifyContent: "space-between" }}>
            <span><b style={{ color: "var(--primary)" }}>{cur.label}</b></span>
            <span className="cell-mono muted">{cur.t}</span>
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {shots.map((e, i) => (
              <div key={i} onClick={() => setShot(i)} style={{
                width: 86, height: 56, borderRadius: 6, cursor: "pointer",
                border: shot === i ? "2px solid var(--blue)" : "2px solid var(--gray-200)",
                overflow: "hidden", position: "relative", background: "#0F1724",
              }}>
                <MiniSvg seed={c.id + i} kind="cam"/>
                <span style={{ position: "absolute", bottom: 2, left: 4, fontSize: 9, color: "white", fontFamily: "monospace", textShadow: "0 1px 2px black" }}>{e.t.slice(0,5)}</span>
                {e.type === "danger" && <span style={{ position: "absolute", top: 2, right: 2, width: 6, height: 6, borderRadius: "50%", background: "var(--red)" }}/>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div style={{ border: "1px solid var(--gray-border)", borderRadius: 10, padding: "4px 14px" }}>
        {c.events.map((e, i) => (
          <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: i < c.events.length - 1 ? "1px solid var(--gray-100)" : "none", alignItems: "center" }}>
            <span className="cell-mono" style={{ fontSize: 11, color: "var(--gray-500)", minWidth: 60 }}>{e.t}</span>
            <span style={{
              width: 24, height: 24, borderRadius: 6, display: "grid", placeItems: "center", flexShrink: 0,
              background: e.type === "danger" ? "var(--red-50)" : "var(--orange-50)",
              color: e.type === "danger" ? "var(--red)" : "var(--orange)",
            }}><Icon name={e.icon} size={12}/></span>
            <div style={{ flex: 1, fontSize: 12, color: "var(--gray-700)" }}>{e.label}</div>
            {e.hasShot && <span className="chip blue" style={{ fontSize: 10 }}>📸 증거</span>}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12, fontSize: 11, color: "var(--gray-400)", textAlign: "right" }}>
        전체 케이스 보기 → <a href="#evidence" style={{ color: "var(--blue)", fontWeight: 500 }}>부정행위 증거 페이지</a>
      </div>
    </div>
  );
}

function MiniFrame({ label, event, kind, caseId }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "var(--gray-500)", marginBottom: 4, fontWeight: 600 }}>{label}</div>
      <div style={{ position: "relative", aspectRatio: "16/10", borderRadius: 8, overflow: "hidden", border: event.type === "danger" ? "2px solid var(--red)" : "1px solid var(--gray-200)", background: "#0F1724" }}>
        <MiniSvg seed={caseId + event.t + kind} kind={kind}/>
        <span style={{ position: "absolute", top: 6, left: 8, fontSize: 9, fontWeight: 700, color: "white", background: event.type === "danger" ? "var(--red)" : "rgba(0,0,0,0.5)", padding: "2px 6px", borderRadius: 3, letterSpacing: "0.05em" }}>● REC</span>
        <span style={{ position: "absolute", top: 6, right: 8, fontSize: 9, color: "white", fontFamily: "monospace", background: "rgba(0,0,0,0.5)", padding: "2px 5px", borderRadius: 3 }}>{event.t}</span>
      </div>
    </div>
  );
}

function MiniSvg({ seed, kind }) {
  const hash = [...(seed || "")].reduce((a, c) => a + c.charCodeAt(0), 0);
  if (kind === "cam") {
    return (
      <svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%" }}>
        <defs><radialGradient id={"mg" + hash}><stop offset="0%" stopColor="#3B4660"/><stop offset="100%" stopColor="#0B1220"/></radialGradient></defs>
        <rect width="160" height="100" fill={`url(#mg${hash})`}/>
        <ellipse cx={80 + (hash % 14) - 7} cy={62} rx="22" ry="26" fill="#1F2937"/>
        <circle cx={80 + (hash % 14) - 7} cy={36} r="14" fill="#374151"/>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%" }}>
      <rect width="160" height="100" fill="#0F1724"/>
      <rect x="0" y="0" width="160" height="8" fill="#1A2438"/>
      <rect x="0" y="8" width="22" height="92" fill="rgba(255,255,255,0.03)"/>
      <rect x="28" y="14" width="100" height="3" fill="rgba(255,255,255,0.6)"/>
      <rect x="28" y="20" width="80" height="2" fill="rgba(255,255,255,0.3)"/>
      {[0,1,2,3].map(i => <rect key={i} x="32" y={36 + i * 11} width={60 + i * 5} height="2.5" fill="rgba(255,255,255,0.4)"/>)}
      {hash % 3 === 0 && <g><rect x="100" y="55" width="55" height="35" fill="#10B981" opacity="0.2" rx="2"/><rect x="100" y="55" width="55" height="6" fill="#10B981" rx="2"/></g>}
    </svg>
  );
}

function PenaltyTab() {
  return (
    <div style={{ padding: 24, textAlign: "center", color: "var(--gray-400)", border: "1px dashed var(--gray-border)", borderRadius: 10 }}>
      <Icon name="check" size={28} color="#16A34A"/>
      <div style={{ marginTop: 8, fontSize: 13, color: "var(--gray-600)" }}>제재 이력이 없습니다.</div>
      <div style={{ fontSize: 11, marginTop: 4 }}>이 응시자는 정상 상태입니다.</div>
    </div>
  );
}

window.Registrations = Registrations;
window.Examinees = Examinees;
