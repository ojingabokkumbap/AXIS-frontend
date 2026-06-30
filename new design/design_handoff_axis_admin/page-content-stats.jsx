// AXIS Admin — Content (Notices/FAQ/Inquiry) + Stats

function Content() {
  const [tab, setTab] = React.useState("notice");
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">커뮤니티</h1>
          <p className="page-sub">공지사항 · FAQ · 1:1 문의</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary"><Icon name="plus" size={14}/> {tab === "notice" ? "공지 등록" : tab === "faq" ? "FAQ 등록" : "답변 작성"}</button>
        </div>
      </div>

      <div className="tabs">
        <div className={"tab" + (tab === "notice" ? " active" : "")} onClick={() => setTab("notice")}>공지사항 <span className="count">38</span></div>
        <div className={"tab" + (tab === "faq" ? " active" : "")} onClick={() => setTab("faq")}>FAQ <span className="count">62</span></div>
        <div className={"tab" + (tab === "qna" ? " active" : "")} onClick={() => setTab("qna")}>1:1 문의 <span className="count">12</span></div>
      </div>

      {tab === "notice" && (
        <div className="card">
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>#</th><th>제목</th><th>등록일</th><th>조회수</th><th>고정</th><th>상태</th><th></th></tr></thead>
              <tbody>
                {[
                  { n: 38, t: "2026년 6월 시험 일정 안내 (AXIS L3 제5회 · AXIS-C L2 제3회)", d: "2026.05.10", v: 1248, pin: true, on: true, isNew: true },
                  { n: 37, t: "AXIS-H 신규 자격 출시 안내 — 6월 22일 첫 시험", d: "2026.05.02", v: 2147, pin: true, on: true, isNew: true },
                  { n: 36, t: "CBT 시스템 점검 안내 (2026.05.18 02:00~04:00)", d: "2026.04.28", v: 312, pin: false, on: true },
                  { n: 35, t: "응시 환경 가이드 업데이트 (Chrome 124 이상 권장)", d: "2026.04.15", v: 487, pin: false, on: true },
                  { n: 34, t: "[합격발표] AXIS L3 제4회 합격자 발표", d: "2026.04.03", v: 3982, pin: false, on: true },
                ].map((n, i) => (
                  <tr key={i}>
                    <td className="cell-mono muted">{n.n}</td>
                    <td>
                      {n.pin && <span className="chip blue" style={{ marginRight: 6 }}>고정</span>}
                      {n.isNew && <span className="chip red" style={{ marginRight: 6 }}>NEW</span>}
                      <span className="cell-strong">{n.t}</span>
                    </td>
                    <td className="muted">{n.d}</td>
                    <td className="muted">{n.v.toLocaleString()}</td>
                    <td><input type="checkbox" defaultChecked={n.pin}/></td>
                    <td><span className={"chip " + (n.on ? "green" : "gray")}><span className="chip-dot"/>{n.on ? "공개" : "비공개"}</span></td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button className="btn btn-sm btn-ghost"><Icon name="edit" size={13}/></button>
                        <button className="btn btn-sm btn-ghost"><Icon name="trash" size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "faq" && (
        <div>
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            {["전체 (62)","시험접수 (18)","응시환경 (14)","합격·성적 (11)","자격증 (8)","환불·취소 (7)","기타 (4)"].map((l, i) => (
              <span key={i} className={"chip " + (i === 0 ? "blue" : "gray")} style={{ padding: "5px 12px", cursor: "pointer" }}>{l}</span>
            ))}
          </div>
          <div className="card">
            {[
              { c: "시험접수", q: "AXIS 응시 자격에 제한이 있나요?", on: true },
              { c: "응시환경", q: "Mac에서도 응시 가능한가요?", on: true },
              { c: "응시환경", q: "웹캠과 마이크가 꼭 필요한가요?", on: true },
              { c: "합격·성적", q: "부분합격제도가 무엇인가요?", on: true },
              { c: "자격증", q: "자격증 PDF는 어디에서 다운로드하나요?", on: true },
              { c: "환불·취소", q: "시험 당일 응시하지 못한 경우 환불이 가능한가요?", on: true },
            ].map((f, i) => (
              <div key={i} style={{ padding: "14px 18px", borderBottom: "1px solid var(--gray-100)", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ color: "var(--gray-300)", cursor: "grab" }}>⋮⋮</span>
                <span className="chip gray" style={{ minWidth: 70 }}>{f.c}</span>
                <span className="cell-strong" style={{ flex: 1 }}>{f.q}</span>
                <span className={"chip " + (f.on ? "green" : "gray")}><span className="chip-dot"/>{f.on ? "공개" : "비공개"}</span>
                <button className="btn btn-sm btn-ghost"><Icon name="edit" size={13}/></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "qna" && <InquiryView/>}
    </div>
  );
}

function InquiryView() {
  const [sel, setSel] = React.useState(0);
  const list = [
    { n: "M-08412 홍길동", title: "L2 시험 부분합격은 다음 회차에 어떻게 신청하나요?", cat: "합격·성적", date: "05.11 13:42", status: "open", statusLabel: "미답변", urgent: true },
    { n: "M-08400 김미래", title: "환불 처리가 아직 안 되었습니다.", cat: "환불", date: "05.11 11:18", status: "pending", statusLabel: "처리중" },
    { n: "M-08395 이철수", title: "자격증 발급일자 변경 가능 여부 문의", cat: "자격증", date: "05.10 17:22", status: "pending", statusLabel: "처리중" },
    { n: "M-08321 박지영", title: "Chrome에서 카메라 권한이 안 잡혀요", cat: "응시환경", date: "05.10 09:48", status: "done", statusLabel: "완료" },
    { n: "M-08210 정수민", title: "기업 결제도 가능한가요?", cat: "접수", date: "05.09 16:30", status: "done", statusLabel: "완료" },
  ];
  const tones = { open: "red", pending: "orange", done: "green" };
  const s = list[sel];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "400px 1fr", gap: 16 }}>
      <div className="card">
        <div className="card-header" style={{ padding: 12 }}>
          <div className="search" style={{ flex: 1 }}>
            <span className="search-ic"><Icon name="search" size={14}/></span>
            <input className="input" placeholder="문의 검색" style={{ width: "100%", minWidth: 0 }}/>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, padding: "0 12px 10px" }}>
          {[["전체",12],["미답변",2],["처리중",6],["완료",4]].map(([l, n], i) => (
            <span key={i} className={"chip " + (i === 0 ? "blue" : "gray")} style={{ padding: "3px 10px", cursor: "pointer" }}>{l} <b>{n}</b></span>
          ))}
        </div>
        <div style={{ borderTop: "1px solid var(--gray-border)" }}>
          {list.map((m, i) => (
            <div key={i} onClick={() => setSel(i)} style={{
              padding: "12px 16px",
              borderBottom: "1px solid var(--gray-100)",
              cursor: "pointer",
              background: sel === i ? "var(--blue-50)" : "white",
              borderLeft: sel === i ? "3px solid var(--blue)" : "3px solid transparent",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span className="chip gray" style={{ fontSize: 10 }}>{m.cat}</span>
                <span className={"chip " + tones[m.status]} style={{ fontSize: 10 }}>{m.urgent && "● "}{m.statusLabel}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</div>
              <div style={{ fontSize: 11, color: "var(--gray-500)", marginTop: 2 }}>{m.n} · {m.date}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--gray-border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--primary)" }}>{s.title}</h3>
              <div style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 6, display: "flex", gap: 12 }}>
                <span>{s.n}</span><span>2026.{s.date}</span>
                <span className="chip gray" style={{ fontSize: 10 }}>{s.cat}</span>
                <span className={"chip " + tones[s.status]} style={{ fontSize: 10 }}>{s.statusLabel}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn btn-sm">상태 변경</button>
              <button className="btn btn-sm btn-danger">삭제</button>
            </div>
          </div>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ padding: 16, background: "var(--gray-50)", borderRadius: 10, fontSize: 13, lineHeight: 1.7, color: "var(--gray-700)" }}>
            안녕하세요. 지난 AXIS L2 제4회 시험에서 필기는 통과했는데 실기에서 부족해 부분합격이 되었습니다. 다음 회차 접수 시 실기만 다시 응시하는 방식인지, 비용은 얼마인지 안내 부탁드립니다.
          </div>
          <div style={{ marginTop: 14, padding: "10px 14px", background: "var(--blue-50)", borderRadius: 8, fontSize: 12, color: "var(--blue)", fontWeight: 500 }}>
            <Icon name="sparkle" size={13}/> AI 추천 답변: 부분합격자는 6개월 이내 차회 응시 시 실기만 재응시 가능합니다. (응시료 33,000원) [답변에 적용]
          </div>
          <div style={{ marginTop: 18 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-600)", marginBottom: 6, display: "block" }}>답변 작성</label>
            <textarea className="input" rows="6" style={{ width: "100%", padding: 12, resize: "vertical", lineHeight: 1.6 }} defaultValue="안녕하세요, AXIS 운영팀입니다.

문의주신 L2 부분합격 재응시는 다음과 같이 안내드립니다.
• 부분합격 유효기간: 합격발표일로부터 6개월
• 재응시 범위: 실기 영역만"/>
            <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button className="btn btn-sm"><Icon name="file" size={12}/> 파일 첨부</button>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn">임시저장</button>
                <button className="btn btn-blue"><Icon name="mail" size={13}/> 답변 발송</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Stats ---------- */
function Stats() {
  const [tab, setTab] = React.useState("overall");
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">통계·리포트</h1>
          <p className="page-sub">응시 추이 · 합격률 · 과목별 분석</p>
        </div>
        <div className="page-actions">
          <select className="select"><option>자격 전체</option></select>
          <select className="select"><option>최근 12개월</option><option>최근 6개월</option><option>2026년</option></select>
          <button className="btn"><Icon name="download" size={14}/> PDF 리포트</button>
          <button className="btn"><Icon name="download" size={14}/> Excel</button>
        </div>
      </div>

      <div className="tabs">
        {[["overall","종합 현황"],["passrate","합격률 분석"],["subject","과목별 분석"],["attend","응시 현황"],["member","회원 통계"]].map(([id, lbl]) => (
          <div key={id} className={"tab" + (tab === id ? " active" : "")} onClick={() => setTab(id)}>{lbl}</div>
        ))}
      </div>

      {tab === "overall" && <OverallStats/>}
      {tab === "passrate" && <PassRateStats/>}
      {tab === "subject" && <SubjectStats/>}
      {tab === "attend" && <AttendStats/>}
      {tab === "member" && <MemberStats/>}
    </div>
  );
}

function OverallStats() {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: 16 }}>
        {[
          { lbl: "누적 응시자", v: "12,847", sub: "전체 누적" },
          { lbl: "전체 합격률", v: "64.2%", sub: "전년 대비 +2.1%" },
          { lbl: "이번달 접수", v: "1,284", sub: "▲ 12.3%" },
          { lbl: "채점 진행률", v: "94.3%", sub: "SLA 평균 2.1일" },
          { lbl: "평균 필기점수", v: "71.3", sub: "이번 분기" },
          { lbl: "평균 실기점수", v: "68.7", sub: "이번 분기" },
        ].map((s, i) => (
          <div key={i} className="kpi" style={{ padding: "14px 16px" }}>
            <div className="kpi-label" style={{ fontSize: 11 }}>{s.lbl}</div>
            <div className="kpi-value" style={{ fontSize: 22 }}>{s.v}</div>
            <div className="kpi-sub" style={{ fontSize: 11 }}>{s.sub}</div>
          </div>
        ))}
      </div>
      <div className="grid-2-eq">
        <div className="card">
          <div className="card-header"><h3 className="card-title">월별 응시자 추이 (12개월)</h3></div>
          <div style={{ padding: 18 }}><LineChart12/></div>
        </div>
        <div className="card">
          <div className="card-header"><h3 className="card-title">자격별 응시 비율</h3></div>
          <div style={{ padding: 18, display: "flex", alignItems: "center", gap: 24 }}>
            <Donut/>
            <div style={{ flex: 1 }}>
              {[
                { l: "AXIS (일반)", v: "62%", n: "7,965", c: "var(--blue)" },
                { l: "AXIS-C (코딩)", v: "26%", n: "3,340", c: "var(--green)" },
                { l: "AXIS-H (의료)", v: "12%", n: "1,542", c: "var(--purple)" },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", padding: "8px 0", borderBottom: i < 2 ? "1px solid var(--gray-100)" : "none" }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: r.c, marginRight: 10 }}/>
                  <span style={{ flex: 1, fontSize: 13, color: "var(--gray-700)" }}>{r.l}</span>
                  <span style={{ fontSize: 13, color: "var(--gray-500)", marginRight: 12 }}>{r.n}</span>
                  <span style={{ fontWeight: 700, color: "var(--primary)" }}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PassRateStats() {
  return (
    <div>
      <div className="grid-2-eq" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="card-header"><h3 className="card-title">회차별 합격률 추이 (최근 10회)</h3></div>
          <div style={{ padding: 18 }}><MultiLineChart/></div>
        </div>
        <div className="card">
          <div className="card-header"><h3 className="card-title">자격·등급별 합격률 비교</h3></div>
          <div style={{ padding: 18 }}><GroupedBar/></div>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><h3 className="card-title">전체 회차 상세</h3></div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>회차</th><th>자격·등급</th><th>응시</th><th>합격</th><th>불합격</th><th>부분합격</th><th>합격률</th><th>평균점수</th></tr></thead>
            <tbody>
              {[
                ["제5회","axis","AXIS","L3", 247, 178, 57, 12, "72.1%", "73.4"],
                ["제4회","axis","AXIS","L3", 98, 71, 27, 0, "72.4%", "71.2"],
                ["제4회","axis","AXIS","L2", 85, 42, 30, 13, "49.4%", "65.3"],
                ["제3회","axisc","AXIS-C","L2", 74, 49, 21, 4, "66.2%", "70.1"],
                ["제2회","axish","AXIS-H","L3", 52, 38, 14, 0, "73.1%", "74.8"],
              ].map((r, i) => (
                <tr key={i}>
                  <td className="cell-strong">{r[0]}</td>
                  <td><span className={"cert-tag " + r[1]}>{r[2]}</span> <b>{r[3]}</b></td>
                  <td>{r[4]}</td><td className="cell-strong" style={{ color: "var(--green)" }}>{r[5]}</td><td>{r[6]}</td><td>{r[7]}</td>
                  <td className="cell-strong">{r[8]}</td><td>{r[9]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SubjectStats() {
  // heatmap data 4x10
  const subj = ["AI 기초이해","AI 도구활용","프롬프트 기초","AI 윤리"];
  const grid = subj.map((s, si) => Array.from({ length: 15 }, (_, qi) => 30 + ((si * 11 + qi * 7) % 60)));
  const colorFor = v => {
    if (v >= 75) return "#16A34A";
    if (v >= 60) return "#84CC16";
    if (v >= 45) return "#F97316";
    return "#DC2626";
  };
  return (
    <div className="grid-2-eq">
      <div className="card" style={{ gridColumn: "span 2" }}>
        <div className="card-header"><h3 className="card-title">문항별 정답률 히트맵 (AXIS L3 · 제5회)</h3></div>
        <div style={{ padding: 18 }}>
          {subj.map((s, si) => (
            <div key={si} style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
              <span style={{ width: 110, fontSize: 12, color: "var(--gray-600)", fontWeight: 500 }}>{s}</span>
              <div style={{ display: "flex", gap: 3, flex: 1 }}>
                {grid[si].map((v, qi) => (
                  <div key={qi} style={{ flex: 1, height: 28, background: colorFor(v), opacity: 0.3 + (v / 100) * 0.7, borderRadius: 3, display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700, color: "white" }}>
                    {v}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div style={{ marginTop: 16, display: "flex", gap: 12, fontSize: 11, color: "var(--gray-500)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 12, height: 12, background: "#16A34A", borderRadius: 2 }}/> 75%+</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 12, height: 12, background: "#84CC16", borderRadius: 2 }}/> 60-75%</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 12, height: 12, background: "#F97316", borderRadius: 2 }}/> 45-60%</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 12, height: 12, background: "#DC2626", borderRadius: 2 }}/> 45% 미만 (재검토 필요)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AttendStats() {
  return (
    <div className="card">
      <div className="card-header"><h3 className="card-title">회차별 접수·실응시·제출 현황</h3></div>
      <div style={{ padding: 18 }}><StackedBar/></div>
    </div>
  );
}

function MemberStats() {
  return (
    <div className="grid-2-eq">
      <div className="card">
        <div className="card-header"><h3 className="card-title">월별 신규 가입자</h3></div>
        <div style={{ padding: 18 }}><LineChart12/></div>
      </div>
      <div className="card">
        <div className="card-header"><h3 className="card-title">주요 지표</h3></div>
        <div style={{ padding: 18 }}>
          {[
            ["재응시율", "31.4%", "최근 6개월"],
            ["부분합격 면제 활용", "68.2%", "L2 한정"],
            ["응시제한자 수", "28명", "전체 회원 0.22%"],
            ["평균 응시 횟수", "1.6회", "회원당"],
          ].map(([l, v, s], i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: i < 3 ? "1px solid var(--gray-100)" : "none" }}>
              <div>
                <div style={{ fontSize: 13, color: "var(--gray-700)", fontWeight: 500 }}>{l}</div>
                <div style={{ fontSize: 11, color: "var(--gray-400)" }}>{s}</div>
              </div>
              <span style={{ fontSize: 22, fontWeight: 800, color: "var(--primary)", letterSpacing: "-0.02em" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Chart primitives ---------- */
function LineChart12() {
  const data = [142, 178, 165, 198, 224, 256, 289, 312, 287, 341, 388, 412];
  const max = 450;
  const W = 540, H = 180, padX = 36, padY = 16;
  const pts = data.map((v, i) => [padX + (i / (data.length - 1)) * (W - padX * 2), H - padY - (v / max) * (H - padY * 2)]);
  const path = "M " + pts.map(p => p.join(",")).join(" L ");
  const area = path + ` L ${pts[pts.length-1][0]},${H-padY} L ${pts[0][0]},${H-padY} Z`;
  const months = ["6","7","8","9","10","11","12","1","2","3","4","5"];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%" }}>
      {[0, 0.5, 1].map((p, i) => (
        <line key={i} x1={padX} x2={W-padX} y1={H - padY - p*(H-padY*2)} y2={H - padY - p*(H-padY*2)} stroke="#E5E7EB" strokeDasharray="3 4"/>
      ))}
      <path d={area} fill="url(#g1)" opacity="0.3"/>
      <path d={path} stroke="#2563EB" strokeWidth="2.5" fill="none"/>
      {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3.5" fill="white" stroke="#2563EB" strokeWidth="2"/>)}
      {pts.map((_, i) => <text key={i} x={pts[i][0]} y={H - 2} fontSize="10" fill="#9CA3AF" textAnchor="middle">{months[i]}월</text>)}
      <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2563EB"/><stop offset="100%" stopColor="#2563EB" stopOpacity="0"/></linearGradient></defs>
    </svg>
  );
}

function MultiLineChart() {
  const series = [
    { c: "#2563EB", lbl: "L3", data: [68, 71, 69, 72, 70, 73, 71, 74, 72, 72] },
    { c: "#0D9488", lbl: "L2", data: [48, 52, 50, 49, 53, 51, 49, 52, 50, 49] },
    { c: "#7C3AED", lbl: "L1", data: [32, 35, 38, 36, 34, 37, 35, 38, 36, 35] },
  ];
  const W = 540, H = 200, padX = 32, padY = 16;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%" }}>
      {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
        <g key={i}>
          <line x1={padX} x2={W-padX} y1={H-padY - p*(H-padY*2)} y2={H-padY - p*(H-padY*2)} stroke="#E5E7EB" strokeDasharray="3 4"/>
          <text x={padX-6} y={H-padY - p*(H-padY*2)+3} fontSize="9" fill="#9CA3AF" textAnchor="end">{Math.round(p*100)}%</text>
        </g>
      ))}
      {series.map((s, si) => {
        const pts = s.data.map((v, i) => [padX + (i/(s.data.length-1))*(W-padX*2), H-padY - (v/100)*(H-padY*2)]);
        return (
          <g key={si}>
            <path d={"M " + pts.map(p => p.join(",")).join(" L ")} stroke={s.c} strokeWidth="2" fill="none"/>
            {pts.map(([x,y], i) => <circle key={i} cx={x} cy={y} r="3" fill={s.c}/>)}
          </g>
        );
      })}
      {[...Array(10)].map((_, i) => <text key={i} x={padX + (i/9)*(W-padX*2)} y={H-2} fontSize="10" fill="#9CA3AF" textAnchor="middle">제{i+1}회</text>)}
    </svg>
  );
}

function GroupedBar() {
  const groups = [
    { l: "AXIS", data: [72, 49, 35] },
    { l: "AXIS-C", data: [78, 66, 0] },
    { l: "AXIS-H", data: [73, 0, 0] },
  ];
  const colors = ["#2563EB", "#0D9488", "#7C3AED"];
  const lvls = ["L3", "L2", "L1"];
  const W = 540, H = 200, padX = 32, padY = 16;
  const gw = (W - padX*2) / groups.length;
  const bw = (gw - 30) / 3;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%" }}>
      {[0, 0.5, 1].map((p, i) => <line key={i} x1={padX} x2={W-padX} y1={H-padY - p*(H-padY*2)} y2={H-padY - p*(H-padY*2)} stroke="#E5E7EB" strokeDasharray="3 4"/>)}
      {groups.map((g, gi) => (
        <g key={gi} transform={`translate(${padX + gw * gi + 15}, 0)`}>
          {g.data.map((v, vi) => {
            const h = (v / 100) * (H - padY * 2);
            return v > 0 ? <rect key={vi} x={vi * (bw + 2)} y={H - padY - h} width={bw} height={h} fill={colors[vi]} rx="2"/> : null;
          })}
          <text x={(gw - 30) / 2} y={H - 2} fontSize="11" fill="#4B5563" textAnchor="middle" fontWeight="600">{g.l}</text>
        </g>
      ))}
      <g transform={`translate(${W-130}, 10)`}>
        {lvls.map((l, i) => (
          <g key={i} transform={`translate(0, ${i * 16})`}>
            <rect width="10" height="10" fill={colors[i]} rx="2"/>
            <text x="14" y="9" fontSize="10" fill="#4B5563">{l}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

function StackedBar() {
  const data = Array.from({ length: 10 }, (_, i) => ({
    reg: 80 + (i*13) % 50,
    attend: 70 + (i*11) % 40,
    submit: 60 + (i*7) % 35,
    terminated: 1 + (i % 3)
  }));
  const max = 150;
  const W = 800, H = 220, padX = 36, padY = 24;
  const gw = (W - padX*2) / data.length;
  const bw = gw - 8;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%" }}>
      {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
        <g key={i}>
          <line x1={padX} x2={W-padX} y1={H-padY - p*(H-padY*2)} y2={H-padY - p*(H-padY*2)} stroke="#E5E7EB" strokeDasharray="3 4"/>
          <text x={padX-6} y={H-padY - p*(H-padY*2)+3} fontSize="9" fill="#9CA3AF" textAnchor="end">{Math.round(max*p)}</text>
        </g>
      ))}
      {data.map((d, i) => {
        const x = padX + gw * i + 4;
        const bh = (v) => (v / max) * (H - padY * 2);
        return (
          <g key={i}>
            <rect x={x} y={H-padY - bh(d.reg)} width={bw/2 - 1} height={bh(d.reg)} fill="#DBEAFE" rx="2"/>
            <rect x={x + bw/2 + 1} y={H-padY - bh(d.attend)} width={bw/2 - 1} height={bh(d.attend)} fill="#2563EB" rx="2"/>
            <rect x={x + bw/2 + 1} y={H-padY - bh(d.submit)} width={bw/2 - 1} height={bh(d.submit)} fill="#0D9488" rx="2"/>
            <text x={x + bw/2} y={H-4} fontSize="10" fill="#9CA3AF" textAnchor="middle">제{i+1}회</text>
          </g>
        );
      })}
      <g transform={`translate(${W-200}, 6)`}>
        {[["#DBEAFE","접수"],["#2563EB","실응시"],["#0D9488","제출완료"]].map((s, i) => (
          <g key={i} transform={`translate(${i*65}, 0)`}>
            <rect width="10" height="10" fill={s[0]} rx="2"/>
            <text x="14" y="9" fontSize="10" fill="#4B5563">{s[1]}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

function Donut() {
  const data = [{ v: 62, c: "#2563EB" }, { v: 26, c: "#16A34A" }, { v: 12, c: "#7C3AED" }];
  let acc = 0;
  return (
    <svg viewBox="0 0 120 120" width="160" height="160">
      <circle cx="60" cy="60" r="48" fill="none" stroke="#F3F4F6" strokeWidth="20"/>
      {data.map((d, i) => {
        const len = (d.v / 100) * (2 * Math.PI * 48);
        const off = (acc / 100) * (2 * Math.PI * 48);
        acc += d.v;
        return <circle key={i} cx="60" cy="60" r="48" fill="none" stroke={d.c} strokeWidth="20"
          strokeDasharray={`${len} ${2*Math.PI*48 - len}`} strokeDashoffset={-off}
          transform="rotate(-90 60 60)"/>;
      })}
      <text x="60" y="58" fontSize="11" fill="#9CA3AF" textAnchor="middle">누적 응시</text>
      <text x="60" y="74" fontSize="18" fill="#0F172A" fontWeight="800" textAnchor="middle">12,847</text>
    </svg>
  );
}

window.Content = Content;
window.Stats = Stats;
