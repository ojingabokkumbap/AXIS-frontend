/* AXIS CBT — L3 Exam Screen */
const CbtExamScreen = () => {
  const cyan = '#00B4D8';
  const blue = '#2563EB';
  return (
    <div style={{ width: 1440, height: 900, background: '#0F1724', fontFamily: "'Noto Sans KR', sans-serif", color: '#F1F5F9', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 52, background: '#0B1220', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 14, letterSpacing: 1 }}>AXIS<span style={{ color: cyan, marginLeft: 4 }}>EXAM</span></div>
          <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }}></div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>AXIS L3 Starter · 제5회 · 2026.06.14</div>
        </div>
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 700, color: cyan, letterSpacing: 2 }}>⏱ 38:24</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>홍길동</div>
          <div style={{ width: 56, height: 42, background: '#1E293B', borderRadius: 6, border: '1px solid rgba(0,180,216,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div style={{ width: 24, height: 24, borderRadius: 12, background: 'rgba(0,180,216,0.15)' }}></div>
            <span style={{ position: 'absolute', top: 3, right: 3, width: 6, height: 6, borderRadius: 3, background: '#EF4444' }}></span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex' }}>
        <div style={{ width: 200, borderRight: '1px solid rgba(255,255,255,0.06)', padding: 18, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, marginBottom: 12, fontWeight: 600 }}>문제 목록</div>

          {[
            { label: '과목 1 · AI 기초이해', from: 1, to: 15 },
            { label: '과목 2 · AI 도구활용', from: 16, to: 30 },
            { label: '과목 3 · 프롬프트 기초', from: 31, to: 40 },
            { label: '과목 4 · AI 윤리·리터러시', from: 41, to: 50 },
          ].map((g) => (
            <div key={g.from} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginBottom: 6, letterSpacing: 0.5 }}>{g.label}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}>
                {Array.from({ length: g.to - g.from + 1 }).map((_, i) => {
                  const n = g.from + i;
                  const answered = [1,2,3,4,5,6,7,8,9,10,12,13,14,15,16,17,18,19,20,21,22,24,25,26,27,29,30,31,32,34,35,36,37,38,40,41,42,43,44,45,46,48,49];
                  const current = n === 23;
                  const flagged = n === 5 || n === 28;
                  const isAnswered = answered.includes(n);
                  return (
                    <div key={n} style={{
                      height: 24, fontSize: 10, fontWeight: 600,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4,
                      background: current ? 'rgba(0,180,216,0.18)' : flagged ? 'rgba(249,115,22,0.2)' : isAnswered ? blue : 'rgba(255,255,255,0.06)',
                      color: current ? cyan : flagged ? '#FB923C' : isAnswered ? '#fff' : 'rgba(255,255,255,0.5)',
                      border: current ? `1px solid ${cyan}` : '1px solid transparent',
                      boxShadow: current ? `0 0 12px rgba(0,180,216,0.5)` : 'none'
                    }}>{n}</div>
                  );
                })}
              </div>
            </div>
          ))}

          <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>범례</div>
            <div style={{ display: 'grid', gap: 5, fontSize: 10, color: 'rgba(255,255,255,0.55)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, background: blue, borderRadius: 2 }}></span> 답변완료</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, background: 'rgba(0,180,216,0.18)', border: `1px solid ${cyan}`, borderRadius: 2 }}></span> 현재 문제</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, background: 'rgba(249,115,22,0.2)', borderRadius: 2 }}></span> 깃발 표시</div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, padding: '48px 80px', overflow: 'auto' }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, letterSpacing: 1 }}>Q.23 / 50</div>
          <div style={{ display: 'inline-block', padding: '4px 12px', background: 'rgba(37,99,235,0.18)', color: '#93C5FD', borderRadius: 4, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, marginBottom: 24 }}>과목 2 · AI 도구활용 기초</div>
          <div style={{ fontSize: 21, fontWeight: 500, lineHeight: 1.6, marginBottom: 40, maxWidth: 880, color: '#F8FAFC' }}>
            다음 중 생성형 AI 도구를 활용하여 업무 효율을 높이는 방법으로 <span style={{ color: cyan, fontWeight: 700 }}>가장 적절하지 않은 것은</span>?
          </div>

          {[
            { n: '①', t: '반복적인 문서 초안 작성에 AI를 활용하고, 사람이 최종 검토·수정한다.', selected: false },
            { n: '②', t: '회사 내부 기밀자료를 그대로 공개 AI 도구에 입력해 분석을 요청한다.', selected: true },
            { n: '③', t: '이메일 톤·스타일을 다듬을 때 AI에게 여러 버전을 요청해 비교한다.', selected: false },
            { n: '④', t: '회의록의 핵심 액션 아이템을 추출하는 데 AI 요약 기능을 활용한다.', selected: false },
          ].map((c, i) => (
            <div key={i} style={{
              padding: '18px 22px', marginBottom: 12, borderRadius: 10,
              background: c.selected ? 'rgba(37,99,235,0.12)' : 'rgba(255,255,255,0.03)',
              border: c.selected ? `1px solid ${blue}` : '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'flex-start', gap: 16, maxWidth: 880
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: 15, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: c.selected ? blue : 'rgba(255,255,255,0.06)',
                color: c.selected ? '#fff' : 'rgba(255,255,255,0.6)',
                fontWeight: 700, fontSize: 14
              }}>{c.n}</div>
              <div style={{ fontSize: 15, lineHeight: 1.6, paddingTop: 4, color: c.selected ? '#F1F5F9' : 'rgba(255,255,255,0.75)' }}>{c.t}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: 56, borderTop: '1px solid rgba(255,255,255,0.06)', background: '#0B1220', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
        <button style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#F1F5F9', padding: '9px 18px', borderRadius: 6, fontSize: 13, fontFamily: 'inherit' }}>← 이전 문제</button>
        <button style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.4)', color: '#FB923C', padding: '9px 18px', borderRadius: 6, fontSize: 13, fontFamily: 'inherit' }}>🚩 깃발 표시</button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ background: blue, border: 'none', color: '#fff', padding: '9px 20px', borderRadius: 6, fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>다음 문제 →</button>
          <button style={{ background: '#DC2626', border: 'none', color: '#fff', padding: '9px 20px', borderRadius: 6, fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>제출하기</button>
        </div>
      </div>
    </div>
  );
};

window.CbtExamScreen = CbtExamScreen;
