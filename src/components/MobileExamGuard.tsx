import { useEffect, useState, type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor, Smartphone } from 'lucide-react';
import { useI18n } from '@/i18n';
import { isExamBlockedDevice } from '@/lib/useIsMobile';

/**
 * Gate around exam / demo / proctoring flows.
 *
 * These experiences rely on live camera + screen proctoring and a split-screen
 * layout that simply cannot run on a phone or tablet, so we hard-block mobile
 * devices and show a bilingual (KO + EN) notice instead of letting the user
 * start — and pop a native alert on entry as an immediate signal.
 */
export function MobileExamGuard({ children }: { children: ReactElement }) {
  const { t } = useI18n();
  const [blocked] = useState<boolean>(() => isExamBlockedDevice());

  useEffect(() => {
    if (blocked) {
      // Immediate, unmissable heads-up in addition to the full-screen notice.
      window.alert(t('mobileBlock.alert'));
    }
  }, [blocked, t]);

  if (blocked) return <MobileBlockScreen />;
  return children;
}

export function MobileBlockScreen() {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0B1120] px-6 py-12 text-white">
      <div className="w-full max-w-[420px] text-center">
        <div className="relative mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10">
          <Monitor className="h-9 w-9 text-white" strokeWidth={1.6} />
          <span className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 ring-4 ring-[#0B1120]">
            <Smartphone className="h-4 w-4 text-white" strokeWidth={2} />
          </span>
        </div>

        <span className="inline-flex items-center rounded-full bg-blue-500/15 px-3 py-1 text-[12px] font-semibold tracking-wide text-blue-300">
          {t('mobileBlock.badge')}
        </span>

        <h1 className="mt-5 text-[22px] font-semibold leading-[1.35]">
          {t('mobileBlock.title')}
        </h1>

        <p className="mt-4 text-[15px] leading-[1.65] text-white/70">
          {t('mobileBlock.desc')}
        </p>

        <p className="mt-3 text-[13px] leading-[1.6] text-white/45">
          {t('mobileBlock.descEn')}
        </p>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-xl bg-white text-[15px] font-semibold text-[#0B1120] transition-opacity hover:opacity-90"
        >
          {t('mobileBlock.home')}
        </button>
      </div>
    </div>
  );
}
