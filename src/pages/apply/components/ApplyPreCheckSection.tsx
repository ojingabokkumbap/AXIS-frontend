import { useI18n } from '@/i18n';

const ITEM_KEYS = [
  { num: '01', title: 'apply.precheck.item1.title', desc: 'apply.precheck.item1.desc' },
  { num: '02', title: 'apply.precheck.item2.title', desc: 'apply.precheck.item2.desc' },
  { num: '03', title: 'apply.precheck.item3.title', desc: 'apply.precheck.item3.desc' },
  { num: '04', title: 'apply.precheck.item4.title', desc: 'apply.precheck.item4.desc' },
  { num: '05', title: 'apply.precheck.item5.title', desc: 'apply.precheck.item5.desc' },
] as const;

export function ApplyPreCheckSection() {
  const { t } = useI18n();

  return (
    <section className="mt-10 bg-white rounded-2xl border border-[#EEEEEE] overflow-hidden">
      <div className="px-6 sm:px-8 pt-8 pb-6">
        <h2 className="text-[22px] sm:text-[24px] font-bold tracking-tight text-black">
          {t('apply.precheck.title')}
        </h2>
        <p className="mt-2 text-sm sm:text-[15px] text-[#666666] leading-relaxed">
          {t('apply.precheck.subtitle')}
        </p>
      </div>
      <div className="mx-6 sm:mx-8 border-t border-[#EEEEEE]" />

      <ul className="px-6 sm:px-8">
        {ITEM_KEYS.map((item) => (
          <li key={item.num} className="border-t border-[#EEEEEE] first:border-t-0">
            <div className="flex gap-5 sm:gap-6 py-8 sm:py-9">
              <span
                className="shrink-0 w-10 sm:w-12 text-[20px] sm:text-[22px] font-semibold tabular-nums leading-none pt-0.5"
                style={{ color: '#A0B0C0' }}
                aria-hidden
              >
                {item.num}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-[16px] sm:text-[17px] font-bold text-black leading-snug">
                  {t(item.title)}
                </h3>
                <p className="mt-2 text-sm sm:text-[15px] text-[#666666] leading-relaxed">
                  {t(item.desc)}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mx-6 sm:mx-8 border-t border-[#EEEEEE]" />

    </section>
  );
}
