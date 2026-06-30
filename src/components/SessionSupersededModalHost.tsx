import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResultModal, ResultModalButton, ResultModalEmpty } from '@/components/ResultModal';
import { useI18n } from '@/i18n';
import {
  releaseSessionSupersededNotifyLock,
  SESSION_SUPERSEDED_EVENT,
  type SessionSupersededDetail,
} from '@/lib/sessionSupersededModal';

export function SessionSupersededModalHost() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState<SessionSupersededDetail | null>(null);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<SessionSupersededDetail>).detail;
      setPayload(detail);
      setOpen(true);
    };
    window.addEventListener(SESSION_SUPERSEDED_EVENT, handler);
    return () => window.removeEventListener(SESSION_SUPERSEDED_EVENT, handler);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    releaseSessionSupersededNotifyLock();
    const redirectTo = payload?.redirectTo;
    setPayload(null);
    if (redirectTo && !window.location.pathname.includes('/login')) {
      navigate(redirectTo, { replace: true });
    }
  }, [navigate, payload?.redirectTo]);

  if (!open || !payload) return null;

  const message = payload.backendMessage?.trim() || t('sessionSuperseded.message');

  return (
    <ResultModal
      title={t('sessionSuperseded.title')}
      headerBg="#D97706"
      onClose={handleClose}
      footer={
        <ResultModalButton variant="primary" onClick={handleClose}>
          {t('sessionSuperseded.confirm')}
        </ResultModalButton>
      }
    >
      <ResultModalEmpty message={message} helperText={t('sessionSuperseded.helper')} />
    </ResultModal>
  );
}
