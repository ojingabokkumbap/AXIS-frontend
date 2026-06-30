import { useI18n } from '@/i18n';
import type { LiveVerdict } from '@/proctor/useProctorMonitorLive';
import type { MicStatus } from '../hooks/useMicMonitor';

export type WarningKind =
  | 'LOOK_AWAY'
  | 'NO_FACE'
  | 'EYES_CLOSED'
  | 'VOICE'
  | 'PAGE_LEAVE';

export interface WarningEntry {
  id: string;
  kind: WarningKind;
  ts: number;
}

/**
 * Active warning is now expressed as a stable kind + the strike numbers
 * needed to render the localized title/subtitle. The actual KO/EN strings
 * are picked at render time from the i18n dictionary so toggling KO ↔ EN
 * via the language switch updates the overlay live.
 */
export interface ActiveWarning {
  kind: WarningKind;
  strikes: { gaze: number; voice: number; pageLeave: number };
  limits: { gaze: number; voice: number; pageLeave: number };
}

export interface LiveWarningOverlayProps {
  active: ActiveWarning | null;
  log: WarningEntry[];
  strikes: { gaze: number; voice: number; pageLeave: number };
  limits: { gaze: number; voice: number; pageLeave: number };
  /**
   * Called when the user clicks "Continue". Caller should clear the sticky
   * holds (voice / page-leave) so a one-shot warning dismisses immediately.
   * Sustained warnings (LOOK_AWAY / NO_FACE / EYES_CLOSED) re-fire on the next
   * detector tick if the condition is still bad — the button can't bypass them.
   */
  onContinue: () => void;
  /**
   * Demo mode: show Continue even for sustained gaze warnings so candidates
   * can keep practicing when the detector is still flagging them.
   */
  allowSustainedDismiss?: boolean;
}

const SUSTAINED_KINDS: ReadonlySet<WarningKind> = new Set(['LOOK_AWAY', 'NO_FACE', 'EYES_CLOSED']);

/**
 * Compute the active warning from the current proctor / mic state plus the
 * "sticky hold" timestamp that one-shot events (page-leave, voice strike)
 * set so a momentary trigger still blurs the screen for ~3 s.
 *
 * Priority order (most disruptive first): LOOK_AWAY → NO_FACE → EYES_CLOSED →
 * VOICE → PAGE_LEAVE.
 *
 * Returns a stable ActiveWarning shape (kind + strike counts); the localized
 * title/subtitle are rendered downstream from the i18n dictionary.
 */
export function computeActiveWarning(input: {
  proctorVerdict: LiveVerdict;
  micStatus: MicStatus;
  pageLeaveHoldUntil: number;
  voiceHoldUntil: number;
  now: number;
  strikes: { gaze: number; voice: number; pageLeave: number };
  limits: { gaze: number; voice: number; pageLeave: number };
}): ActiveWarning | null {
  const { proctorVerdict, micStatus, pageLeaveHoldUntil, voiceHoldUntil, now, strikes, limits } =
    input;

  if (proctorVerdict === 'LOOK_AWAY') {
    return { kind: 'LOOK_AWAY', strikes, limits };
  }
  if (proctorVerdict === 'NO_FACE') {
    return { kind: 'NO_FACE', strikes, limits };
  }
  if (proctorVerdict === 'EYES_CLOSED') {
    return { kind: 'EYES_CLOSED', strikes, limits };
  }
  if (micStatus === 'VOICE_DETECTED' || voiceHoldUntil > now) {
    return { kind: 'VOICE', strikes, limits };
  }
  if (pageLeaveHoldUntil > now) {
    return { kind: 'PAGE_LEAVE', strikes, limits };
  }
  return null;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}

/** Map a warning kind to its localized title + subtitle. */
function activeCopy(active: ActiveWarning, t: ReturnType<typeof useI18n>['t']) {
  switch (active.kind) {
    case 'LOOK_AWAY':
      return {
        title: t('warn.lookAway.title'),
        subtitle: t('warn.lookAway.sub', {
          n: active.strikes.gaze,
          limit: active.limits.gaze,
        }),
      };
    case 'NO_FACE':
      return { title: t('warn.noFace.title'), subtitle: t('warn.noFace.sub') };
    case 'EYES_CLOSED':
      return { title: t('warn.eyesClosed.title'), subtitle: t('warn.eyesClosed.sub') };
    case 'VOICE':
      return {
        title: t('warn.voice.title'),
        subtitle: t('warn.voice.sub', {
          n: active.strikes.voice,
          limit: active.limits.voice,
        }),
      };
    case 'PAGE_LEAVE':
      return {
        title: t('warn.pageLeave.title'),
        subtitle: t('warn.pageLeave.sub', {
          n: active.strikes.pageLeave,
          limit: active.limits.pageLeave,
        }),
      };
  }
}

