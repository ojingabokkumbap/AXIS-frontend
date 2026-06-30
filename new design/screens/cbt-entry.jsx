/* AXIS CBT Entry */
const CbtEntryScreen = () => (
  <div style={{ width: 1440, height: 900, background: '#0F1724', fontFamily: "'Noto Sans KR', sans-serif", color: '#F1F5F9', display: 'flex', flexDirection: 'column' }}>
    <div style={{ height: 56, borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', padding: '0 32px', justifyContent: 'space-between' }}>
      <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: 1 }}>AXIS<span style={{ color: '#00B4D8', marginLeft: 4 }}>EXAM</span></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
        <span>홍길동님</span>
        <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#F1F5F9', padding: '6px 14px', borderRadius: 6, fontSize: 12, fontFamily: 'inherit' }}>로그아웃</button>
      </div>
    </div>
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 64px' }}>
      <div style={{ width: 680 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, margin: '0 0 8px', letterSpacing: -1 }}>응시 가능한 시험</h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: '0 0 28px' }}>응시할 시험을 선택해 입장하세요</p>
        <div style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 14, padding: 28, marginBottom: 14, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: 'linear-gradient(180deg, #2563EB, #00B4D8)' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ background: '#2563EB', color: '#fff', padding: '3px 10px', borderRadius: 4, fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>AXIS · L3 STARTER</span>
              <div style={{ fontSize: 22, fontWeight: 700, marginTop: 14, letterSpacing: -0.5 }}>제5회 정기 검정</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 6 }}>2026.06.14 (토) 14:00 – 14:40 · 객관식 50문항 · 40분</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 14, fontSize: 13, color: '#4ADE80' }}>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: '#4ADE80', boxShadow: '0 0 12px #4ADE80' }}></span>
                지금 응시 가능
              </div>
            </div>
            <button style={{ background: '#2563EB', color: '#fff', border: 'none', padding: '14px 24px', borderRadius: 8, fontWeight: 700, fontSize: 14, fontFamily: 'inherit', boxShadow: '0 8px 24px rgba(37,99,235,0.4)' }}>입장하기 →</button>
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 24, opacity: 0.7 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ background: 'rgba(22,163,74,0.2)', color: '#86EFAC', padding: '3px 10px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>AXIS-C · L2</span>
              <div style={{ fontSize: 19, fontWeight: 700, marginTop: 12 }}>제3회 Practitioner</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>2026.07.12 (토) 14:00</div>
              <div style={{ marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>D-28 · 시험일이 아닙니다</div>
            </div>
            <button disabled style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 22px', borderRadius: 8, fontWeight: 600, fontSize: 13, fontFamily: 'inherit' }}>입장하기</button>
          </div>
        </div>
        <div style={{ marginTop: 36, padding: '14px 20px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'flex', gap: 24 }}>
          <span>💻 PC + Chrome 필수</span>
          <span>📷 웹캠·마이크·화면공유 허용 필요</span>
          <span>🔒 풀스크린 자동 진입</span>
        </div>
      </div>
    </div>
  </div>
);
window.CbtEntryScreen = CbtEntryScreen;
