import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/lib/useIsMobile';
import { GUIDE_SEEN_KEY, PUBLIC_TOUR, type TourStep } from './guideTour';

type TourStatus = 'idle' | 'running';

interface TourCtx {
  status: TourStatus;
  /** 현재 디바이스에서 실제로 보여줄 스텝 목록 (desktopOnly 필터 반영) */
  steps: TourStep[];
  stepIndex: number;
  step: TourStep | null;
  seen: boolean;
  start: () => void;
  stop: (opts?: { completed?: boolean }) => void;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
}

const Ctx = createContext<TourCtx | null>(null);

export function TourProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  // 헤더 nav 는 lg(1024px) 이상에서만 노출되므로 그 미만에선 desktopOnly 스텝을 건너뛴다.
  const belowLg = useIsMobile(1024);

  const [status, setStatus] = useState<TourStatus>('idle');
  const [stepIndex, setStepIndex] = useState(0);
  const [seen, setSeen] = useState<boolean>(() => {
    try {
      return localStorage.getItem(GUIDE_SEEN_KEY) === '1';
    } catch {
      return false;
    }
  });

  const steps = useMemo(
    () => PUBLIC_TOUR.filter((s) => !(s.desktopOnly && belowLg)),
    [belowLg],
  );

  const markSeen = useCallback(() => {
    try {
      localStorage.setItem(GUIDE_SEEN_KEY, '1');
    } catch {
      /* private mode 등 — 무시 */
    }
    setSeen(true);
  },  []);

  const start = useCallback(() => {
    setStepIndex(0);
    setStatus('running');
  }, []);

  const stop = useCallback(
    (opts?: { completed?: boolean }) => {
      setStatus('idle');
      if (opts?.completed) markSeen();
    },
    [markSeen],
  );

  const clampAndSet = useCallback(
    (index: number) => {
      if (index < 0) return;
      if (index >= steps.length) {
        // 마지막 다음 → 완료
        setStatus('idle');
        markSeen();
        return;
      }
      setStepIndex(index);
    },
    [steps.length, markSeen],
  );

  const next = useCallback(() => clampAndSet(stepIndex + 1), [clampAndSet, stepIndex]);
  const prev = useCallback(() => clampAndSet(stepIndex - 1), [clampAndSet, stepIndex]);
  const goTo = useCallback((index: number) => clampAndSet(index), [clampAndSet]);

  // 스텝이 다른 경로에 있으면 먼저 해당 경로로 이동한다.
  // (오버레이는 이동 후 앵커가 mount 될 때까지 기다렸다가 스포트라이트를 띄운다)
  const step = status === 'running' ? steps[stepIndex] ?? null : null;
  const targetPath = step?.path;
  const navigatedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!targetPath) {
      navigatedRef.current = null;
      return;
    }
    if (location.pathname !== targetPath && navigatedRef.current !== targetPath) {
      navigatedRef.current = targetPath;
      navigate(targetPath);
    } else if (location.pathname === targetPath) {
      navigatedRef.current = null;
    }
  }, [targetPath, location.pathname, navigate]);

  // ESC 로 종료
  useEffect(() => {
    if (status !== 'running') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') stop();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [status, stop]);

  const value = useMemo<TourCtx>(
    () => ({ status, steps, stepIndex, step, seen, start, stop, next, prev, goTo }),
    [status, steps, stepIndex, step, seen, start, stop, next, prev, goTo],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTour(): TourCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTour must be used within TourProvider');
  return ctx;
}
