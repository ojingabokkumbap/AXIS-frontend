import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { SiteHeader } from '@/components/marketing/SiteHeader';
import { SiteFooter } from '@/components/marketing/SiteFooter';
import { PageHeroSolid } from '@/components/marketing/PageHeroSolid';
import { PageTabs } from '@/components/marketing/PageTabs';
import { ResultModal, ResultModalEmpty, ResultModalRows } from '@/components/ResultModal';
import { resultsApi, type PublicPassListResponse, type PublicRoundRow } from '@/services/api';
import { InfoCallout } from '@/components/InfoCallout';

/* ─────────────────────────────────────────────────────────────
   Design tokens — AboutPage / CertGuidePage / QnAPage와 동일
   ───────────────────────────────────────────────────────────── */
const INK_900 = '#191919';
const GRAY_500 = '#525252';
const H_CARD = 'text-[21px] lg:text-[26px] font-semibold leading-[1.3] tracking-[-0.02em]';
const T_BODY = 'text-[16px] lg:text-[19px] leading-[1.85] tracking-[-0.005em]';
const TABLE_WRAP = 'w-full overflow-x-auto border-t-2 border-ink mt-4 mb-2';
const FIELD_INPUT =
  'w-full min-h-[44px] sm:min-h-[48px] rounded-md border bg-white px-3 py-2.5 sm:px-4 text-[16px] sm:text-[15px] lg:text-[18px] text-ink placeholder:text-faint focus-visible:outline-2 focus-visible:outline-blue focus-visible:outline-offset-2';

type FilterTab = 'AXIS' | 'AXIS-C' | 'AXIS-H';

type ResultsTab = 'sessions' | 'lookup';

const RESULTS_LABELS: Record<ResultsTab, string> = {
  sessions: '회차 결과',
  lookup: '성적 조회',
};

function formatExamDateKst(iso: string): string {
  const s = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(iso));
  return s.replace(/-/g, '.');
}

function formatRoundCertLabel(certType: 'AXIS' | 'AXIS_C' | 'AXIS_H', level: string): string {
  const track = certType.replace('_', '-');
  const tier = level === 'L3' ? 'Starter' : level === 'L2' ? 'Practitioner' : 'Leader';
  return `${track} ${level} ${tier}`;
}

function filterTabToCertType(tab: FilterTab): 'AXIS' | 'AXIS_C' | 'AXIS_H' {
  if (tab === 'AXIS') return 'AXIS';
  if (tab === 'AXIS-C') return 'AXIS_C';
  return 'AXIS_H';
}

type LookupState =
  | { step: 'idle' }
  | { step: 'checking' }
  | { step: 'pass'; score: number; cut: number; sections: { name: string; score: number; max: number }[] }
  | { step: 'fail'; score: number; cut: number; sections: { name: string; score: number; max: number }[] }
  | { step: 'not-found' };

type LookupModalResult = Exclude<LookupState, { step: 'idle' } | { step: 'checking' }>;

function LookupResultModalView({ result, onClose }: { result: LookupModalResult; onClose: () => void }) {
  if (result.step === 'not-found') {
    return (
      <ResultModal title="조회 결과" onClose={onClose}>
        <ResultModalEmpty
          message="입력하신 접수번호와 이름에 해당하는 결과를 찾을 수 없습니다."
          helperText={
            <>
              접수번호와 이름을 다시 확인해주세요. 문의사항은{' '}
              <Link to="/qna" className="font-semibold" style={{ color: 'var(--color-blue)' }}>1:1 문의</Link>를 이용해주세요.
            </>
          }
        />
      </ResultModal>
    );
  }

  const passed = result.step === 'pass';
  return (
    <ResultModal title={passed ? '합격 결과' : '불합격 결과'} headerBg={passed ? '#059669' : '#6B7280'} onClose={onClose}>
      <ResultModalRows
        description={
          passed ? '축하합니다. 아래 성적으로 합격하셨습니다.' : '이번 시험에서는 합격 기준에 미달하였습니다.'
        }
        descriptionColor={passed ? '#059669' : '#374151'}
        rows={[
          { label: '판정', value: passed ? '합격' : '불합격', valueClass: 'font-semibold' },
          { label: '평균 점수', value: `${result.score}점`, valueClass: 'font-en font-semibold' },
          { label: '합격 기준', value: `${result.cut}점 이상`, valueClass: 'font-en' },
          ...result.sections.map((sec) => ({
            label: sec.name,
            value: `${sec.score}/${sec.max}`,
            valueClass: 'font-en',
          })),
        ]}
      />
    </ResultModal>
  );
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-8 left-4 right-4 text-center sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:text-left z-50 px-6 py-3 rounded-lg text-[14px] font-medium"
      style={{ background: 'var(--color-ink)', color: '#fff' }}>
      {message}
    </div>
  );
}

