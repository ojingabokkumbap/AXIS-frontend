import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

export type Lang = 'ko' | 'en';

const STORAGE_KEY = 'axis.lang';

const dict = {
  ko: {
    'gnb.mypage': '마이페이지',
    'gnb.logout': '로그아웃',

    'home.success': '로그인 성공',
    'home.loading': '불러오는 중...',
    'home.profileError': '프로필을 불러오지 못했습니다.',
    'home.userId': '아이디',
    'home.name': '이름',
    'home.phone': '휴대폰',
    'home.email': '이메일',
    'home.roles': '역할',

    // Sidebar groups
    'sb.group.exam': '시험',
    'sb.group.results': '결과',
    'sb.group.support': '고객지원',
    'sb.group.account': '계정',

    // Menu items
    'sb.registrations': '접수내역',
    'sb.schedule': '내 일정',
    'sb.taken': '응시 이력',
    'sb.demo': '데모 / 체험',
    'sb.scores': '성적조회',
    'sb.partial': '부분합격 현황',
    'sb.certs': '자격증',
    'sb.inquiry': '1:1 문의',
    'sb.alerts': '알림 / 공지',
    'sb.profile': '회원정보 수정',

    // Section titles
    'sec.registrations.title': '접수내역 / 수험표',
    'sec.registrations.sub': '접수한 시험, 결제, 수험표를 관리하세요',
    'sec.schedule.title': '내 시험 일정',
    'sec.schedule.sub': '접수한 시험과 설정한 회차 알림을 확인하세요',
    'sec.taken.title': '응시 이력',
    'sec.taken.sub': '응시한 모든 시험 결과와 상세 점수',
    'sec.demo.title': '데모 시험 / 무료 체험',
    'sec.demo.sub': '실제 응시 전 샘플 시험을 체험해보세요',
    'sec.scores.title': '성적조회',
    'sec.scores.sub': '모든 자격증·등급별 회차 결과',
    'sec.partial.title': '부분합격 현황',
    'sec.partial.sub': '활성 부분합격 면제 (12개월 유효, 1회 재응시)',
    'sec.certs.title': '내 자격증',
    'sec.certs.sub': 'PDF 다운로드, 디지털 배지, 실물 사본 신청',
    'sec.inquiry.title': '1:1 문의 내역',
    'sec.inquiry.sub': '제출하신 문의와 답변을 확인하세요',
    'sec.alerts.title': '알림 / 공지',
    'sec.alerts.sub': '회차 오픈 알림, 결과 발표, 시스템 공지',
    'sec.profile.title': '회원정보 수정',
    'sec.profile.sub': '연락처, 비밀번호, 계정 설정 변경',
  },
  en: {
    'gnb.mypage': 'My Page',
    'gnb.logout': 'Log out',

    'home.success': 'Login successful',
    'home.loading': 'Loading...',
    'home.profileError': 'Failed to load profile.',
    'home.userId': 'User ID',
    'home.name': 'Name',
    'home.phone': 'Phone',
    'home.email': 'Email',
    'home.roles': 'Roles',

    'sb.group.exam': 'EXAM',
    'sb.group.results': 'RESULTS',
    'sb.group.support': 'SUPPORT',
    'sb.group.account': 'ACCOUNT',

    'sb.registrations': 'Registrations',
    'sb.schedule': 'My Schedule',
    'sb.taken': 'Exam History',
    'sb.demo': 'Demo / Free Trial',
    'sb.scores': 'Score Lookup',
    'sb.partial': 'Partial Pass Status',
    'sb.certs': 'Certificates',
    'sb.inquiry': '1:1 Inquiry',
    'sb.alerts': 'Alerts & Notices',
    'sb.profile': 'Edit Profile',

    'sec.registrations.title': 'Registrations & Exam Voucher',
    'sec.registrations.sub': 'Manage your registered exams, payments, and admission tickets',
    'sec.schedule.title': 'My Upcoming Exam Schedule',
    'sec.schedule.sub': 'Registered exams and open session alerts you have set',
    'sec.taken.title': 'Exam History',
    'sec.taken.sub': 'All exams you have taken, with results and detailed scores',
    'sec.demo.title': 'Demo Exam / Free Trial',
    'sec.demo.sub': 'Try a sample exam before registering — no login or payment required for L3 demo',
    'sec.scores.title': 'Score Lookup',
    'sec.scores.sub': 'All session results across every certification and level',
    'sec.partial.title': 'Partial Pass Status',
    'sec.partial.sub': 'Track your active partial pass exemptions (valid 12 months, 1 re-attempt)',
    'sec.certs.title': 'My Certificates',
    'sec.certs.sub': 'Download PDF, issue digital badge, or request physical copy',
    'sec.inquiry.title': '1:1 Inquiry History',
    'sec.inquiry.sub': 'Track all support tickets and admin replies',
    'sec.alerts.title': 'Alerts & Notices',
    'sec.alerts.sub': 'Session open alerts, result announcements, and system notices',
    'sec.profile.title': 'Edit Profile',
    'sec.profile.sub': 'Update your contact info, password, and account settings',
  },
} as const;

type Key = keyof typeof dict.ko;

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: Key, vars?: Record<string, string | number>) => string;
}

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'en' || saved === 'ko' ? saved : 'ko';
  });

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    localStorage.setItem(STORAGE_KEY, l);
    setLangState(l);
  };

  const t = (key: Key, vars?: Record<string, string | number>) => {
    let s: string = dict[lang][key] ?? dict.ko[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        s = s.replace(`{${k}}`, String(v));
      }
    }
    return s;
  };

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

export function LangToggle({ className = '' }: { className?: string }) {
  const { lang, setLang } = useI18n();
  const base = 'px-2 py-1 text-xs font-semibold rounded transition-colors';
  const active = 'bg-white text-primary';
  const inactive = 'text-white/70 hover:text-white';
  return (
    <div className={`inline-flex items-center gap-1 rounded-md bg-white/10 p-0.5 ${className}`}>
      <button
        type="button"
        onClick={() => setLang('ko')}
        aria-pressed={lang === 'ko'}
        className={`${base} ${lang === 'ko' ? active : inactive}`}
      >
        KO
      </button>
      <button
        type="button"
        onClick={() => setLang('en')}
        aria-pressed={lang === 'en'}
        className={`${base} ${lang === 'en' ? active : inactive}`}
      >
        EN
      </button>
    </div>
  );
}
