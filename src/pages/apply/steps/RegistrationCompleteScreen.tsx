import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { registrationsApi } from '@/services/api';

interface Ticket {
  regId: string;
  regNo: string | null;
  certType: string;
  level: string;
  roundNumber: number;
  year: number;
  examDate: string;
  examStartTime: string;
  venue: string;
  candidateName: string;
  seatNumber: number | null;
}

function formatDate(iso: string, time?: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}${time ? ` ${time}` : ''}`;
}

function certLabel(certType: string, level: string) {
  const cert = certType === 'AXIS_C' ? 'AXIS-C' : certType === 'AXIS_H' ? 'AXIS-H' : 'AXIS';
  return `${cert} ${level}`;
}

export default function RegistrationCompleteScreen({ regId }: { regId: string }) {
  const { t, lang } = useI18n();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    registrationsApi.ticket(regId)
      .then((r) => setTicket(r.data as Ticket))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [regId]);

  return (
    <div className="max-w-lg mx-auto px-4 py-10 text-center">
      <div className="w-16 h-16 bg-[#DCFCE7] rounded-full flex items-center justify-center mx-auto mb-5">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h1 className="text-[22px] font-bold text-[#0F172A] mb-2">{t('apply.complete.title')}</h1>
      <p className="text-sm text-body mb-8">{t('apply.complete.sub')}</p>

      {loading ? (
        <div className="py-8 flex justify-center">
          <div className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : ticket ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm text-left mb-8">
          <div className="bg-[#0F172A] px-6 py-4 text-white">
            <div className="text-[11px] font-medium uppercase tracking-wider text-white/60 mb-0.5">
              {t('apply.complete.voucherTitle')}
            </div>
            <div className="text-[18px] font-bold">{certLabel(ticket.certType, ticket.level)}</div>
          </div>
          <div className="px-6 py-4 space-y-3">
            <div className="flex justify-between text-[13px]">
              <span className="text-[#6B7280]">{t('apply.complete.regNo')}</span>
              <span className="font-mono font-semibold text-[#0F172A]">{ticket.regNo ?? '—'}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-[#6B7280]">{t('apply.complete.candidate')}</span>
              <span className="font-medium text-[#0F172A]">{ticket.candidateName}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-[#6B7280]">{t('apply.complete.examDate')}</span>
              <span className="font-medium text-[#0F172A]">
                {formatDate(ticket.examDate, ticket.examStartTime)}
              </span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-[#6B7280]">{t('apply.complete.venue')}</span>
              <span className="font-medium text-[#0F172A]">{ticket.venue}</span>
            </div>
            {ticket.seatNumber && (
              <div className="flex justify-between text-[13px]">
                <span className="text-[#6B7280]">{t('apply.complete.seat')}</span>
                <span className="font-medium text-[#0F172A]">{ticket.seatNumber}</span>
              </div>
            )}
            <div className="flex justify-between text-[13px]">
              <span className="text-[#6B7280]">{t('apply.complete.session')}</span>
              <span className="font-medium text-[#0F172A]">
                {lang === 'ko'
                  ? `${ticket.year}년 ${ticket.roundNumber}회차`
                  : `${ticket.year} Round ${ticket.roundNumber}`}
              </span>
            </div>
          </div>
          <div className="border-t border-dashed border-[#E2E8F0] px-6 py-3 text-[11px] text-[#9CA3AF]">
            {t('apply.complete.footer')}
          </div>
        </div>
      ) : (
        <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-xl px-5 py-4 text-[13px] text-[#A16207] mb-8">
          {t('apply.complete.noVoucher')}
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={() => window.print()}
          className="w-full h-12 rounded-xl border border-[#2563EB] text-[#2563EB] font-medium text-[14px] hover:bg-[#EFF6FF] transition-colors cursor-pointer"
        >
          {t('apply.complete.print')}
        </button>
        <Link
          to="/mypage"
          className="flex w-full h-12 rounded-xl bg-[#0F172A] text-white font-medium text-[14px] items-center justify-center hover:bg-[#1E293B] transition-colors"
        >
          {t('apply.complete.goMyPage')}
        </Link>
      </div>
    </div>
  );
}
