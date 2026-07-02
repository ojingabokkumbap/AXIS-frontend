import { Check } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useI18n } from '@/i18n';
import { useWizard } from '@/pages/apply/lib/WizardContext';
import type { CertType, CertLevel } from '@/pages/apply/lib/WizardContext';
import { T_BODY, T_META, INK_900, GRAY_500, BORDER, ACCENT } from '@/pages/apply/lib/applyTokens';
import { ApplySectionHeader } from '@/pages/apply/components/ApplySectionHeader';

type CertId = CertType;
type LevelId = CertLevel;

export default function Step1CertLevel() {
  const { t } = useI18n();
  const { selectedCert, selectedLevel, setCert, setLevel, nextStep, prevStep } = useWizard();
  const levelSectionRef = useRef<HTMLDivElement>(null);
  const previousCertRef = useRef<CertType | null>(selectedCert);

  const CERT_CARDS: {
    id: CertId;
    color: string;
    accent: string;
    letter: string;
  }[] = [
    { id: 'AXIS',   color: 'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]', accent: '#2563EB', letter: 'A' },
    { id: 'AXIS_C', color: 'border-[#16A34A] bg-[#ECFDF5] text-[#16A34A]', accent: '#16A34A', letter: 'C' },
    { id: 'AXIS_H', color: 'border-[#7C3AED] bg-[#F3E8FF] text-[#7C3AED]', accent: '#7C3AED', letter: 'H' },
  ];

  const LEVEL_CARDS: { id: LevelId; highlight?: boolean }[] = [
    { id: 'L3', highlight: true },
    { id: 'L2' },
    { id: 'L1' },
  ];

  const canProceed = selectedCert !== null && selectedLevel !== null;

  useEffect(() => {
    const prev = previousCertRef.current;
    const openedNow = !prev && !!selectedCert;

    if (openedNow) {
      window.setTimeout(() => {
        const target = levelSectionRef.current;
        if (!target) return;
        const stickyOffset = 180;
        const top = target.getBoundingClientRect().top + window.scrollY - stickyOffset;
        window.scrollTo({ top, behavior: 'smooth' });
      }, 120);
    }

    previousCertRef.current = selectedCert;
  }, [selectedCert]);

  return (
    <div>
      {/* Cert selection */}
      <div className="mb-8">
        <ApplySectionHeader
          title={t('apply.s1.title')}
          sub={t('apply.s1.certSub')}
        />
        <div className="space-y-3 my-8">
          {CERT_CARDS.map((c) => {
            const selected = selectedCert === c.id;
            const tags = [
              t(`apply.cert.${c.id}.tag1` as never),
              t(`apply.cert.${c.id}.tag2` as never),
              t(`apply.cert.${c.id}.tag3` as never),
              t(`apply.cert.${c.id}.tag4` as never),
            ];
            return (
              <button
                key={c.id}
                onClick={() => setCert(selected ? null : c.id)}
                className={`w-full text-left px-4 py-5 sm:px-8 sm:py-8 mb-4 rounded-xl border transition-all cursor-pointer flex items-center gap-3 sm:gap-4 ${
                  selected
                    ? `${c.color} shadow-sm`
                    : 'border-[#E5E5E5] bg-white hover:border-[#93C5FD] hover:bg-[#F8FAFC]'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-[16px] font-bold shrink-0 ${
                    selected ? c.color : 'bg-[#F1F5F9] text-[#475569]'
                  }`}
                >
                  {c.letter}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[15px] lg:text-[16px] font-bold" style={{ color: INK_900 }}>
                      {t(`apply.cert.${c.id}.name` as never)}
                    </span>
                    <span
                      className="text-[11px] px-2 py-0.5 rounded font-medium"
                      style={{ background: '#F1F5F9', color: '#475569' }}
                    >
                      {t(`apply.cert.${c.id}.sub` as never)}
                    </span>
                  </div>
                  <p className={`${T_BODY} mb-2 line-clamp-2 sm:line-clamp-1 break-keep`} style={{ color: GRAY_500 }}>
                    {t(`apply.cert.${c.id}.desc` as never)}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className={`${T_META} px-1.5 py-0.5 bg-black/5 rounded`}
                        style={{ color: GRAY_500 }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                {selected && (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: c.accent }}
                  >
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Level selection — cert가 선택돼야 펼쳐짐 */}
      <div
        ref={levelSectionRef}
        className="overflow-hidden transition-all duration-500 ease-out scroll-mt-0"
        style={{
          maxHeight: selectedCert ? 1400 : 0,
          opacity: selectedCert ? 1 : 0,
          transform: selectedCert ? 'translateY(0)' : 'translateY(-8px)',
        }}
        aria-hidden={!selectedCert}
      >
      <div className="mb-8">
        <ApplySectionHeader
          title={t('apply.s1.levelTitle')}
          sub={t('apply.s1.levelSub')}
        />
        <div className="space-y-3 my-8">
          {LEVEL_CARDS.map((lv) => {
            const selected = selectedLevel === lv.id;
            return (
              <button
                key={lv.id}
                onClick={() => setLevel(selected ? null : lv.id)}
                className={`w-full text-left px-4 py-5 sm:px-8 sm:py-8 mb-4 rounded-xl border transition-all cursor-pointer flex items-center gap-3 sm:gap-4 ${
                  selected
                    ? 'border-[#2563EB] bg-[#EFF6FF] shadow-sm'
                    : 'border-[#E5E5E5] bg-white hover:border-[#93C5FD]'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="text-[15px] lg:text-[16px] font-bold leading-tight" style={{ color: INK_900 }}>
                      {t(`apply.level.${lv.id}.name` as never)}
                    </span>
                    <span
                      className="text-[11px] px-2 py-0.5 rounded font-medium"
                      style={{ background: '#F1F5F9', color: '#475569' }}
                    >
                      {t(`apply.level.${lv.id}.tier` as never)}
                    </span>
                    {lv.highlight && (
                      <span className="text-[11px] bg-[#2563EB] text-white px-2 py-0.5 rounded font-medium">
                        {t(`apply.level.${lv.id}.badge` as never)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-[14px] lg:text-[15px] font-bold" style={{ color: ACCENT }}>
                      {t(`apply.level.${lv.id}.fee` as never)}
                    </span>
                  </div>
                  <p className={`${T_BODY} line-clamp-2 sm:line-clamp-1 break-keep`} style={{ color: GRAY_500 }}>
                    {t(`apply.level.${lv.id}.desc` as never)}
                  </p>
                </div>
                {selected && (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: ACCENT }}
                  >
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
      </div>

      {/* L1 응시 자격 notice — only AXIS-C L1 requires proof of experience */}
      {selectedLevel === 'L1' && selectedCert === 'AXIS_C' && (
        <div className={`mb-6 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl ${T_BODY} text-amber-700 break-keep`}>
          {t('apply.s1.l1Notice')}
        </div>
      )}

      <div className="sticky bottom-0 sm:static bg-white py-4 sm:py-0">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={prevStep}
            className="flex-1 h-12 rounded-xl text-[13px] lg:text-[14px] font-medium border bg-white hover:bg-[#F8FAFC] transition-colors cursor-pointer"
            style={{ borderColor: BORDER, color: GRAY_500 }}
          >
            {t('apply.nav.prev')}
          </button>
          <button
            type="button"
            onClick={nextStep}
            disabled={!canProceed}
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