export function LiveWarningOverlay({
  active,
  log,
  strikes,
  limits,
  onContinue,
  allowSustainedDismiss = false,
}: LiveWarningOverlayProps) {
  if (!active) return null;
  return <LiveWarningOverlayInner
    active={active}
    log={log}
    strikes={strikes}
    limits={limits}
    onContinue={onContinue}
    allowSustainedDismiss={allowSustainedDismiss}
  />;
}

const KIND_META: Record<WarningKind, { icon: string; code: string }> = {
  LOOK_AWAY: { icon: '👁', code: 'LOOK_AWAY' },
  NO_FACE: { icon: '👤', code: 'NO_FACE' },
  EYES_CLOSED: { icon: '😴', code: 'EYES_CLOSED' },
  VOICE: { icon: '🎙', code: 'VOICE_DETECTED' },
  PAGE_LEAVE: { icon: '🪟', code: 'PAGE_LEAVE' },
};

function severityFor(kind: WarningKind): 'LOW' | 'MED' | 'HIGH' {
  if (kind === 'NO_FACE' || kind === 'EYES_CLOSED') return 'LOW';
  if (kind === 'PAGE_LEAVE') return 'HIGH';
  return 'MED';
}

const SEVERITY_COLOR: Record<string, string> = {
  HIGH: '#F87171',
  MED: '#FB923C',
  LOW: '#94A3B8',
};

/* ─── Strike Card Labels ─────────────────────────────────────── */
const CARD_KO: Record<string, string> = {
  GAZE: '시선 이탈',
  VOICE: '음성 감지',
  PAGE: '페이지 이탈',
};
const CARD_EN: Record<string, string> = {
  GAZE: 'Gaze',
  VOICE: 'Voice',
  PAGE: 'Page Leave',
};

