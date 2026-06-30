/* AXIS CBT — Result (pass) */
const ResultScreen = () => {
  const blue = '#2563EB';
  const green = '#16A34A';
  return (
    <div style={{ width: 1440, height: 900, background: '#0F1724', fontFamily: "'Noto Sans KR', sans-serif", color: '#F1F5F9', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ height: 56, borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', padding: '0 32px', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 800, fontSize: 14, letterSpacing: 1 }}>AXIS<span style={{ color: '#00B4D8', marginLeft: 4 }}>EXAM</span></div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>시험이 종료되었습니다</div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
        <div style={{ width: 760, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 48 }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, marginBottom: 12 }}>AXIS L3 STARTER · 제5회</div>
            <h1 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 28px', letterSpacing: -0.5 }}>시험 결과</h1>
            <div style={{ width: 140, height: 140, borderRadius: 70, margin: '0 auto', background: 'radial-gradient(circle at 30% 30%, #22C55E, #15803D)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 60px rgba(34,197,94,0.3)' }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#fff', lineHeight: 1 }}>합격</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)', letterSpacing: 2, marginTop: 6 }}>PASS</div>
            </div>
            <div style={{ marginTop: 28 }}>
              <span style={{ fontSize: 64, fontWeight: 800, color: '#fff', letterSpacing: -2 }}>82</span>
              <span style={{ fontSize: 22, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}> / 100</span>
            </div>
          </div>

          {/* Score bar */}
          <div style={{ position: 'relative', height: 56, marginBottom: 36 }}>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 26, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}></div>
            <div style={{ position: 'absolute', left: 0, top: 26, height: 4, width: '82%', background: 'linear-gradient(90deg, #22C55E, #4ADE80)', borderRadius: 2 }}></div>
            {/* threshold marker */}
            <div style={{ position: 'absolute', left: '60%', top: 16, width: 2, height: 24, background: 'rgba(255,255,255,0.3)' }}></div>
            <div style={{ position: 'absolute', left: '60%', top: 0, transform: 'translateX(-50%)', fontSize: 10, color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>합격선 60</div>
            {/* my score */}
            <div style={{ position: 'absolute', left: '82%', top: 36, transform: 'translateX(-50%)', fontSize: 11, color: '#4ADE80', fontWeight: 700, whiteSpace: 'nowrap' }}>내 점수 82</div>
          </div>

          {/* Subject breakdown */}
          <div style={{ display: 'grid', gap: 14 }}>
            {[
              { name: 'AI 기초이해', score: 13, max: 15, pct: 87 },
              { name: 'AI 도구활용 기초', score: 11, max: 15, pct: 73 },
              { name: '프롬프트 기초', score: 8, max: 10, pct: 80 },
              { name: 'AI 윤리·리터러시', score: 9, max: 10, pct: 90 },
            ].map(s => (
              <div key={s.name} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 60px 24px', gap: 14, alignItems: 'center' }}>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)' }}>{s.name}</span>
                <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${s.pct}%`, height: '100%', background: s.pct >= 70 ? '#4ADE80' : '#60A5FA', borderRadius: 4 }}></div>
                </div>
                <span style={{ fontSize: 13, color: '#fff', fontFamily: 'monospace', textAlign: 'right' }}>{s.score}/{s.max}</span>
                <span style={{ fontSize: 13, color: '#4ADE80' }}>✓</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 40, justifyContent: 'center' }}>
            <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#F1F5F9', padding: '13px 24px', borderRadius: 8, fontSize: 14, fontFamily: 'inherit' }}>응시 확인서 출력</button>
            <button style={{ background: blue, border: 'none', color: '#fff', padding: '13px 28px', borderRadius: 8, fontSize: 14, fontWeight: 700, fontFamily: 'inherit' }}>axisexam.com 으로 이동 →</button>
          </div>
        </div>
      </div>
    </div>
  );
};

window.ResultScreen = ResultScreen;
