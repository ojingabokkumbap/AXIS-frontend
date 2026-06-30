import { useMemo } from 'react';
import { buildCertificateVerifyQrUrl, CertificateVerifyQr } from './CertificateVerifyQr';
import certiBg from '@/assets/certi-bg.png';
import stampImg from '@/assets/stamp.png';

/** Main-site A4-style formal certificate (Korean layout). Screen + print.
 *  Decorative frame/ribbons/medallion/watermark live in the background image
 *  (certi-bg.png); only the dynamic text, QR and red seal are overlaid. */
const NAVY = '#1B2A4A';
const INK = '#1A1A1A';

/** Background image is 1248×1742 → the card keeps this exact A4-ish ratio. */
const BG_RATIO = '1248 / 1742';

type CertType = 'AXIS' | 'AXIS_C' | 'AXIS_H';
type CertLevel = 'L3' | 'L2' | 'L1';

export function levelKoLine(level: CertLevel): string {
  switch (level) {
    case 'L3':
      return 'L3 (3급 · 스타터)';
    case 'L2':
      return 'L2 (2급 · 전문 실무자)';
    case 'L1':
      return 'L1 (1급 · 리더)';
    default:
      return level;
  }
}

export function certTitleKo(certType: CertType): string {
  if (certType === 'AXIS_C') return 'AI 코딩·자동화 실무역량검정 (AXIS-C)';
  if (certType === 'AXIS_H') return 'AI 헬스케어 실무역량검정 (AXIS-H)';
  return 'AI 실무역량검정 (AXIS)';
}

export function formatKoreanCalendarDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}년 ${m}월 ${day}일`;
}

export function buildFormalCertNameLine(certType: CertType, level: CertLevel): string {
  return `${certTitleKo(certType)} - ${levelKoLine(level)}`;
}

function FieldRow({ label, value, fill }: { label: string; value: string; fill?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', lineHeight: 1.5 }}>
      <span
        style={{
          flex: '0 0 118px',
          fontSize: 17,
          fontWeight: 700,
          color: NAVY,
          letterSpacing: '0.02em',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 18,
          fontWeight: 600,
          color: INK,
          // `fill` stretches a (single) long value edge-to-edge so it reaches the
          // same right margin as the other long rows instead of stopping short.
          ...(fill
            ? { flex: 1, textAlign: 'justify' as const, textAlignLast: 'justify' as const }
            : {}),
        }}
      >
        {value}
      </span>
    </div>
  );
}

export type FormalCertificatePrintProps = {
  certType: CertType;
  level: CertLevel;
  holderName: string;
  birthDateIso: string | null | undefined;
  certNumber: string;
  issuedAtIso: string | null | undefined;
  validUntilIso: string | null | undefined;
  /** e.g. https://axisexam.com/verify-cert */
  verifyPageUrl: string;
};

export function FormalCertificatePrint({
  certType,
  level,
  holderName,
  birthDateIso,
  certNumber,
  issuedAtIso,
  validUntilIso,
  verifyPageUrl,
}: FormalCertificatePrintProps) {
  const certNameLine = buildFormalCertNameLine(certType, level);
  const issuedKr = formatKoreanCalendarDate(issuedAtIso ?? null);
  const validFrom = formatKoreanCalendarDate(issuedAtIso ?? null);
  const validEnd = formatKoreanCalendarDate(validUntilIso ?? null);
  const birthKr = formatKoreanCalendarDate(birthDateIso ?? null);
  const validRange = validFrom !== '—' && validEnd !== '—' ? `${validFrom} ~ ${validEnd}` : '—';

  const qrPayloadUrl = useMemo(
    () => buildCertificateVerifyQrUrl(verifyPageUrl, certNumber, holderName),
    [verifyPageUrl, certNumber, holderName],
  );

  return (
    <div
      className="formal-certificate-root"
      style={{
        position: 'relative',
        boxSizing: 'border-box',
        width: '100%',
        maxWidth: 720,
        margin: '0 auto',
        aspectRatio: BG_RATIO,
        color: INK,
        fontFamily: "'Malgun Gothic', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
      }}
    >
      {/* Decorative background: frame + ribbons + gold medallion + AXIS watermark */}
      <img
        src={certiBg}
        alt=""
        aria-hidden
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'fill' }}
      />

      {/* QR — top-right, inside the white area (white starts ~6.8%/right ~7%) */}
      <div style={{ position: 'absolute', top: '6.5%', right: '10%', textAlign: 'center' }}>
        <CertificateVerifyQr payloadUrl={qrPayloadUrl} size={76} />
      </div>

      {/* Content layer — padding tuned to the measured white face
          (left 6.8% / right 93% / top 4.9% / bottom 95%) plus inner margin */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          padding: '20% 12% 15%',
          boxSizing: 'border-box',
        }}
      >
        {/* Title */}
        <div style={{ textAlign: 'center' }}>
          <h1
            style={{
              margin: 0,
              fontSize: 52,
              fontWeight: 800,
              letterSpacing: '0.3em',
              textIndent: '0.3em',
              color: INK,
            }}
          >
            자 격 증
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: 15, letterSpacing: '0.04em', color: '#5B5B5B' }}>
            Artificial Intelligence Practical Skills Certification
          </p>
        </div>

        {/* Fields */}
        <div
          style={{
            alignSelf: 'center',
            width: '92%',
            marginTop: '25.5%',
            display: 'flex',
            flexDirection: 'column',
            gap: 13,
          }}
        >
          <FieldRow label="성　　　명" value={holderName.trim() || '—'} />
          <FieldRow label="생 년 월 일" value={birthKr} />
          <FieldRow label="자  격  명" value={certNameLine} fill />
          <FieldRow label="종　　　목" value={levelKoLine(level)} />
          <FieldRow label="자 격 번 호" value={certNumber} />
          <FieldRow label="유 효 기 간" value={validRange} />
        </div>

        {/* Award sentence */}
        <p
          style={{
            margin: '20% 0 0',
            textAlign: 'center',
            fontSize: 18,
            lineHeight: 2,
            color: '#2B2B2B',
          }}
        >
          위 사람은 본 아이넥스에 의해 실시한
          <br />
          자격시험을 통과하였으므로 이 증서를 수여합니다.
        </p>

        {/* Issue date */}
        <p style={{ margin: '5% 0 0', textAlign: 'center', fontSize: 19, fontWeight: 600, color: INK }}>
          {issuedKr}
        </p>

        {/* Signature + official seal */}
        <div style={{ marginTop: 'auto', position: 'relative', textAlign: 'center' }}>
          <p
            style={{
              margin: 0,
              fontSize: 40,
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: INK,
              fontFamily: "'Nanum Myeongjo', 'Apple SD Gothic Neo', serif",
            }}
          >
            주식회사 아이넥스
          </p>
          <p style={{ margin: '6px 0 0', fontSize: 15, color: '#555' }}>Certified by AINEX Co., Ltd.</p>
          <img
            src={stampImg}
            alt=""
            aria-hidden
            style={{
              position: 'absolute',
              right: '14%',
              top: '-0px',
              width: 74,
              height: 'auto',
              opacity: 0.95,
              mixBlendMode: 'multiply',
            }}
          />
        </div>
      </div>
    </div>
  );
}
