import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PDFViewer } from '@react-pdf/renderer';
import { useI18n } from '@/i18n';
import { userApi } from '@/services/api';
import { VoucherPdfDocument } from '@/components/VoucherPdfDocument';
import type { DashboardDto, RegistrationDto } from './mypage/types';

/**
 * Standalone "응시표" (exam admission ticket) — opened in a popup from My Page
 * (MyExamsPanel / RegistrationsPanel). Vector PDF (@react-pdf/renderer), keyed
 * by registration id; data comes from the same dashboard source.
 */
export default function VoucherPrintPage() {
  const { registrationId: regIdRaw } = useParams<{ registrationId: string }>();
  const registrationId = regIdRaw ? decodeURIComponent(regIdRaw) : '';
  const { t, lang } = useI18n();
  const navigate = useNavigate();

  const [data, setData] = useState<DashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const reg: RegistrationDto | null = useMemo(
    () => data?.registrations.find((r) => r.id === registrationId) ?? null,
    [data, registrationId],
  );

  const doc = useMemo(() => {
    if (!data || !reg) return null;
    return (
      <VoucherPdfDocument
        certType={reg.certType}
        holderName={data.profile.name}
        birthDateIso={data.profile.birthDate ?? null}
        examNumber={reg.registrationNumber}
        examDateIso={reg.schedule.examDate}
      />
    );
  }, [data, reg]);

  if (loading) return <CenteredMessage text={lang === 'ko' ? '응시표를 불러오는 중…' : 'Loading…'} />;
  if (error) return <CenteredMessage text={error} tone="danger" />;
  if (!doc) {
    return (
      <CenteredMessage
        text={lang === 'ko' ? '해당 접수 내역을 찾을 수 없습니다.' : 'Registration not found.'}
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
