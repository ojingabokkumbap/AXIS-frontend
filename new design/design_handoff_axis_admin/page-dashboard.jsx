// AXIS Admin — Page: Dashboard
const { useState: useStateDash } = React;

function Dashboard({ goto }) {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">대시보드</h1>
          <p className="page-sub">오늘의 운영 현황 · 2026년 5월 11일 (월) 14:32 · 30초마다 자동 갱신</p>
        </div>
        <div className="page-actions">
          <button className="btn"><Icon name="refresh" size={14}/> 새로고침</button>
          <button className="btn"><Icon name="download" size={14}/> 일일 리포트</button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="kpi-grid">
        <div className="kpi blue">
          <div className="kpi-label"><Icon name="users" size={13}/> 오늘 응시자</div>
          <div className="kpi-value">247<span className="unit">명</span></div>
          <div className="kpi-sub">진행중 <b style={{color:"var(--blue)"}}>183</b> · 완료 <b>64</b></div>
        </div>
        <div className="kpi green">
          <div className="kpi-label"><Icon name="card" size={13}/> 이번달 접수</div>
          <div className="kpi-value">1,284<span className="unit">건</span></div>
          <div className="kpi-sub"><span className="delta-up">▲ 12.3%</span> 전월 대비</div>
        </div>
        <div className="kpi orange">
          <div className="kpi-label"><Icon name="grading" size={13}/> 채점 대기</div>
          <div className="kpi-value">38<span className="unit">건</span></div>
          <div className="kpi-sub">AI 채점 22 · 전문가 검수 16</div>
        </div>
        <div className="kpi red">
          <div className="kpi-label"><Icon name="alert" size={13}/> 부정행위 알림</div>
          <div className="kpi-value">3<span className="unit">건</span></div>
          <div className="kpi-sub" style={{color:"var(--red)", cursor:"pointer"}} onClick={() => goto("monitor")}>오늘 발생 · 확인하기 →</div>
        </div>
      </div>

      {/* Two-column: live exams + upcoming */}
      <div className="grid-2" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--red)", display: "inline-block", boxShadow: "0 0 0 4px rgba(220,38,38,0.15)" }}/>
              현재 진행 중인 시험
            </h3>
            <span style={{ fontSize: 11, color: "var(--gray-400)" }}>실시간 · 30초 갱신</span>
          </div>
          <div className="card-body" style={{ paddingTop: 4, paddingBottom: 4 }}>
            <div className="live-exam-row">
              <div className="exam-icon axis">AXIS</div>
              <div className="live-meta">
                <div className="live-meta-title">AXIS L3 Starter · 제5회</div>
                <div className="live-meta-sub">183명 응시 · 14:00 시작 · 잔여 38분</div>
              </div>
              <div style={{ minWidth: 120 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--gray-500)", marginBottom: 4 }}>
                  <span>진행률</span><b style={{ color: "var(--primary)" }}>73%</b>
                </div>
                <div className="bar"><span style={{ width: "73%" }}/></div>
              </div>
              <button className="btn btn-sm" onClick={() => goto("monitor")}>모니터링 →</button>
            </div>
            <div className="live-exam-row">
              <div className="exam-icon axisc">AXISC</div>
              <div className="live-meta">
                <div className="live-meta-title">AXIS-C L2 Practitioner · 제3회</div>
                <div className="live-meta-sub">42명 응시 · 14:00 시작 · 잔여 56분</div>
              </div>
              <div style={{ minWidth: 120 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--gray-500)", marginBottom: 4 }}>
                  <span>진행률</span><b style={{ color: "var(--primary)" }}>51%</b>
                </div>
                <div className="bar green"><span style={{ width: "51%" }}/></div>
              </div>
              <button className="btn btn-sm" onClick={() => goto("monitor")}>모니터링 →</button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">다가오는 시험 <span style={{ fontSize: 11, color: "var(--gray-400)", fontWeight: 500 }}>(7일 이내)</span></h3>
            <span className="btn btn-sm btn-ghost" onClick={() => goto("schedule")}>전체 →</span>
          </div>
          <div className="card-body" style={{ paddingTop: 4, paddingBottom: 4 }}>
            {[
              { d: "06.21", w: "토", cert: "axis", name: "AXIS L3 제6회", n: 284, t: 300, pct: 95 },
              { d: "06.22", w: "일", cert: "axish", name: "AXIS-H L2 제2회", n: 67, t: 100, pct: 67 },
              { d: "06.28", w: "토", cert: "axisc", name: "AXIS-C L1 제1회", n: 23, t: 50, pct: 46 }
            ].map((e, i) => (
              <div key={i} className="live-exam-row">
                <div style={{ width: 44, textAlign: "center", padding: "4px 0", border: "1px solid var(--gray-border)", borderRadius: 8 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "var(--primary)", lineHeight: 1 }}>{e.d.split(".")[1]}</div>
                  <div style={{ fontSize: 10, color: "var(--gray-500)", marginTop: 2 }}>{e.d.split(".")[0]}월·{e.w}</div>
                </div>
                <div className="live-meta">
                  <div className="live-meta-title">{e.name}</div>
                  <div className="live-meta-sub">접수 {e.n}/{e.t}명</div>
                </div>
                <div style={{ minWidth: 80 }}>
                  <div className="bar"><span style={{ width: `${e.pct}%` }}/></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two-column: alerts + pass rates */}
      <div className="grid-2" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">최근 알림 피드</h3>
            <span className="btn btn-sm btn-ghost">전체 →</span>
          </div>
          <div className="alert-feed">
            {[
              { t: "14:32", tone: "red", text: "<b>부정행위 감지</b> · AXIS L3 제5회 · 홍** (3차 위반)", action: "강제종료 대기" },
              { t: "14:23", tone: "orange", text: "<b>외부 프로그램 감지</b> · AXIS L3 제5회 · 박** (1회)", action: "경고 발송됨" },
              { t: "14:05", tone: "blue", text: "<b>AI 채점 완료</b> · AXIS L2 제5회 · 24건 검수 대기" },
              { t: "13:47", tone: "orange", text: "<b>환불 요청</b> · AXIS-C L2 제3회 · 김** · 66,000원" },
              { t: "13:30", tone: "green", text: "<b>합격 발표 완료</b> · AXIS L3 제4회 (71/98명 합격)" },
              { t: "12:48", tone: "blue", text: "<b>신규 가입</b> · 12명 (오늘 누적 47명)" }
            ].map((a, i) => (
              <div key={i} className={"alert-row " + a.tone}>
                <span className="alert-pip"/>
                <div style={{ flex: 1 }}>
                  <div className="alert-time">{a.t}</div>
                  <div className="alert-text" dangerouslySetInnerHTML={{ __html: a.text }}/>
                </div>
                {a.action && <span style={{ fontSize: 11, color: "var(--gray-400)", alignSelf: "center" }}>{a.action}</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">합격률 요약</h3>
            <span className="btn btn-sm btn-ghost" onClick={() => goto("stats")}>통계 상세 →</span>
          </div>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr><th>자격·등급</th><th>회차</th><th style={{ textAlign: "right" }}>응시</th><th style={{ textAlign: "right" }}>합격</th><th style={{ textAlign: "right" }}>합격률</th><th>전회 대비</th></tr>
              </thead>
              <tbody>
                <tr><td><span className="cert-tag axis">AXIS</span> <b>L3</b></td><td>제4회</td><td style={{ textAlign: "right" }}>98</td><td style={{ textAlign: "right" }}>71</td><td style={{ textAlign: "right" }} className="cell-strong">72.4%</td><td className="delta-up">▲ +3.2%</td></tr>
                <tr><td><span className="cert-tag axis">AXIS</span> <b>L2</b></td><td>제4회</td><td style={{ textAlign: "right" }}>85</td><td style={{ textAlign: "right" }}>42</td><td style={{ textAlign: "right" }} className="cell-strong">49.4%</td><td className="delta-down">▼ -2.1%</td></tr>
                <tr><td><span className="cert-tag axis">AXIS</span> <b>L1</b></td><td>제2회</td><td style={{ textAlign: "right" }}>40</td><td style={{ textAlign: "right" }}>14</td><td style={{ textAlign: "right" }} className="cell-strong">35.0%</td><td className="muted">—</td></tr>
                <tr><td><span className="cert-tag axisc">AXIS-C</span> <b>L3</b></td><td>제2회</td><td style={{ textAlign: "right" }}>74</td><td style={{ textAlign: "right" }}>49</td><td style={{ textAlign: "right" }} className="cell-strong">66.2%</td><td className="delta-up">▲ +5.4%</td></tr>
                <tr><td><span className="cert-tag axish">AXIS-H</span> <b>L3</b></td><td>제1회</td><td style={{ textAlign: "right" }}>52</td><td style={{ textAlign: "right" }}>38</td><td style={{ textAlign: "right" }} className="cell-strong">73.1%</td><td className="muted">신규</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom chart */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">최근 30일 응시 현황</h3>
          <div style={{ display: "flex", gap: 14, fontSize: 11, color: "var(--gray-500)" }}>
            <span><i style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: "var(--blue)", marginRight: 4, verticalAlign: "middle" }}/> L3</span>
            <span><i style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: "var(--teal)", marginRight: 4, verticalAlign: "middle" }}/> L2</span>
            <span><i style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: "var(--purple)", marginRight: 4, verticalAlign: "middle" }}/> L1</span>
          </div>
        </div>
        <div style={{ padding: "20px 18px 12px" }}>
          <BarChart30/>
        </div>
      </div>
    </div>
  );
}

