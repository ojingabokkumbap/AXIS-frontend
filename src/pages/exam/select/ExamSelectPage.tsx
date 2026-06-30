import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { examApi, authApi, clearAuthTokens, type CertType, type CertLevel } from '@/services/api';
import { useI18n } from '@/i18n';
import { CertBadge } from '@/components/CertBadge';

interface CertEntry {
  type: CertType;
  nameKey: 'cbt.entry.AXIS.name' | 'cbt.entry.AXIS_C.name' | 'cbt.entry.AXIS_H.name';
  descKey: 'cbt.entry.AXIS.desc' | 'cbt.entry.AXIS_C.desc' | 'cbt.entry.AXIS_H.desc';
}

const CERTS: CertEntry[] = [
  { type: 'AXIS', nameKey: 'cbt.entry.AXIS.name', descKey: 'cbt.entry.AXIS.desc' },
  { type: 'AXIS_C', nameKey: 'cbt.entry.AXIS_C.name', descKey: 'cbt.entry.AXIS_C.desc' },
  { type: 'AXIS_H', nameKey: 'cbt.entry.AXIS_H.name', descKey: 'cbt.entry.AXIS_H.desc' },
];

interface LevelEntry {
  level: CertLevel;
  labelKey: 'cbt.entry.L3.label' | 'cbt.entry.L2.label' | 'cbt.entry.L1.label';
  subKey: 'cbt.entry.L3.sub' | 'cbt.entry.L2.sub' | 'cbt.entry.L1.sub';
}

const LEVELS: LevelEntry[] = [
  { level: 'L3', labelKey: 'cbt.entry.L3.label', subKey: 'cbt.entry.L3.sub' },
  { level: 'L2', labelKey: 'cbt.entry.L2.label', subKey: 'cbt.entry.L2.sub' },
  { level: 'L1', labelKey: 'cbt.entry.L1.label', subKey: 'cbt.entry.L1.sub' },
];

const GRADIENT: Record<CertType, string> = {
  AXIS: 'linear-gradient(180deg, #2563EB, #00B4D8)',
  AXIS_C: 'linear-gradient(180deg, #16A34A, #4ADE80)',
  AXIS_H: 'linear-gradient(180deg, #7C3AED, #A78BFA)',
};

const ACTIVE_BORDER: Record<CertType, string> = {
  AXIS: 'rgba(37,99,235,0.3)',
  AXIS_C: 'rgba(22,163,74,0.3)',
  AXIS_H: 'rgba(124,58,237,0.3)',
};

const ACTIVE_BG: Record<CertType, string> = {
  AXIS: 'rgba(37,99,235,0.06)',
  AXIS_C: 'rgba(22,163,74,0.06)',
  AXIS_H: 'rgba(124,58,237,0.06)',
};

export default function ExamSelectPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleLogout = () => {
    void authApi.logout().catch(() => undefined);
    clearAuthTokens();
    navigate('/login');
  };

  const start = async (certType: CertType, level: CertLevel) => {
    setBusy(`${certType}-${level}`);
    setError('');
    try {
      const created = await examApi.createSession(certType, level);
      navigate(`/cbt/exam/${created.data.id}`);
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        t('cbt.entry.error');
      setError(msg);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0F1724] font-sans text-[#F1F5F9]">
      {/* ── Top bar ── */}
      <header className="flex h-[56px] flex-shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#0B1220] px-8">
        <div
          className="text-[16px] font-extrabold tracking-[0.06em]"
          style={{ fontFamily: 'var(--font-en, inherit)' }}
        >
          AXIS<span className="ml-1 text-[#00B4D8]">EXAM</span>
        </div>
        <div className="flex items-center gap-3.5 text-[13px] text-white/60">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="transition-colors hover:text-white/80"
          >
            {t('common.home')}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md border border-white/15 bg-transparent px-3.5 py-1.5 text-[12px] text-[#F1F5F9] transition-colors hover:bg-white/5"
          >
            {t('gnb.logout')}
          </button>
        </div>
      </header>

      {/* ── Main content ── */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-[680px]">
          <h1 className="text-[32px] font-extrabold tracking-[-0.03em]">
            {t('cbt.entry.title')}
          </h1>
          <p className="mb-7 mt-2 text-[14px] text-white/50">
            {t('cbt.entry.sub')}
          </p>

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-[13px] text-red-300">
              {error}
            </div>
          )}

          <div data-tour="cbt-certs" className="space-y-3.5">
            {CERTS.map((c, idx) => {
              const primary = idx === 0;
              return (
                <article
                  key={c.type}
                  className="relative overflow-hidden rounded-[14px] p-7"
                  style={{
                    background: primary ? ACTIVE_BG[c.type] : 'rgba(255,255,255,0.03)',
                    border: primary
                      ? `1px solid ${ACTIVE_BORDER[c.type]}`
                      : '1px solid rgba(255,255,255,0.08)',
                    opacity: primary ? 1 : 0.7,
                  }}
                >
                  <div
                    className="absolute bottom-0 left-0 top-0 w-[3px]"
                    style={{ background: GRADIENT[c.type] }}
                    aria-hidden
                  />

                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CertBadge type={c.type} />
                      <div className="mt-3.5 text-[18px] font-bold tracking-[-0.02em]">
                        {t(c.nameKey as never)}
                      </div>
                      <div className="mt-1.5 text-[13px] text-white/55">
                        {t(c.descKey as never)}
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-2 text-[13px] text-[#4ADE80]"
                      style={{ fontFamily: 'var(--font-mono, monospace)' }}
                    >
                      <span
                        className="h-2 w-2 rounded-full bg-[#4ADE80]"
                        style={{ boxShadow: '0 0 12px #4ADE80' }}
                        aria-hidden
                      />
                      {t('cbt.entry.now')}
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                    {LEVELS.map((l) => {
                      const key = `${c.type}-${l.level}`;
                      const isBusy = busy === key;
                      return (
                        <button
                          key={l.level}
                          type="button"
                          onClick={() => start(c.type, l.level)}
                          disabled={busy !== null}
                          className={`rounded-lg border p-3.5 text-left transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                            primary
                              ? 'border-white/10 bg-white/[0.04] hover:border-[#2563EB]/60 hover:bg-white/[0.07]'
                              : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/5'
                          }`}
                        >
                          <div className="text-[14px] font-semibold text-white">
                            {t(l.labelKey as never)}
                          </div>
                          <div className="mt-1 text-[11px] text-white/50">
                            {t(l.subKey as never)}
                          </div>
                          {isBusy && (
                            <div className="mt-2 text-[11px] font-medium text-[#00B4D8]">
                              {t('cbt.entry.creating')}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </div>

          {/* ── Footer note strip ── */}
          <div data-tour="cbt-requirements" className="mt-9 flex flex-wrap gap-6 rounded-lg border border-white/[0.08] bg-white/[0.03] px-5 py-3.5 text-[12px] text-white/50">
            <span>{t('cbt.entry.req.pc')}</span>
            <span>{t('cbt.entry.req.media')}</span>
            <span>{t('cbt.entry.req.fs')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
