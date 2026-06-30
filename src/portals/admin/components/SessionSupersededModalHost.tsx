import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Button, Modal } from '@admin/components/shared/ui-kit';
import { useI18n } from '@admin/i18n';
import {
  ADMIN_SESSION_SUPERSEDED_EVENT,
  releaseAdminSessionSupersededNotifyLock,
  type AdminSessionSupersededDetail,
} from '@admin/lib/sessionSupersededModal';

export function SessionSupersededModalHost() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState<AdminSessionSupersededDetail | null>(null);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<AdminSessionSupersededDetail>).detail;
      setPayload(detail);
      setOpen(true);
    };
    window.addEventListener(ADMIN_SESSION_SUPERSEDED_EVENT, handler);
    return () => window.removeEventListener(ADMIN_SESSION_SUPERSEDED_EVENT, handler);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    releaseAdminSessionSupersededNotifyLock();
    const redirectTo = payload?.redirectTo;
    setPayload(null);
    if (redirectTo && !window.location.pathname.endsWith('/login')) {
      navigate(redirectTo, { replace: true });
    }
  }, [navigate, payload?.redirectTo]);

  const message = payload?.backendMessage?.trim() || t('sessionSuperseded.message');

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t('sessionSuperseded.title')}
      width={480}
      footer={
        <Button variant="primary" onClick={handleClose}>
          {t('sessionSuperseded.confirm')}
        </Button>
      }
    >
      <div className="flex flex-col items-center text-center py-2">
        <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 grid place-items-center mb-5">
          <AlertTriangle className="w-8 h-8 text-amber-600" strokeWidth={1.75} />
        </div>
        <p className="text-[16px] leading-relaxed text-[var(--gray-700)] m-0">{message}</p>
        <p className="text-[14px] leading-relaxed text-[var(--gray-500)] mt-3 m-0">
          {t('sessionSuperseded.helper')}
        </p>
      </div>
    </Modal>
  );
}
