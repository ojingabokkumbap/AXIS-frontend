import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
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
    <div className="fixed bottom-6 left-1/2 z-[3000] -translate-x-1/2 px-4 py-3 rounded-xl bg-[#0F172A] text-white text-sm shadow-lg">
      {message}
    </div>
  );
}

export default function ApplyCompletePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ApplyCompleteState | null | undefined;
  const [toast, setToast] = useState<string | null>(null);

  if (!state?.vbankNum) {
    return <Navigate to="/apply" replace />;
  }

  const copyNum = async () => {
    try {
      await navigator.clipboard.writeText(state.vbankNum);
      setToast('복사되었습니다!');
    } catch {
      setToast('복사에 실패했습니다');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {toast && <MiniToast message={toast} onClose={() => setToast(null)} />}
      <SiteHeader active="apply" />

      <div className="flex-1 max-w-lg w-full mx-auto px-4 py-12">
        <div className="text-center text-[22px] font-extrabold text-[#0F172A] mb-2">
          ✅ 가상계좌가 발급되었습니다
        </div>
        <p className="text-center text-sm text-[#64748B] mb-8">{state.orderName}</p>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-3 text-[14px]">
          <div className="flex justify-between gap-3">
            <span className="text-[#64748B]">입금 은행</span>
            <span className="font-semibold text-[#0F172A] text-right">{state.vbankName}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-[#64748B]">계좌번호</span>
            <span className="font-mono font-semibold text-[#0F172A] text-right text-[13px] break-all">
              {state.vbankNum}
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-[#64748B]">예금주</span>
            <span className="font-medium text-[#0F172A] text-right">주식회사 에이아이넥스</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-[#64748B]">입금 금액</span>
            <span className="font-bold text-[#2563EB]">₩{state.amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-3 pt-2 border-t border-[#E2E8F0]">
            <span className="text-[#64748B]">입금 기한</span>
            <span className="font-medium text-[#0F172A] text-right">
              {formatExpiryDisplay(state.vbankExpiry)} 까지
            </span>
          </div>
        </div>

        <p className="mt-6 text-[13px] text-amber-900 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          ⚠ 입금기한 내 미입금 시 접수가 자동으로 취소됩니다.
        </p>

        <p className="mt-3 text-[13px] text-[#1E3A5F] bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl px-4 py-3">
          입금 확인 후 SMS와 이메일로 접수 확정 안내를 드립니다.
          <br />
          처리 시간: 입금 확인 후 즉시 (평균 10초 이내)
        </p>

        <div className="mt-8 space-y-3">
          <button
            type="button"
            onClick={() => void copyNum()}
            className="w-full h-12 rounded-xl text-[14px] font-semibold border-2 border-[#2563EB] text-[#2563EB] bg-white hover:bg-[#EFF6FF] transition-colors"
          >
            계좌번호 복사
          </button>
          <button
            type="button"
            onClick={() => navigate('/mypage')}
            className="w-full h-12 rounded-xl text-[14px] font-semibold bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-colors"
          >
            마이페이지에서 확인
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full h-12 rounded-xl text-[14px] font-medium border border-[#E2E8F0] bg-white text-body hover:bg-[#F8FAFC] transition-colors"
          >
            홈으로 이동
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
