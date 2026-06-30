import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { certTitleKo, formatKoreanCalendarDate } from './FormalCertificatePrint';
import { registerCertificateFonts, type PdfPageSize } from './CertificatePdfDocument';
import attendBg from '@/assets/certi-attend-bg.png';
import stampImg from '@/assets/stamp.png';

/** Vector PDF "시험응시 확인서" (exam-attendance confirmation).
 *  Frame/watermark live in certi-attend-bg.png; text + seal are overlaid. */

type CertType = 'AXIS' | 'AXIS_C' | 'AXIS_H';

registerCertificateFonts();

const INK = '#1A1A1A';
const LABEL_INK = '#333333';
const LABEL_BG = '#F2F2F2';
const BORDER = '#D9D9D9';

/** Background image is 1151×1632 → A4-ish; the card fills the page. */
const PAGE_DIMS: Record<PdfPageSize, [number, number]> = {
  A4: [595.28, 841.89],
  LETTER: [612, 792],
};

function formatDotDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}.${m}.${day}`;
}

export type ConfirmationPdfDocumentProps = {
  certType: CertType;
  holderName: string;
  birthDateIso: string | null | undefined;
  examNumber: string | null | undefined;
  examDateIso: string | null | undefined;
  pageSize?: PdfPageSize;
};

export function ConfirmationPdfDocument({
  certType,
  holderName,
  birthDateIso,
  examNumber,
  examDateIso,
  pageSize = 'A4',
}: ConfirmationPdfDocumentProps) {
  const [W, H] = PAGE_DIMS[pageSize];
  const sf = W / 720;
  const px = (n: number) => n * sf;

  const examKind = certTitleKo(certType);
  const birth = formatDotDate(birthDateIso);
  const examDate = formatKoreanCalendarDate(examDateIso ?? null);

  const s = StyleSheet.create({
    page: { backgroundColor: '#fff' },
    // Explicit-size card so the absolute bg Image's 100% resolves (else it sizes to 0).
    card: { width: W, height: H, position: 'relative' },
    bg: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'fill' },
    content: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: W,
      height: H,
      paddingTop: W * 0.12,
      paddingHorizontal: W * 0.11,
      paddingBottom: W * 0.1,
      flexDirection: 'column',
      // Root Korean font — inherited by all Text below (else Helvetica → mojibake).
      fontFamily: 'NanumGothic',
      color: INK,
    },
    title: { textAlign: 'center', fontSize: px(38), fontWeight: 700, color: INK, letterSpacing: px(2) },

    table: { marginTop: W * 0.14, borderWidth: 1, borderColor: BORDER, borderStyle: 'solid' },
    row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: BORDER, borderBottomStyle: 'solid' },
    rowLast: { flexDirection: 'row' },
    labelCell: {
      width: px(120),
      backgroundColor: LABEL_BG,
      borderRightWidth: 1,
      borderRightColor: BORDER,
      borderRightStyle: 'solid',
      paddingVertical: px(11),
      paddingHorizontal: px(8),
      alignItems: 'center',
      justifyContent: 'center',
    },
    labelCellMid: {
      width: px(120),
      backgroundColor: LABEL_BG,
      borderLeftWidth: 1,
      borderLeftColor: BORDER,
      borderLeftStyle: 'solid',
      borderRightWidth: 1,
      borderRightColor: BORDER,
      borderRightStyle: 'solid',
      paddingVertical: px(11),
      paddingHorizontal: px(8),
      alignItems: 'center',
      justifyContent: 'center',
    },
    labelText: { fontSize: px(14), fontWeight: 700, color: LABEL_INK },
    valueCell: { flex: 1, paddingVertical: px(11), paddingHorizontal: px(14), justifyContent: 'center' },
    valueText: { fontSize: px(14), fontWeight: 400, color: INK },

    body: { textAlign: 'center', fontSize: px(16), color: '#2B2B2B', marginTop: W * 0.11 },
    date: { textAlign: 'center', fontSize: px(17), fontWeight: 700, color: INK, marginTop: W * 0.13 },

    spacer: { flexGrow: 1 },
    signWrap: { position: 'relative', alignItems: 'center' },
    sign: { fontSize: px(40), fontWeight: 800, fontFamily: 'NanumMyeongjo', color: INK, letterSpacing: px(40 * 0.04) },
    signEn: { fontSize: px(15), color: '#555', marginTop: px(6) },
    stamp: { position: 'absolute', right: '14%', top: 0, width: px(74), height: px(74), objectFit: 'contain' },
  });

  return (
    <Document title="AXIS 시험응시 확인서">
      <Page size={pageSize} style={s.page}>
        <View style={s.card}>
          <Image src={attendBg} style={s.bg} />

          <View style={s.content}>
          <Text style={s.title}>시험응시 확인서</Text>

          <View style={s.table}>
            <View style={s.row}>
              <View style={s.labelCell}>
                <Text style={s.labelText}>시험구분</Text>
              </View>
              <View style={s.valueCell}>
                <Text style={s.valueText}>{examKind}</Text>
              </View>
            </View>

            <View style={s.row}>
              <View style={s.labelCell}>
                <Text style={s.labelText}>성명</Text>
              </View>
              <View style={s.valueCell}>
                <Text style={s.valueText}>{holderName.trim() || '—'}</Text>
              </View>
              <View style={s.labelCellMid}>
                <Text style={s.labelText}>생년월일</Text>
              </View>
              <View style={s.valueCell}>
                <Text style={s.valueText}>{birth}</Text>
              </View>
            </View>

            <View style={s.row}>
              <View style={s.labelCell}>
                <Text style={s.labelText}>수험번호</Text>
              </View>
              <View style={s.valueCell}>
                <Text style={s.valueText}>{examNumber?.trim() || '—'}</Text>
              </View>
            </View>

            <View style={s.rowLast}>
              <View style={s.labelCell}>
                <Text style={s.labelText}>시험일자</Text>
              </View>
              <View style={s.valueCell}>
                <Text style={s.valueText}>{examDate}</Text>
              </View>
            </View>
          </View>

          <Text style={s.body}>위 사람은 본 아이넥스에 의해 실시한 자격시험에 응시하였음을 확인합니다.</Text>
          <Text style={s.date}>{examDate}</Text>

          <View style={s.spacer} />

          <View style={s.signWrap}>
            <Text style={s.sign}>주식회사 아이넥스</Text>
            <Text style={s.signEn}>Certified by AINEX Co., Ltd.</Text>
            <Image src={stampImg} style={s.stamp} />
          </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
