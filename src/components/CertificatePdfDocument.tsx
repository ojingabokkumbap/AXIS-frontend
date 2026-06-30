import { Document, Page, View, Text, Image, Font, StyleSheet } from '@react-pdf/renderer';
import { buildFormalCertNameLine, formatKoreanCalendarDate, levelKoLine } from './FormalCertificatePrint';
import certiBg from '@/assets/certi-bg.png';
import stampImg from '@/assets/stamp.png';
import NanumGothic from '@/assets/fonts/NanumGothic-Regular.ttf';
import NanumGothicBold from '@/assets/fonts/NanumGothic-Bold.ttf';
import NanumMyeongjoEB from '@/assets/fonts/NanumMyeongjo-ExtraBold.ttf';

/**
 * Vector PDF version of the formal certificate (@react-pdf/renderer).
 * The decorative frame/ribbons/medallion live in certi-bg.png; everything else
 * (text, QR, seal) is drawn on top. Korean needs registered TTFs — without them
 * react-pdf renders blank glyphs.
 */

type CertType = 'AXIS' | 'AXIS_C' | 'AXIS_H';
type CertLevel = 'L3' | 'L2' | 'L1';
export type PdfPageSize = 'A4' | 'LETTER';

let fontsRegistered = false;
export function registerCertificateFonts() {
  if (fontsRegistered) return;
  Font.register({
    family: 'NanumGothic',
    fonts: [
      { src: NanumGothic, fontWeight: 400 },
      { src: NanumGothicBold, fontWeight: 700 },
    ],
  });
  Font.register({ family: 'NanumMyeongjo', fonts: [{ src: NanumMyeongjoEB, fontWeight: 800 }] });
  // Korean text should never be split mid-syllable.
  Font.registerHyphenationCallback((word) => [word]);
  fontsRegistered = true;
}
registerCertificateFonts();

const NAVY = '#1B2A4A';
const INK = '#1A1A1A';

/** Point dimensions per paper size; the card fills the whole page at scale 1. */
const PAGE_DIMS: Record<PdfPageSize, [number, number]> = {
  A4: [595.28, 841.89],
  LETTER: [612, 792],
};

export type CertificatePdfDocumentProps = {
  certType: CertType;
  level: CertLevel;
  holderName: string;
  birthDateIso: string | null | undefined;
  certNumber: string;
  issuedAtIso: string | null | undefined;
  validUntilIso: string | null | undefined;
  qrDataUrl: string | null;
  pageSize?: PdfPageSize;
  /** Overall "배율" — shrinks the certificate within the page, leaving margin. */
  scale?: number;
  /**
   * 체험용 자격증 여부. true 면 "체험용 · DEMO · 인증 효력 없음" 워터마크/배지를
   * 본문 위에 오버레이합니다. 진짜 자격증과 시각적으로 명확히 구분되어야 하므로
   * 강한 대비 + 회전 텍스트로 처리합니다.
   */
  demo?: boolean;
};

