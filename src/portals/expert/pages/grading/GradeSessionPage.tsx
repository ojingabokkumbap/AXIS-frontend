import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  Check,
  CheckCircle2,
  FileWarning,
  Loader2,
  ShieldAlert,
  Sparkles,
  XCircle,
} from 'lucide-react';
import {
  Button,
  Card,
  CertTag,
  certCodeOf,
  PageHeader,
  pushToast,
} from '@expert/components/shared/ui-kit';
import { expertApi, type DeliverableReview, type GradingDetail, type GradingTaskDetail } from '@expert/services/api';
import { ProctorEvidencePanel } from '@expert/components/grading/ProctorEvidencePanel';
import { AxiosError } from 'axios';

function bandPill(band: string | null): string {
  switch (band) {
    case 'excellent':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'normal':
      return 'bg-blue-50 text-blue-800 border-blue-200';
    case 'borderline':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'fail':
      return 'bg-rose-50 text-rose-800 border-rose-200';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200';
  }
}

function aiSuggestedPoints(task: GradingTaskDetail): number | null {
  if (task.aiPreScore == null || task.maxPoints <= 0) return null;
  return Math.max(0, Math.min(task.maxPoints, Math.round((task.aiPreScore / 100) * task.maxPoints)));
}

function isAiRationaleReady(text: string | null): boolean {
  if (!text?.trim()) return false;
  return !/pending|대기 중|manual or ai review/i.test(text);
}