function BarChart30() {
  // synthetic 30-day data
  const days = Array.from({ length: 30 }, (_, i) => {
    const seed = (i * 7 + 13) % 19;
    const l3 = 20 + ((i * 3) % 25) + seed;
    const l2 = 10 + ((i * 5) % 18) + (seed % 8);
    const l1 = 3 + ((i * 2) % 8);
    return { d: i + 1, l3, l2, l1 };
  });
  const max = Math.max(...days.map(d => d.l3 + d.l2 + d.l1));
  const W = 1200, H = 200, padX = 30, padY = 24;
  const bw = (W - padX * 2) / days.length - 4;
  return (
    <svg viewBox={`0 0 ${W} ${H + 30}`} style={{ width: "100%", height: 230 }}>
      {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
        <g key={i}>
          <line x1={padX} x2={W - padX} y1={padY + (H - padY * 2) * (1 - p)} y2={padY + (H - padY * 2) * (1 - p)} stroke="#E5E7EB" strokeDasharray="3 4"/>
          <text x={padX - 8} y={padY + (H - padY * 2) * (1 - p) + 4} fontSize="10" fill="#9CA3AF" textAnchor="end">{Math.round(max * p)}</text>
        </g>
      ))}
      {days.map((d, i) => {
        const x = padX + 2 + i * (bw + 4);
        const total = d.l3 + d.l2 + d.l1;
        const totalH = (total / max) * (H - padY * 2);
        const l3H = (d.l3 / max) * (H - padY * 2);
        const l2H = (d.l2 / max) * (H - padY * 2);
        const l1H = (d.l1 / max) * (H - padY * 2);
        const baseY = padY + (H - padY * 2);
        return (
          <g key={i}>
            <rect x={x} y={baseY - l3H} width={bw} height={l3H} fill="#2563EB" rx="1"/>
            <rect x={x} y={baseY - l3H - l2H} width={bw} height={l2H} fill="#0D9488"/>
            <rect x={x} y={baseY - totalH} width={bw} height={l1H} fill="#7C3AED" rx="1"/>
            {(i % 3 === 0) && <text x={x + bw / 2} y={H + 12} fontSize="10" fill="#9CA3AF" textAnchor="middle">{d.d}일</text>}
          </g>
        );
      })}
    </svg>
  );
}

window.Dashboard = Dashboard;