export function CertificatePdfDocument({
  certType,
  level,
  holderName,
  birthDateIso,
  certNumber,
  issuedAtIso,
  validUntilIso,
  qrDataUrl,
  pageSize = 'A4',
  scale = 1,
  demo = false,
}: CertificatePdfDocumentProps) {
  const [W, H] = PAGE_DIMS[pageSize];
  // Font/spacing reference: HTML design was authored on a 720px-wide card.
  const sf = W / 720;
  const px = (n: number) => n * sf;

  const certNameLine = buildFormalCertNameLine(certType, level);
  const certNameOnly = certNameLine.split(' - ')[0] ?? certNameLine;
  const birthKr = formatKoreanCalendarDate(birthDateIso ?? null);
  const issuedKr = formatKoreanCalendarDate(issuedAtIso ?? null);
  const validFrom = formatKoreanCalendarDate(issuedAtIso ?? null);
  const validEnd = formatKoreanCalendarDate(validUntilIso ?? null);
  const validRange = validFrom !== '—' && validEnd !== '—' ? `${validFrom} ~ ${validEnd}` : '—';
  const splitLabelChars = (label: string) => label.replace(/\s+/g, '').split('');

  const s = StyleSheet.create({
    page: { backgroundColor: '#fff' },
    center: { position: 'absolute', top: 0, left: 0, width: W, height: H, alignItems: 'center', justifyContent: 'center' },
    card: { width: W, height: H, position: 'relative', fontFamily: 'NanumGothic', color: INK },
    bg: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'fill' },
    qr: { position: 'absolute', top: H * 0.065, right: W * 0.1, width: px(76), height: px(76) },
    content: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: W,
      height: H,
      paddingTop: W * 0.25,
      paddingHorizontal: W * 0.12,
      paddingBottom: W * 0.15,
      flexDirection: 'column',
    },
    title: { textAlign: 'center', fontSize: px(46), fontWeight: 800, fontFamily: 'NanumMyeongjo', letterSpacing: px(14) },
    titleWrap: { alignItems: 'center' },
    sub: { textAlign: 'center', fontSize: px(13), color: '#5B5B5B', marginTop: px(8), letterSpacing: 0.4 },
    fields: { width: '92%', marginTop: W * 0.105, marginHorizontal: 'auto' },
    row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: px(7) },
    label: { width: px(100), paddingRight: px(30) },
    labelChars: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    labelChar: { fontSize: px(16), lineHeight: 1.35, fontWeight: 700, color: NAVY },
    value: { fontSize: px(17), lineHeight: 1.35, fontWeight: 400, color: INK, flex: 1 },
    award: { textAlign: 'center', fontSize: px(17), lineHeight: 1.9, color: '#2B2B2B', marginTop: W * 0.1 },
    date: { textAlign: 'center', fontSize: px(18), fontWeight: 700, color: INK, marginTop: W * 0.05 },
    spacer: { flexGrow: 1 },
    signWrap: { position: 'relative', alignItems: 'center' },
    sign: { fontSize: px(38), fontWeight: 800, fontFamily: 'NanumMyeongjo', color: INK, letterSpacing: px(2) },
    signEn: { fontSize: px(13), color: '#555', marginTop: px(6) },
    stamp: { position: 'absolute', right: '16%', top: px(-6), width: px(68), height: px(68), objectFit: 'contain' },
    demoBadge: {
      position: 'absolute',
      top: H * 0.05,
      left: W * 0.08,
      paddingHorizontal: px(10),
      paddingVertical: px(4),
      backgroundColor: '#DC2626',
      color: '#FFFFFF',
      fontSize: px(13),
      fontWeight: 700,
      letterSpacing: px(1),
    },
    demoWatermark: {
      position: 'absolute',
      top: H * 0.42,
      left: 0,
      width: W,
      textAlign: 'center',
      color: 'rgba(220, 38, 38, 0.18)',
      fontSize: px(110),
      fontWeight: 800,
      letterSpacing: px(8),
      transform: 'rotate(-22deg)',
      transformOrigin: 'center center',
    },
    demoFooter: {
      position: 'absolute',
      bottom: H * 0.04,
      left: 0,
      width: W,
      textAlign: 'center',
      color: '#DC2626',
      fontSize: px(11),
      fontWeight: 700,
      letterSpacing: px(0.5),
    },
  });

  // Spaced labels so 3-char names line up with 4-char ones.
  const fieldRows: { label: string; value: string }[] = [
    { label: '성명', value: holderName.trim() || '—' },
    { label: '생년월일', value: birthKr },
    { label: '자격명', value: certNameOnly },
    { label: '종목', value: levelKoLine(level) },
    { label: '자격번호', value: certNumber },
    { label: '유효기간', value: validRange },
  ];

  return (
    <Document title={`AXIS 자격증 ${certNumber}`}>
      <Page size={pageSize} style={s.page}>
        <View style={s.center}>
          <View style={[s.card, { transform: `scale(${scale})`, transformOrigin: 'center center' }]}>
            <Image src={certiBg} style={s.bg} />
            {qrDataUrl ? <Image src={qrDataUrl} style={s.qr} /> : null}

            <View style={s.content}>
              <View style={s.titleWrap}>
                <Text style={s.title}>자 격 증</Text>
                <Text style={s.sub}>Artificial Intelligence Practical Skills Certification</Text>
              </View>

              <View style={s.fields}>
                {fieldRows.map((f) => (
                  <View style={s.row} key={f.label}>
                    <View style={s.label}>
                      <View style={s.labelChars}>
                        {splitLabelChars(f.label).map((char, idx) => (
                          <Text style={s.labelChar} key={`${f.label}-${idx}`}>
                            {char}
                          </Text>
                        ))}
                      </View>
                    </View>
                    <Text style={s.value}>{f.value}</Text>
                  </View>
                ))}
              </View>

              <Text style={s.award}>
                위 사람은 본 아이넥스에 의해 실시한{'\n'}자격시험을 통과하였으므로 이 증서를 수여합니다.
              </Text>
              <Text style={s.date}>{issuedKr}</Text>

              <View style={s.spacer} />

              <View style={s.signWrap}>
                <Text style={s.sign}>주식회사 아이넥스</Text>
                <Text style={s.signEn}>Certified by AINEX Co., Ltd.</Text>
                <Image src={stampImg} style={s.stamp} />
              </View>
            </View>

            {demo ? (
              <>
                <Text style={s.demoBadge}>체험용 · DEMO</Text>
                <Text style={s.demoWatermark}>DEMO</Text>
                <Text style={s.demoFooter}>
                  본 자격증은 체험용입니다. 인증 효력이 없으며 자격 인정 자료로 사용할 수 없습니다.
                </Text>
              </>
            ) : null}
          </View>
        </View>
      </Page>
    </Document>
  );
}
