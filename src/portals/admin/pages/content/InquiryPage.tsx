import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Bell, RefreshCw, Trash2 } from 'lucide-react';
import { useI18n } from '@admin/i18n';
import {
  adminApi,
  InquiryCategory,
  InquiryDetail,
  InquiryFilters,
  InquiryReply,
  InquiryRow,
  InquiryStats,
  InquiryStatus,
  Pagination as ApiPagination,
  parseInquiryContent,
  resolveAttachmentUrl,
} from '@admin/services/api';
import {
  Button,
  FilterBar,
  PageHeader,
  Pagination,
  Search,
  Select,
  SimpleKpiCard,
  Table,
  TableWrap,
  Td,
  Th,
} from '@admin/components/shared/ui-kit';
import { ContentSidePanel } from './components/ContentSidePanel';

const CATEGORY_OPTIONS: { value: InquiryCategory | ''; labelKo: string; labelEn: string }[] = [
  { value: '', labelKo: '전체', labelEn: 'All' },
  { value: 'REGISTRATION', labelKo: '접수 문의', labelEn: 'Registration' },
  { value: 'PAYMENT', labelKo: '결제 문의', labelEn: 'Payment' },
  { value: 'EXAM', labelKo: '시험 문의', labelEn: 'Exam' },
  { value: 'TECHNICAL', labelKo: '기술 문의', labelEn: 'Technical' },
  { value: 'CERTIFICATE', labelKo: '자격증 문의', labelEn: 'Certificate' },
  { value: 'OTHER', labelKo: '기타', labelEn: 'Other' },
];

const STATUS_OPTIONS: { value: InquiryStatus | ''; labelKo: string; labelEn: string }[] = [
  { value: '', labelKo: '전체', labelEn: 'All' },
  { value: 'PENDING', labelKo: '대기중', labelEn: 'Pending' },
  { value: 'ANSWERED', labelKo: '답변완료', labelEn: 'Answered' },
  { value: 'CLOSED', labelKo: '종료', labelEn: 'Closed' },
];

