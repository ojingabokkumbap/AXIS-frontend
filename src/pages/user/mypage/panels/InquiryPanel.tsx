import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { inquiryApi } from '@/services/api';
import type { Inquiry, InquiryCategory } from '@/services/api';
import {
  EmptyState,
  SectionTitle,
} from '../primitives';
import type { DashboardDto } from '../types';

const TABLE_WRAP = 'w-full overflow-x-auto border-t-2 border-ink mt-4 mb-2';

const CATEGORY_LABEL: Record<InquiryCategory, { ko: string; en: string }> = {
  REGISTRATION: { ko: '접수 문의', en: 'Registration' },
  PAYMENT: { ko: '결제 문의', en: 'Payment' },
  EXAM: { ko: '시험 문의', en: 'Exam' },
  TECHNICAL: { ko: '기술 문의', en: 'Technical' },
  CERTIFICATE: { ko: '자격증 문의', en: 'Certificate' },
  OTHER: { ko: '기타', en: 'Other' },
};

const STATUS_CONFIG = {
  PENDING: {
    labelKo: '대기중',
    labelEn: 'Pending',
    textClass: 'text-[#475569]',
    bgClass: 'bg-[#F8FAFC]',
    borderClass: 'border-[#CBD5E1]',
  },
  ANSWERED: {
    labelKo: '답변완료',
    labelEn: 'Answered',
    textClass: 'text-[#1D4ED8]',
    bgClass: 'bg-[#EFF6FF]',
    borderClass: 'border-[#BFDBFE]',
  },
  CLOSED: {
    labelKo: '종료',
    labelEn: 'Closed',
    textClass: 'text-[#B91C1C]',
    bgClass: 'bg-[#FEF2F2]',
    borderClass: 'border-[#FECACA]',
  },
};

export function InquiryPanel({ data: _data }: { data: DashboardDto }) {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!localStorage.getItem('accessToken')) {
        setLoading(false);
        return;
      }
      try {
        const res = await inquiryApi.getMyInquiries(1, 50);
        if (!cancelled) setInquiries(res.data.inquiries);
      } catch (err) {
        console.error('Failed to fetch inquiries:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const getCategoryLabel = (cat: InquiryCategory) =>
    lang === 'ko' ? CATEGORY_LABEL[cat].ko : CATEGORY_LABEL[cat].en;

  const handleViewDetail = (inq: Inquiry) =>
    navigate(`/qna?tab=ask&id=${inq.id}`);

  return (
    <>
      <div className="mb-6">
        <SectionTitle title={t('sec.alerts.title')} sub="" />
      </div>

      <p className="mb-4 text-[14px] text-muted">
        {lang === 'ko' ? (
          <>
            내 문의 내역을 확인할 수 있습니다. 문의 작성은{' '}
            <button
              type="button"
              onClick={() => navigate('/qna?tab=ask')}
              className="text-blue-500 font-semibold underline underline-offset-2 bg-transparent border-none cursor-pointer hover:text-blue-700 p-0"
              style={{ fontFamily: 'inherit', fontSize: 'inherit' }}
            >
              고객센터 1:1 문의
            </button>
            에서 진행해 주세요.
          </>
        ) : (
          <>
            View your inquiry history here. To write a new inquiry, please use{' '}
            <button
              type="button"
              onClick={() => navigate('/qna?tab=ask')}
              className="text-blue-500 font-semibold underline underline-offset-2 bg-transparent border-none cursor-pointer hover:text-blue-700 p-0"
              style={{ fontFamily: 'inherit', fontSize: 'inherit' }}
            >
              Customer Center 1:1 Inquiry
            </button>
            .
          </>
        )}
      </p>

      {loading ? (
        <div aria-live="polite" className="space-y-2 py-3">
          <div className="h-12 rounded-lg bg-[#F3F5F9] animate-pulse" />
          <div className="h-12 rounded-lg bg-[#F3F5F9] animate-pulse" />
          <div className="h-12 rounded-lg bg-[#F3F5F9] animate-pulse" />
          <div className="h-12 rounded-lg bg-[#F3F5F9] animate-pulse" />
        </div>
      ) : (
        <div className={TABLE_WRAP}>
          <table className="data-table" style={{ minWidth: 720 }}>
            <thead>
              <tr>
                <th style={{ width: 140 }}>분류</th>
                <th>제목</th>
                <th style={{ width: 140 }}>등록일자</th>
                <th style={{ width: 130 }}>상태</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <EmptyState description={lang === 'ko' ? '문의 작성은 고객센터 1:1 문의에서 진행해 주세요.' : 'To write an inquiry, please use the Customer Center 1:1 Inquiry.'}>
                      {lang === 'ko' ? '문의 내역이 없습니다.' : 'No inquiry history yet.'}
                    </EmptyState>
                  </td>
                </tr>
              ) : (
                inquiries.map((inq) => {
                  const status = STATUS_CONFIG[inq.status];
                  return (
                    <tr
                      key={inq.id}
                      onClick={() => handleViewDetail(inq)}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <td className="text-muted">{getCategoryLabel(inq.category)}</td>
                      <td>
                        <span className="text-ink font-semibold truncate block max-w-120">
                          {inq.title}
                        </span>
                      </td>
                      <td className="text-muted font-en">
                        {new Date(inq.createdAt).toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US')}
                      </td>
                      <td>
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[14px] leading-none font-semibold ${status.textClass} ${status.bgClass} ${status.borderClass}`}
                        >
                          {lang === 'ko' ? status.labelKo : status.labelEn}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
