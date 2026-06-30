import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { InquiryCategory } from '@/services/api';
import { useI18n } from '@/i18n';
import {
  Badge,
  Btn,
  EmptyState,
  KebabMenu,
  SectionTitle,
} from '../primitives';
import { ScoreDetailModal } from '../SharedModals';
import {
  certLabel,
  formatAttemptSuffix,
  formatExamDate,
  formatExamRoundLabel,
  resultStatusBadge,
} from '../helpers';
import type { DashboardDto, ResultDto } from '../types';
import { InfoCallout } from '@/components/InfoCallout';

const TABLE_WRAP = 'w-full overflow-x-auto border-t-2 border-ink mt-4 mb-2';

function ResultsSection({ data }: { data: DashboardDto }) {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [scoreDetailFor, setScoreDetailFor] = useState<ResultDto | null>(null);

  const openConfirmation = (r: ResultDto) => {
    const url = `/mypage/confirmation/${encodeURIComponent(r.id)}`;
    const w = 860;
    const h = Math.min(1040, window.screen.availHeight - 40);
    const left = window.screenX + Math.max(0, (window.outerWidth - w) / 2);
    const top = window.screenY + Math.max(0, (window.outerHeight - h) / 2);
    const features = `popup=yes,width=${w},height=${h},left=${Math.round(left)},top=${Math.round(top)},resizable=yes,scrollbars=yes`;
    const popup = window.open(url, `axis-confirm-${r.id}`, features);
    if (!popup) window.open(url, '_blank', 'noopener');
    else popup.focus();
  };

  return (
    <>
      <SectionTitle title={t('sec.taken.title')} sub="" />

      <InfoCallout tone="blue" className="">
        <p>
          AI 채점은 최종 판정자가 아니라 1차 채점 보조입니다. 최종 점수와 합격 판정은 전문가 검수 및 관리자 확정을 거쳐 결정됩니다.
        </p>
      </InfoCallout>
      <InfoCallout tone="blue" className="mb-6">
        <p>자격증발급은 자격증발급 페이지에서 가능합니다.</p>
      </InfoCallout>

      <div className={TABLE_WRAP}>
        <table className="data-table" style={{ minWidth: 980 }}>
          <thead>
            <tr>
              <th style={{ width: 220 }}>{t('mypage.scores.col.exam')}</th>
              <th style={{ width: 120 }}>{t('mypage.scores.col.round')}</th>
              <th style={{ width: 130 }}>{t('mypage.scores.col.examDate')}</th>
              <th style={{ width: 130 }}>{t('mypage.scores.col.announced')}</th>
              <th style={{ width: 200 }}>{t('mypage.scores.col.score')}</th>
              <th style={{ width: 100 }}></th>
            </tr>
          </thead>
          <tbody>
            {data.results.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState description={t('mypage.scores.emptyHint')}>
                    {t('mypage.scores.empty')}
                  </EmptyState>
                </td>
              </tr>
            ) : (
              data.results.map((r) => {
                const badge = resultStatusBadge(r);
                const examDateText = r.submittedAt ? formatExamDate(r.submittedAt) : '—';
                const announcedText = r.gradedAt
                  ? formatExamDate(r.gradedAt)
                  : r.status === 'SUBMITTED'
                    ? t('mypage.scores.pending')
                    : '—';
                const attemptSuffix = formatAttemptSuffix(r.attemptNo, lang);

                return (
                  <tr key={r.id}>
                    <td>
                      <span className="text-ink font-semibold">
                        {certLabel(r.certType, r.level)}
                      </span>
                    </td>
                    <td className="text-muted">
                      <div className="font-en">{formatExamRoundLabel(r.roundNumber, r.scheduleYear, lang)}</div>
                      {attemptSuffix && (
                        <div className="text-[11px] text-[#9CA3AF] mt-0.5">{attemptSuffix}</div>
                      )}
                    </td>
                    <td className="text-muted text-[13px]">{examDateText}</td>
                    <td className="text-muted text-[13px]">{announcedText}</td>
                    <td>
                      <div className="inline-flex items-center gap-2 flex-wrap">
                        {r.totalScore != null && (
                          <span className="text-[15.5px] text-ink font-en">{r.totalScore}</span>
                        )}
                        <Badge tone={badge.tone}>{t(badge.labelKey)}</Badge>
                        <KebabMenu
                          items={[
                            { label: t('mypage.scores.detail'), onClick: () => setScoreDetailFor(r) },
                            {
                              label: t('mypage.scores.appeal'),
                              onClick: () =>
                                navigate('/qna', {
                                  state: {
                                    prefill: {
                                      category: 'EXAM' as InquiryCategory,
                                      title: `[Score Appeal] ${certLabel(r.certType, r.level)} · ${formatExamRoundLabel(r.roundNumber, r.scheduleYear, 'en')}`,
                                    },
                                  },
                                }),
                            },
                            {
                              label: t('mypage.scores.evidence'),
                              onClick: () => navigate(`/cbt/sessions/${r.id}/evidence`),
                            },
                          ]}
                        />
                      </div>
                    </td>
                    <td>
                      <Btn variant="blue" className="btn-sm" onClick={() => openConfirmation(r)}>
                        {t('mypage.act.confirmationPdf' as never)}
                      </Btn>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ScoreDetailModal
        open={!!scoreDetailFor}
        result={scoreDetailFor}
        onClose={() => setScoreDetailFor(null)}
      />
    </>
  );
}

export function ScoresPanel({ data }: { data: DashboardDto }) {
  return <ResultsSection data={data} />;
}
