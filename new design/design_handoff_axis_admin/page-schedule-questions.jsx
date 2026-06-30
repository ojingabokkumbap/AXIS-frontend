// AXIS Admin — Schedule + Question Bank + Registrations + Examinees

function Schedule({ openPanel }) {
  const [view, setView] = React.useState("list");
  const rows = [
    { round: "제5회", cert: "axis", certLabel: "AXIS", lvl: "L3", reg: "06.01~06.10", date: "2026.06.14 14:00", cap: 300, n: 284, status: "live", statusLabel: "진행중" },
    { round: "제3회", cert: "axisc", certLabel: "AXIS-C", lvl: "L2", reg: "05.25~06.05", date: "2026.06.14 14:00", cap: 80, n: 42, status: "live", statusLabel: "진행중" },
    { round: "제6회", cert: "axis", certLabel: "AXIS", lvl: "L3", reg: "06.10~06.20", date: "2026.06.28 14:00", cap: 300, n: 284, status: "open", statusLabel: "접수중" },
    { round: "제2회", cert: "axish", certLabel: "AXIS-H", lvl: "L2", reg: "06.05~06.18", date: "2026.06.22 14:00", cap: 100, n: 67, status: "open", statusLabel: "접수중" },
    { round: "제1회", cert: "axisc", certLabel: "AXIS-C", lvl: "L1", reg: "06.10~06.25", date: "2026.06.28 14:00", cap: 50, n: 23, status: "open", statusLabel: "접수중" },
    { round: "제7회", cert: "axis", certLabel: "AXIS", lvl: "L3", reg: "07.01~07.10", date: "2026.07.12 14:00", cap: 300, n: 0, status: "soon", statusLabel: "접수예정" },
    { round: "제4회", cert: "axis", certLabel: "AXIS", lvl: "L3", reg: "05.01~05.10", date: "2026.05.17 14:00", cap: 300, n: 298, status: "done", statusLabel: "완료" },
  ];
  const chipTone = { live: "green", open: "blue", soon: "gray", done: "teal", closed: "orange", cancelled: "red" };
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">시험일정 관리</h1>
          <p className="page-sub">전체 회차 등록·정원·접수 기간을 관리합니다 · 총 24개 회차</p>
        </div>
        <div className="page-actions">
          <button className="btn"><Icon name="download" size={14}/> Excel</button>
          <button className="btn btn-primary" onClick={openPanel}><Icon name="plus" size={14}/> 새 시험 등록</button>
        </div>
      </div>

      <div className="filter-bar">
        <select className="select"><option>자격 전체</option><option>AXIS</option><option>AXIS-C</option><option>AXIS-H</option></select>
        <select className="select"><option>등급 전체</option><option>L3</option><option>L2</option><option>L1</option></select>
        <select className="select"><option>상태 전체</option><option>접수중</option><option>진행중</option><option>완료</option></select>
        <select className="select"><option>2026년</option><option>2025년</option></select>
        <div className="search"><span className="search-ic"><Icon name="search" size={14}/></span><input className="input" placeholder="회차·자격명 검색"/></div>
        <div style={{ marginLeft: "auto", display: "flex", border: "1px solid var(--gray-border)", borderRadius: 8, padding: 2, background: "var(--gray-50)" }}>
          <button className={"btn btn-sm btn-ghost" + (view === "list" ? " btn-primary" : "")} onClick={() => setView("list")}><Icon name="list" size={13}/> 목록</button>
          <button className={"btn btn-sm btn-ghost" + (view === "cal" ? " btn-primary" : "")} onClick={() => setView("cal")}><Icon name="calendar" size={13}/> 캘린더</button>
        </div>
      </div>

      {view === "list" && (
        <div className="card">
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>회차</th><th>자격</th><th>등급</th><th>접수기간</th><th>시험일시</th>
                  <th style={{ textAlign: "right" }}>정원</th><th>접수 진행</th><th>상태</th><th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td className="cell-strong">{r.round}</td>
                    <td><span className={"cert-tag " + r.cert}>{r.certLabel}</span></td>
                    <td><b>{r.lvl}</b></td>
                    <td className="muted">{r.reg}</td>
                    <td>{r.date}</td>
                    <td style={{ textAlign: "right" }} className="cell-strong">{r.cap}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 160 }}>
                        <div className="bar" style={{ flex: 1 }}><span style={{ width: `${Math.min(100, (r.n / r.cap) * 100)}%` }}/></div>
                        <span style={{ fontSize: 12, color: "var(--gray-600)", fontFeatureSettings: '"tnum"' }}>{r.n}/{r.cap}</span>
                      </div>
                    </td>
                    <td><span className={"chip " + chipTone[r.status]}><span className="chip-dot"/>{r.statusLabel}</span></td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button className="btn btn-sm btn-ghost" title="상세"><Icon name="eye" size={13}/></button>
                        <button className="btn btn-sm btn-ghost" title="수정"><Icon name="edit" size={13}/></button>
                        <button className="btn btn-sm btn-ghost" title="삭제"><Icon name="trash" size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <span>총 24건</span>
            <div className="pager-nav">
              <button><Icon name="chevronL" size={12}/></button>
              <button className="active">1</button><button>2</button><button>3</button>
              <button><Icon name="chevronR" size={12}/></button>
            </div>
          </div>
        </div>
      )}

      {view === "cal" && <CalendarView/>}
    </div>
  );
}

