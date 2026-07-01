/**
 * Route-aware site tour orchestrator + floating help button.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { useIsMobile } from '@/lib/useIsMobile';
import { SpotlightTour, type SpotlightTourStep } from './SpotlightTour';
import { MobileTourSheet } from './MobileTourSheet';
import { JourneyWelcomeModal } from './JourneyWelcomeModal';
import { TourHelpFab } from './TourHelpFab';
import { isTourDone, resetSiteTours, TOUR_KEYS } from './onboardingStorage';

type SiteTourId = 'home' | 'mypage' | 'apply' | 'cbt' | 'generic' | null;

interface OnboardingCtx {
  replayCurrentTour: () => void;
  replayAllTours: () => void;
  tourActive: boolean;
}

const Ctx = createContext<OnboardingCtx | null>(null);

export function useOnboarding() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}

function resolveTourId(pathname: string): SiteTourId {
  if (pathname === '/') return 'home';
  if (pathname === '/mypage') return 'mypage';
  if (pathname.startsWith('/apply')) return 'apply';
  if (pathname === '/cbt') return 'cbt';
  if (!isTourEligiblePath(pathname)) return null;
  return 'generic';
}

/**
 * Pages where overlaying a guided tour would interfere with the actual flow:
 * the live exam runner, the demo runner (has its own tour), printable pages,
 * proctoring, and the pre-exam verification sequence.
 */
