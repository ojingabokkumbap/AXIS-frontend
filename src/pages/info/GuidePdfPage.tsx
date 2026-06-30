import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PdfPreviewModal } from '@/components/PdfPreviewModal';
import { INFO_PDF_MAP, type InfoPdfId } from '@/constants/infoPdfDocuments';

export default function GuidePdfPage() {
  const { guideId } = useParams<{ guideId: string }>();
  const navigate = useNavigate();

  const guide = useMemo(() => {
    if (!guideId) return null;
    return INFO_PDF_MAP[guideId as InfoPdfId] ?? null;
  }, [guideId]);

  if (!guide) {
    return (
      <CenteredMessage
        text="해당 수험가이드를 찾을 수 없습니다."
        tone="danger"
        actionLabel="가이드 페이지로"
        onAction={() => navigate('/guide')}
      />
    );
  }

  return (
    <div style={styles.page}>
      <PdfPreviewModal
        title={guide.title}
        url={guide.url}
        downloadName={guide.downloadName}
        onClose={() => navigate('/guide')}
      />
    </div>
  );
}

function CenteredMessage({
  text,
  tone,
  actionLabel,
  onAction,
}: {
  text: string;
  tone?: 'danger';
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div style={styles.messageWrap}>
      <div style={{ ...styles.messageCard, color: tone === 'danger' ? '#C62828' : '#444' }}>
        <div>{text}</div>
        {actionLabel && onAction ? (
          <button type="button" onClick={onAction} style={styles.messageButton}>
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    height: '100vh',
    background: '#525659',
  },
  messageWrap: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    background: '#F3F5F9',
    fontFamily: "'Malgun Gothic', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
  },
  messageCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    fontSize: 15,
  },
  messageButton: {
    height: 40,
    padding: '0 18px',
    borderRadius: 9999,
    border: '1px solid #1D6FE5',
    background: '#1D6FE5',
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
};
