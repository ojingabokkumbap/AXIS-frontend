import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/i18n';
import type { InquiryCategory } from '@/services/api';
import {
  Btn,
  SectionTitle,
} from '../primitives';
import { DigitalBadgeModal } from '../SharedModals';
import { certLabel, formatExamDate } from '../helpers';
import type { CertificateDto, DashboardDto } from '../types';
import { InfoCallout } from '@/components/InfoCallout';
import { openPrintPopup } from '@/utils/openPrintPopup';

const TABLE_WRAP = 'w-full overflow-x-auto border-t-2 border-ink mt-4 mb-2';

export function CertsPanel({ data }: { data: DashboardDto }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [badgeFor, setBadgeFor] = useState<CertificateDto | null>(null);

  const openCertificate = (cert: CertificateDto) =>
    openPrintPopup(`/mypage/certificate/${encodeURIComponent(cert.certNumber)}`, `axis-cert-${cert.certNumber}`);

  const requestPhysicalCopy = () =>
    navigate('/qna', {
      state: {
        prefill: {
          category: 'CERTIFICATE' as InquiryCategory,
          title: '[Physical Cert] Shipping request',
        },
      },
    });

  return (
    <>
      <SectionTitle title={t('sec.certs.title')} sub="" />

       <InfoCallout tone="blue" className="">
          <p>
            자격증의 진위 여부는 자격검증 페이지에서 자격번호와 본인확인 정보를 통해 확인할 수 있습니다.
          </p>
      </InfoCallout>
      <InfoCallout tone="blue" className="">
          <p>
            실물 자격증이 필요하신 경우 문의하기로 신청해주세요.{' '}
            <button
              type="button"
              onClick={requestPhysicalCopy}
              className="text-blue-500 font-semibold underline underline-offset-2 bg-transparent border-none cursor-pointer hover:text-blue-700 p-0"
              style={{ fontFamily: 'inherit', fontSize: 'inherit' }}
            >
              바로가기
            </button>
          </p>
      </InfoCallout>
      <InfoCallout tone="red" className="mb-6">
          <p>
            AXIS 자격의 유효기간은 취득일로부터 3년입니다. 갱신은 상위 등급 취득 또는 무상 보수교육 이수로 가능합니다.
          </p>
      </InfoCallout>

      <div className={TABLE_WRAP}>
        <table className="data-table" style={{ minWidth: 940 }}>
          <thead>
            <tr>
              <th style={{ width: 200 }}>시험명</th>
              <th style={{ width: 240 }}>자격번호</th>
              <th style={{ width: 140 }}>취득일</th>
              <th style={{ width: 250 }}>유효기간</th>
              <th style={{ width: 200 }}>인증서발급</th>
            </tr>
          </thead>
          <tbody>
            {data.certificates.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-muted py-8">
                  You don&apos;t have any certificates yet. Pass an exam to issue one.
                </td>
              </tr>
            ) : (
              data.certificates.map((c) => (
                <tr key={c.sessionId}>
                  <td>
                    <span className="text-ink font-semibold">{certLabel(c.certType, c.level)}</span>
                  </td>
                  <td className="text-muted font-en">{c.certNumber}</td>
                  <td className="text-muted">{formatExamDate(c.issuedAt)}</td>
                  <td className="text-muted">
                    {formatExamDate(c.issuedAt)} ~ {formatExamDate(c.validUntil)}
                    <span className="text-light ml-1">(3년)</span>
                  </td>
                  <td>
                    <div className="inline-flex items-center gap-1.5 flex-wrap">
                      <Btn variant="primary" className="btn-sm bg-blue-500" onClick={() => openCertificate(c)}>
                        {t('mypage.act.pdfDownload' as never)}
                      </Btn>
                      <Btn variant="blue" className="btn-sm" onClick={() => setBadgeFor(c)}>
                        {t('mypage.act.digitalBadge' as never)}
                      </Btn>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <DigitalBadgeModal
        open={!!badgeFor}
        cert={badgeFor}
        onClose={() => setBadgeFor(null)}
      />
    </>
  );
}