export default function GradeSessionPage() {
  const { sessionId = '' } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<GradingDetail | null>(null);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [deliverableReviews, setDeliverableReviews] = useState<Record<string, DeliverableReview | null>>({});
  const [aiConfirmed, setAiConfirmed] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    expertApi
      .getDetail(sessionId)
      .then((res) => {
        const d = res.data;
        setDetail(d);
        const s: Record<string, string> = {};
        const n: Record<string, string> = {};
        const confirmed: Record<string, boolean> = {};
        const dr: Record<string, DeliverableReview | null> = {};
        for (const t of d.tasks) {
          const aiPts = aiSuggestedPoints(t);
          const init =
            t.expertScore ??
            (aiPts != null ? aiPts : 0);
          s[t.taskId] = String(init);
          n[t.taskId] = t.expertNotes ?? '';
          dr[t.taskId] = t.deliverableReview ?? null;
          if (t.expertScore != null && aiPts != null && t.expertScore === aiPts) {
            confirmed[t.taskId] = true;
          }
        }
        setScores(s);
        setNotes(n);
        setDeliverableReviews(dr);
        setAiConfirmed(confirmed);
      })
      .catch((e) =>
        setError((e as AxiosError<{ message?: string }>)?.response?.data?.message ?? '불러오기 실패'),
      );
  }, [sessionId]);

  const readOnly = detail?.status === 'GRADED';

  const applyAiScore = (task: GradingTaskDetail) => {
    const pts = aiSuggestedPoints(task);
    if (pts == null || readOnly) return;
    setScores((s) => ({ ...s, [task.taskId]: String(pts) }));
    setAiConfirmed((c) => ({ ...c, [task.taskId]: true }));
    pushToast(`AI 제안 ${pts}/${task.maxPoints}점을 적용했습니다`, 'green');
  };

  const onScoreChange = (taskId: string, value: string) => {
    setScores((s) => ({ ...s, [taskId]: value }));
    setAiConfirmed((c) => ({ ...c, [taskId]: false }));
  };

  const buildTaskPayload = () =>
    detail!.tasks.map((t) => ({
      taskId: t.taskId,
      expertScore: Math.max(0, Math.min(t.maxPoints, Number(scores[t.taskId] ?? 0))),
      expertNotes: notes[t.taskId]?.trim() || undefined,
      ...(t.part === 'DELIVERABLE' && deliverableReviews[t.taskId]
        ? { deliverableReview: deliverableReviews[t.taskId]! }
        : {}),
    }));

  const setDeliverableReview = (taskId: string, review: DeliverableReview) => {
    setDeliverableReviews((prev) => ({ ...prev, [taskId]: review }));
    if (review === 'rejected') {
      setScores((s) => ({ ...s, [taskId]: '0' }));
    }
    pushToast(review === 'accepted' ? '증빙 파일을 승인했습니다' : '증빙 파일을 반려했습니다', review === 'accepted' ? 'green' : 'orange');
  };

  const saveDraft = async () => {
    if (!detail) return;
    setSavingDraft(true);
    try {
      const res = await expertApi.saveDraft(sessionId, { tasks: buildTaskPayload() });
      pushToast(`임시 저장 완료 — ${res.data.scoredTasks}개 과제 저장됨`, 'green');
    } catch (e) {
      const msg = (e as AxiosError<{ message?: string | string[] }>)?.response?.data?.message;
      pushToast(Array.isArray(msg) ? msg.join(', ') : msg || '임시 저장 실패', 'red');
    } finally {
      setSavingDraft(false);
    }
  };

  const finalize = async () => {
    if (!detail) return;
    setBusy(true);
    try {
      const res = await expertApi.finalize(sessionId, { tasks: buildTaskPayload() });
      pushToast(
        `결과 게시 완료 — 총점 ${res.data.totalScore}/100 · ${res.data.passed ? '합격' : '불합격'}`,
        res.data.passed ? 'green' : 'orange',
      );
      navigate('/');
    } catch (e) {
      const msg = (e as AxiosError<{ message?: string | string[] }>)?.response?.data?.message;
      pushToast(Array.isArray(msg) ? msg.join(', ') : msg || '결과 게시 실패', 'red');
    } finally {
      setBusy(false);
    }
  };

  const isAxisC = detail?.certType === 'AXIS_C';

  return (
    <div className="max-w-[1400px]">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="axis-focus inline-flex items-center gap-1 text-[13px] text-[var(--gray-500)] hover:text-[var(--gray-800)] mb-2"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> 목록으로
      </button>

      <PageHeader
        title={readOnly ? '채점 상세 (확정됨)' : '실기 채점'}
        subtitle={
          detail
            ? `${detail.candidate} · ${detail.level} · 세션 ${detail.sessionId.slice(-12)}`
            : '세션 정보를 불러오는 중…'
        }
        actions={
          detail && (
            <div className="flex items-center gap-2">
              <CertTag code={certCodeOf(detail.certType)} />
              {detail.mandatoryReview && (
                <span className="inline-flex items-center gap-1 text-[12px] text-[var(--red)] bg-rose-50 border border-rose-200 rounded px-1.5 py-0.5">
                  <ShieldAlert className="w-3 h-3" /> 필수 검수
                </span>
              )}
            </div>
          )
        }
      />

      {error && (
        <Card className="p-4 mb-4 border-rose-200 bg-rose-50/40 text-sm text-rose-700">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        </Card>
      )}

      {!detail ? (
        <div className="py-16 flex justify-center text-[var(--gray-400)]">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <>
          <Card className="p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-indigo-50/40 border border-slate-200">
            <div>
              <div className="text-[12px] uppercase tracking-wide text-slate-500 mb-1">필기 점수</div>
              <div className="text-2xl font-bold text-slate-900">
                {detail.writtenScore != null ? `${detail.writtenScore}%` : '—'}
              </div>
            </div>
            <p className="text-[13px] text-slate-600 max-w-md leading-relaxed">
              <Sparkles className="w-3.5 h-3.5 inline -mt-0.5 mr-1 text-indigo-500" />
              AI 1차 채점은 참고용입니다. 제안 점수에 동의하면{' '}
              <span className="font-semibold text-indigo-700">확인</span>을 눌러 적용하거나 직접 수정하세요.
            </p>
          </Card>

          <ProctorEvidencePanel
            sessionId={detail.sessionId}
            proctorWarnings={detail.proctorWarnings}
            cheatingSuspect={detail.cheatingSuspect}
            events={detail.proctoringEvents}
          />

          <div className="space-y-6">
            {detail.tasks.map((t, i) => {
              const aiPts = aiSuggestedPoints(t);
              const hasAi = aiPts != null;
              const scoreMatchesAi =
                hasAi && Number(scores[t.taskId] ?? '') === aiPts;
              const confirmed = aiConfirmed[t.taskId] || scoreMatchesAi;
              const riskCount = Array.isArray(t.aiRiskFlags) ? (t.aiRiskFlags as unknown[]).length : 0;

              return (
                <Card key={t.taskId} className="overflow-hidden border border-slate-200 shadow-sm">
                  <div className="px-6 py-4 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 mb-1">
                        과제 {i + 1}
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900">{t.title}</h3>
                      <p className="text-[13px] text-slate-500 mt-0.5">
                        {t.part} · 만점 {t.maxPoints}점
                      </p>
                    </div>
                    {t.aiBand && (
                      <span
                        className={`inline-flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded-full border ${bandPill(t.aiBand)}`}
                      >
                        <Bot className="w-3.5 h-3.5" />
                        AI {t.aiBand}
                        {t.aiConfidence != null && (
                          <span className="opacity-75">
                            · 신뢰도 {(t.aiConfidence * 100).toFixed(0)}%
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 min-h-[420px]">
                    <div className="p-6 space-y-5 border-b xl:border-b-0 xl:border-r border-slate-100 bg-slate-50/30">
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                          시나리오
                        </div>
                        <div className="text-[14px] text-slate-700 whitespace-pre-wrap leading-relaxed max-h-44 overflow-y-auto rounded-xl bg-white border border-slate-200 p-4">
                          {t.scenario}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                          {isAxisC ? '제출 코드' : '응시자 답안'}
                        </div>
                        {isAxisC ? (
                          <pre className="text-[12px] font-mono leading-relaxed max-h-72 overflow-y-auto rounded-xl bg-slate-900 text-green-300 border border-slate-700 p-4 whitespace-pre-wrap">
                            {t.contentText || '(미제출)'}
                          </pre>
                        ) : (
                          <div className="text-[14px] text-slate-800 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto rounded-xl bg-white border border-slate-200 p-4 font-mono text-[13px]">
                            {t.contentText || '(미제출)'}
                          </div>
                        )}
                      </div>

                      {t.part === 'DELIVERABLE' && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4">
                          <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-amber-800 mb-2">
                            <FileWarning className="w-4 h-4" />
                            L1 증빙 파일 (열람 전용 · 다운로드 불가)
                          </div>
                          {t.hasAttachment ? (
                            <>
                              <p className="text-[13px] text-slate-700">
                                업로드됨:{' '}
                                <span className="font-medium">{t.attachmentFileName ?? '첨부파일'}</span>
                              </p>
                              <p className="text-[12px] text-slate-500 mt-1">
                                파일 내용은 다운로드할 수 없습니다. 메타정보와 답안을 바탕으로 승인/반려하세요.
                              </p>
                              {!readOnly && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                  <button
                                    type="button"
                                    onClick={() => setDeliverableReview(t.taskId, 'accepted')}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium border ${
                                      deliverableReviews[t.taskId] === 'accepted'
                                        ? 'bg-emerald-600 text-white border-emerald-600'
                                        : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50'
                                    }`}
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    승인
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeliverableReview(t.taskId, 'rejected')}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium border ${
                                      deliverableReviews[t.taskId] === 'rejected'
                                        ? 'bg-rose-600 text-white border-rose-600'
                                        : 'bg-white text-rose-700 border-rose-300 hover:bg-rose-50'
                                    }`}
                                  >
                                    <XCircle className="w-4 h-4" />
                                    반려
                                  </button>
                                </div>
                              )}
                              {readOnly && deliverableReviews[t.taskId] && (
                                <p className="text-[13px] mt-2 font-medium text-slate-700">
                                  처리: {deliverableReviews[t.taskId] === 'accepted' ? '승인' : '반려'}
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-[13px] text-slate-500">증빙 파일이 업로드되지 않았습니다.</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex flex-col gap-5 bg-white">
                      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-white p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div>
                            <div className="text-[13px] font-semibold text-slate-800">AI 1차 채점</div>
                            <div className="text-[11px] text-slate-500">참고용 — 최종 점수는 채점위원이 결정</div>
                          </div>
                        </div>

                        {hasAi ? (
                          <div className="flex flex-wrap items-stretch gap-4 mb-4">
                            <div className="flex-1 min-w-[140px] rounded-xl bg-white border border-indigo-200 px-5 py-4 shadow-sm">
                              <div className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 mb-1">
                                AI 제안 점수
                              </div>
                              <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-indigo-700">{aiPts}</span>
                                <span className="text-lg text-slate-400 font-medium">/ {t.maxPoints}</span>
                              </div>
                              {t.aiPreScore != null && (
                                <div className="text-[12px] text-slate-500 mt-1">
                                  ({t.aiPreScore}% · {t.aiBand ?? '—'})
                                </div>
                              )}
                            </div>

                            {!readOnly && (
                              <button
                                type="button"
                                onClick={() => applyAiScore(t)}
                                disabled={confirmed && scoreMatchesAi}
                                className={`flex flex-col items-center justify-center gap-2 min-w-[120px] px-4 py-3 rounded-xl border-2 transition-all ${
                                  confirmed && scoreMatchesAi
                                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800 cursor-default'
                                    : 'border-indigo-300 bg-indigo-600 text-white hover:bg-indigo-700 hover:border-indigo-400 shadow-md hover:shadow-lg'
                                }`}
                                title="AI 제안 점수를 내 점수에 적용"
                              >
                                {confirmed && scoreMatchesAi ? (
                                  <>
                                    <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                                    <span className="text-[12px] font-semibold">적용됨</span>
                                  </>
                                ) : (
                                  <>
                                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                      <Check className="w-6 h-6" strokeWidth={2.5} />
                                    </div>
                                    <span className="text-[13px] font-semibold">AI 점수 적용</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="rounded-xl bg-white/70 border border-dashed border-indigo-200 px-4 py-6 text-center text-[13px] text-slate-500 mb-4">
                            AI 1차 채점 대기 중입니다.
                          </div>
                        )}

                        {isAiRationaleReady(t.aiRationale) ? (
                          <div>
                            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                              AI 채점 근거
                            </div>
                            <p className="text-[14px] text-slate-700 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto rounded-xl bg-white/90 border border-indigo-100 p-4">
                              {t.aiRationale}
                            </p>
                          </div>
                        ) : (
                          t.aiRationale && (
                            <p className="text-[13px] text-slate-500 italic">{t.aiRationale}</p>
                          )
                        )}

                        {riskCount > 0 && (
                          <div className="mt-4 flex items-start gap-2 text-[13px] text-rose-800 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
                            <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>위험 플래그 {riskCount}건 — 반드시 확인하세요</span>
                          </div>
                        )}
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3">
                          채점위원 최종 점수
                        </div>
                        <div className="flex flex-wrap items-end gap-4">
                          <div>
                            <label
                              htmlFor={`score-${t.taskId}`}
                              className="block text-[12px] text-slate-600 mb-1.5"
                            >
                              점수 (0–{t.maxPoints})
                            </label>
                            <input
                              id={`score-${t.taskId}`}
                              type="number"
                              min={0}
                              max={t.maxPoints}
                              disabled={readOnly}
                              value={scores[t.taskId] ?? ''}
                              onChange={(e) => onScoreChange(t.taskId, e.target.value)}
                              className="w-32 h-12 border-2 border-slate-300 rounded-xl px-3 text-xl font-bold text-slate-900 text-center placeholder:text-slate-400 disabled:bg-slate-100 disabled:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
                            />
                          </div>
                          {hasAi && !readOnly && (
                            <p className="text-[12px] text-slate-500 pb-2">
                              AI 제안: <strong className="text-indigo-700">{aiPts}점</strong>
                              {scoreMatchesAi ? (
                                <span className="ml-2 text-emerald-600 font-medium">· AI와 일치</span>
                              ) : (
                                <span className="ml-2 text-amber-600">· 수동 조정 중</span>
                              )}
                            </p>
                          )}
                        </div>
                        <label
                          htmlFor={`notes-${t.taskId}`}
                          className="block text-[12px] font-semibold text-slate-600 mt-4 mb-1.5"
                        >
                          검수 메모
                        </label>
                        <textarea
                          id={`notes-${t.taskId}`}
                          disabled={readOnly}
                          value={notes[t.taskId] ?? ''}
                          onChange={(e) =>
                            setNotes((n) => ({ ...n, [t.taskId]: e.target.value }))
                          }
                          rows={4}
                          placeholder="채점 근거·감점 사유를 적어주세요"
                          className="w-full border border-slate-300 rounded-xl px-4 py-3 text-[14px] text-slate-900 placeholder:text-slate-400 disabled:bg-slate-100 disabled:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-2 mt-8 pb-4">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-sm bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg"
            >
              닫기
            </button>
            {!readOnly && (
              <>
                <button
                  type="button"
                  onClick={saveDraft}
                  disabled={savingDraft || busy}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 rounded-lg disabled:opacity-50"
                >
                  {savingDraft ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  임시 저장
                </button>
                <Button onClick={finalize} disabled={busy || savingDraft}>
                  {busy ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  결과 게시 (합/불 판정)
                </Button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
