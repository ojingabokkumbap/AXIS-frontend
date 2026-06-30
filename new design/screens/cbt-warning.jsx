/* AXIS CBT — Live Warning Overlay */
const CbtWarningScreen = () => {
  return (
    <div style={{ width: 1440, height: 900, background: '#0F1724', fontFamily: "'Noto Sans KR', sans-serif", color: '#F1F5F9', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, filter: 'blur(8px)', opacity: 0.4 }}>
        <div style={{ height: 52, background: '#0B1220' }}></div>
        <div style={{ display: 'flex', height: 'calc(900px - 52px)' }}>
          <div style={{ width: 200, padding: 20 }}>
            {Array.from({ length: 50 }).map((_, i) => (
              <div key={i} style={{ display: 'inline-block', width: 26, height: 22, margin: 2, background: i % 3 === 0 ? '#2563EB' : 'rgba(255,255,255,0.1)', borderRadius: 4 }}></div>
            ))}
          </div>
          <div style={{ flex: 1, padding: 60 }}>
            <div style={{ height: 30, background: 'rgba(255,255,255,0.08)', borderRadius: 6, width: '60%', marginBottom: 30 }}></div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ height: 60, background: 'rgba(255,255,255,0.04)', borderRadius: 10, marginBottom: 14 }}></div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,36,0.85)' }}></div>

      <div style={{ position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)', background: 'rgba(220,38,38,0.95)', borderRadius: 12, padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.5)', maxWidth: 720 }}>
        <div style={{ width: 36, height: 36, borderRadius: 18, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚠</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>화면 밖을 응시하고 있습니다 · 시선을 화면으로 되돌려 주세요</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 3 }}>Your gaze is off-screen. Please return your eyes to the monitor.</div>
        </div>
      </div>

      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 920 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-block', padding: '6px 14px', background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.4)', borderRadius: 999, fontSize: 11, color: '#FCA5A5', letterSpacing: 1, fontWeight: 700, marginBottom: 16 }}>
            ● LIVE WARNING
          </div>
          <h2 style={{ fontSize: 30, fontWeight: 800, margin: '0 0 8px', letterSpacing: -1 }}>경고 · 시험이 일시 중지되었습니다</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', margin: 0 }}>다음 경고 누적 시 시험이 자동 종료됩니다. 한도 도달 직전 항목은 빨간색으로 표시됩니다.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { icon: '👁', label: '시선 / Gaze', sub: 'LOOK_AWAY', count: 2, limit: 3, active: true },
            { icon: '🎙', label: '음성 / Voice', sub: 'VOICE_DETECTED', count: 1, limit: 3, active: false },
            { icon: '🪟', label: '화면 이탈 / Page', sub: 'PAGE_LEAVE', count: 0, limit: 3, active: false },
          ].map((s, i) => {
            const near = s.count >= s.limit - 1;
            return (
              <div key={i} style={{
                background: s.active ? 'rgba(220,38,38,0.08)' : 'rgba(255,255,255,0.03)',
                border: s.active ? '1px solid rgba(220,38,38,0.5)' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12, padding: 22
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 24 }}>{s.icon}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>{s.sub}</div>
                </div>
                <div style={{ marginTop: 18, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{s.label}</div>
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: 36, fontWeight: 800, color: near ? '#F87171' : '#F1F5F9' }}>{s.count}</span>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>/ {s.limit}</span>
                </div>
                <div style={{ marginTop: 10, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${(s.count / s.limit) * 100}%`, height: '100%', background: near ? '#EF4444' : '#00B4D8' }}></div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 18 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, fontWeight: 600, marginBottom: 10 }}>RECENT EVENTS</div>
          {[
            { t: '14:23:15', sev: 'MED', type: 'LOOK_AWAY', msg: '시선이 5초 이상 화면 우측 밖으로 이동' },
            { t: '14:19:48', sev: 'MED', type: 'LOOK_AWAY', msg: '시선이 3초 이상 화면 하단으로 이동' },
            { t: '14:11:02', sev: 'MED', type: 'VOICE', msg: '지속적인 음성 감지 (8.2초)' },
            { t: '14:04:33', sev: 'LOW', type: 'NO_FACE', msg: '얼굴 일시 미감지 (1.2초)' },
          ].map((e, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 60px 130px 1fr', gap: 16, padding: '7px 0', fontSize: 12, alignItems: 'center', borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)' }}>{e.t}</span>
              <span style={{ fontFamily: 'monospace', fontSize: 10, color: e.sev === 'MED' ? '#FB923C' : '#94A3B8', fontWeight: 700 }}>{e.sev}</span>
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#93C5FD' }}>{e.type}</span>
              <span style={{ color: 'rgba(255,255,255,0.75)' }}>{e.msg}</span>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
          이 경고는 지속적 위반 항목이므로 임의로 닫을 수 없습니다. 화면을 정면으로 응시하면 자동 해제됩니다.
        </div>
      </div>
    </div>
  );
};

window.CbtWarningScreen = CbtWarningScreen;