const ROUNDS_PAGE_SIZE = 10;
const MODAL_ENTRY_PAGE_SIZE = 12;

function RoundsPaginationBar({
  meta,
  onPageChange,
  disabled,
}: {
  meta: { total: number; page: number; pageSize: number; totalPages: number };
  onPageChange: (p: number) => void;
  disabled?: boolean;
}) {
  const { page, totalPages } = meta;
  if (totalPages <= 0) return null;

  const btnBase =
    'min-w-[2.25rem] h-8.5 px-3 rounded-full text-[13px] font-medium border transition-colors disabled:opacity-40 disabled:cursor-not-allowed';
  const btnIdle = 'border-none text-ink hover:bg-[#F8FAFC]';
  const btnActive = 'bg-blue-500 text-white';

  const windowPages = (): number[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = new Set<number>();
    pages.add(1);
    pages.add(totalPages);
    for (let d = -2; d <= 2; d++) {
      const p = page + d;
      if (p >= 1 && p <= totalPages) pages.add(p);
    }
    return [...pages].sort((a, b) => a - b);
  };

  const nums = windowPages();
  const segments: (number | '…')[] = [];
  for (let i = 0; i < nums.length; i++) {
    const n = nums[i];
    const prev = nums[i - 1];
    if (i > 0 && prev !== undefined && n > prev + 1) segments.push('…');
    segments.push(n);
  }

  return (
    <nav className="flex flex-wrap items-center justify-center gap-1 pt-4" aria-label="회차 목록 페이지">
      <button
        type="button"
        disabled={disabled || page <= 1}
        className={`${btnBase} ${btnIdle}`}
        onClick={() => onPageChange(1)}
      >
        «
      </button>
      {segments.map((seg, idx) =>
        seg === '…' ? (
          <span key={`e-${idx}`} className="px-1 text-muted text-[13px]">
            …
          </span>
        ) : (
          <button
            key={seg}
            type="button"
            disabled={disabled}
            className={`${btnBase} ${seg === page ? btnActive : btnIdle}`}
            onClick={() => onPageChange(seg)}
          >
            {seg}
          </button>
        ),
      )}
      <button
        type="button"
        disabled={disabled || page >= totalPages}
        className={`${btnBase} ${btnIdle}`}
        onClick={() => onPageChange(totalPages)}
      >
        »
      </button>
    </nav>
  );
}