function isTourEligiblePath(pathname: string): boolean {
  if (pathname.startsWith('/cbt/exam')) return false;
  if (pathname.startsWith('/cbt/sessions')) return false;
  if (pathname.startsWith('/cbt/demo')) return false;
  if (pathname.startsWith('/demo')) return false;
  if (pathname.startsWith('/proctor')) return false;
  if (pathname.startsWith('/verify') && !pathname.startsWith('/verify-cert')) return false;
  if (pathname.startsWith('/env-check')) return false;
  if (pathname.startsWith('/exam-ready')) return false;
  if (pathname.startsWith('/mypage/certificate/')) return false;
  if (pathname.startsWith('/mypage/confirmation/')) return false;
  if (pathname.startsWith('/mypage/voucher/')) return false;
  if (pathname.startsWith('/guide/pdf/')) return false;
  return true;
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { t } = useI18n();
  const isMobile = useIsMobile();
  const tourId = resolveTourId(pathname);
  const [tourOpen, setTourOpen] = useState(false);
  const [forceOpen, setForceOpen] = useState(false);
  const [journeyOpen, setJourneyOpen] = useState(false);

  const labels = useMemo(
    () => ({
      next: t('siteTour.controls.next' as never),
      prev: t('siteTour.controls.prev' as never),
      skip: t('siteTour.controls.skip' as never),
      finish: t('siteTour.controls.finish' as never),
      realExam: t('siteTour.controls.realExam' as never),
      progress: (i: number, n: number) => t('siteTour.controls.progress' as never, { i, n }),
    }),
    [t],
  );

  const journeyLabels = useMemo(
    () => ({
      title: t('siteTour.journey.title' as never),
      subtitle: t('siteTour.journey.subtitle' as never),
      step1Title: t('siteTour.journey.step1.title' as never),
      step1Body: t('siteTour.journey.step1.body' as never),
      step2Title: t('siteTour.journey.step2.title' as never),
      step2Body: t('siteTour.journey.step2.body' as never),
      step3Title: t('siteTour.journey.step3.title' as never),
      step3Body: t('siteTour.journey.step3.body' as never),
      step4Title: t('siteTour.journey.step4.title' as never),
      step4Body: t('siteTour.journey.step4.body' as never),
      demoBadge: t('siteTour.journey.badge.demo' as never),
      realBadge: t('siteTour.journey.badge.real' as never),
      startTour: t('siteTour.journey.startTour' as never),
      skip: t('siteTour.journey.skip' as never),
    }),
    [t],
  );

  const homeSteps = useMemo<SpotlightTourStep[]>(
    () => [
      {
        id: 'welcome',
        title: t('siteTour.home.welcome.title' as never),
        body: t('siteTour.home.welcome.body' as never),
      },
      {
        id: 'nav',
        target: '[data-tour="site-nav"]',
        title: t('siteTour.home.nav.title' as never),
        body: t('siteTour.home.nav.body' as never),
        placement: 'bottom',
      },
      {
        id: 'hero',
        target: '[data-tour="home-hero"]',
        title: t('siteTour.home.hero.title' as never),
        body: t('siteTour.home.hero.body' as never),
        realExam: t('siteTour.home.hero.real' as never),
        placement: 'bottom',
      },
      {
        id: 'demo-nav',
        target: '[data-tour="site-nav-demo"]',
        title: t('siteTour.home.demoNav.title' as never),
        body: t('siteTour.home.demoNav.body' as never),
        realExam: t('siteTour.home.demoNav.real' as never),
        placement: 'bottom',
      },
      {
        id: 'quick',
        target: '[data-tour="home-quick"]',
        title: t('siteTour.home.quick.title' as never),
        body: t('siteTour.home.quick.body' as never),
        placement: 'top',
      },
    ],
    [t],
  );

  const clickTab = useCallback((key: string) => {
    const btn = document.querySelector(`[data-tab="${key}"]`) as HTMLElement | null;
    btn?.click();
  }, []);

  const mypageSteps = useMemo<SpotlightTourStep[]>(
    () => [
      {
        id: 'welcome',
        title: t('siteTour.mypage.welcome.title' as never),
        body: t('siteTour.mypage.welcome.body' as never),
        onEnter: () => clickTab('registrations'),
      },
      {
        id: 'tabs',
        target: '[data-tour="mypage-tabs"]',
        title: t('siteTour.mypage.tabs.title' as never),
        body: t('siteTour.mypage.tabs.body' as never),
        placement: 'bottom',
      },
      {
        id: 'registrations',
        target: '[data-tab="registrations"]',
        title: t('siteTour.mypage.registrations.title' as never),
        body: t('siteTour.mypage.registrations.body' as never),
        realExam: t('siteTour.mypage.registrations.real' as never),
        placement: 'bottom',
        onEnter: () => clickTab('registrations'),
      },
      {
        id: 'exams',
        target: '[data-tab="myExams"]',
        title: t('siteTour.mypage.exams.title' as never),
        body: t('siteTour.mypage.exams.body' as never),
        realExam: t('siteTour.mypage.exams.real' as never),
        placement: 'bottom',
        onEnter: () => clickTab('myExams'),
      },
      {
        id: 'demo',
        target: '[data-tour="site-nav-demo"]',
        title: t('siteTour.mypage.demo.title' as never),
        body: t('siteTour.mypage.demo.body' as never),
        realExam: t('siteTour.mypage.demo.real' as never),
        placement: 'bottom',
      },
    ],
    [t, clickTab],
  );

  const applySteps = useMemo<SpotlightTourStep[]>(
    () => [
      {
        id: 'welcome',
        title: t('siteTour.apply.welcome.title' as never),
        body: t('siteTour.apply.welcome.body' as never),
        realExam: t('siteTour.apply.welcome.real' as never),
      },
      {
        id: 'steps',
        target: '[data-tour="apply-steps"]',
        title: t('siteTour.apply.steps.title' as never),
        body: t('siteTour.apply.steps.body' as never),
        placement: 'bottom',
      },
      {
        id: 'form',
        target: '[data-tour="apply-form"]',
        title: t('siteTour.apply.form.title' as never),
        body: t('siteTour.apply.form.body' as never),
        placement: 'right',
      },
      {
        id: 'sidebar',
        target: '[data-tour="apply-sidebar"]',
        title: t('siteTour.apply.sidebar.title' as never),
        body: t('siteTour.apply.sidebar.body' as never),
        realExam: t('siteTour.apply.sidebar.real' as never),
        placement: 'left',
      },
    ],
    [t],
  );

  const cbtSteps = useMemo<SpotlightTourStep[]>(
    () => [
      {
        id: 'welcome',
        title: t('siteTour.cbt.welcome.title' as never),
        body: t('siteTour.cbt.welcome.body' as never),
        realExam: t('siteTour.cbt.welcome.real' as never),
      },
      {
        id: 'certs',
        target: '[data-tour="cbt-certs"]',
        title: t('siteTour.cbt.certs.title' as never),
        body: t('siteTour.cbt.certs.body' as never),
        realExam: t('siteTour.cbt.certs.real' as never),
        placement: 'bottom',
      },
      {
        id: 'requirements',
        target: '[data-tour="cbt-requirements"]',
        title: t('siteTour.cbt.requirements.title' as never),
        body: t('siteTour.cbt.requirements.body' as never),
        placement: 'top',
      },
    ],
    [t],
  );

  // Fallback tour for pages without a curated walkthrough — gives every page
  // a short welcome + nav pointer so the FAB always has something to replay.
  const genericSteps = useMemo<SpotlightTourStep[]>(
    () => [
      {
        id: 'welcome',
        title: t('siteTour.generic.welcome.title' as never),
        body: t('siteTour.generic.welcome.body' as never),
      },
      {
        id: 'nav',
        target: '[data-tour="site-nav"]',
        title: t('siteTour.generic.nav.title' as never),
        body: t('siteTour.generic.nav.body' as never),
        placement: 'bottom',
      },
      {
        id: 'help',
        target: '[data-tour="site-guide-fab"]',
        title: t('siteTour.generic.help.title' as never),
        body: t('siteTour.generic.help.body' as never),
        placement: 'top',
      },
    ],
    [t],
  );

  const tourConfig = useMemo(() => {
    switch (tourId) {
      case 'home':
        return { key: TOUR_KEYS.home, steps: homeSteps };
      case 'mypage':
        return { key: TOUR_KEYS.mypage, steps: mypageSteps };
      case 'apply':
        return { key: TOUR_KEYS.apply, steps: applySteps };
      case 'cbt':
        return { key: TOUR_KEYS.cbt, steps: cbtSteps };
      case 'generic':
        // Per-path key so each generic page tracks its own 3-show budget.
        return { key: `${TOUR_KEYS.generic}:${pathname}`, steps: genericSteps };
      default:
        return null;
    }
  }, [tourId, pathname, homeSteps, mypageSteps, applySteps, cbtSteps, genericSteps]);

  // First visit: journey modal on home (logged-in users only).
  useEffect(() => {
    setTourOpen(false);
    setForceOpen(false);
    if (pathname !== '/') return;
    const loggedIn = !!localStorage.getItem('accessToken');
    if (!loggedIn) return;
    if (isTourDone(TOUR_KEYS.journey)) return;
    const id = window.setTimeout(() => setJourneyOpen(true), 600);
    return () => window.clearTimeout(id);
  }, [pathname]);

  // Auto-start page tour after journey dismissed or on other pages.
  // Plays up to MAX_AUTO_SHOWS (3) times per page; after that the FAB takes over.
  useEffect(() => {
    if (!tourConfig || journeyOpen) return;
    if (forceOpen) return;
    if (isTourDone(tourConfig.key)) return;
    const loggedIn = !!localStorage.getItem('accessToken');
    if ((tourId === 'mypage' || tourId === 'apply' || tourId === 'cbt') && !loggedIn) return;
    if (pathname === '/' && !isTourDone(TOUR_KEYS.journey)) return;
    const id = window.setTimeout(() => setTourOpen(true), 800);
    return () => window.clearTimeout(id);
  }, [pathname, tourConfig, journeyOpen, forceOpen, tourId]);

  const replayCurrentTour = useCallback(() => {
    if (!tourConfig) return;
    setForceOpen(true);
    setTourOpen(true);
  }, [tourConfig]);

  const replayAllTours = useCallback(() => {
    resetSiteTours();
    setForceOpen(true);
    if (pathname === '/') {
      setJourneyOpen(true);
    } else {
      setTourOpen(true);
    }
  }, [pathname]);

  // FAB lives on every tour-eligible page (including those using the generic
  // tour) so the user can replay/start the guide at any time from the right edge.
  const showFab = isTourEligiblePath(pathname) && !!tourConfig && !journeyOpen;
  const tourActive = tourOpen || journeyOpen;

  return (
    <Ctx.Provider value={{ replayCurrentTour, replayAllTours, tourActive }}>
      {children}

      <JourneyWelcomeModal
        open={journeyOpen}
        labels={journeyLabels}
        onStartTour={() => {
          setJourneyOpen(false);
          setForceOpen(true);
          setTourOpen(true);
        }}
        onClose={() => setJourneyOpen(false)}
      />

      {tourConfig &&
        (isMobile ? (
          // Phones can't use the spotlight — most targets live in the desktop
          // nav (behind the hamburger) or assume a wide layout. Swap in a
          // bottom-sheet card deck that teaches the same steps sequentially.
          <MobileTourSheet
            open={tourOpen}
            steps={tourConfig.steps}
            storageKey={tourConfig.key}
            labels={labels}
            forceOpen={forceOpen}
            onClose={() => {
              setTourOpen(false);
              setForceOpen(false);
            }}
          />
        ) : (
          <SpotlightTour
            open={tourOpen}
            steps={tourConfig.steps}
            storageKey={tourConfig.key}
            labels={labels}
            forceOpen={forceOpen}
            onClose={() => {
              setTourOpen(false);
              setForceOpen(false);
            }}
          />
        ))}

      {showFab && (
        <TourHelpFab
          onReplay={replayCurrentTour}
          label={t('siteTour.controls.help' as never)}
        />
      )}
    </Ctx.Provider>
  );
}
