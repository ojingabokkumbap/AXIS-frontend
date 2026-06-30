/* AXIS — Home Page (axisexam.com) */
const HomeScreen = () => {
  return (
    <div style={{ width: 1440, background: '#ffffff', fontFamily: "'Noto Sans KR', sans-serif", color: '#0F172A' }}>
      {/* GNB */}
      <div style={{ height: 64, borderBottom: '1px solid #E5E7EB', background: '#fff', display: 'flex', alignItems: 'center', padding: '0 48px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: 22, letterSpacing: -0.5 }}>
          AXIS<span style={{ width: 6, height: 6, borderRadius: 3, background: '#00B4D8', display: 'inline-block', marginLeft: 2 }}></span>
        </div>
        <div style={{ display: 'flex', gap: 28, fontSize: 14, color: '#334155', alignItems: 'center' }}>
          <span>소개</span>
          <span>자격안내 ▾</span>
          <span>시험접수</span>
          <span style={{ background: '#2563EB', color: '#fff', padding: '8px 18px', borderRadius: 999, fontWeight: 600 }}>시험응시</span>
          <span>합격자발표</span>
          <span>자격검증</span>
          <span>고객센터 ▾</span>
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 14, color: '#334155' }}>
          <span>로그인</span>
          <span style={{ color: '#0F172A', fontWeight: 600 }}>마이페이지</span>
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)', color: '#fff', padding: '88px 96px', display: 'grid', gridTemplateColumns: '1fr 460px', gap: 64, alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -120, top: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,180,216,0.15), transparent 70%)' }}></div>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999, background: 'rgba(0,180,216,0.12)', border: '1px solid rgba(0,180,216,0.3)', color: '#67E8F9', fontSize: 13, marginBottom: 28 }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: '#00B4D8' }}></span>
            AI 실무역량 민간자격 · AiNex Inc.
          </div>
          <h1 style={{ fontSize: 56, lineHeight: 1.2, fontWeight: 800, letterSpacing: -1.5, margin: '0 0 24px' }}>
            AI를 쓰는 사람이 아니라<br/>
            <span style={{ color: '#67E8F9' }}>AI로 결과를 만드는 사람</span>
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', margin: '0 0 36px', lineHeight: 1.6 }}>
            AXIS는 실무에서 AI를 활용해 성과를 낼 수 있는지 검증합니다
          </p>
          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            <button style={{ padding: '16px 32px', background: '#2563EB', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, fontSize: 16, fontFamily: 'inherit' }}>시험 접수하기</button>
            <button style={{ padding: '16px 32px', background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, color: '#fff', fontWeight: 500, fontSize: 16, fontFamily: 'inherit' }}>자격 안내 보기</button>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.06)', fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
            🗓 다음 시험: 2026년 6월 14일 · <span style={{ color: '#67E8F9' }}>접수중</span>
          </div>
        </div>

        {/* Cert card mockup */}
        <div style={{ transform: 'rotate(-4deg)', background: 'linear-gradient(160deg, #1E3A5F 0%, #0F172A 100%)', borderRadius: 20, padding: 36, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 40px 80px rgba(0,0,0,0.4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 56 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 2, color: '#67E8F9', marginBottom: 6 }}>CERTIFICATE</div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>AXIS EXAM</div>
            </div>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, #67E8F9, #2563EB 80%)', opacity: 0.85 }}></div>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Level</div>
          <div style={{ fontSize: 44, fontWeight: 800, marginBottom: 4, letterSpacing: -1 }}>L2</div>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', marginBottom: 36 }}>Practitioner</div>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', marginBottom: 16 }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.45)', letterSpacing: 1 }}>
            <span>AXIS-2026-L2-0142</span>
            <span>VALID THRU 2029</span>
          </div>
        </div>
      </div>

      {/* Section 2 — 3 cert cards */}
      <div style={{ padding: '96px 96px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 13, color: '#2563EB', fontWeight: 600, marginBottom: 8, letterSpacing: 1 }}>CERTIFICATIONS</div>
          <h2 style={{ fontSize: 40, fontWeight: 800, margin: 0, letterSpacing: -1 }}>3가지 전문 자격</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {[
            { key: 'AXIS', sub: 'AI 실무역량검정 (일반)', color: '#2563EB', emoji: '🧠', desc: '직장인·취준생·대학생 전 국민 대상' },
            { key: 'AXIS-C', sub: 'AI 코딩·자동화 실무역량검정', color: '#16A34A', emoji: '💻', desc: '비개발 직군, 코딩 입문자 대상' },
            { key: 'AXIS-H', sub: '의료기관 AI 실무역량검정', color: '#7C3AED', emoji: '🏥', desc: '의료기관 전 직종 종사자 대상' },
          ].map((c) => (
            <div key={c.key} style={{ background: '#fff', border: '1px solid #E5E7EB', borderLeft: `4px solid ${c.color}`, borderRadius: 12, padding: 32, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>{c.emoji}</div>
              <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5 }}>{c.key}</div>
              <div style={{ fontSize: 14, color: '#64748B', marginTop: 6, marginBottom: 20 }}>{c.sub}</div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
                {['L3', 'L2', 'L1'].map(l => (
                  <span key={l} style={{ padding: '4px 10px', borderRadius: 6, background: '#F1F5F9', fontSize: 12, fontWeight: 600, color: '#475569' }}>{l}</span>
                ))}
              </div>
              <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 20 }}>{c.desc}</div>
              <div style={{ fontSize: 14, color: c.color, fontWeight: 600 }}>자세히 보기 →</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3 — CTA band */}
      <div style={{ background: 'linear-gradient(90deg, #2563EB 0%, #00B4D8 100%)', padding: '64px 96px', textAlign: 'center', color: '#fff' }}>
        <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 8, letterSpacing: -1 }}>지금 바로 응시하세요</div>
        <div style={{ fontSize: 15, opacity: 0.9, marginBottom: 28 }}>PC 환경에서 온라인으로 응시 · AI 감독 시스템 운영</div>
        <button style={{ padding: '18px 44px', background: '#fff', border: 'none', borderRadius: 8, color: '#2563EB', fontWeight: 700, fontSize: 16, fontFamily: 'inherit' }}>시험 응시하기 →</button>
      </div>

      {/* Section 4 — Schedule */}
      <div style={{ padding: '96px 96px', background: '#F8FAFC' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 13, color: '#2563EB', fontWeight: 600, marginBottom: 8, letterSpacing: 1 }}>SCHEDULE</div>
            <h2 style={{ fontSize: 32, fontWeight: 800, margin: 0, letterSpacing: -1 }}>시험 일정</h2>
          </div>
          <span style={{ fontSize: 14, color: '#2563EB', fontWeight: 600 }}>전체 일정 보기 →</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { d: '14', m: 'JUN', cert: 'AXIS', color: '#2563EB', name: '제5회 L3 Starter', period: '접수 ~ 06.07', date: '2026.06.14 (토) 14:00', seats: 284, total: 300, status: '접수중', stColor: '#2563EB' },
            { d: '12', m: 'JUL', cert: 'AXIS-C', color: '#16A34A', name: '제3회 L2 Practitioner', period: '접수 06.20 ~ 07.05', date: '2026.07.12 (토) 14:00', seats: 0, total: 200, status: '접수예정', stColor: '#F97316' },
            { d: '06', m: 'SEP', cert: 'AXIS-H', color: '#7C3AED', name: '제2회 L2 실무활용', period: '접수 08.10 ~ 08.30', date: '2026.09.06 (일) 10:00', seats: 0, total: 150, status: '접수예정', stColor: '#F97316' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', gap: 18, border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ width: 64, height: 64, borderRadius: 10, background: '#0F172A', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{s.d}</div>
                  <div style={{ fontSize: 10, color: '#67E8F9', marginTop: 2, letterSpacing: 1 }}>{s.m}</div>
                </div>
                <span style={{ padding: '4px 10px', borderRadius: 6, background: s.stColor, color: '#fff', fontSize: 12, fontWeight: 600, height: 22 }}>{s.status}</span>
              </div>
              <div>
                <span style={{ padding: '2px 8px', borderRadius: 4, background: s.color, color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>{s.cert}</span>
                <div style={{ fontSize: 17, fontWeight: 700, marginTop: 10 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 6 }}>{s.period}</div>
                <div style={{ fontSize: 13, color: '#334155', marginTop: 4, fontWeight: 500 }}>{s.date}</div>
              </div>
              {s.seats > 0 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748B', marginBottom: 6 }}>
                    <span>좌석</span><span style={{ color: '#0F172A', fontWeight: 600 }}>{s.seats} / {s.total}</span>
                  </div>
                  <div style={{ height: 6, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${(s.seats / s.total) * 100}%`, height: '100%', background: s.color }}></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Section 5 — Pass */}
      <div style={{ padding: '96px 96px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
        <div>
          <div style={{ fontSize: 13, color: '#2563EB', fontWeight: 600, marginBottom: 8, letterSpacing: 1 }}>RESULTS</div>
          <h2 style={{ fontSize: 32, fontWeight: 800, margin: '0 0 24px', letterSpacing: -1 }}>합격자 발표</h2>
          {[
            { title: 'AXIS L3 Starter 제4회', date: '2026.03.20', pass: 187, total: 245 },
            { title: 'AXIS-C L2 Practitioner 제2회', date: '2026.02.15', pass: 84, total: 142 },
          ].map((r, i) => (
            <div key={i} style={{ padding: 20, border: '1px solid #E5E7EB', borderRadius: 10, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{r.title}</div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>발표일 {r.date}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#16A34A' }}>{r.pass}<span style={{ fontSize: 13, color: '#94A3B8', fontWeight: 500 }}> / {r.total}명</span></div>
                <div style={{ fontSize: 11, color: '#94A3B8' }}>합격률 {Math.round(r.pass / r.total * 100)}%</div>
              </div>
            </div>
          ))}
          <button style={{ marginTop: 12, padding: '10px 18px', border: '1px solid #2563EB', background: '#fff', color: '#2563EB', borderRadius: 8, fontWeight: 600, fontSize: 14, fontFamily: 'inherit' }}>전체 합격자 조회</button>
        </div>

        {/* Section 6 — Notices */}
        <div>
          <div style={{ fontSize: 13, color: '#2563EB', fontWeight: 600, marginBottom: 8, letterSpacing: 1 }}>NOTICES</div>
          <h2 style={{ fontSize: 32, fontWeight: 800, margin: '0 0 24px', letterSpacing: -1 }}>공지사항</h2>
          {[
            ['제5회 AXIS L3 접수 안내', '2026.05.20', true],
            ['AXIS-H 신규 자격 출범 안내', '2026.05.12', true],
            ['시스템 점검 안내 (5/18 02:00~04:00)', '2026.05.08', false],
            ['응시 환경 권장 사양 업데이트', '2026.04.30', false],
            ['부분합격 제도 운영 안내', '2026.04.18', false],
          ].map(([title, date, isNew], i) => (
            <div key={i} style={{ padding: '14px 0', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {isNew && <span style={{ padding: '2px 6px', borderRadius: 4, background: '#FEF3C7', color: '#D97706', fontSize: 10, fontWeight: 700 }}>NEW</span>}
                <span style={{ fontSize: 14, color: '#0F172A' }}>{title}</span>
              </div>
              <span style={{ fontSize: 12, color: '#94A3B8' }}>{date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 7 — Bottom CTA */}
      <div style={{ background: '#F1F5F9', padding: '64px 96px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>자격증이 필요하신가요?</div>
            <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>온라인 CBT로 간편하게 응시</div>
          </div>
          <button style={{ padding: '12px 24px', background: '#2563EB', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, fontSize: 14, fontFamily: 'inherit' }}>시험 접수</button>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>기업 인증 조회</div>
            <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>채용·인사 담당자용 검증 서비스</div>
          </div>
          <button style={{ padding: '12px 24px', background: '#fff', border: '1px solid #0F172A', color: '#0F172A', borderRadius: 8, fontWeight: 600, fontSize: 14, fontFamily: 'inherit' }}>자격 검증</button>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#0F172A', color: 'rgba(255,255,255,0.6)', padding: '64px 96px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 48, marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 16 }}>AXIS<span style={{ color: '#00B4D8' }}>.</span></div>
            <div style={{ fontSize: 13, lineHeight: 1.7 }}>
              AiNex Inc.<br/>
              사업자등록 123-45-67890 · 대표 김미래<br/>
              서울특별시 강남구 테헤란로 152, 16층
            </div>
          </div>
          <div>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Quick Links</div>
            <div style={{ display: 'grid', gap: 8, fontSize: 13 }}>
              <span>자격 소개</span><span>시험 접수</span><span>합격자 발표</span><span>자격 검증</span>
            </div>
          </div>
          <div>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Contact</div>
            <div style={{ fontSize: 13, lineHeight: 1.7 }}>
              📞 1811-9530<br/>
              ✉ support@axisexam.com<br/>
              평일 09:00–18:00
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20, fontSize: 12 }}>
          © 2026 AiNex Inc. All rights reserved.
        </div>
      </div>
    </div>
  );
};

window.HomeScreen = HomeScreen;
