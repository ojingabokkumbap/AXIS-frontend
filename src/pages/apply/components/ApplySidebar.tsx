import { useI18n } from '@/i18n';
import { useWizard } from '@/pages/apply/lib/WizardContext';
import type { CertLevel, CertType } from '@/pages/apply/lib/WizardContext';

const INK_900 = '#191919';
const GRAY_500 = '#525252';
const BORDER = '#a8a8a8';
const CERT_BORDER: Record<CertType, string> = {
  AXIS: '#2563EB',
  AXIS_C: '#16A34A',
  AXIS_H: '#7C3AED',
};
const CERT_BG: Record<CertType, string> = {
  AXIS: '#EFF6FF',
  AXIS_C: '#ECFDF5',
  AXIS_H: '#F3E8FF',
};

const FEE_KRW: Record<CertLevel, number> = {
  L3: 100000,
  L2: 200000,
  L1: 300000,
};

function formatKRW(n: number) {
  return n.toLocaleString('ko-KR') + '원';
}

function formatExamDateKorean(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export function ApplySidebar() {
  const { t } = useI18n();
  const { selectedCert, selectedLevel, selectedSchedule } = useWizard();

  const certName = selectedCert ? t(`apply.cert.${selectedCert}.name` as never) : '';
  const certSub = selectedCert ? t(`apply.cert.${selectedCert}.sub` as never) : '';
  const levelName = selectedLevel ? t(`apply.level.${selectedLevel}.name` as never) : '';
  const heading = selectedCert ? certName : '응시 자격 미선택';

  const level = selectedLevel ? levelName : '—';
  const format = selectedLevel ? t(`apply.level.${selectedLevel}.format` as never) : '—';
  const duration = selectedLevel ? t(`apply.level.${selectedLevel}.duration` as never) : '—';
  const borderColor = selectedCert ? CERT_BORDER[selectedCert] : BORDER;
  const infoBg = selectedCert ? CERT_BG[selectedCert] : '#F8FAFC';

  const total = selectedLevel ? FEE_KRW[selectedLevel] : 0;
  const examDate = formatExamDateKorean(selectedSchedule?.examDate);
  const examTime = selectedSchedule?.examStartTime ?? '—';

  return (
    <aside className="lg:sticky lg:top-24 self-start">
      <div
        className="rounded-[20px] overflow-hidden"
        style={{ background: '#FFFFFF', border: `1px solid ${borderColor}` }}
      >
        <div className="px-5 pt-5 lg:px-6 lg:pt-8 pb-2">
          <div className="flex items-end justify-between gap-3">
            <div
              className="text-[17px] sm:text-[18px] lg:text-[20px] font-semibold break-keep"
              style={{ color: borderColor }}
            >
              {heading}
            </div>
            {selectedCert && (
              <div className="text-[12px] lg:text-[13px] font-medium text-right break-keep" style={{ color: GRAY_500 }}>
                {certSub}
              </div>
            )}
          </div>
        </div>

        <div className="px-4 pt-3 pb-4 space-y-2 m-3 lg:px-6 lg:pt-4 lg:pb-5 lg:space-y-2.5 lg:m-5 rounded-lg" style={{ background: infoBg }}>
          <InfoRow label="등급" value={level} />
          <InfoRow label="시험 형식" value={format} />
          <InfoRow label="소요 시간" value={duration} />
        </div>


        <div className="px-5 pt-3 pb-3 space-y-2 lg:px-6 lg:pt-4 lg:pb-4 lg:space-y-2.5">
          <PriceRow label="날짜" value={examDate} />
          <PriceRow label="시간" value={examTime} />
        </div>

        <div className="mx-5 lg:mx-6 border-t" style={{ borderColor: `#bbbbbb` }} />

        <div className="px-5 pt-2 pb-5 lg:px-6 lg:pb-6">
          <div className="flex items-baseline justify-between">
            <span className="text-[14px] font-semibold" style={{ color: INK_900 }}>
              최종 결제금액
            </span>
            <span className="text-[20px] sm:text-[22px] lg:text-[24px] font-bold" style={{ color: INK_900 }}>
              {formatKRW(total)}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-[13px] lg:text-[14px]">
      <span style={{ color: GRAY_500 }}>{label}</span>
      <span className="text-right font-medium" style={{ color: INK_900 }}>{value}</span>
    </div>
  );
}

function PriceRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="flex items-center justify-between text-[14px]">
      <span style={{ color: GRAY_500 }}>{label}</span>
      <span className="font-semibold" style={{ color: valueColor ?? INK_900 }}>{value}</span>
    </div>
  );
}