function CalendarView() {
  // June 2026 calendar (June 1 is Monday)
  const startOffset = 1; // Sunday=0, Monday=1
  const daysInMonth = 30;
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push({ muted: true, n: 31 - startOffset + i + 1 });
  for (let i = 1; i <= daysInMonth; i++) cells.push({ n: i });
  while (cells.length < 35) cells.push({ muted: true, n: cells.length - daysInMonth - startOffset + 1 });
  const events = {
    14: [{ name: "AXIS L3 제5회", c: "blue" }, { name: "AXIS-C L2 제3회", c: "green" }],
    21: [{ name: "AXIS L3 제6회", c: "blue" }],
    22: [{ name: "AXIS-H L2 제2회", c: "purple" }],
    28: [{ name: "AXIS-C L1 제1회", c: "green" }, { name: "AXIS L3 제6회 채점", c: "blue" }],
  };
  return (
    <div className="card">
      <div className="card-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn btn-sm"><Icon name="chevronL" size={13}/></button>
          <h3 className="card-title" style={{ margin: 0 }}>2026년 6월</h3>
          <button className="btn btn-sm"><Icon name="chevronR" size={13}/></button>
        </div>
        <div style={{ display: "flex", gap: 12, fontSize: 11, color: "var(--gray-500)" }}>
          <span><i style={{ display: "inline-block", width: 9, height: 9, borderRadius: 2, background: "var(--blue)", marginRight: 4, verticalAlign: "middle" }}/> AXIS</span>
          <span><i style={{ display: "inline-block", width: 9, height: 9, borderRadius: 2, background: "var(--green)", marginRight: 4, verticalAlign: "middle" }}/> AXIS-C</span>
          <span><i style={{ display: "inline-block", width: 9, height: 9, borderRadius: 2, background: "var(--purple)", marginRight: 4, verticalAlign: "middle" }}/> AXIS-H</span>
        </div>
      </div>
      <div className="cal-grid">
        {["일","월","화","수","목","금","토"].map(d => <div key={d} className="cal-head">{d}</div>)}
        {cells.map((c, i) => {
          const dow = i % 7;
          const cls = ["cal-cell"];
          if (c.muted) cls.push("muted");
          if (!c.muted && c.n === 14) cls.push("today");
          if (dow === 0) cls.push("sun");
          if (dow === 6) cls.push("sat");
          return (
            <div key={i} className={cls.join(" ")}>
              <div className="day-num">{c.n}</div>
              {!c.muted && events[c.n] && events[c.n].map((e, j) => (
                <div key={j} className={"cal-evt " + e.c}>{e.name}</div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScheduleSidePanel({ onClose }) {
  return (
    <>
      <div className="panel-overlay" onClick={onClose}/>
      <div className="side-panel">
        <div className="panel-head">
          <h3>새 시험 등록</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" size={14}/></button>
        </div>
        <div className="panel-body">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="field-grp"><label>자격</label><select className="select"><option>AXIS (일반)</option><option>AXIS-C (코딩)</option><option>AXIS-H (의료)</option></select></div>
            <div className="field-grp"><label>등급</label><select className="select"><option>L3 Starter</option><option>L2 Practitioner</option><option>L1 Expert</option></select></div>
          </div>
          <div className="field-grp"><label>회차</label><input className="input" defaultValue="제6회"/></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="field-grp"><label>접수 시작</label><input className="input" type="date" defaultValue="2026-06-10"/></div>
            <div className="field-grp"><label>접수 마감</label><input className="input" type="date" defaultValue="2026-06-20"/></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="field-grp"><label>시험일</label><input className="input" type="date" defaultValue="2026-06-28"/></div>
            <div className="field-grp"><label>시작 시간</label><input className="input" type="time" defaultValue="14:00"/></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="field-grp"><label>정원</label><input className="input" defaultValue="300"/></div>
            <div className="field-grp"><label>응시료 (원)</label><input className="input" defaultValue="44,000"/></div>
          </div>
          <div className="field-grp">
            <label>옵션</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "8px 0" }}>
              <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: "var(--gray-700)" }}>
                <input type="checkbox"/> L3 상시 응시 (접수기간 미설정)
              </label>
              <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: "var(--gray-700)" }}>
                <input type="checkbox" defaultChecked/> 사이트 캘린더에 공개
              </label>
            </div>
          </div>
        </div>
        <div className="panel-foot">
          <button className="btn" onClick={onClose}>취소</button>
          <button className="btn btn-blue">등록하기</button>
        </div>
      </div>
    </>
  );
}

/* ---------- Question Bank ---------- */
function Questions() {
  const [tab, setTab] = React.useState("mcq");
  const [opened, setOpened] = React.useState(null);
  const stats = [
    { lbl: "총 문항 수", v: "2,847", sub: "AXIS 1,420 · AXIS-C 824 · AXIS-H 603" },
    { lbl: "활성 문항", v: "2,612", sub: "비활성 235" },
    { lbl: "평균 정답률", v: "67.4%", sub: "최근 4회차 기준" },
    { lbl: "이번달 추가", v: "184", sub: "8명 출제위원" },
  ];
  const questions = [
    { id: "Q-2341", cert: "axis", lvl: "L3", subj: "AI 기초이해", q: "다음 중 생성형 AI의 특징으로 가장 적절한 것은?", diff: "중", diffTone: "orange", rate: 67.3, used: 4, active: true },
    { id: "Q-2340", cert: "axis", lvl: "L3", subj: "AI 도구활용 기초", q: "ChatGPT를 활용한 업무 시나리오 중 부적절한 것은?", diff: "하", diffTone: "green", rate: 84.1, used: 5, active: true },
    { id: "Q-2338", cert: "axisc", lvl: "L2", subj: "AI 코딩 실무", q: "Cursor에서 다음 코드의 리팩터링 방향으로 가장 적합한 것은?", diff: "상", diffTone: "red", rate: 38.2, used: 2, active: true },
    { id: "Q-2335", cert: "axish", lvl: "L3", subj: "환자정보·보안", q: "의료기관에서 ChatGPT 사용 시 반드시 제외해야 하는 정보는?", diff: "중", diffTone: "orange", rate: 71.8, used: 1, active: true },
    { id: "Q-2331", cert: "axis", lvl: "L2", subj: "프롬프트 심화", q: "Chain-of-Thought 프롬프트의 핵심 원칙은?", diff: "상", diffTone: "red", rate: 42.6, used: 3, active: true },
    { id: "Q-2328", cert: "axis", lvl: "L1", subj: "AI 거버넌스", q: "AI 윤리 가이드라인 수립 시 우선 순위가 가장 높은 것은?", diff: "상", diffTone: "red", rate: 55.4, used: 2, active: false },
  ];
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">문제은행 관리</h1>
          <p className="page-sub">필기 문항 및 실기 과제 템플릿 운영</p>
        </div>
        <div className="page-actions">
          <button className="btn"><Icon name="download" size={14}/> CSV 템플릿</button>
          <button className="btn"><Icon name="upload" size={14}/> CSV 업로드</button>
          <button className="btn btn-primary"><Icon name="plus" size={14}/> 문항 추가</button>
        </div>
      </div>

      <div className="kpi-grid">
        {stats.map((s, i) => (
          <div key={i} className={"kpi " + ["blue","green","orange","red"][i]}>
            <div className="kpi-label">{s.lbl}</div>
            <div className="kpi-value">{s.v}</div>
            <div className="kpi-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="tabs">
        <div className={"tab" + (tab === "mcq" ? " active" : "")} onClick={() => setTab("mcq")}>필기 문항 <span className="count">2,612</span></div>
        <div className={"tab" + (tab === "task" ? " active" : "")} onClick={() => setTab("task")}>실기 과제 템플릿 <span className="count">142</span></div>
        <div className={"tab" + (tab === "stat" ? " active" : "")} onClick={() => setTab("stat")}>출제 통계</div>
      </div>

      <div className="filter-bar">
        <select className="select"><option>자격 전체</option></select>
        <select className="select"><option>등급 전체</option></select>
        <select className="select"><option>과목 전체</option></select>
        <select className="select"><option>난이도 전체</option></select>
        <select className="select"><option>상태 전체</option></select>
        <div className="search"><span className="search-ic"><Icon name="search" size={14}/></span><input className="input" placeholder="문항 검색"/></div>
      </div>

      <div className="card">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>ID</th><th>자격·등급</th><th>과목</th><th>문항</th><th>난이도</th><th>정답률</th><th>출제</th><th>상태</th><th></th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q, i) => (
                <tr key={i} onClick={() => setOpened(q)} style={{ cursor: "pointer" }}>
                  <td className="cell-mono cell-strong">{q.id}</td>
                  <td><span className={"cert-tag " + q.cert}>{q.cert === "axis" ? "AXIS" : q.cert === "axisc" ? "AXIS-C" : "AXIS-H"}</span> <b>{q.lvl}</b></td>
                  <td className="muted">{q.subj}</td>
                  <td style={{ maxWidth: 360, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.q}</td>
                  <td><span className={"chip " + q.diffTone}>{q.diff}</span></td>
                  <td className="cell-strong" style={{ fontFeatureSettings: '"tnum"' }}>{q.rate}%</td>
                  <td className="muted">{q.used}회</td>
                  <td><span className={"chip " + (q.active ? "green" : "gray")}><span className="chip-dot"/>{q.active ? "활성" : "비활성"}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button className="btn btn-sm btn-ghost"><Icon name="eye" size={13}/></button>
                      <button className="btn btn-sm btn-ghost"><Icon name="edit" size={13}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <span>총 2,612 문항</span>
          <div className="pager-nav">
            <button><Icon name="chevronL" size={12}/></button>
            <button className="active">1</button><button>2</button><button>3</button><button>...</button><button>261</button>
            <button><Icon name="chevronR" size={12}/></button>
          </div>
        </div>
      </div>

      {opened && <QuestionDetail q={opened} onClose={() => setOpened(null)}/>}
    </div>
  );
}

function QuestionDetail({ q, onClose }) {
  const choices = [
    { n: "①", t: "스스로 학습하여 새로운 데이터에 적응한다" },
    { n: "②", t: "정해진 규칙 없이도 패턴을 추출한다", correct: true },
    { n: "③", t: "데이터 양과 무관하게 동일한 품질을 제공한다" },
    { n: "④", t: "프롬프트의 모호함을 자동으로 보정한다" },
  ];
  return (
    <>
      <div className="panel-overlay" onClick={onClose}/>
      <div className="side-panel" style={{ width: 560 }}>
        <div className="panel-head">
          <div>
            <h3>{q.id} · 문항 상세</h3>
            <div style={{ marginTop: 4, display: "flex", gap: 6 }}>
              <span className={"cert-tag " + q.cert}>{q.cert === "axis" ? "AXIS" : q.cert === "axisc" ? "AXIS-C" : "AXIS-H"}</span>
              <span className="chip gray">{q.lvl}</span>
              <span className="chip gray">{q.subj}</span>
              <span className={"chip " + q.diffTone}>난이도 {q.diff}</span>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="close" size={14}/></button>
        </div>
        <div className="panel-body">
          <div className="field-grp">
            <label>문제</label>
            <div style={{ padding: "12px 14px", background: "var(--gray-50)", borderRadius: 8, fontSize: 14, lineHeight: 1.6, color: "var(--primary)" }}>
              {q.q}
            </div>
          </div>
          <div className="field-grp">
            <label>선택지</label>
            {choices.map((c, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "10px 12px", marginBottom: 6, borderRadius: 8, background: c.correct ? "var(--green-50)" : "white", border: c.correct ? "1px solid #BBF7D0" : "1px solid var(--gray-border)" }}>
                <span style={{ fontWeight: 700, color: c.correct ? "var(--green)" : "var(--gray-500)", minWidth: 16 }}>{c.n}</span>
                <span style={{ flex: 1, fontSize: 13 }}>{c.t}</span>
                {c.correct && <span className="chip green">정답</span>}
              </div>
            ))}
          </div>
          <div className="field-grp">
            <label>해설</label>
            <div style={{ padding: "12px 14px", background: "var(--gray-50)", borderRadius: 8, fontSize: 13, lineHeight: 1.6 }}>
              생성형 AI는 사전 학습된 패턴에 기반하여 새로운 입력에 대해 출력을 생성하지만, 학습되지 않은 영역에 자동으로 적응하지는 않으며, 데이터 양과 품질에 의존합니다.
            </div>
          </div>
          <div className="grid-2-eq" style={{ marginTop: 16 }}>
            <div className="card" style={{ boxShadow: "none" }}>
              <div className="card-body" style={{ padding: 14 }}>
                <div style={{ fontSize: 11, color: "var(--gray-500)", marginBottom: 4 }}>출제 이력</div>
                <div style={{ fontSize: 13, color: "var(--primary)", fontWeight: 600 }}>제2회, 제3회, 제4회, 제5회</div>
              </div>
            </div>
            <div className="card" style={{ boxShadow: "none" }}>
              <div className="card-body" style={{ padding: 14 }}>
                <div style={{ fontSize: 11, color: "var(--gray-500)", marginBottom: 4 }}>회차별 정답률</div>
                <Sparkline data={[62, 68, 71, 67]}/>
              </div>
            </div>
          </div>
        </div>
        <div className="panel-foot">
          <button className="btn" onClick={onClose}>닫기</button>
          <button className="btn"><Icon name="edit" size={13}/> 복제</button>
          <button className="btn btn-primary"><Icon name="edit" size={13}/> 수정</button>
        </div>
      </div>
    </>
  );
}

function Sparkline({ data, color = "var(--blue)" }) {
  const W = 200, H = 40;
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / (max - min || 1)) * H}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 40 }}>
      <polyline fill="none" stroke={color} strokeWidth="2" points={pts}/>
      {data.map((v, i) => (
        <circle key={i} cx={(i / (data.length - 1)) * W} cy={H - ((v - min) / (max - min || 1)) * H} r="3" fill={color}/>
      ))}
    </svg>
  );
}

window.Schedule = Schedule;
window.ScheduleSidePanel = ScheduleSidePanel;
window.Questions = Questions;
window.Sparkline = Sparkline;
