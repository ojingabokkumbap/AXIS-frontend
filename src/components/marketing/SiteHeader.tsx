import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { authNavigate } from '@/utils/authNavigate';
import { authApi, clearAuthTokens } from '@/services/api';

export type SiteNavKey =
  | 'about'
  | 'guide'
  | 'apply'
  | 'cbt'
  | 'announce'
  | 'verify'
  | 'support'
  | 'mypage'
  | 'login'
  | null;

interface Props {
  active?: SiteNavKey;
  compact?: boolean;
}

/* ─────────────────────────────────────────────────────────────
   Tokens
   ───────────────────────────────────────────────────────────── */
const INK = '#191919';
const BODY = '#525252';
const MUTED = '#8C8C8C';
const BORDER = '#E5E5E5';

export function SiteHeader({ active = null, compact = false }: Props) {
  const navigate = useNavigate();
  const { lang, setLang, t } = useI18n();
  const loggedIn = typeof window !== 'undefined' && !!localStorage.getItem('accessToken');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const guideRef = useRef<HTMLDivElement>(null);
  const supportRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    void authApi.logout().catch(() => undefined);
    clearAuthTokens();
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  /* Outside-click for language dropdown */
  useEffect(() => {
    if (!langOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [langOpen]);

  const navItemClass = (key: SiteNavKey) =>
    `inline-flex items-center h-9 px-3 text-[16px] leading-none transition-colors rounded-lg ${
      active === key ? 'font-bold' : 'font-semibold'
    } hover:bg-[#F5F5F7]`;

  const navItem = (key: SiteNavKey, label: string, to: string) => (
    <Link to={to} className={`${navItemClass(key)} no-underline`} style={{ color: INK }}>
      {label}
    </Link>
  );

  const authNavItem = (key: SiteNavKey, label: string, to: string, dataTour?: string) => (
    <button
      type="button"
      data-tour={dataTour}
      onClick={() => authNavigate(navigate, to)}
      className={`${navItemClass(key)} bg-transparent border-none cursor-pointer`}
      style={{ color: INK, fontFamily: 'inherit' }}
    >
      {label}
    </button>
  );

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-[1000]"
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <div
          className="mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-10"
          style={{ maxWidth: 1280, height: 80 }}
        >
          {/* Logo */}
          <Link to="/" className="no-underline flex items-center shrink-0" aria-label="AXIS Home">
            <span
              className="font-en"
              style={{
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: INK,
              }}
            >
              AXIS
            </span>
          </Link>

          {/* Center nav */}
          {!compact && (
            <nav data-tour="site-nav" className="hidden lg:flex items-center gap-3 absolute left-1/2 -translate-x-1/2">
              {navItem('about', t('gnb.about'), '/about')}

              {/* 자격안내 dropdown */}
              <div
                className="relative flex items-center"
                ref={guideRef}
                onMouseEnter={() => setGuideOpen(true)}
                onMouseLeave={() => setGuideOpen(false)}
              >
                <button
                  type="button"
                  className={`${navItemClass('guide')} bg-transparent border-none cursor-pointer`}
                  style={{ fontFamily: 'inherit', color: INK }}
                  onClick={() => navigate('/guide?cert=axis')}
                >
                  {t('gnb.guide')}
                  <ChevronDown open={guideOpen} />
                </button>
                <DropdownPanel open={guideOpen} align="left">
                  <DropdownItem
                    to="/guide?cert=axis"
                    icon={<IconBook />}
                    title={t('gnb.dd.axis')}
                    desc={t('gnb.dd.axisDesc')}
                    onClick={() => setGuideOpen(false)}
                  />
                  <DropdownItem
                    to="/guide?cert=axis-c"
                    icon={<IconCode />}
                    title={t('gnb.dd.axisC')}
                    desc={t('gnb.dd.axisCDesc')}
                    onClick={() => setGuideOpen(false)}
                  />
                  <DropdownItem
                    to="/guide?cert=axis-h"
                    icon={<IconMedical />}
                    title={t('gnb.dd.axisH')}
                    desc={t('gnb.dd.axisHDesc')}
                    onClick={() => setGuideOpen(false)}
                  />
                </DropdownPanel>
              </div>

              {authNavItem('apply', t('gnb.applyNav'), '/apply', 'site-nav-apply')}
              {navItem('announce', t('gnb.announce'), '/results')}
              {navItem('verify', t('gnb.verify'), '/verify-cert')}
              {authNavItem('cbt', t('gnb.cbtNav'), '/demo/AXIS/L3', 'site-nav-demo')}

              {/* 고객센터 dropdown */}
              <div
                className="relative flex items-center"
                ref={supportRef}
                onMouseEnter={() => setSupportOpen(true)}
                onMouseLeave={() => setSupportOpen(false)}
              >
                <button
                  type="button"
                  className={`${navItemClass('support')} bg-transparent border-none cursor-pointer`}
                  style={{ fontFamily: 'inherit', color: INK }}
                  onClick={() => navigate('/qna?tab=notice')}
                >
                  {t('gnb.support')}
                  <ChevronDown open={supportOpen} />
                </button>
                <DropdownPanel open={supportOpen} align="right">
                  <DropdownItem
                    to="/qna?tab=notice"
                    icon={<IconBell />}
                    title={t('gnb.dd.notice')}
                    desc={t('gnb.dd.noticeDesc')}
                    onClick={() => setSupportOpen(false)}
                  />
                  <DropdownItem
                    to="/qna?tab=faq"
                    icon={<IconQuestion />}
                    title={t('gnb.dd.faq')}
                    desc={t('gnb.dd.faqDesc')}
                    onClick={() => setSupportOpen(false)}
                  />
                  <DropdownItem
                    to="/qna?tab=ask"
                    icon={<IconChat />}
                    title={t('gnb.dd.ask')}
                    desc={t('gnb.dd.askDesc')}
                    onClick={() => setSupportOpen(false)}
                  />
                </DropdownPanel>
              </div>
            </nav>
          )}

          {/* Right: language + auth + CTA */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Globe language toggle */}
            <div className="relative hidden sm:block" ref={langRef}>
              <button
                type="button"
                onClick={() => setLangOpen(o => !o)}
                aria-expanded={langOpen}
                aria-haspopup="menu"
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-[14px] font-semibold transition-colors"
                style={{ color: INK }}
              >
                <IconGlobe />
                <ChevronDown open={langOpen} small />
              </button>
              {langOpen && (
                <div
                  className="absolute top-full right-0 mt-2 bg-white rounded-xl py-2 min-w-[140px]"
                  style={{ border: `1px solid ${BORDER}`, boxShadow: '0 12px 32px rgba(0,0,0,0.08)' }}
                  role="menu"
                >
                  <button
                    type="button"
                    onClick={() => { setLang('ko'); setLangOpen(false); }}
                    className="w-full text-left px-4 py-2 text-[14px] font-medium hover:bg-[#F5F5F7] transition-colors"
                    style={{ color: lang === 'ko' ? INK : BODY, fontWeight: lang === 'ko' ? 700 : 500 }}
                  >
                    한국어
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLang('en'); setLangOpen(false); }}
                    className="w-full text-left px-4 py-2 text-[14px] font-medium hover:bg-[#F5F5F7] transition-colors"
                    style={{ color: lang === 'en' ? INK : BODY, fontWeight: lang === 'en' ? 700 : 500 }}
                  >
                    English
                  </button>
                </div>
              )}
            </div>

            {loggedIn ? (
              <>
                <Link
                  to="/mypage"
                  className="hidden sm:inline-flex items-center h-9 px-3 rounded-lg text-[14px] font-semibold hover:bg-[#F5F5F7] transition-colors no-underline"
                  style={{ color: INK }}
                >
                  {t('gnb.mypage')}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="hidden sm:inline-flex items-center h-9 px-3 rounded-lg text-[14px] font-semibold hover:bg-[#F5F5F7] transition-colors bg-transparent border-none cursor-pointer"
                  style={{ color: BODY }}
                >
                  {t('gnb.logout')}
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center h-9 px-3 rounded-lg text-[14px] font-semibold hover:bg-[#F5F5F7] transition-colors no-underline"
                style={{ color: INK }}
              >
                {t('gnb.login')}
              </Link>
            )}

            {/* Mobile hamburger */}
            {!compact && (
              <button
                type="button"
                className="lg:hidden p-2 bg-transparent border-none"
                onClick={() => setMobileOpen(true)}
                aria-label={t('gnb.menu')}
              >
                <div className="w-[22px] h-[2px] mb-[5px] rounded-sm" style={{ background: INK }} />
                <div className="w-[22px] h-[2px] mb-[5px] rounded-sm" style={{ background: INK }} />
                <div className="w-[15px] h-[2px] rounded-sm" style={{ background: INK }} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div style={{ height: 80 }} />

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[1001] flex flex-col lg:hidden"
          style={{ background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(20px)' }}
        >
          {/* Top bar — mirrors the fixed header */}
          <div
            className="flex items-center justify-between shrink-0 px-4 sm:px-6"
            style={{ height: 80, borderBottom: `1px solid ${BORDER}` }}
          >
            <span
              className="font-en"
              style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', color: INK }}
            >
              AXIS
            </span>
            <button
              type="button"
              className="p-2 -mr-2 text-[24px] leading-none bg-transparent border-none cursor-pointer"
              onClick={() => setMobileOpen(false)}
              aria-label={t('common.close')}
              style={{ color: INK }}
            >
              ✕
            </button>
          </div>

          {/* Scrollable nav list */}
          <nav className="flex-1 overflow-y-auto px-4 sm:px-6 pt-2 pb-6">
            <Link to="/about" className="flex items-center min-h-[52px] text-[18px] font-semibold no-underline" style={{ color: INK, borderBottom: '1px solid #F2F2F2' }} onClick={() => setMobileOpen(false)}>{t('gnb.about')}</Link>
            <Link to="/guide" className="flex items-center min-h-[52px] text-[18px] font-semibold no-underline" style={{ color: INK, borderBottom: '1px solid #F2F2F2' }} onClick={() => setMobileOpen(false)}>{t('gnb.guide')}</Link>
            <button type="button" className="flex items-center w-full min-h-[52px] p-0 text-left text-[18px] font-semibold bg-transparent border-none cursor-pointer" style={{ color: INK, fontFamily: 'inherit', borderBottom: '1px solid #F2F2F2' }} onClick={() => { authNavigate(navigate, '/apply'); setMobileOpen(false); }}>{t('gnb.applyNav')}</button>
            <button type="button" className="flex items-center w-full min-h-[52px] p-0 text-left text-[18px] font-semibold bg-transparent border-none cursor-pointer" style={{ color: INK, fontFamily: 'inherit', borderBottom: '1px solid #F2F2F2' }} onClick={() => { navigate('/results'); setMobileOpen(false); }}>{t('gnb.announce')}</button>
            <button type="button" className="flex items-center w-full min-h-[52px] p-0 text-left text-[18px] font-semibold bg-transparent border-none cursor-pointer" style={{ color: INK, fontFamily: 'inherit', borderBottom: '1px solid #F2F2F2' }} onClick={() => { navigate('/verify-cert'); setMobileOpen(false); }}>{t('gnb.verify')}</button>
            <button type="button" className="flex items-center w-full min-h-[52px] p-0 text-left text-[18px] font-semibold bg-transparent border-none cursor-pointer" style={{ color: INK, fontFamily: 'inherit', borderBottom: '1px solid #F2F2F2' }} onClick={() => { authNavigate(navigate, '/demo/AXIS/L3'); setMobileOpen(false); }}>{t('gnb.cbtNav')}</button>
            <Link to="/qna" className="flex items-center min-h-[52px] text-[18px] font-semibold no-underline" style={{ color: INK }} onClick={() => setMobileOpen(false)}>{t('gnb.support')}</Link>

            {/* Auth section */}
            <div className="mt-2 pt-2" style={{ borderTop: `1px solid ${BORDER}` }}>
              {loggedIn ? (
                <>
                  <Link to="/mypage" className="flex items-center min-h-[52px] text-[16px] font-semibold no-underline" style={{ color: INK }} onClick={() => setMobileOpen(false)}>{t('gnb.mypage')}</Link>
                  <button type="button" onClick={() => { handleLogout(); setMobileOpen(false); }} className="flex items-center w-full min-h-[52px] p-0 text-left text-[16px] font-semibold bg-transparent border-none cursor-pointer" style={{ color: BODY, fontFamily: 'inherit' }}>{t('gnb.logout')}</button>
                </>
              ) : (
                <Link to="/login" className="flex items-center min-h-[52px] text-[16px] font-semibold no-underline" style={{ color: INK }} onClick={() => setMobileOpen(false)}>{t('gnb.login')}</Link>
              )}
            </div>
          </nav>

          {/* Language toggle — pinned near bottom */}
          <div
            className="shrink-0 flex items-center gap-2 px-4 sm:px-6 pt-4"
            style={{ borderTop: `1px solid ${BORDER}`, paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
          >
            <button type="button" onClick={() => setLang('ko')} className={`inline-flex items-center justify-center gap-1.5 flex-1 min-h-[44px] px-4 py-2 rounded-full text-[14px] font-semibold border ${lang === 'ko' ? 'bg-[#191919] text-white border-[#191919]' : 'bg-white border-[#E5E5E5]'}`} style={{ color: lang === 'ko' ? '#fff' : INK }}>
              <IconGlobe /> 한국어
            </button>
            <button type="button" onClick={() => setLang('en')} className={`inline-flex items-center justify-center gap-1.5 flex-1 min-h-[44px] px-4 py-2 rounded-full text-[14px] font-semibold border ${lang === 'en' ? 'bg-[#191919] text-white border-[#191919]' : 'bg-white border-[#E5E5E5]'}`} style={{ color: lang === 'en' ? '#fff' : INK }}>
              <IconGlobe /> English
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default SiteHeader;

/* ─────────────────────────────────────────────────────────────
   Dropdown panel — 호버 시 보이는 큰 흰 박스
   ───────────────────────────────────────────────────────────── */
function DropdownPanel({
  open,
  children,
}: {
  open: boolean;
  align?: 'left' | 'right';
  children: React.ReactNode;
}) {
  return (
    <div
      className={`absolute top-full left-1/2 -translate-x-1/2 pt-3 transition-all ${
        open
          ? 'opacity-100 visible translate-y-0 pointer-events-auto'
          : 'opacity-0 invisible -translate-y-2 pointer-events-none'
      }`}
    >
      <div
        className="bg-white rounded-2xl p-2 w-max max-w-90"
        style={{
          border: `1px solid ${BORDER}`,
          boxShadow: '0 24px 64px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

function DropdownItem({
  to,
  icon,
  title,
  desc,
  onClick,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick?: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-start gap-4 p-4 rounded-xl no-underline transition-colors hover:bg-[#F5F5F7]"
    >
      <span
        className="shrink-0 inline-flex items-center justify-center"
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: '#F5F5F7',
          color: INK,
        }}
      >
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[16px] font-bold leading-[1.3]" style={{ color: INK }}>{title}</div>
        <div className="text-[13px] mt-1 leading-[1.55]" style={{ color: MUTED }}>{desc}</div>
      </div>
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────────
   Icons
   ───────────────────────────────────────────────────────────── */
function ChevronDown({ open, small }: { open: boolean; small?: boolean }) {
  const size = small ? 10 : 12;
  return (
    <svg
      className={`ml-1 transition-transform ${open ? 'rotate-180' : ''}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function IconGlobe() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 4 9 14 14 0 0 1-4 9 14 14 0 0 1-4-9 14 14 0 0 1 4-9z" />
    </svg>
  );
}

function IconBook() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5z" />
      <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5A2.5 2.5 0 0 1 4 20.5z" />
      <path d="M8 8h8M8 11h6" />
    </svg>
  );
}

function IconCode() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function IconMedical() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
      <path d="M12 8v6M9 11h6" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  );
}

function IconQuestion() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 1 1 3.6 2.2c-.7.3-1.1.9-1.1 1.6V13" />
      <circle cx="12" cy="16.5" r="0.7" fill="currentColor" />
    </svg>
  );
}

function IconChat() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z" />
    </svg>
  );
}