function formatListDate(value: string, lang: 'ko' | 'en'): string {
  const date = new Date(value);
  if (lang === 'ko') {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
  return date.toLocaleDateString('en-US');
}

function MessageBody({ content }: { content: string }) {
  const parts = parseInquiryContent(content);
  if (parts.length === 0) return null;

  return (
    <div className="space-y-2">
      {parts.map((part, index) => {
        if (part.type === 'text' && part.text) {
          return (
            <p key={index} className="whitespace-pre-wrap break-words text-[13px] leading-6 text-[var(--gray-700)]">
              {part.text}
            </p>
          );
        }

        if (part.type === 'attachment' && part.attachment) {
          return (
            <a
              key={index}
              href={resolveAttachmentUrl(part.attachment.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-[var(--gray-border)] px-3 py-2 text-[12px] text-[var(--gray-600)] hover:bg-[var(--gray-50)]"
            >
              <span className="font-medium">{part.attachment.filename}</span>
            </a>
          );
        }

        return null;
      })}
    </div>
  );
}

export default function InquiryPage() {
  const { t, lang } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const [stats, setStats] = useState<InquiryStats | null>(null);
  const [inquiries, setInquiries] = useState<InquiryRow[]>([]);
  const [pagination, setPagination] = useState<ApiPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [newInquiryAlert, setNewInquiryAlert] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryDetail | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const [statusFilter, setStatusFilter] = useState<InquiryStatus | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<InquiryCategory | ''>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const selectedInquiryIdRef = useRef<string | null>(null);

  useEffect(() => {
    selectedInquiryIdRef.current = selectedInquiry?.id ?? null;
  }, [selectedInquiry?.id]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await adminApi.getInquiryStats();
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const filters: InquiryFilters = {
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        search: search || undefined,
        page,
        limit: 15,
      };
      const res = await adminApi.getInquiries(filters);
      setInquiries(res.data.inquiries);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to fetch inquiries:', err);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, page, search, statusFilter]);

  const openInquiryById = useCallback(async (id: string) => {
    setDetailLoading(true);
    try {
      const res = await adminApi.getInquiryById(id);
      setSelectedInquiry(res.data);
      setNewInquiryAlert(false);
    } catch (err) {
      console.error('Failed to fetch inquiry detail:', err);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchInquiries();
  }, [fetchInquiries, fetchStats]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    const apiBase = (import.meta.env.VITE_API_BASE_URL as string)?.trim().replace(/\/$/, '') || '';
    const wsUrl = apiBase || window.location.origin.replace(/:\d+$/, ':3333');

    const socket = io(`${wsUrl}/ws/inquiry`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1_000,
      reconnectionDelayMax: 5_000,
    });

    socket.on('inquiry:new', () => {
      setNewInquiryAlert(true);
      fetchStats();
      fetchInquiries();
    });

    socket.on('inquiry:user-reply', (data: { inquiryId: string }) => {
      fetchStats();
      fetchInquiries();
      if (selectedInquiryIdRef.current === data.inquiryId) {
        void openInquiryById(data.inquiryId);
      }
    });

    socket.on('inquiry:status', () => {
      fetchStats();
      fetchInquiries();
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [fetchInquiries, fetchStats, openInquiryById]);

  const getCategoryLabel = (cat: InquiryCategory) => {
    const opt = CATEGORY_OPTIONS.find((item) => item.value === cat);
    return lang === 'ko' ? opt?.labelKo : opt?.labelEn;
  };

  const getStatusLabel = (status: InquiryStatus) => {
    const opt = STATUS_OPTIONS.find((item) => item.value === status);
    return lang === 'ko' ? opt?.labelKo : opt?.labelEn;
  };

  const handleClearFilters = () => {
    setStatusFilter('');
    setCategoryFilter('');
    setSearch('');
    setPage(1);
  };

  const openInquiry = async (row: InquiryRow) => {
    await openInquiryById(row.id);
  };

  useEffect(() => {
    const inquiryId = searchParams.get('inquiryId');
    if (!inquiryId) return;
    void openInquiryById(inquiryId).finally(() => {
      const next = new URLSearchParams(searchParams);
      next.delete('inquiryId');
      setSearchParams(next, { replace: true });
    });
  }, [openInquiryById, searchParams, setSearchParams]);

  const closeInquiry = () => {
    setSelectedInquiry(null);
    setReplyContent('');
  };

  const handleStatusChange = async (status: InquiryStatus) => {
    if (!selectedInquiry) return;
    try {
      await adminApi.updateInquiryStatus(selectedInquiry.id, status);
      setSelectedInquiry({ ...selectedInquiry, status });
      fetchStats();
      fetchInquiries();
    } catch (err) {
      console.error('Failed to update inquiry status:', err);
    }
  };

  const handleReply = async () => {
    if (!selectedInquiry || !replyContent.trim()) return;
    setSubmitting(true);
    try {
      const res = await adminApi.replyToInquiry(selectedInquiry.id, replyContent.trim());
      setSelectedInquiry({
        ...selectedInquiry,
        status: 'ANSWERED',
        replies: [...selectedInquiry.replies, res.data as InquiryReply],
      });
      setReplyContent('');
      fetchStats();
      fetchInquiries();
    } catch (err: unknown) {
      console.error('Failed to reply inquiry:', err);
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string | string[] } } }).response?.data?.message
          : undefined;
      const text = Array.isArray(msg) ? msg.join(', ') : msg;
      alert(
        text
          ?? (lang === 'ko'
            ? '답변 등록에 실패했습니다. 다시 시도해 주세요.'
            : 'Failed to send reply. Please try again.'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedInquiry) return;
    if (!confirm(lang === 'ko' ? '정말 삭제하시겠습니까?' : 'Are you sure you want to delete?')) {
      return;
    }
    try {
      await adminApi.deleteInquiry(selectedInquiry.id);
      closeInquiry();
      fetchStats();
      fetchInquiries();
    } catch (err) {
      console.error('Failed to delete inquiry:', err);
    }
  };

  return (
    <div>
      <PageHeader
        title={t('page.qna.title')}
        subtitle={t('page.qna.sub')}
        actions={
          <>
            {newInquiryAlert && (
              <div className="flex items-center gap-2 rounded-lg bg-[var(--red-50)] px-3 py-1.5 text-[var(--red)] animate-pulse">
                <Bell className="w-4 h-4" />
                <span className="text-sm font-medium">{lang === 'ko' ? '새 문의' : 'New inquiry'}</span>
              </div>
            )}
            <Button
              variant="secondary"
              onClick={() => {
                setNewInquiryAlert(false);
                fetchStats();
                fetchInquiries();
              }}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {lang === 'ko' ? '새로고침' : 'Refresh'}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-4 gap-3.5 mb-5">
        <SimpleKpiCard
          label={lang === 'ko' ? '전체 문의' : 'Total'}
          value={stats?.total ?? '—'}
          unit={lang === 'ko' ? '건' : ''}
          meta={<><span className="font-medium text-[var(--gray-900)]">{stats?.total ?? '—'}</span> {lang === 'ko' ? '누적 문의' : 'all inquiries'}</>}
        />
        <SimpleKpiCard
          label={lang === 'ko' ? '대기중' : 'Pending'}
          value={stats?.pending ?? '—'}
          unit={lang === 'ko' ? '건' : ''}
          meta={<><span className="font-medium text-[var(--orange)]">{stats?.pending ?? '—'}</span> {lang === 'ko' ? '답변 대기' : 'awaiting reply'}</>}
        />
        <SimpleKpiCard
          label={lang === 'ko' ? '답변완료' : 'Answered'}
          value={stats?.answered ?? '—'}
          unit={lang === 'ko' ? '건' : ''}
          meta={<><span className="font-medium text-[var(--green)]">{stats?.answered ?? '—'}</span> {lang === 'ko' ? '처리 완료' : 'resolved'}</>}
        />
        <SimpleKpiCard
          label={lang === 'ko' ? '오늘 문의' : 'Today'}
          value="—"
          meta={lang === 'ko' ? '실시간 집계 준비중' : 'Live tally coming soon'}
        />
      </div>

      <FilterBar className="justify-between gap-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as InquiryStatus | '');
              setPage(1);
            }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {lang === 'ko' ? opt.labelKo : opt.labelEn}
              </option>
            ))}
          </Select>
          <Select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value as InquiryCategory | '');
              setPage(1);
            }}
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {lang === 'ko' ? opt.labelKo : opt.labelEn}
              </option>
            ))}
          </Select>
          <Search
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchInquiries()}
            placeholder={lang === 'ko' ? '문의 제목 또는 작성자 검색' : 'Search title or user'}
            className="min-w-[260px]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="blue" onClick={fetchInquiries}>
            {lang === 'ko' ? '검색' : 'Search'}
          </Button>
          {(statusFilter || categoryFilter || search) && (
            <Button variant="secondary" onClick={handleClearFilters}>
              {lang === 'ko' ? '초기화' : 'Reset'}
            </Button>
          )}
        </div>
      </FilterBar>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-[var(--blue)]" />
        </div>
      ) : inquiries.length === 0 ? (
        <div className="py-12 text-center text-slate-500">
          {lang === 'ko' ? '문의가 없습니다' : 'No inquiries'}
        </div>
      ) : (
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <Th className="w-[72px]">{lang === 'ko' ? '번호' : 'No.'}</Th>
                <Th>{lang === 'ko' ? '제목' : 'Title'}</Th>
                <Th className="w-[120px]">{lang === 'ko' ? '작성자' : 'User'}</Th>
                <Th className="w-[132px]">{lang === 'ko' ? '등록일' : 'Created'}</Th>
                <Th className="w-[110px]">{lang === 'ko' ? '상태' : 'Status'}</Th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inq, index) => {
                const rowNumber = pagination
                  ? pagination.total - (page - 1) * pagination.limit - index
                  : inquiries.length - index;
                const statusClass =
                  inq.status === 'ANSWERED'
                    ? 'text-[var(--green)]'
                    : inq.status === 'PENDING'
                      ? 'text-[var(--orange)]'
                      : 'text-[var(--gray-600)]';

                return (
                  <tr key={inq.id} className="cursor-pointer hover:bg-[var(--gray-50)]" onClick={() => openInquiry(inq)}>
                    <Td muted>{rowNumber}</Td>
                    <Td className="text-left">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[12px] text-[var(--gray-500)] whitespace-nowrap">
                          [{getCategoryLabel(inq.category)}]
                        </span>
                        <span className="truncate font-medium text-[var(--gray-900)]">{inq.title}</span>
                        {inq._count.replies > 0 && (
                          <span className="text-[12px] text-[var(--blue)] whitespace-nowrap">
                            {inq._count.replies}
                            {lang === 'ko' ? '건 답변' : ' replies'}
                          </span>
                        )}
                      </div>
                    </Td>
                    <Td>{inq.user.name || '—'}</Td>
                    <Td>{formatListDate(inq.createdAt, lang)}</Td>
                    <Td className={statusClass}>{getStatusLabel(inq.status)}</Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </TableWrap>
      )}

      {pagination && (
        <Pagination
          page={page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          onChange={setPage}
        />
      )}

      <ContentSidePanel
        open={!!selectedInquiry}
        onClose={closeInquiry}
        title={selectedInquiry?.title ?? (lang === 'ko' ? '문의 상세' : 'Inquiry detail')}
        width={560}
        footer={
          selectedInquiry ? (
            <>
              <Button variant="danger" onClick={handleDelete}>
                <Trash2 className="w-3.5 h-3.5" />
                {t('common.delete')}
              </Button>
              <Button variant="secondary" onClick={closeInquiry}>
                {t('common.cancel')}
              </Button>
              <Button variant="blue" onClick={handleReply} disabled={submitting || !replyContent.trim()}>
                {lang === 'ko' ? '답변 등록' : 'Reply'}
              </Button>
            </>
          ) : null
        }
      >
        {detailLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin text-[var(--gray-400)]" />
          </div>
        ) : selectedInquiry ? (
          <>
            <Field label={lang === 'ko' ? '문의 정보' : 'Inquiry'}>
              <div className="rounded-lg border border-[var(--gray-border)] p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2 text-[12px] text-[var(--gray-500)]">
                  <span>{getCategoryLabel(selectedInquiry.category)}</span>
                  <span>|</span>
                  <span>{selectedInquiry.user.name}</span>
                  <span>|</span>
                  <span>{selectedInquiry.user.email}</span>
                </div>
                <div className="text-[13px] text-[var(--gray-500)] mb-3">
                  {formatListDate(selectedInquiry.createdAt, lang)}
                </div>
                <MessageBody content={selectedInquiry.content} />
              </div>
            </Field>

            <Field label={lang === 'ko' ? '상태' : 'Status'}>
              <Select
                className="w-full"
                value={selectedInquiry.status}
                onChange={(e) => handleStatusChange(e.target.value as InquiryStatus)}
              >
                {STATUS_OPTIONS.filter((opt) => opt.value).map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {lang === 'ko' ? opt.labelKo : opt.labelEn}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label={lang === 'ko' ? '답변 이력' : 'Replies'}>
              <div className="space-y-3">
                {selectedInquiry.replies.length === 0 ? (
                  <div className="rounded-lg border border-[var(--gray-border)] px-4 py-6 text-center text-[13px] text-[var(--gray-400)]">
                    {lang === 'ko' ? '등록된 답변이 없습니다.' : 'No replies yet.'}
                  </div>
                ) : (
                  selectedInquiry.replies.map((reply) => (
                    <div key={reply.id} className="rounded-lg border border-[var(--gray-border)] p-4">
                      <div className="mb-2 text-[12px] font-medium text-[var(--gray-500)]">
                        {reply.isAdmin ? (lang === 'ko' ? '관리자 답변' : 'Admin reply') : (lang === 'ko' ? '사용자 추가 메시지' : 'User reply')}
                        <span className="ml-2 font-normal">{formatListDate(reply.createdAt, lang)}</span>
                      </div>
                      <MessageBody content={reply.content} />
                    </div>
                  ))
                )}
              </div>
            </Field>

            {selectedInquiry.status !== 'CLOSED' && (
              <Field label={lang === 'ko' ? '답변 작성' : 'Write reply'}>
                <textarea
                  className="axis-input axis-focus w-full min-h-[180px] resize-y"
                  placeholder={lang === 'ko' ? '답변 내용을 입력하세요.' : 'Type your reply.'}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                />
              </Field>
            )}
          </>
        ) : null}
      </ContentSidePanel>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-[var(--gray-600)] mb-1.5">{label}</label>
      {children}
    </div>
  );
}
