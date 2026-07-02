import { useI18n } from '@/i18n';
import { useWizard } from '@/pages/apply/lib/WizardContext';
import { H_CARD, T_BODY, INK_900, GRAY_500, ACCENT } from '@/pages/apply/lib/applyTokens';
import { ApplySectionHeader } from '@/pages/apply/components/ApplySectionHeader';

const ITEM_KEYS = [
  { num: '01', title: 'apply.precheck.item1.title', desc: 'apply.precheck.item1.desc' },
  { num: '02', title: 'apply.precheck.item2.title', desc: 'apply.precheck.item2.desc' },
  { num: '03', title: 'apply.precheck.item3.title', desc: 'apply.precheck.item3.desc' },
  { num: '04', title: 'apply.precheck.item4.title', desc: 'apply.precheck.item4.desc' },
  { num: '05', title: 'apply.precheck.item5.title', desc: 'apply.precheck.item5.desc' },
] as const;

export default function Step0PreCheck() {
  const { t } = useI18n();
  const { agreedToPrecheck, setAgreedToPrecheck, nextStep } = useWizard();

  return (
    <div>
      <ApplySectionHeader
        title={t('apply.sPre.title')}
        sub={t('apply.sPre.sub')}
      />

      <ul className="mb-8 sm:mb-10 space-y-4 sm:space-y-6">
        {ITEM_KEYS.map((item) => (
          <li key={item.num}>
            <div className="flex gap-3 sm:gap-4 py-4 px-4 sm:py-5 sm:px-6 rounded-lg border border-[#E5E7EB]">
              <span
                className="shrink-0 w-9 sm:w-10 text-[18px] sm:text-[20px] font-semibold tabular-nums leading-none pt-0.5"
                style={{ color: '#A0B0C0' }}
                aria-hidden
              >
                {item.num}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className={`${H_CARD} break-keep`} style={{ color: INK_900 }}>
                  {t(item.title)}
                </h3>
                <p className={`mt-1.5 ${T_BODY} break-keep`} style={{ color: GRAY_500 }}>
                  {t(item.desc)}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <label
        className={`flex items-start gap-3 p-1 cursor-pointer transition-all mb-6 ${
          agreedToPrecheck
            ? 'text-[#2563EB]'
            : 'text-[#191919]'
        }`}
      >
        <input
          type="checkbox"
          checked={agreedToPrecheck}
          onChange={(e) => setAgreedToPrecheck(e.target.checked)}
          className="mt-0.5 w-5 h-5 accent-[#2563EB] cursor-pointer"
        />
        <span className={`${T_BODY} font-medium break-keep`} style={{ color: INK_900 }}>
          {t('apply.sPre.consentLabel')}
        </span>
      </label>

      <div className="sticky bottom-0 sm:static bg-white py-4 sm:py-0">
        <div className="flex gap-2">
          <button
            type="button"
            disabled
            aria-hidden="true"
            tabIndex={-1}
            className="hidden sm:block flex-1 h-12 rounded-xl invisible pointer-events-none"
          >
            {t('apply.nav.prev')}
          </button>
          <button
            type="button"
            onClick={nextStep}
            disabled={!agreedToPrecheck}
            className="flex-1 h-12 rounded-xl text-[14px] lg:text-[15px] font-semibold text-white hover:bg-[#1D4ED8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-sm"
            style={{ background: ACCENT }}
          >
            {t('apply.nav.next')}
          </button>
        </div>
      </div>
    </div>
  );
}
