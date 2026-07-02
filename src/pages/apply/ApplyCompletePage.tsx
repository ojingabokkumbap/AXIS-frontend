import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { SiteHeader } from '@/components/marketing/SiteHeader';
import { SiteFooter } from '@/components/marketing/SiteFooter';

export type ApplyCompleteState = {
  vbankName: string;
  vbankNum: string;
  vbankExpiry: string;
  amount: number;
  orderName: string;
  registrationId: string;
};

function formatExpiryDisplay(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd} ${hh}:${mi}`;
}

function MiniToast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const id = setTimeout(onClose, 2200);
    return () => clearTimeout(id);
  }, [onClose]);
  return (
    <div className="fixed bottom-6 left-1/2 z-[3000] -translate-x-1/2 max-w-[90vw] text-center px-4 py-3 rounded-xl bg-[#0F172A] text-white text-sm shadow-lg">
      {message}
    </div>
  );
}

export default function ApplyCompletePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();
  const state = location.state as ApplyCompleteState | null | undefined;
  const [toast, setToast] = useState<string | null>(null);

  if (!state?.vbankNum) {
    return <Navigate to="/apply" replace />;
  }

  const copyNum = async () => {
    try {
      await navigator.clipboard.writeText(state.vbankNum);
      setToast(t('apply.complete.copied' as never));
    } catch {
      setToast(t('apply.complete.copyFailed' as never));
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {toast && <MiniToast message={toast} onClose={() => setToast(null)} />}
      <SiteHeader active="apply" />

      <div className="flex-1 max-w-lg w-full mx-auto px-4 py-8 sm:py-12">
        <div className="text-center text-[20px] sm:text-[22px] font-extrabold text-[#0F172A] mb-2 break-keep">
          {t('apply.complete.vaTitle' as never)}
        </div>
        <p className="text-center text-sm text-[#64748B] mb-6 sm:mb-8 break-keep">{state.orderName}</p>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-sm space-y-3 text-[14px]">
          <div className="flex justify-between gap-3">
            <span className="text-[#64748B]">{t('apply.complete.bank' as never)}</span>
            <span className="font-semibold text-[#0F172A] text-right">{state.vbankName}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-[#64748B]">{t('apply.complete.account' as never)}</span>
            <span className="font-mono font-semibold text-[#0F172A] text-right text-[13px] break-all">
              {state.vbankNum}
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-[#64748B]">{t('apply.complete.holder' as never)}</span>
            <span className="font-medium text-[#0F172A] text-right">주식회사 에이아이넥스</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-[#64748B]">{t('apply.complete.amount' as never)}</span>
            <span className="font-bold text-[#2563EB] text-[16px] sm:text-[14px]">₩{state.amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-3 pt-2 border-t border-[#E2E8F0]">
            <span className="text-[#64748B]">{t('apply.complete.deadline' as never)}</span>
            <span className="font-medium text-[#0F172A] text-right">
              {formatExpiryDisplay(state.vbankExpiry)} {t('apply.complete.deadlineSuffix' as never)}
            </span>
          </div>
        </div>

        <p className="mt-6 text-[13px] text-amber-900 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 break-keep">
          {t('apply.complete.warnNoPay' as never)}
        </p>

        <p className="mt-3 text-[13px] text-[#1E3A5F] bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl px-4 py-3 break-keep">
          {t('apply.complete.smsInfo' as never)}
          <br />
          {t('apply.complete.processTime' as never)}
        </p>

        <div className="mt-8 space-y-3">
          <button
            type="button"
            onClick={() => void copyNum()}
            className="w-full h-12 rounded-xl text-[14px] font-semibold border-2 border-[#2563EB] text-[#2563EB] bg-white hover:bg-[#EFF6FF] transition-colors"
          >
            {t('apply.complete.copyAccount' as never)}
          </button>
          <button
            type="button"
            onClick={() => navigate('/mypage')}
            className="w-full h-12 rounded-xl text-[14px] font-semibold bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-colors"
          >
            {t('apply.complete.gotoMypage' as never)}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full h-12 rounded-xl text-[14px] font-medium border border-[#E2E8F0] bg-white text-body hover:bg-[#F8FAFC] transition-colors"
          >
            {t('apply.complete.gotoHome' as never)}
          </button>
        </div>

        <p className="mt-10 text-center text-[12px] text-[#94A3B8] leading-relaxed">
          문의: 1811-9530 · support@axisexam.com · 평일 09:00-18:00
        </p>
      </div>

      <SiteFooter />
    </div>
  );
}