function LiveWarningOverlayInner({
  active,
  log,
  strikes,
  limits,
  onContinue,
  allowSustainedDismiss = false,
}: LiveWarningOverlayProps & {
  active: ActiveWarning;
}) {
  const { t } = useI18n();
  const sustained = SUSTAINED_KINDS.has(active.kind);
  const showContinue = !sustained || allowSustainedDismiss;
  const copy = activeCopy(active, t);

  const cards: { kind: 'GAZE' | 'VOICE' | 'PAGE'; icon: string; count: number; limit: number; active: boolean }[] = [
    {
      kind: 'GAZE',
      icon: '👁',
      count: strikes.gaze,
      limit: limits.gaze,
      active: active.kind === 'LOOK_AWAY' || active.kind === 'NO_FACE' || active.kind === 'EYES_CLOSED',
    },
    {
      kind: 'VOICE',
      icon: '🎙',
      count: strikes.voice,
      limit: limits.voice,
      active: active.kind === 'VOICE',
    },
    {
      kind: 'PAGE',
      icon: '🪟',
      count: strikes.pageLeave,
      limit: limits.pageLeave,
      active: active.kind === 'PAGE_LEAVE',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[150] flex flex-col items-center pointer-events-none"
      role="alertdialog"
      aria-live="assertive"
      style={{
        background: 'rgba(15,23,36,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {/* ── Top red toast bar ─────────────────────────────────── */}
      <div
        className="pointer-events-auto w-full flex-shrink-0"
        style={{
          background: 'linear-gradient(90deg, #DC2626 0%, #B91C1C 100%)',
          boxShadow: '0 4px 24px rgba(220,38,38,0.5)',
        }}
      >
        <div className="max-w-[920px] mx-auto flex items-center gap-4 px-6 py-3.5">
          <div
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg flex-shrink-0"
            aria-hidden
          >
            ⚠
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-bold text-white leading-tight">{copy.title}</div>
            <div className="text-[12px] text-white/85 mt-0.5">{copy.subtitle}</div>
          </div>
        </div>
      </div>

      {/* ── Center content ────────────────────────────────────── */}
      <div className="pointer-events-auto flex-1 overflow-y-auto w-full">
        <div className="max-w-[920px] mx-auto px-6 pt-10 pb-8">

          {/* LIVE WARNING pill + title + subtitle */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-red-400/40 bg-red-500/12">
              <span
                className="w-2 h-2 rounded-full bg-red-400 animate-pulse"
                aria-hidden
              />
              <span className="text-[11px] font-bold tracking-[0.08em] text-red-300">
                LIVE WARNING
              </span>
            </div>
            <h2 className="text-[28px] sm:text-[32px] font-extrabold tracking-[-0.02em] text-[#F1F5F9] mb-2">
              {t('warn.badge')} · {t('warn.bannerSub')}
            </h2>
            <p className="text-[13px] text-white/50">
              {t('warn.terminalNote')}
            </p>
          </div>

          {/* ── 3 Strike cards ────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6">
            {cards.map((c) => {
              const near = c.count >= c.limit - 1;
              const ratio = c.limit > 0 ? Math.min(1, c.count / c.limit) : 0;

              return (
                <div
                  key={c.kind}
                  className="rounded-xl p-5 transition-colors"
                  style={{
                    background: c.active
                      ? 'rgba(220,38,38,0.08)'
                      : 'rgba(255,255,255,0.025)',
                    border: c.active
                      ? '1px solid rgba(220,38,38,0.45)'
                      : '1px solid rgba(255,255,255,0.07)',
                    boxShadow: c.active
                      ? '0 0 30px rgba(220,38,38,0.1)'
                      : 'none',
                  }}
                >
                  {/* Card header: icon + type label */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-2xl" aria-hidden>{c.icon}</div>
                    <div className="text-[10px] text-white/35 font-mono tracking-wider">
                      {CARD_EN[c.kind]}
                    </div>
                  </div>

                  {/* KO label */}
                  <div className="text-[13px] text-white/65 mb-1">
                    {CARD_KO[c.kind]}
                  </div>

                  {/* Count / Limit */}
                  <div className="flex items-baseline gap-1.5 mb-3">
                    <span
                      className="text-[38px] font-extrabold leading-none tabular-nums"
                      style={{ color: near ? '#F87171' : '#F1F5F9' }}
                    >
                      {c.count}
                    </span>
                    <span className="text-[14px] text-white/35 font-medium">/ {c.limit}</span>
                  </div>

                  {/* Progress bar: teal when OK, red near limit */}
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${ratio * 100}%`,
                        background: near
                          ? 'linear-gradient(90deg, #EF4444, #F87171)'
                          : 'linear-gradient(90deg, #00B4D8, #22D3EE)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── RECENT EVENTS table ───────────────────────────── */}
          {log.length > 0 && (
            <div
              className="rounded-xl p-5 mb-6"
              style={{
                background: 'rgba(0,0,0,0.35)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div className="text-[11px] tracking-[0.1em] font-semibold text-white/35 mb-3 font-mono">
                RECENT EVENTS
              </div>

              {/* Table header */}
              <div
                className="grid items-center text-[10px] text-white/30 uppercase tracking-wider font-mono pb-2 mb-1"
                style={{
                  gridTemplateColumns: '72px 56px 130px 1fr',
                  gap: '12px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <span>Time</span>
                <span>Sev</span>
                <span>Type</span>
                <span>Message</span>
              </div>

              {/* Event rows */}
              <div className="space-y-0">
                {log.slice(0, 5).map((e, i) => {
                  const sev = severityFor(e.kind);
                  const meta = KIND_META[e.kind];
                  return (
                    <div
                      key={e.id}
                      className="grid items-center text-[12px] py-2"
                      style={{
                        gridTemplateColumns: '72px 56px 130px 1fr',
                        gap: '12px',
                        borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.03)',
                      }}
                    >
                      <span className="font-mono text-white/50">{formatTime(e.ts)}</span>
                      <span
                        className="font-mono text-[10px] font-bold"
                        style={{ color: SEVERITY_COLOR[sev] }}
                      >
                        {t(`severity.${sev}` as never)}
                      </span>
                      <span className="text-[11px] text-[#00B4D8]">{t(`evidence.type.${meta.code}` as never)}</span>
                      <span className="text-white/70">{t(`warn.kind.${e.kind}` as const)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Footer ────────────────────────────────────────── */}
          <div className="text-center">
            {showContinue ? (
              <div className="space-y-4">
                {sustained && allowSustainedDismiss && (
                  <div className="text-[12px] text-emerald-300/90 font-medium">
                    {t('warn.demoSustainedHint' as never)}
                  </div>
                )}
                <button
                  onClick={onContinue}
                  autoFocus
                  className="px-8 py-3 rounded-xl bg-status-danger hover:bg-[#B91C1C] text-white font-bold text-[14px] shadow-lg transition-colors"
                  style={{ boxShadow: '0 4px 24px rgba(220,38,38,0.4)' }}
                >
                  {t('warn.continue')}
                </button>
                {!allowSustainedDismiss && (
                  <div className="text-[11px] text-white/25">
                    {t('warn.noManualDismiss' as never)}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-[12px] text-white/35 italic">
                  {t('warn.sustained')}
                </div>
                <div className="text-[11px] text-white/25">
                  {t('warn.noManualDismiss' as never)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
