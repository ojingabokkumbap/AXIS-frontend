import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PDFViewer } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import { useI18n } from '@/i18n';
import { userApi } from '@/services/api';
import { buildCertificateVerifyQrUrl } from '@/components/CertificateVerifyQr';
import { CertificatePdfDocument } from '@/components/CertificatePdfDocument';
import type { CertificateDto, DashboardDto, ResultDto } from './mypage/types';

/**
 * Standalone certificate view — opened in a popup from My Page (CertsPanel).
 * Renders a real vector PDF (@react-pdf/renderer) so the user can pick paper
 * size / scale and download or print it from the embedded PDF viewer.
 */
export default function CertificatePrintPage() {
  const { certNumber: certNumberRaw } = useParams<{ certNumber: string }>();
  const certNumber = certNumberRaw ? decodeURIComponent(certNumberRaw) : '';
  const { t, lang } = useI18n();
  const navigate = useNavigate();

  const [data, setData] = useState<DashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await userApi.getDashboard();
        if (!cancelled) {
          setData(res.data);
          setError('');
        }
      } catch (err: any) {
        if (err.response?.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          navigate('/login', { replace: true });
          return;
        }
        if (!cancelled) setError(err.response?.data?.message || t('home.profileError'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cert: CertificateDto | null = useMemo(
    () => data?.certificates.find((c) => c.certNumber === certNumber) ?? null,
    [data, certNumber],
  );

  const result: ResultDto | null = useMemo(() => {
    if (!data || !cert) return null;
    return data.results.find((r) => r.certType === cert.certType && r.level === cert.level) ?? null;
  }, [data, cert]);

  const displayName = useMemo(
    () => (cert?.holderName && cert.holderName.trim()) || data?.profile.name || '',
    [cert, data],
  );
  const displayBirthIso = cert?.holderBirthDate ?? data?.profile.birthDate ?? null;

  const verifyPageUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/verify-cert` : 'https://axisexam.com/verify-cert';

  // QR → data URL (react-pdf <Image> needs a URL, not a DOM node).
  useEffect(() => {
    if (!cert) return;
    let cancelled = false;
    const url = buildCertificateVerifyQrUrl(verifyPageUrl, cert.certNumber, displayName);
    void QRCode.toDataURL(url, {
      width: 240,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#002060', light: '#FFFFFF' },
    }).then((d) => {
      if (!cancelled) setQrDataUrl(d);
    });
    return () => {
      cancelled = true;
    };
  }, [cert, displayName, verifyPageUrl]);

  const doc = useMemo(() => {
    if (!cert) return null;
    return (
      <CertificatePdfDocument
        certType={cert.certType}
        level={cert.level}
        holderName={displayName}
        birthDateIso={displayBirthIso}
        certNumber={cert.certNumber}
        issuedAtIso={cert.issuedAt}
        validUntilIso={cert.validUntil}
        qrDataUrl={qrDataUrl}
      />
    );
    // result is unused by the PDF but kept in deps so a re-fetch refreshes the doc
  }, [cert, displayName, displayBirthIso, qrDataUrl, result]);

  if (loading) return <CenteredMessage text={lang === 'ko' ? '자격증을 불러오는 중…' : 'Loading certificate…'} />;
  if (error) return <CenteredMessage text={error} tone="danger" />;
  if (!cert || !doc) {
    return (
      <CenteredMessage
        text={lang === 'ko' ? '해당 자격증을 찾을 수 없습니다.' : 'Certificate not found.'}
        tone="danger"
      />
    );
  }

  return (
    <div style={styles.page}>
      <PDFViewer style={{ width: '100%', height: '100%' }} showToolbar>
        {doc}
      </PDFViewer>
    </div>
  );
}

function CenteredMessage({ text, tone }: { text: string; tone?: 'danger' }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        fontFamily: "'Malgun Gothic', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
        fontSize: 15,
        color: tone === 'danger' ? '#C62828' : '#444',
        background: '#F3F5F9',
      }}
    >
      {text}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    height: '100vh',
    background: '#525659',
    fontFamily: "'Malgun Gothic', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
  },
};
