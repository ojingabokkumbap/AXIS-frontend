import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { certTitleKo, formatKoreanCalendarDate } from './FormalCertificatePrint';
import { registerCertificateFonts, type PdfPageSize } from './CertificatePdfDocument';
import attendBg from '@/assets/certi-attend-bg.png';
import stampImg from '@/assets/stamp.png';

/** Vector PDF "응시표" (exam admission ticket).
 *  Frame/watermark live in certi-attend-bg.png; text + seal + notice are overlaid. */

type CertType = 'AXIS' | 'AXIS_C' | 'AXIS_H';

registerCertificateFonts();

const INK = '#1A1A1A';
const LABEL_INK = '#333333';
const LABEL_BG = '#F2F2F2';
const BORDER = '#D9D9D9';

const PAGE_DIMS: Record<PdfPageSize, [number, number]> = {
  A4: [595.28, 841.89],
  LETTER: [612, 792],
};

const DEFAULT_NOTICES = [
  '시험 시작 30분 전부터 입실 가능합니다.',
  '신분증을 반드시 지참해 주세요.',
  '응시 환경(웹캠·마이크·네트워크) 사전 점검을 권장합니다.',
];

function formatDotDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}.${m}.${day}`;
}

export type VoucherPdfDocumentProps = {
  certType: CertType;
  holderName: string;
  birthDateIso: string | null | undefined;
  examNumber: string | null | undefined;
  examDateIso: string | null | undefined;
  notices?: string[];
  pageSize?: PdfPageSize;
};

export function VoucherPdfDocument({
  certType,
  holderName,
  birthDateIso,
  examNumber,
  examDateIso,
  notices = DEFAULT_NOTICES,
  pageSize = 'A4',
}: VoucherPdfDocumentProps) {
  const [W, H] = PAGE_DIMS[pageSize];
  const sf = W / 720;
  const px = (n: number) => n * sf;

  const examKind = certTitleKo(certType);
  const birth = formatDotDate(birthDateIso);
  const examDate = formatKoreanCalendarDate(examDateIso ?? null);

  const s = StyleSheet.create({
    page: { backgroundColor: '#fff' },
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
      fontFamily: 'NanumGothic',
      color: INK,
    },
    title: { textAlign: 'center', fontSize: px(38), fontWeight: 700, color: INK, letterSpacing: px(6) },

    table: { marginTop: W * 0.13, borderWidth: 1, borderColor: BORDER, borderStyle: 'solid' },
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

    date: { textAlign: 'center', fontSize: px(17), fontWeight: 700, color: INK, marginTop: W * 0.1 },

    signWrap: { position: 'relative', alignItems: 'center', marginTop: W * 0.03 },
    sign: { fontSize: px(40), fontWeight: 800, fontFamily: 'NanumMyeongjo', color: INK, letterSpacing: px(40 * 0.04) },
    signEn: { fontSize: px(15), color: '#555', marginTop: px(6) },
    stamp: { position: 'absolute', right: '14%', top: 0, width: px(74), height: px(74), objectFit: 'contain' },

    notice: { marginTop: W * 0.06, borderWidth: 1, borderColor: BORDER, borderStyle: 'solid', padding: px(18) },
    noticeTitle: { textAlign: 'center', fontSize: px(15), fontWeight: 700, color: INK, marginBottom: px(12) },
    noticeLine: { fontSize: px(13), color: '#333333', lineHeight: 1.5, marginBottom: px(8) },
  });

  return (
    <Document title="AXIS 응시표">
      <Page size={pageSize} style={s.page}>
        <View style={s.card}>
          <Image src={attendBg} style={s.bg} />

          <View style={s.content}>
            <Text style={s.title}>응시표</Text>

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

            <Text style={s.date}>{examDate}</Text>

            <View style={s.signWrap}>
              <Text style={s.sign}>주식회사 아이넥스</Text>
              <Text style={s.signEn}>Certified by AINEX Co., Ltd.</Text>
              <Image src={stampImg} style={s.stamp} />
            </View>

            <View style={s.notice}>
              <Text style={s.noticeTitle}>주의사항</Text>
              {notices.map((n, i) => (
                <Text key={i} style={s.noticeLine}>{`${i + 1}. ${n}`}</Text>
              ))}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
