import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PDFViewer } from '@react-pdf/renderer';
import { useI18n } from '@/i18n';
import { userApi } from '@/services/api';
import { ConfirmationPdfDocument } from '@/components/ConfirmationPdfDocument';
import type { DashboardDto, RegistrationDto, ResultDto } from './mypage/types';

/**
 * Standalone "시험응시 확인서" — opened in a popup from My Page (ScoresPanel).
 * Renders a vector PDF (@react-pdf/renderer). Same dashboard data source as the
 * scores table, keyed by result id; exam number / date come from the matching
 * registration when present.
 */
export default function ConfirmationPrintPage() {
  const { resultId: resultIdRaw } = useParams<{ resultId: string }>();
  const resultId = resultIdRaw ? decodeURIComponent(resultIdRaw) : '';
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

  const result: ResultDto | null = useMemo(
    () => data?.results.find((r) => r.id === resultId) ?? null,
    [data, resultId],
  );

  // Exam number / date come from a registration of the same track, when present.
  const reg: RegistrationDto | null = useMemo(() => {
    if (!data || !result) return null;
    if (result.registrationId) {
      const linked = data.registrations.find((r) => r.id === result.registrationId);
      if (linked) return linked;
    }
    const sameTrack = data.registrations.filter(
      (r) => r.certType === result.certType && r.level === result.level,
    );
    return sameTrack.find((r) => r.registrationNumber) ?? sameTrack[0] ?? null;
  }, [data, result]);

  const doc = useMemo(() => {
    if (!data || !result) return null;
    return (
      <ConfirmationPdfDocument
        certType={result.certType}
        holderName={data.profile.name}
        birthDateIso={data.profile.birthDate ?? null}
        examNumber={result.registrationNumber ?? reg?.registrationNumber ?? null}
        examDateIso={result.submittedAt ?? reg?.schedule.examDate ?? null}
      />
    );
  }, [data, result, reg]);

  if (loading) return <CenteredMessage text={lang === 'ko' ? '확인서를 불러오는 중…' : 'Loading…'} />;
  if (error) return <CenteredMessage text={error} tone="danger" />;
  if (!doc) {
    return (
      <CenteredMessage
        text={lang === 'ko' ? '해당 응시 내역을 찾을 수 없습니다.' : 'Record not found.'}
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
