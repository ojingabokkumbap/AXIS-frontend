import type { I18nKey } from '@/i18n';

/**
 * 사이트 가이드 — 공개(비로그인 포함) 페이지를 스포트라이트로 안내하는 투어.
 *
 * 각 스텝은 페이지에 심어진 `data-tour="<anchor>"` 요소를 가리킨다.
 * `path` 가 현재 경로와 다르면 TourProvider 가 먼저 그 경로로 이동한 뒤
 * 앵커가 mount 되기를 기다렸다가 말풍선을 띄운다.
 */
export interface TourStep {
  /** 안정적인 식별자 (localStorage/디버깅용) */
  id: string;
  /** 이 스텝이 존재하는 라우트 경로 */
  path: string;
  /** 대상 요소의 data-tour 값 */
  anchor: string;
  titleKey: I18nKey;
  bodyKey: I18nKey;
  /** 말풍선 선호 위치 (공간이 부족하면 자동으로 반대쪽으로 뒤집힘) */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /** 스포트라이트 여백(px) */
  padding?: number;
  /**
   * 데스크톱 전용 스텝. 모바일(lg 미만)에서 헤더 nav 처럼 숨겨지는
   * 앵커는 이 플래그로 표시해 두면 모바일에서는 자동으로 건너뛴다.
   */
  desktopOnly?: boolean;
}

/**
 * 공개 페이지 기본 투어. 이미 코드에 심어진 data-tour 앵커를 그대로 사용한다.
 *   home-hero / home-quick   → HomePage
 *   site-nav / site-nav-demo → SiteHeader (헤더는 모든 페이지 공통, lg 이상에서만 노출)
 *   apply-steps              → ApplyPage (크로스 페이지 이동)
 */
export const PUBLIC_TOUR: TourStep[] = [
  {
    id: 'hero',
    path: '/',
    anchor: 'home-hero',
    titleKey: 'guide.step.hero.title',
    bodyKey: 'guide.step.hero.body',
    placement: 'bottom',
  },
  {
    id: 'quick',
    path: '/',
    anchor: 'home-quick',
    titleKey: 'guide.step.quick.title',
    bodyKey: 'guide.step.quick.body',
    placement: 'top',
  },
  {
    id: 'nav',
    path: '/',
    anchor: 'site-nav',
    titleKey: 'guide.step.nav.title',
    bodyKey: 'guide.step.nav.body',
    placement: 'bottom',
    desktopOnly: true,
  },
  {
    id: 'demo',
    path: '/',
    anchor: 'site-nav-demo',
    titleKey: 'guide.step.demo.title',
    bodyKey: 'guide.step.demo.body',
    placement: 'bottom',
    desktopOnly: true,
  },
  {
    id: 'apply',
    path: '/apply',
    anchor: 'apply-steps',
    titleKey: 'guide.step.apply.title',
    bodyKey: 'guide.step.apply.body',
    placement: 'right',
  },
];

/** 우측하단 마스코트 위젯 영상 (public/asset/guide.mp4) */
export const GUIDE_MASCOT_SRC = '/asset/guide.mp4';
export const GUIDE_MASCOT_POSTER = '/asset/guide.gif';

/** "이미 가이드를 봤음" 기록 키 */
export const GUIDE_SEEN_KEY = 'axis.guide.seen';

/**
 * 위젯을 노출할지 판단.
 * 시험·프록터·전체화면·인쇄 흐름에서는 집중을 방해하고 프록터 카메라(우측하단)와
 * 겹치므로 숨긴다.
 */
export function shouldShowGuideWidget(pathname: string): boolean {
  const HIDDEN_PREFIXES = [
    '/cbt/exam',
    '/demo/',
    '/proctor',
    '/verify', // 신원확인 (주의: /verify-cert 는 공개 조회 페이지라 노출 유지)
    '/env-check',
    '/exam-ready',
    '/mypage/certificate',
    '/mypage/confirmation',
    '/mypage/voucher',
    '/guide/pdf',
  ];
  if (pathname === '/verify-cert') return true;
  return !HIDDEN_PREFIXES.some((p) => pathname.startsWith(p));
}

/**
 * data-tour 앵커가 DOM 에 나타날 때까지 기다린다.
 * 라우트 전환 직후나 데이터 로딩으로 요소가 늦게 mount 되는 경우를 대비.
 * timeout 안에 못 찾으면 null 을 돌려준다(호출부에서 스텝 스킵 처리).
 */
export function waitForAnchor(
  anchor: string,
  { timeout = 4000, signal }: { timeout?: number; signal?: AbortSignal } = {},
): Promise<HTMLElement | null> {
  const selector = `[data-tour="${anchor}"]`;

  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLElement>(selector);
    if (existing) {
      resolve(existing);
      return;
    }

    let settled = false;
    const finish = (el: HTMLElement | null) => {
      if (settled) return;
      settled = true;
      observer.disconnect();
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
      resolve(el);
    };

    const observer = new MutationObserver(() => {
      const el = document.querySelector<HTMLElement>(selector);
      if (el) finish(el);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const timer = window.setTimeout(() => finish(null), timeout);
    const onAbort = () => finish(null);
    signal?.addEventListener('abort', onAbort);
  });
}
