/* AXIS — Certification Guide (AXIS L3/L2/L1) */
const CertGuideScreen = () => {
  const blue = '#2563EB';
  return (
    <div style={{ width: 1440, background: '#fff', fontFamily: "'Noto Sans KR', sans-serif", color: '#0F172A' }}>
      <div style={{ height: 64, borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', padding: '0 48px', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 800, fontSize: 22, letterSpacing: -0.5 }}>AXIS<span style={{ color: '#00B4D8' }}>.</span></div>
        <div style={{ display: 'flex', gap: 28, fontSize: 14, color: '#334155', alignItems: 'center' }}>
          <span>소개</span><span style={{ color: blue, fontWeight: 700 }}>자격안내 ▾</span><span>시험접수</span>
          <span style={{ background: blue, color: '#fff', padding: '8px 18px', borderRadius: 999, fontWeight: 600 }}>시험응시</span>
          <span>합격자발표</span><span>자격검증</span><span>고객센터 ▾</span>
        </div>
        <div style={{ fontSize: 14, color: '#334155' }}>로그인 · 마이페이지</div>
      </div>

      <div style={{ background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)', color: '#fff', padding: '56px 96px', display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 32 }}>
        <div>
          <div style={{ fontSize: 12, color: '#BFDBFE', marginBottom: 10, letterSpacing: 2 }}>홈 / 자격안내 / AXIS</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ width: 64, height: 64, borderRadius: 14, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>🧠</div>
            <div>
              <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: -1, lineHeight: 1 }}>AXIS</div>
              <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 6 }}>AI 실무역량검정 (일반)</div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', maxWidth: 360, justifyContent: 'flex-end' }}>
          {['3개 등급', '온라인 CBT', '연 4회 시행', '44,000~88,000원'].map(t => (
            <span key={t} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.12)', borderRadius: 999, fontSize: 12, border: '1px solid rgba(255,255,255,0.2)' }}>{t}</span>
          ))}
        </div>
      </div>

      <div style={{ padding: '64px 96px' }}>
        <div style={{ fontSize: 12, color: '#0891B2', fontWeight: 700, letterSpacing: 1, marginBottom: 12, borderLeft: `4px solid #00B4D8`, paddingLeft: 16 }}>LEVELS</div>
        <h2 style={{ fontSize: 32, fontWeight: 800, margin: '0 0 32px', letterSpacing: -1 }}>등급별 상세</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { lv: 'L3', name: 'Starter', kor: '기초', bg: '#F1F5F9', fg: '#0F172A', fee: '44,000원', q: '객관식 50문항', t: '40분', pass: '60점 이상' },
            { lv: 'L2', name: 'Practitioner', kor: '실무', bg: blue, fg: '#fff', fee: '66,000원', q: '객관식 40문항 + 실습 2과제', t: '60–75분', pass: '60점 + 실기 50%' },
            { lv: 'L1', name: 'Expert', kor: '전문', bg: '#0F172A', fg: '#fff', fee: '88,000원', q: '산출물 + 서술형', t: '90분', pass: '70점 + 산출물 60%' },
          ].map((l) => (
            <div key={l.lv} style={{ background: l.bg, color: l.fg, padding: 28, borderRadius: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: -1, lineHeight: 1 }}>{l.lv}</div>
                <div style={{ fontSize: 11, padding: '3px 8px', border: `1px solid ${l.fg === '#fff' ? 'rgba(255,255,255,0.3)' : '#CBD5E1'}`, borderRadius: 4, opacity: 0.8 }}>{l.kor}</div>
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, marginTop: 8 }}>{l.name}</div>
              <div style={{ marginTop: 24, fontSize: 13, opacity: 0.7 }}>응시료</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>{l.fee}</div>
              <div style={{ display: 'grid', gap: 10, fontSize: 13 }}>
                {[['형식', l.q], ['시간', l.t], ['합격', l.pass]].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, paddingTop: 8, borderTop: `1px solid ${l.fg === '#fff' ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.08)'}` }}>
                    <span style={{ opacity: 0.6, fontSize: 12 }}>{k}</span>
                    <span style={{ fontWeight: 600, fontSize: 13, textAlign: 'right' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 96px 64px' }}>
        <div style={{ fontSize: 12, color: '#0891B2', fontWeight: 700, letterSpacing: 1, marginBottom: 12, borderLeft: `4px solid #00B4D8`, paddingLeft: 16 }}>SCOPE</div>
        <h2 style={{ fontSize: 32, fontWeight: 800, margin: '0 0 24px', letterSpacing: -1 }}>검정 범위</h2>
        <div style={{ background: '#F8FAFC', borderRadius: 12, border: '1px solid #E5E7EB' }}>
          {[
            { t: 'AI 기초이해 (15문항)', open: true, items: ['생성형 AI 개요와 작동 원리', '대표 모델 비교 (LLM, 멀티모달)', 'AI 활용 사례와 한계'] },
            { t: 'AI 도구활용 기초 (15문항)', open: false },
            { t: '프롬프트 기초 (10문항)', open: false },
            { t: 'AI 윤리·리터러시 (10문항)', open: false },
          ].map((s, i) => (
            <div key={i} style={{ borderBottom: i < 3 ? '1px solid #E2E8F0' : 'none', padding: '20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 6, background: '#EFF6FF', color: blue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{i + 1}</span>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{s.t}</span>
                </div>
                <span style={{ color: '#94A3B8', fontSize: 18 }}>{s.open ? '−' : '+'}</span>
              </div>
              {s.open && s.items && (
                <ul style={{ marginTop: 14, marginBottom: 0, paddingLeft: 56, color: '#475569', fontSize: 14, lineHeight: 2 }}>
                  {s.items.map((it, j) => <li key={j}>{it}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#0F172A', color: '#fff', padding: '20px 96px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>AXIS 시험에 응시할 준비가 되셨나요?</div>
        <button style={{ background: blue, color: '#fff', padding: '12px 28px', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, fontFamily: 'inherit' }}>접수 →</button>
      </div>
    </div>
  );
};

window.CertGuideScreen = CertGuideScreen;