export default function ResultsPage() {
  const mainRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<ResultsTab>('sessions');
  const [filterTrack, setFilterTrack] = useState<FilterTab>('AXIS');
  const [roundsPage, setRoundsPage] = useState(1);
  const [roundRows, setRoundRows] = useState<PublicRoundRow[]>([]);
  const [roundsMeta, setRoundsMeta] = useState<{
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  } | null>(null);
  const [roundsLoading, setRoundsLoading] = useState(false);
  const [roundsError, setRoundsError] = useState<string | null>(null);
  const [modalEntryPage, setModalEntryPage] = useState(1);
  const [passModal, setPassModal] = useState<
    | { scheduleId: string; loading: true }
    | { scheduleId: string; loading: false; data: PublicPassListResponse }
    | { scheduleId: string; loading: false; error: string }
    | null
  >(null);
  const [regNo, setRegNo] = useState('');
  const [name, setName] = useState('');
  const [lookup, setLookup] = useState<LookupState>({ step: 'idle' });
  const [lookupModalOpen, setLookupModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
    );
    const container = mainRef.current;
    if (container) {
      container.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    }
    return () => obs.disconnect();
  }, [activeTab, roundRows.length]);

  const filterTabs: FilterTab[] = ['AXIS', 'AXIS-C', 'AXIS-H'];

  useEffect(() => {
    if (activeTab !== 'sessions') return;
    let cancelled = false;
    setRoundsLoading(true);
    setRoundsError(null);
    resultsApi
      .publicRounds({
        certType: filterTabToCertType(filterTrack),
        page: roundsPage,
        pageSize: ROUNDS_PAGE_SIZE,
      })
      .then((res) => {
        if (cancelled) return;
        const d = res.data;
        if (d.total > 0 && d.items.length === 0 && d.page > 1) {
          setRoundsPage(1);
          return;
        }
        setRoundRows(d.items);
        setRoundsMeta({
          total: d.total,
          page: d.page,
          pageSize: d.pageSize,
          totalPages: d.totalPages,
        });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const code =
            err && typeof err === 'object' && 'response' in err
              ? (err as { response?: { status?: number } }).response?.status
              : undefined;
          setRoundsError(
            code === 500
              ? '서버에서 회차 집계 중 오류가 발생했습니다. 잠시 후 다시 시도하거나 고객센터로 문의해 주세요.'
              : '회차 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
          );
          setRoundRows([]);
          setRoundsMeta(null);
        }
      })
      .finally(() => {
        if (!cancelled) setRoundsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab, filterTrack, roundsPage]);

  const openPassList = (scheduleId: string) => {
    setModalEntryPage(1);
    setPassModal({ scheduleId, loading: true });
    resultsApi
      .publicPassList(scheduleId)
      .then((res) => {
        setPassModal({ scheduleId, loading: false, data: res.data });
      })
      .catch(() => {
        setPassModal({
          scheduleId,
          loading: false,
          error: '합격자 명단을 불러오지 못했습니다.',
        });
      });
  };

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNo.trim() || !name.trim()) {
      setToast('접수번호와 이름을 모두 입력해주세요.');
      return;
    }
    setLookup({ step: 'checking' });
    setTimeout(() => {
      const isMatch = regNo.trim().toUpperCase().startsWith('AXIS') && name.trim().length >= 2;
      if (isMatch) {
        const passed = regNo.includes('0001') || regNo.includes('0142');
        const sections = [
          { name: 'AI 기초 이해', score: passed ? 82 : 35, max: 100 },
          { name: '프롬프트 설계', score: passed ? 78 : 28, max: 100 },
          { name: 'AI 도구 활용', score: passed ? 91 : 42, max: 100 },
          { name: '윤리·보안', score: passed ? 88 : 30, max: 100 },
        ];
        const total = sections.reduce((a, s) => a + s.score, 0);
        const avg = Math.round(total / sections.length);
        if (passed) {
          setLookup({ step: 'pass', score: avg, cut: 60, sections });
        } else {
          setLookup({ step: 'fail', score: avg, cut: 60, sections });
        }
        setLookupModalOpen(true);
      } else {
        setLookup({ step: 'not-found' });
        setLookupModalOpen(true);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen " style={{ color: 'var(--color-body)' }}>
      <SiteHeader active="announce" />

      <PageHeroSolid
        title="합격자 발표"
        subtitle="회차별 결과 · 합격 여부 · 성적 조회"
      />

      <PageTabs
        tabs={(['sessions', 'lookup'] as ResultsTab[]).map((k) => ({ key: k, label: RESULTS_LABELS[k] }))}
        active={activeTab}
        onChange={(k) => setActiveTab(k)}
      />

      <main ref={mainRef} className="mx-auto py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 max-lg:break-keep" style={{ maxWidth: 'var(--spacing-content-w)' }}>

        {activeTab === 'sessions' && (
          <>
            {/* Filter Chips + Session List */}
            <section className="mb-10 sm:mb-14 reveal">
              <h2 className={`${H_CARD} mb-4`} style={{ color: INK_900 }}>회차별 결과</h2>
              <p className={`${T_BODY} mb-2`} style={{ color: GRAY_500 }}>
                발표가 완료된 회차는 <strong className="text-ink">확정 접수 인원</strong>과{' '}
                <strong className="text-ink">합격·불합격</strong> 집계를 보여 드립니다. 채점 중인 회차는 접수 인원만 표시됩니다.
              </p>

              <div className="mb-10">
                <InfoCallout tone="blue">
                  <p>
                    시험 종료 후 L3은 1시간 이내, L2는 3일 이내, L1은 7일 이내에 성적이 공개됩니다. 정확한 발표일은 시험 접수 시 안내됩니다.
                  </p>
                </InfoCallout>
                <InfoCallout tone="blue">
                  <p>
                    확정 접수는 결제 완료 및 시험 종료 접수를 기준으로 합니다. 합격·불합격은 채점이 끝난 최종 응시(재응시 포함) 기준입니다.
                  </p>
                </InfoCallout>
                <InfoCallout tone="blue">
                  <p>
                    실습형 과제(L2·L1)는 AI 1차 채점 후 전문가 검수를 거치므로 다소 시간이 소요될 수 있습니다.
                  </p>
                </InfoCallout>
              </div>

              <div className="flex items-center mb-10 w-full border border-gray-300 divide-x divide-gray-300">
                {filterTabs.map((tab) => {
                  const active = filterTrack === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => {
                        setFilterTrack(tab);
                        setRoundsPage(1);
                      }}
                      className={`flex-1 px-2 sm:px-4 py-3 text-[15px] sm:text-[17px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                        active
                          ? 'bg-blue-500 text-white'
                          : ' text-gray-500 hover:text-ink'
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>

              {roundsError && (
                <p className="text-[14px] text-red-600 mb-4">{roundsError}</p>
              )}



              <div className={`${TABLE_WRAP} hidden md:block`} aria-busy={roundsLoading}>
                <table className="data-table" style={{ minWidth: 940 }}>
                  <thead>
                    <tr>
                      <th style={{ width: 100 }}>회차</th>
                      <th style={{ width: 220 }}>자격</th>
                      <th style={{ width: 160 }}>시험일</th>
                      <th style={{ width: 100 }}>상태</th>
                      <th style={{ width: 120 }} className="text-center">
                        접수 인원
                      </th>
                      <th style={{ width: 88 }} className="text-right">
                        합격
                      </th>
                      <th style={{ width: 88 }} className="text-right">
                        불합격
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {roundRows.map((s) => {
                      const announced = s.publicationState === 'announced';
                      const graded = announced && s.passCount != null && s.failCount != null;
                      const pending =
                        announced && s.passCount != null && s.failCount != null
                          ? Math.max(0, s.registeredCount - (s.passCount + s.failCount))
                          : 0;
                      return (
                        <tr key={s.scheduleId}>
                          <td className="text-muted font-en">
                            {s.roundNumber}회차
                          </td>
                          <td>
                            <span className="text-ink text-center font-semibold">
                              {formatRoundCertLabel(s.certType, s.level)}
                            </span>
                          </td>
                          <td className="text-muted">{formatExamDateKst(s.examDate)}</td>
                          <td>
                            {s.publicationState === 'announced' ? (
                              <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-2">
                                <span
                                  className="text-[13px] font-semibold"
                                  style={{ color: 'var(--color-status-success)' }}
                                >
                                  발표 완료
                                </span>
                                <button
                                  type="button"
                                  className="btn-text btn-sm"
                                  onClick={() => openPassList(s.scheduleId)}
                                >
                                  상세보기 →
                                </button>
                              </div>
                            ) : s.publicationState === 'grading' ? (
                              <span
                                className="text-[13px] font-semibold"
                                style={{ color: 'var(--color-status-grading)' }}
                              >
                                채점 중
                              </span>
                            ) : (
                              <span className="text-[13px] font-semibold text-faint">발표 예정</span>
                            )}
                          </td>
                          <td className="text-center">
                            <span style={{ fontFamily: 'var(--font-en)' }}>
                              {s.registeredCount}
                              <span className="text-faint text-[13px]">명</span>
                            </span>
                            {pending > 0 && (
                              <div className="text-[11px] text-muted mt-0.5 leading-tight">
                                미채점 {pending}명
                              </div>
                            )}
                          </td>
                          <td className="text-right">
                            {graded ? (
                              <span
                                className="inline-block min-w-[2.5rem] rounded-md px-2 py-1 text-[13px] font-semibold font-en"
                                style={{
                                  background: 'rgba(5, 150, 105, 0.12)',
                                  color: 'var(--color-status-success)',
                                }}
                              >
                                {s.passCount}
                              </span>
                            ) : null}
                          </td>
                          <td className="text-right">
                            {graded ? (
                              <span
                                className="inline-block min-w-[2.5rem] rounded-md px-2 py-1 text-[13px] font-semibold font-en"
                                style={{
                                  background: 'rgba(148, 163, 184, 0.2)',
                                  color: 'var(--color-muted)',
                                }}
                              >
                                {s.failCount}
                              </span>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })}
                    {roundsLoading && roundRows.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center text-muted py-8">
                          불러오는 중…
                        </td>
                      </tr>
                    )}
                    {!roundsLoading && roundRows.length === 0 && !roundsError && (
                      <tr>
                        <td colSpan={7} className="text-center text-muted py-8">
                          해당 자격의 발표된 회차가 없습니다.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile: stacked cards (same data as the table) */}
              <div className="md:hidden border-t-2 border-ink mt-4 mb-2" aria-busy={roundsLoading}>
                {roundRows.map((s) => {
                  const announced = s.publicationState === 'announced';
                  const graded = announced && s.passCount != null && s.failCount != null;
                  const pending =
                    announced && s.passCount != null && s.failCount != null
                      ? Math.max(0, s.registeredCount - (s.passCount + s.failCount))
                      : 0;
                  return (
                    <div key={s.scheduleId} className="border-b border-border py-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[13px] text-muted font-en">{s.roundNumber}회차</span>
                        <span className="text-[13px] text-muted">{formatExamDateKst(s.examDate)}</span>
                      </div>
                      <div className="mt-1 text-[15.5px] font-semibold text-ink">
                        {formatRoundCertLabel(s.certType, s.level)}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        {s.publicationState === 'announced' ? (
                          <>
                            <span
                              className="text-[13px] font-semibold"
                              style={{ color: 'var(--color-status-success)' }}
                            >
                              발표 완료
                            </span>
                            <button
                              type="button"
                              className="btn-text btn-sm"
                              onClick={() => openPassList(s.scheduleId)}
                            >
                              상세보기 →
                            </button>
                          </>
                        ) : s.publicationState === 'grading' ? (
                          <span
                            className="text-[13px] font-semibold"
                            style={{ color: 'var(--color-status-grading)' }}
                          >
                            채점 중
                          </span>
                        ) : (
                          <span className="text-[13px] font-semibold text-faint">발표 예정</span>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px]">
                        <span className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 bg-[#F8FAFC]">
                          <span className="text-muted">접수</span>
                          <strong className="font-en text-ink">{s.registeredCount}</strong>
                          <span className="text-faint">명</span>
                        </span>
                        {graded && (
                          <>
                            <span
                              className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-semibold font-en"
                              style={{
                                background: 'rgba(5, 150, 105, 0.12)',
                                color: 'var(--color-status-success)',
                              }}
                            >
                              합격 {s.passCount}
                            </span>
                            <span
                              className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-semibold font-en"
                              style={{
                                background: 'rgba(148, 163, 184, 0.2)',
                                color: 'var(--color-muted)',
                              }}
                            >
                              불합격 {s.failCount}
                            </span>
                          </>
                        )}
                        {pending > 0 && (
                          <span className="text-[12px] text-muted">미채점 {pending}명</span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {roundsLoading && roundRows.length === 0 && (
                  <p className="text-center text-muted py-8 text-[14px]">불러오는 중…</p>
                )}
                {!roundsLoading && roundRows.length === 0 && !roundsError && (
                  <p className="text-center text-muted py-8 text-[14px]">해당 자격의 발표된 회차가 없습니다.</p>
                )}
              </div>

              {roundsLoading && roundRows.length > 0 && (
                <p className="text-[14px] text-muted mt-3">불러오는 중…</p>
              )}

              {roundsMeta != null && roundsMeta.totalPages > 0 && (
                <RoundsPaginationBar
                  meta={roundsMeta}
                  disabled={roundsLoading}
                  onPageChange={setRoundsPage}
                />
              )}
            </section>
          </>
        )}

        {activeTab === 'lookup' && (
          <section className="mb-10 sm:mb-14 reveal">
            <h2 className={`${H_CARD} text-black mb-4`} >내 결과 확인</h2>
            <p className={`${T_BODY} mb-6`} style={{ color: GRAY_500 }}>
              접수번호와 이름으로 본인의 시험 결과를 조회할 수 있습니다.
              로그인 상태라면 <Link to="/mypage" className="font-semibold text-ink underline underline-offset-4">마이페이지</Link>에서도 확인 가능합니다.
            </p>

            <section className="mb-10 sm:mb-16 lg:mb-24 reveal py-5 px-4 sm:py-8 sm:px-6 lg:py-10 lg:px-12 rounded-md border border-[#e5e7eb]" style={{ background: '#f3f4f5' }}>
              <form onSubmit={handleLookup} className="min-w-0">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                  <label className="block flex-1 min-w-0">
                    <span className="mb-2 block text-[14px] sm:text-[15px] lg:text-[16px] font-semibold tracking-[-0.005em] text-black">
                      접수번호
                    </span>
                    <input
                      type="text"
                      inputMode="text"
                      autoComplete="off"
                      autoCapitalize="characters"
                      spellCheck={false}
                      value={regNo}
                      onChange={e => setRegNo(e.target.value)}
                      placeholder="예: AXIS-2026-L3-0142"
                      className={`${FIELD_INPUT} font-en`}
                      style={{ borderColor: '#e5e7eb', background: '#ffffff' }}
                    />
                  </label>
                  <label className="block flex-1 min-w-0">
                    <span className="mb-2 block text-[14px] sm:text-[15px] lg:text-[16px] font-semibold tracking-[-0.005em] text-black">
                      이름
                    </span>
                    <input
                      type="text"
                      inputMode="text"
                      autoComplete="name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="홍길동"
                      className={FIELD_INPUT}
                      style={{ borderColor: '#e5e7eb', background: '#ffffff' }}
                    />
                  </label>
                </div>
                <div className="flex items-center justify-center px-1 sm:px-10 pt-5 sm:pt-8">
                  <button
                    type="submit"
                    className="btn-primary !bg-blue-500 w-full sm:max-w-[200px] min-h-[48px] !text-[16px] sm:!text-[18px] touch-manipulation"
                    disabled={lookup.step === 'checking'}
                  >
                    {lookup.step === 'checking' ? '조회 중...' : '조회하기'}
                  </button>
                </div>
              </form>
            </section>

            <section className="mb-10 sm:mb-14 reveal">
              <h2 className={`${H_CARD} mb-4`} style={{ color: INK_900 }}>채점 및 합격 기준</h2>
              <p className={`${T_BODY} mb-5`} style={{ color: GRAY_500 }}>
                AXIS의 채점 방식과 합격 기준을 안내합니다.
              </p>
              <div className="hidden md:block w-full overflow-x-auto border-t-2 border-ink mt-4 mb-2">
                <table className="data-table" style={{ minWidth: 600 }}>
                  <thead>
                    <tr>
                      <th style={{ width: 160 }}>등급</th>
                      <th>평가 구성</th>
                      <th>합격 기준</th>
                      <th>채점 방식</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <strong>L3</strong>
                        <div className="text-[12.5px] text-light mt-0.5">(Starter)</div>
                      </td>
                      <td>객관식 40 + 실습 4</td>
                      <td>70점 이상</td>
                      <td>AI 자동채점 · 1시간 이내 발표</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>L2</strong>
                        <div className="text-[12.5px] text-light mt-0.5">(Practitioner)</div>
                      </td>
                      <td>사례형 객관식 30 + 실습 3과제</td>
                      <td>70점 이상</td>
                      <td>AI 1차 + 전문가 검수 · 3일 이내</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>L1</strong>
                        <div className="text-[12.5px] text-light mt-0.5">(Leader)</div>
                      </td>
                      <td>객관식 25 + 실행계획서 + 서술형 2</td>
                      <td>70점 이상</td>
                      <td>전문가 채점 · 관리자 확정 · 7일 이내</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Mobile: stacked cards (same data as the table) */}
              <div className="md:hidden border-t-2 border-ink mt-4 mb-2">
                {[
                  { level: 'L3', tier: 'Starter', comp: '객관식 40 + 실습 4', cut: '70점 이상', method: 'AI 자동채점 · 1시간 이내 발표' },
                  { level: 'L2', tier: 'Practitioner', comp: '사례형 객관식 30 + 실습 3과제', cut: '70점 이상', method: 'AI 1차 + 전문가 검수 · 3일 이내' },
                  { level: 'L1', tier: 'Leader', comp: '객관식 25 + 실행계획서 + 서술형 2', cut: '70점 이상', method: '전문가 채점 · 관리자 확정 · 7일 이내' },
                ].map((row) => (
                  <div key={row.level} className="border-b border-border py-4">
                    <div className="text-[15.5px] text-ink">
                      <strong>{row.level}</strong>{' '}
                      <span className="text-[12.5px] text-light">({row.tier})</span>
                    </div>
                    <div className="mt-2 space-y-1.5 text-[14px]">
                      <div className="flex gap-2">
                        <span className="w-[70px] shrink-0 text-[12.5px] text-muted pt-0.5">평가 구성</span>
                        <span>{row.comp}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="w-[70px] shrink-0 text-[12.5px] text-muted pt-0.5">합격 기준</span>
                        <span>{row.cut}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="w-[70px] shrink-0 text-[12.5px] text-muted pt-0.5">채점 방식</span>
                        <span>{row.method}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[13px] text-light mt-3">※ 각주 : 합격은 총점 70점 이상, 실습형 최소기준 미달 시 별도 검토.</p>
            </section>
            <div className="w-10 h-px bg-border mb-10 sm:mb-14" />

            <section className="mb-10 sm:mb-14 reveal">
              <h2 className={`${H_CARD} mb-4`} style={{ color: INK_900 }}>이의신청 안내</h2>
              <p className={`${T_BODY} mb-4`} style={{ color: GRAY_500 }}>
                시험 결과에 이의가 있는 경우, 성적 발표일로부터 <strong className="text-ink font-semibold">7일 이내</strong>에 이의신청을 할 수 있습니다.
              </p>
              <p className={`${T_BODY} mb-4`} style={{ color: GRAY_500 }}>
                이의신청은 1:1 문의를 통해 접수하며, 접수번호·이름·이의 사유를 기재해주세요.
                접수 후 <strong className="text-ink font-semibold">14영업일 이내</strong>에 재검토 결과를 개별 안내드립니다.
              </p>
              <p className={`${T_BODY} mb-5`} style={{ color: GRAY_500 }}>
                객관식 문항의 정답 이의, 실습 과제의 채점 기준 이의 모두 접수 가능합니다.
                단, 주관적 평가 항목의 경우 채점 기준표에 근거한 재검토가 이루어지며, 단순 점수 불만은 처리되지 않습니다.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link to="/qna" className="btn-primary">이의신청 하기 →</Link>
                <Link to="/guide" className="btn-secondary">채점 기준 상세 →</Link>
              </div>
            </section>
          </section>
        )}

      </main>

      {passModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pass-modal-title"
          onClick={() => setPassModal(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 id="pass-modal-title" className="text-[17px] font-extrabold text-ink">
                합격자 명단
              </h2>
              <button
                type="button"
                className="text-faint hover:text-ink text-[22px] leading-none px-2"
                onClick={() => setPassModal(null)}
                aria-label="닫기"
              >
                ×
              </button>
            </div>
            <div className="px-5 py-4 overflow-y-auto flex-1 text-[14px]">
              {passModal.loading && <p className="text-muted">불러오는 중…</p>}
              {!passModal.loading && 'error' in passModal && (
                <p className="text-red-600">{passModal.error}</p>
              )}
              {!passModal.loading && 'data' in passModal && (() => {
                const entries = passModal.data.entries;
                const modalTotalPages = Math.max(1, Math.ceil(entries.length / MODAL_ENTRY_PAGE_SIZE));
                const safeModalPage = Math.min(modalEntryPage, modalTotalPages);
                const start = (safeModalPage - 1) * MODAL_ENTRY_PAGE_SIZE;
                const pageEntries = entries.slice(start, start + MODAL_ENTRY_PAGE_SIZE);
                return (
                <>
                  <p className="font-semibold text-ink mb-1">{passModal.data.schedule.labelRound}</p>
                  <p className="text-muted text-[13px] mb-3">
                    시험일 {formatExamDateKst(passModal.data.schedule.examDate)}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4 text-[12px]">
                    <span
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 bg-[#F8FAFC]"
                      title="결제·확정 접수"
                    >
                      <span className="text-muted">확정 접수</span>
                      <strong className="font-en text-ink">{passModal.data.summary.registeredCount}</strong>
                      <span className="text-muted">명</span>
                    </span>
                    <span
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5"
                      style={{ background: 'rgba(5, 150, 105, 0.12)', color: 'var(--color-status-success)' }}
                    >
                      <span className="font-medium">합격</span>
                      <strong className="font-en">{passModal.data.summary.passCount}</strong>
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-muted" style={{ background: '#F1F5F9' }}>
                      <span className="font-medium">불합격</span>
                      <strong className="font-en text-ink">{passModal.data.summary.failCount}</strong>
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-lg border border-dashed border-border px-2.5 py-1.5 text-muted">
                      채점 완료 <strong className="font-en text-ink">{passModal.data.summary.gradedCount}</strong>명
                    </span>
                  </div>
                  <p className="text-[12px] text-muted mb-3">
                    접수번호 일부만 표시됩니다. 본인 확인은 성적 조회에서 진행해 주세요.
                  </p>
                  <table className="data-table w-full text-[13px]">
                    <thead>
                      <tr>
                        <th>접수번호</th>
                        <th className="text-right">결과</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.length === 0 ? (
                        <tr>
                          <td colSpan={2} className="text-center text-muted py-6">
                            등록된 합격 처리 데이터가 없습니다.
                          </td>
                        </tr>
                      ) : (
                        pageEntries.map((row, idx) => (
                          <tr key={`${row.registrationNumberMasked}-${start + idx}`}>
                            <td className="font-mono">{row.registrationNumberMasked}</td>
                            <td className="text-right font-semibold">
                              {row.passed ? (
                                <span style={{ color: 'var(--color-status-success)' }}>합격</span>
                              ) : (
                                <span className="text-muted">불합격</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  {entries.length > MODAL_ENTRY_PAGE_SIZE && (
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-t border-border pt-3">
                      <p className="text-[12px] text-muted">
                        명단 <strong className="text-ink font-en">{entries.length}</strong>명 중{' '}
                        <strong className="text-ink font-en">{start + 1}</strong>–
                        <strong className="text-ink font-en">{Math.min(start + MODAL_ENTRY_PAGE_SIZE, entries.length)}</strong>
                        <span className="text-faint"> · </span>
                        {safeModalPage} / {modalTotalPages} 페이지
                      </p>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          className="rounded-lg border border-border bg-white px-2.5 py-1.5 text-[12px] font-medium text-ink disabled:opacity-40"
                          disabled={safeModalPage <= 1}
                          onClick={() => setModalEntryPage((p) => Math.max(1, p - 1))}
                        >
                          이전
                        </button>
                        <button
                          type="button"
                          className="rounded-lg border border-border bg-white px-2.5 py-1.5 text-[12px] font-medium text-ink disabled:opacity-40"
                          disabled={safeModalPage >= modalTotalPages}
                          onClick={() => setModalEntryPage((p) => Math.min(modalTotalPages, p + 1))}
                        >
                          다음
                        </button>
                      </div>
                    </div>
                  )}
                </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      <SiteFooter />

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      {lookupModalOpen && lookup.step !== 'idle' && lookup.step !== 'checking' && (
        <LookupResultModalView result={lookup} onClose={() => setLookupModalOpen(false)} />
      )}
    </div>
  );
}
