import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useI18n } from '@/i18n';
import {
  inquiryApi,
  noticeApi,
  faqApi,
  buildAttachmentMarker,
  parseInquiryContent,
  resolveAttachmentUrl,
} from '@/services/api';
import type {
  Inquiry,
  InquiryCategory,
  InquiryAttachment,
  NoticeItem,
  FaqItem,
  FaqCategoryEnum,
} from '@/services/api';
import {
  ChevronLeft,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Paperclip,
  X as XIcon,
  FileText,
  Loader2,
} from 'lucide-react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import {
  findUnseenAdminReplyInquiry,
  hasUnseenAdminReply,
  latestAdminReplyId,
  markInquiryAdminReplySeen,
} from './inquiryNoticeSeen';
import { SiteHeader } from '@/components/marketing/SiteHeader';
import { SiteFooter } from '@/components/marketing/SiteFooter';
import { PageHeroSolid } from '@/components/marketing/PageHeroSolid';
import { PageTabs } from '@/components/marketing/PageTabs';
import { NoticeAccordion } from '@/components/marketing/NoticeAccordion';

/* ─────────────────────────────────────────────────────────────
   Design tokens — AboutPage / CertGuidePage와 동일
   ───────────────────────────────────────────────────────────── */
const INK_900 = '#191919';
const GRAY_500 = '#525252';
const GRAY_300 = '#737373';
const BORDER_LIGHT = '#E5E5E5';
const H_CARD = 'text-[21px] lg:text-[26px] font-semibold leading-[1.3] tracking-[-0.02em]';
const T_BODY = 'text-[16px] lg:text-[19px] leading-[1.85] tracking-[-0.005em]';

/* ------------------------------------------------------------------ */
/*  Constants & helpers                                                */
/* ------------------------------------------------------------------ */

const MAX_ATTACHMENT_BYTES = 15 * 1024 * 1024;

type SupportTab = 'notice' | 'faq' | 'ask';

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

/* ------------------------------------------------------------------ */
/*  FAQ category filter definitions                                    */
/* ------------------------------------------------------------------ */

type FaqCategoryFilter = '전체' | '접수' | '응시' | '합격' | '환불';

const FAQ_CATEGORIES: FaqCategoryFilter[] = ['전체', '접수', '응시', '합격', '환불'];

const FAQ_FILTER_TO_ENUM: Record<FaqCategoryFilter, FaqCategoryEnum | undefined> = {
  '전체': undefined,
  '접수': 'REGISTRATION',
  '응시': 'EXAM',
  '합격': 'PASS',
  '환불': 'REFUND',
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function MessageBody({ content }: { content: string }) {
  const parts = parseInquiryContent(content);
  if (parts.length === 0) return null;
  return (
    <div className="space-y-2">
      {parts.map((p, i) => {
        if (p.type === 'text' && p.text) {
          return (
            <p key={i} className="whitespace-pre-wrap break-words" style={{ color: 'var(--color-ink)' }}>
              {p.text}
            </p>
          );
        }
        if (p.type === 'attachment' && p.attachment) {
          const a = p.attachment;
          const url = resolveAttachmentUrl(a.url);
          const isImage = /^image\//i.test(a.mimeType);
          if (isImage) {
            return (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block">
                <img
                  src={url}
                  alt={a.filename}
                  className="max-w-full max-h-80 rounded border border-border"
                />
                <div className="text-[11px] mt-1" style={{ color: 'var(--color-muted)' }}>
                  {a.filename} · {formatBytes(a.size)}
                </div>
              </a>
            );
          }
          return (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-border rounded-lg hover:bg-surface max-w-full"
            >
              <FileText className="w-4 h-4 text-muted flex-shrink-0" />
              <span className="text-sm text-ink truncate">{a.filename}</span>
              <span className="text-[11px] text-light flex-shrink-0">
                {formatBytes(a.size)}
              </span>
            </a>
          );
        }
        return null;
      })}
    </div>
  );
}

function AttachmentChip({
  attachment,
  onRemove,
}: {
  attachment: InquiryAttachment;
  onRemove: () => void;
}) {
  const isImage = /^image\//i.test(attachment.mimeType);
  return (
    <div className="inline-flex items-center gap-2 pl-2 pr-1 py-1 bg-surface border border-border rounded-full max-w-full">
      {isImage ? (
        <img
          src={resolveAttachmentUrl(attachment.url)}
          alt=""
          className="w-5 h-5 rounded object-cover"
        />
      ) : (
        <FileText className="w-3.5 h-3.5 text-muted flex-shrink-0" />
      )}
      <span className="text-xs text-ink truncate max-w-[140px]">{attachment.filename}</span>
      <span className="text-[10px] text-light flex-shrink-0">
        {formatBytes(attachment.size)}
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove attachment"
        className="w-5 h-5 rounded-full hover:bg-border text-muted grid place-items-center bg-transparent border-none"
      >
        <XIcon className="w-3 h-3" />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Inquiry constants                                                  */
/* ------------------------------------------------------------------ */

const CATEGORY_OPTIONS: { value: InquiryCategory; labelKo: string; labelEn: string }[] = [
  { value: 'REGISTRATION', labelKo: '접수 문의', labelEn: 'Registration' },
  { value: 'PAYMENT', labelKo: '결제 문의', labelEn: 'Payment' },
  { value: 'EXAM', labelKo: '시험 문의', labelEn: 'Exam' },
  { value: 'TECHNICAL', labelKo: '기술 문의', labelEn: 'Technical' },
  { value: 'CERTIFICATE', labelKo: '자격증 문의', labelEn: 'Certificate' },
  { value: 'OTHER', labelKo: '기타', labelEn: 'Other' },
];

const STATUS_CONFIG = {
  PENDING: { labelKo: '대기중', labelEn: 'Pending', textColor: '#D97706', icon: Clock },
  ANSWERED: { labelKo: '답변완료', labelEn: 'Answered', textColor: '#059669', icon: CheckCircle },
  CLOSED: { labelKo: '종료', labelEn: 'Closed', textColor: '#8B95B0', icon: AlertCircle },
};

/* ================================================================== */
/*  Main component                                                     */
/* ================================================================== */

export default function QnAPage() {
  const { lang } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  /* ── Support-level tab (notice / faq / ask) ── */
  const initialTab = (): SupportTab => {
    const t = searchParams.get('tab');
    if (t === 'ask' && !localStorage.getItem('accessToken')) return 'notice';
    if (t === 'notice' || t === 'faq' || t === 'ask') return t;
    return 'notice';
  };
  const [activeTab, setActiveTab] = useState<SupportTab>(initialTab);

  const navigate = useNavigate();

  const switchTab = (tab: SupportTab) => {
    if (tab === 'ask' && !localStorage.getItem('accessToken')) {
      navigate('/login');
      return;
    }
    setActiveTab(tab);
    const id = searchParams.get('id');
    if (tab === 'ask' && id) {
      setSearchParams({ tab, id }, { replace: true });
    } else {
      setSearchParams({ tab }, { replace: true });
    }
  };

  /* ── Notices state ── */
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [noticeLoading, setNoticeLoading] = useState(false);
  const [openNoticeIds, setOpenNoticeIds] = useState<Set<string>>(() => {
    const id = new URLSearchParams(window.location.search).get('noticeId');
    return id ? new Set([id]) : new Set();
  });

  const toggleNotice = (id: string) => {
    setOpenNoticeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /* ── FAQ state ── */
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [faqLoading, setFaqLoading] = useState(false);
  const [faqFilter, setFaqFilter] = useState<FaqCategoryFilter>('전체');
  const [openFaqIds, setOpenFaqIds] = useState<Set<string>>(new Set());

  const toggleFaq = (id: string) => {
    setOpenFaqIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /* ── Fetch notices ── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setNoticeLoading(true);
      try {
        const res = await noticeApi.getAll(1, 50);
        if (!cancelled) {
          setNotices(res.data.notices);
          const noticeId = searchParams.get('noticeId');
          if (noticeId && res.data.notices.some((n) => n.id === noticeId)) {
            setOpenNoticeIds(new Set([noticeId]));
          }
        }
      } catch (err) {
        console.error('Failed to fetch notices:', err);
      } finally {
        if (!cancelled) setNoticeLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [searchParams]);

  /* ── Fetch FAQ ── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setFaqLoading(true);
      try {
        const categoryEnum = FAQ_FILTER_TO_ENUM[faqFilter];
        const res = await faqApi.getAll(categoryEnum);
        if (!cancelled) setFaqItems(res.data);
      } catch (err) {
        console.error('Failed to fetch FAQ:', err);
      } finally {
        if (!cancelled) setFaqLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [faqFilter]);

  /* ── Inquiry state (1:1 문의) ── */
  const [view, setView] = useState<'default' | 'detail'>('default');
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [newCategory, setNewCategory] = useState<InquiryCategory>('OTHER');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newAttachments, setNewAttachments] = useState<InquiryAttachment[]>([]);
  const [replyContent, setReplyContent] = useState('');
  const [replyAttachments, setReplyAttachments] = useState<InquiryAttachment[]>([]);
  const [adminReplyNotice, setAdminReplyNotice] = useState<{
    inquiryId: string;
    title: string;
    replyId?: string;
  } | null>(null);
  const [uploadingCreate, setUploadingCreate] = useState(false);
  const [uploadingReply, setUploadingReply] = useState(false);
  const createFileInputRef = useRef<HTMLInputElement>(null);
  const replyFileInputRef = useRef<HTMLInputElement>(null);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedInquiryIdRef = useRef<string | null>(null);

  useEffect(() => {
    selectedInquiryIdRef.current = selectedInquiry?.id ?? null;
  }, [selectedInquiry?.id]);

  /* ── Fetch inquiries ── */
  const fetchInquiries = useCallback(async () => {
    if (!localStorage.getItem('accessToken')) return;
    try {
      setLoading(true);
      const res = await inquiryApi.getMyInquiries(1, 50);
      setInquiries(res.data.inquiries);
    } catch (err) {
      console.error('Failed to fetch inquiries:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  useEffect(() => {
    if (!localStorage.getItem('accessToken')) return;
    if (view === 'detail') return;
    const hit = findUnseenAdminReplyInquiry(inquiries);
    if (hit) {
      setAdminReplyNotice({ inquiryId: hit.inquiryId, title: hit.title, replyId: hit.replyId });
    } else {
      setAdminReplyNotice(null);
    }
  }, [inquiries, view]);

  /* ── Prefill from MyPage ── */
  const prefillAppliedRef = useRef(false);
  useEffect(() => {
    if (prefillAppliedRef.current) return;
    if (!localStorage.getItem('accessToken')) return;
    const prefill = (location.state as { prefill?: { category?: InquiryCategory; title?: string } } | null)?.prefill;
    if (!prefill) return;
    if (prefill.category) setNewCategory(prefill.category);
    if (prefill.title) setNewTitle(prefill.title);
    setActiveTab('ask');
    setView('default');
    prefillAppliedRef.current = true;
  }, [location.state]);

  /* ── Deep-link: /qna?id=<id> ── */
  useEffect(() => {
    if (!localStorage.getItem('accessToken')) return;
    const id = searchParams.get('id');
    if (!id) {
      if (view === 'detail') {
        setView('default');
        setSelectedInquiry(null);
      }
      return;
    }
    if (selectedInquiry?.id === id && view === 'detail') return;
    setActiveTab('ask');
    let cancelled = false;
    (async () => {
      try {
        const res = await inquiryApi.getById(id);
        if (cancelled) return;
        setSelectedInquiry(res.data);
        setView('detail');
        markInquiryAdminReplySeen(id, latestAdminReplyId(res.data.replies) ?? undefined);
        setAdminReplyNotice(null);
      } catch (err) {
        console.error('Failed to load inquiry from id param:', err);
        setSearchParams({}, { replace: true });
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  /* ── Socket.IO — real-time admin replies ── */
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
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

    socket.on('connect', () => {
      console.log('Inquiry WebSocket connected');
      const id = selectedInquiryIdRef.current;
      if (id) socket.emit('inquiry:subscribe', { inquiryId: id });
    });

    socket.on('connect_error', (err) => {
      console.warn('Inquiry WS connect error:', err.message);
    });

    socket.on(
      'inquiry:admin-reply',
      (data: {
        inquiryId: string;
        replyId: string;
        content: string;
        createdAt: string;
        inquiryTitle?: string;
      }) => {
        const newReply = {
          id: data.replyId,
          inquiryId: data.inquiryId,
          authorId: '',
          content: data.content,
          isAdmin: true,
          createdAt: data.createdAt,
        };

        setInquiries((prev) =>
          prev.map((inq) =>
            inq.id === data.inquiryId
              ? {
                  ...inq,
                  status: 'ANSWERED',
                  replies: (inq.replies || []).some((r) => r.id === data.replyId)
                    ? inq.replies
                    : [...(inq.replies || []), newReply],
                }
              : inq,
          ),
        );

        setSelectedInquiry((prev) =>
          prev && prev.id === data.inquiryId
            ? {
                ...prev,
                status: 'ANSWERED',
                replies: (prev.replies || []).some((r) => r.id === data.replyId)
                  ? prev.replies
                  : [...(prev.replies || []), newReply],
              }
            : prev,
        );

        if (selectedInquiryIdRef.current === data.inquiryId) {
          markInquiryAdminReplySeen(data.inquiryId, data.replyId);
          return;
        }

        if (hasUnseenAdminReply(data.inquiryId, data.replyId)) {
          setAdminReplyNotice({
            inquiryId: data.inquiryId,
            title: data.inquiryTitle ?? '',
            replyId: data.replyId,
          });
        }
      },
    );

    socket.on(
      'inquiry:status',
      (data: { inquiryId: string; status: 'PENDING' | 'ANSWERED' | 'CLOSED' }) => {
        setInquiries((prev) =>
          prev.map((inq) => (inq.id === data.inquiryId ? { ...inq, status: data.status } : inq)),
        );
        setSelectedInquiry((prev) =>
          prev && prev.id === data.inquiryId ? { ...prev, status: data.status } : prev,
        );
      },
    );

    socketRef.current = socket;

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    const id = selectedInquiry?.id;
    if (!socket || !id) return;
    if (socket.connected) socket.emit('inquiry:subscribe', { inquiryId: id });
    return () => {
      if (socket.connected) socket.emit('inquiry:unsubscribe', { inquiryId: id });
    };
  }, [selectedInquiry?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedInquiry?.replies]);

  /* ── Inquiry helpers ── */
  const composeContent = (text: string, attachments: InquiryAttachment[]): string => {
    const trimmed = text.trim();
    const markers = attachments.map(buildAttachmentMarker).join('\n');
    if (!markers) return trimmed;
    return trimmed ? `${trimmed}\n${markers}` : markers;
  };

  const handleAttachFile = async (
    file: File,
    target: 'create' | 'reply',
  ): Promise<void> => {
    if (file.size > MAX_ATTACHMENT_BYTES) {
      alert(
        lang === 'ko'
          ? `파일이 너무 큽니다. 최대 ${formatBytes(MAX_ATTACHMENT_BYTES)} 까지 가능합니다.`
          : `File is too large. Maximum is ${formatBytes(MAX_ATTACHMENT_BYTES)}.`,
      );
      return;
    }
    if (target === 'create') setUploadingCreate(true);
    else setUploadingReply(true);
    try {
      const res = await inquiryApi.uploadAttachment(file);
      if (target === 'create') setNewAttachments((prev) => [...prev, res.data]);
      else setReplyAttachments((prev) => [...prev, res.data]);
    } catch (err: any) {
      console.error('Upload failed:', err);
      alert(
        err?.response?.data?.message ||
          (lang === 'ko' ? '파일 업로드에 실패했습니다.' : 'File upload failed.'),
      );
    } finally {
      if (target === 'create') setUploadingCreate(false);
      else setUploadingReply(false);
    }
  };

  const handleCreate = async () => {
    if (!newTitle.trim() || (!newContent.trim() && newAttachments.length === 0)) return;
    setSubmitting(true);
    try {
      const res = await inquiryApi.create({
        category: newCategory,
        title: newTitle.trim(),
        content: composeContent(newContent, newAttachments),
      });
      setInquiries((prev) => [res.data, ...prev]);
      setNewTitle('');
      setNewContent('');
      setNewCategory('OTHER');
      setNewAttachments([]);
      setView('default');
    } catch (err) {
      console.error('Failed to create inquiry:', err);
      alert(lang === 'ko' ? '문의 등록에 실패했습니다.' : 'Failed to submit inquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDetail = (inquiry: Inquiry) => {
    setSearchParams({ tab: 'ask', id: inquiry.id });
  };

  const handleReply = async () => {
    if (!selectedInquiry) return;
    if (!replyContent.trim() && replyAttachments.length === 0) return;
    setSubmitting(true);
    try {
      const composed = composeContent(replyContent, replyAttachments);
      const res = await inquiryApi.addReply(selectedInquiry.id, composed);
      setSelectedInquiry((prev) =>
        prev ? { ...prev, replies: [...(prev.replies || []), res.data] } : null,
      );
      setInquiries((prev) =>
        prev.map((inq) =>
          inq.id === selectedInquiry.id
            ? { ...inq, replies: [...(inq.replies || []), res.data] }
            : inq,
        ),
      );
      setReplyContent('');
      setReplyAttachments([]);
    } catch (err: unknown) {
      console.error('Failed to send reply:', err);
      const apiMessage = isAxiosError(err)
        ? (typeof err.response?.data?.message === 'string'
            ? err.response.data.message
            : Array.isArray(err.response?.data?.message)
              ? err.response?.data?.message.join(', ')
              : undefined)
        : undefined;
      alert(
        apiMessage
          ?? (lang === 'ko'
            ? '답변 전송에 실패했습니다. 로그인 상태를 확인한 뒤 다시 시도해 주세요.'
            : 'Failed to send your reply. Please check that you are logged in and try again.'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openInquiryFromNotice = () => {
    if (!adminReplyNotice) return;
    markInquiryAdminReplySeen(adminReplyNotice.inquiryId, adminReplyNotice.replyId);
    setSearchParams({ tab: 'ask', id: adminReplyNotice.inquiryId });
    setAdminReplyNotice(null);
  };

  const getCategoryLabel = (cat: InquiryCategory) => {
    const opt = CATEGORY_OPTIONS.find((c) => c.value === cat);
    return lang === 'ko' ? opt?.labelKo : opt?.labelEn;
  };

  /* ================================================================ */
  /*  Tab panels                                                       */
  /* ================================================================ */

  /* ── Notice panel ── */
  const renderNotice = () => (
    <div>
      <h2
        className={`${H_CARD} mb-6`}
        style={{ color: INK_900 }}
      >
        공지사항
      </h2>
      {noticeLoading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="w-6 h-6 animate-spin" style={{ color: 'var(--color-blue)' }} />
        </div>
      ) : notices.length === 0 ? (
        <div className="py-16 text-center text-[14px]" style={{ color: 'var(--color-light)' }}>
          {lang === 'ko' ? '등록된 공지사항이 없습니다.' : 'No notices yet.'}
        </div>
      ) : (
        <NoticeAccordion
          notices={notices}
          openIds={openNoticeIds}
          onToggle={toggleNotice}
          variant="qna"
        />
      )}
    </div>
  );

  /* ── FAQ panel ── */
  const renderFaq = () => (
    <div>
      <h2
        className={`${H_CARD} mb-6`}
        style={{ color: INK_900 }}
      >
        FAQ
      </h2>

      {/* Filter chips — pill 스타일 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FAQ_CATEGORIES.map((cat) => {
          const isActive = faqFilter === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setFaqFilter(cat);
                setOpenFaqIds(new Set());
              }}
              className="inline-flex items-center h-11 lg:h-10 px-4 text-[14px] lg:text-[15px] font-semibold transition-all cursor-pointer"
              style={{
                color: isActive ? INK_900 : GRAY_300,
                border: isActive ? `1.5px solid ${INK_900}` : `1.5px solid ${BORDER_LIGHT}`,
                borderRadius: 9999,
                background: 'transparent',
                fontFamily: 'inherit',
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* FAQ list */}
      {faqLoading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="w-6 h-6 animate-spin" style={{ color: 'var(--color-blue)' }} />
        </div>
      ) : faqItems.length === 0 ? (
        <div className="py-16 text-center text-[14px]" style={{ color: 'var(--color-light)' }}>
          {lang === 'ko' ? '등록된 FAQ가 없습니다.' : 'No FAQs yet.'}
        </div>
      ) : (
        <div style={{ borderTop: `1px solid ${BORDER_LIGHT}` }}>
          {faqItems.map((faq) => {
            const isOpen = openFaqIds.has(faq.id);
            return (
              <div key={faq.id} style={{ borderBottom: `1px solid ${BORDER_LIGHT}` }}>
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  className="flex items-start justify-between w-full py-5 sm:py-6 lg:py-7 gap-4 sm:gap-6 bg-transparent border-none cursor-pointer text-left"
                  style={{ fontFamily: 'inherit' }}
                  aria-expanded={isOpen}
                >
                  <span
                    className="flex-1 text-[17px] lg:text-[19px] font-semibold leading-[1.4] transition-colors"
                    style={{ color: INK_900 }}
                  >
                    Q. {faq.question}
                  </span>
                  <span
                    className="shrink-0 inline-flex items-center justify-center mt-1"
                    style={{ width: 28, height: 28, color: isOpen ? INK_900 : GRAY_500 }}
                    aria-hidden="true"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <line
                        x1="12" y1="5" x2="12" y2="19"
                        style={{
                          transformOrigin: '12px 12px',
                          transform: isOpen ? 'scaleY(0)' : 'scaleY(1)',
                          transition: 'transform .3s cubic-bezier(.16,1,.3,1)',
                        }}
                      />
                    </svg>
                  </span>
                </button>
                <div
                  className="overflow-hidden"
                  style={{
                    maxHeight: isOpen ? 800 : 0,
                    opacity: isOpen ? 1 : 0,
                    transition: 'max-height .35s cubic-bezier(.16,1,.3,1), opacity .25s ease',
                  }}
                >
                  <div
                    className={`m-0 pb-6 lg:pb-8 ${T_BODY}`}
                    style={{ color: GRAY_500 }}
                  >
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  /* ── 1:1 Inquiry — Combined form + inquiry list view ── */
  const formInputStyle: React.CSSProperties = {
    width: '100%',
    height: 48,
    padding: '0 16px',
    border: '1.5px solid var(--color-border)',
    borderRadius: 'var(--radius-default)',
    fontFamily: 'inherit',
    color: 'var(--color-ink)',
    background: 'var(--color-white)',
    outline: 'none',
  };
  const formTextareaStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    border: '1.5px solid var(--color-border)',
    borderRadius: 'var(--radius-default)',
    fontFamily: 'inherit',
    color: 'var(--color-ink)',
    background: 'var(--color-white)',
    outline: 'none',
    minHeight: 140,
    resize: 'vertical',
    lineHeight: 1.7,
  };
  const formSelectStyle: React.CSSProperties = {
    ...formInputStyle,
    appearance: 'none',
    WebkitAppearance: 'none' as never,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%239CA3AF'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 16px center',
    cursor: 'pointer',
  };
  const focusBorder = (e: React.FocusEvent<HTMLElement>) => {
    (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-blue)';
  };
  const blurBorder = (e: React.FocusEvent<HTMLElement>) => {
    (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
  };

  const renderInquiryForm = () => (
    <div>
      <h2
        className={`${H_CARD} mb-6`}
        style={{ color: INK_900 }}
      >
        {lang === 'ko' ? '1:1 문의' : 'Q&A'}
      </h2>

      {/* Neutral info box */}
      <div className="info-box neutral" style={{ marginBottom: 16 }}>
        <strong>로그인 후 문의를 작성하면</strong> 마이페이지에서 답변을 확인할 수 있습니다.
      </div>

      {/* Blue info box */}
      <div className="info-box" style={{ marginBottom: 28 }}>
        <strong>개인정보 처리 안내</strong> —{' '}
        문의 처리에 필요한 개인정보가 수집되며, 문의 처리 완료 후 보관기간에 따라 관리됩니다.
        자세한 내용은 개인정보처리방침을 확인해 주세요.
      </div>

      <div className="space-y-4">
        {/* Category */}
        <div>
          <label
            className="block text-[15px] lg:text-[16px] font-semibold mb-2"
            style={{ color: INK_900 }}
          >
            {lang === 'ko' ? '카테고리' : 'Category'}
            <span style={{ color: 'var(--color-status-danger)', marginLeft: 2 }}>*</span>
          </label>
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as InquiryCategory)}
            className="text-[16px] lg:text-[15px]"
            style={formSelectStyle}
            onFocus={focusBorder}
            onBlur={blurBorder}
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {lang === 'ko' ? opt.labelKo : opt.labelEn}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label
            className="block text-[15px] lg:text-[16px] font-semibold mb-2"
            style={{ color: INK_900 }}
          >
            {lang === 'ko' ? '제목' : 'Title'}
            <span style={{ color: 'var(--color-status-danger)', marginLeft: 2 }}>*</span>
          </label>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder={lang === 'ko' ? '문의 제목을 입력하세요' : 'Enter inquiry title'}
            className="text-[16px] lg:text-[15px]"
            style={formInputStyle}
            onFocus={focusBorder}
            onBlur={blurBorder}
          />
        </div>

        {/* Content */}
        <div>
          <label
            className="block text-[15px] lg:text-[16px] font-semibold mb-2"
            style={{ color: INK_900 }}
          >
            {lang === 'ko' ? '내용' : 'Content'}
            <span style={{ color: 'var(--color-status-danger)', marginLeft: 2 }}>*</span>
          </label>
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder={lang === 'ko' ? '문의 내용을 작성하세요' : 'Please describe your inquiry in detail'}
            rows={6}
            className="text-[16px] lg:text-[15px]"
            style={formTextareaStyle}
            onFocus={focusBorder}
            onBlur={blurBorder}
          />
        </div>

        {/* File attachments */}
        <div>
          <label
            className="block text-[15px] lg:text-[16px] font-semibold mb-2"
            style={{ color: INK_900 }}
          >
            {lang === 'ko' ? '첨부파일 (선택)' : 'Attachments (optional)'}
          </label>
          <button
            type="button"
            onClick={() => createFileInputRef.current?.click()}
            disabled={uploadingCreate}
            className="w-full text-left cursor-pointer disabled:opacity-50"
            style={{
              padding: '12px 16px',
              border: '1.5px dashed var(--color-border)',
              borderRadius: 'var(--radius-default)',
              fontSize: 13,
              color: 'var(--color-muted)',
              background: 'var(--color-white)',
              fontFamily: 'inherit',
            }}
          >
            {uploadingCreate ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {lang === 'ko' ? '업로드 중...' : 'Uploading...'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                {lang === 'ko'
                  ? '파일을 선택하세요 (최대 15MB)'
                  : 'Choose a file (up to 15MB)'}
              </span>
            )}
          </button>
          <input
            ref={createFileInputRef}
            type="file"
            hidden
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) await handleAttachFile(file, 'create');
              if (e.target) e.target.value = '';
            }}
          />
          {newAttachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {newAttachments.map((a, i) => (
                <AttachmentChip
                  key={`${a.url}-${i}`}
                  attachment={a}
                  onRemove={() =>
                    setNewAttachments((prev) => prev.filter((_, idx) => idx !== i))
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={handleCreate}
          disabled={
            submitting ||
            uploadingCreate ||
            !newTitle.trim() ||
            (!newContent.trim() && newAttachments.length === 0)
          }
          className="w-full text-white border-none cursor-pointer disabled:opacity-50 transition-colors"
          style={{
            background: 'var(--color-blue)',
            padding: '14px 32px',
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 600,
            fontFamily: 'inherit',
          }}
        >
          {submitting
            ? lang === 'ko'
              ? '등록중...'
              : 'Submitting...'
            : lang === 'ko'
              ? '문의 제출'
              : 'Submit'}
        </button>
      </div>

      {/* Contact bar */}
      <div
        className="text-center text-[15px] lg:text-[16px] mt-10 pt-8"
        style={{ borderTop: `1px solid ${BORDER_LIGHT}`, color: GRAY_500 }}
      >
        <strong className="font-semibold" style={{ color: INK_900 }}>전화</strong> 1811-9530 ·{' '}
        <strong className="font-semibold" style={{ color: INK_900 }}>이메일</strong> support@axisexam.com ·{' '}
        평일 09:00~18:00
      </div>

      {/* My inquiries section */}
      {loading && (
        <div className="flex items-center justify-center py-16" style={{ marginTop: 32 }}>
          <RefreshCw className="w-6 h-6 animate-spin" style={{ color: 'var(--color-blue)' }} />
        </div>
      )}

      {!loading && inquiries.length > 0 && (
        <div
          style={{
            borderTop: '1px solid var(--color-border)',
            marginTop: 40,
            paddingTop: 32,
          }}
        >
          <h3
            className="text-[18px] lg:text-[20px] font-semibold mb-5"
            style={{ color: INK_900 }}
          >
            {lang === 'ko' ? '내 문의 내역' : 'My Inquiries'}
          </h3>
          <div className="space-y-3">
            {inquiries.map((inq) => {
              const status = STATUS_CONFIG[inq.status];
              const StatusIcon = status.icon;
              return (
                <div
                  key={inq.id}
                  onClick={() => handleViewDetail(inq)}
                  className="bg-white rounded-xl border border-border p-4 cursor-pointer transition-colors hover:border-border"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="px-2 py-0.5 text-xs rounded"
                          style={{ background: 'var(--color-surface)', color: 'var(--color-body)' }}
                        >
                          {getCategoryLabel(inq.category)}
                        </span>
                        <span
                          className="text-xs flex items-center gap-1"
                          style={{ color: status.textColor, fontWeight: 600 }}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {lang === 'ko' ? status.labelKo : status.labelEn}
                        </span>
                      </div>
                      <h3
                        className="font-semibold truncate text-[16px] lg:text-[17px]"
                        style={{ color: INK_900 }}
                      >
                        {inq.title}
                      </h3>
                      <p
                        className="text-[14px] lg:text-[15px] mt-1.5 line-clamp-2"
                        style={{ color: GRAY_500 }}
                      >
                        {parseInquiryContent(inq.content)
                          .filter((p) => p.type === 'text')
                          .map((p) => p.text)
                          .join(' ')
                          .trim() ||
                          (lang === 'ko' ? '(첨부 파일)' : '(attachment)')}
                      </p>
                    </div>
                    <div className="text-xs ml-4 shrink-0 whitespace-nowrap" style={{ color: 'var(--color-light)' }}>
                      {new Date(inq.createdAt).toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  /* ── 1:1 Inquiry — Detail / thread view ── */
  const renderInquiryDetail = () => {
    if (!selectedInquiry) return null;
    const status = STATUS_CONFIG[selectedInquiry.status];
    const StatusIcon = status.icon;

    return (
      <div className="flex flex-col" style={{ minHeight: 400 }}>
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => {
              if (selectedInquiry) {
                markInquiryAdminReplySeen(
                  selectedInquiry.id,
                  latestAdminReplyId(selectedInquiry.replies) ?? undefined,
                );
              }
              setAdminReplyNotice(null);
              setView('default');
              setSelectedInquiry(null);
              setSearchParams({ tab: 'ask' });
            }}
            className="p-2 hover:bg-surface rounded-lg bg-transparent border-none cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" style={{ color: 'var(--color-ink)' }} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="px-2 py-0.5 text-xs rounded"
                style={{ background: 'var(--color-surface)', color: 'var(--color-body)' }}
              >
                {getCategoryLabel(selectedInquiry.category)}
              </span>
              <span
                className="text-xs flex items-center gap-1"
                style={{ color: status.textColor, fontWeight: 600 }}
              >
                <StatusIcon className="w-3 h-3" />
                {lang === 'ko' ? status.labelKo : status.labelEn}
              </span>
            </div>
            <h2
              className={`${H_CARD} truncate`}
              style={{ color: INK_900 }}
            >
              {selectedInquiry.title}
            </h2>
          </div>
        </div>

        {/* Messages thread */}
        <div
          className="flex-1 rounded-xl border border-border overflow-hidden flex flex-col bg-white"
          style={{ minHeight: 300 }}
        >
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Original message */}
            <div className="rounded-lg p-4" style={{ background: 'var(--color-bg)' }}>
              <div className="text-xs mb-2" style={{ color: 'var(--color-muted)' }}>
                {new Date(selectedInquiry.createdAt).toLocaleString(lang === 'ko' ? 'ko-KR' : 'en-US')}
              </div>
              <MessageBody content={selectedInquiry.content} />
            </div>

            {/* Replies */}
            {selectedInquiry.replies?.map((reply) => (
              <div
                key={reply.id}
                className={`rounded-lg p-4 ${reply.isAdmin ? 'ml-3 sm:ml-6' : 'mr-3 sm:mr-6'}`}
                style={{
                  background: reply.isAdmin ? 'var(--color-bg)' : 'var(--color-surface)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-xs px-2 py-0.5 rounded"
                    style={{
                      background: reply.isAdmin ? 'var(--color-surface)' : 'var(--color-border)',
                      color: reply.isAdmin ? '#059669' : 'var(--color-body)',
                    }}
                  >
                    {reply.isAdmin ? (lang === 'ko' ? '관리자' : 'Admin') : lang === 'ko' ? '나' : 'Me'}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                    {new Date(reply.createdAt).toLocaleString(lang === 'ko' ? 'ko-KR' : 'en-US')}
                  </span>
                </div>
                <MessageBody content={reply.content} />
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply input */}
          {selectedInquiry.status !== 'CLOSED' && (
            <div className="border-t border-border p-4 space-y-2">
              {replyAttachments.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {replyAttachments.map((a, i) => (
                    <AttachmentChip
                      key={`${a.url}-${i}`}
                      attachment={a}
                      onRemove={() =>
                        setReplyAttachments((prev) => prev.filter((_, idx) => idx !== i))
                      }
                    />
                  ))}
                </div>
              )}
              <div className="flex gap-2 items-end">
                <button
                  type="button"
                  onClick={() => replyFileInputRef.current?.click()}
                  disabled={uploadingReply || submitting}
                  title={lang === 'ko' ? '파일 첨부 (최대 15MB)' : 'Attach file (up to 15MB)'}
                  className="p-2 rounded-lg border border-border hover:bg-surface disabled:opacity-50 self-stretch grid place-items-center bg-transparent cursor-pointer"
                >
                  {uploadingReply ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Paperclip className="w-4 h-4" style={{ color: 'var(--color-muted)' }} />
                  )}
                </button>
                <input
                  ref={replyFileInputRef}
                  type="file"
                  hidden
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) await handleAttachFile(file, 'reply');
                    if (e.target) e.target.value = '';
                  }}
                />
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={lang === 'ko' ? '추가 문의사항을 입력하세요...' : 'Type your message...'}
                  rows={2}
                  className="form-textarea flex-1 max-lg:text-[16px]"
                  style={{ minHeight: 'auto', resize: 'none' }}
                />
                <button
                  type="button"
                  onClick={handleReply}
                  disabled={
                    submitting ||
                    uploadingReply ||
                    (!replyContent.trim() && replyAttachments.length === 0)
                  }
                  className="px-4 py-2 text-white rounded-lg disabled:opacity-50 border-none cursor-pointer"
                  style={{ background: 'var(--color-blue)' }}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ── Ask tab dispatcher ── */
  const renderAsk = () => {
    if (view === 'detail') return renderInquiryDetail();
    return (
      <>
        {adminReplyNotice && (
          <div
            className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border px-4 py-4"
            style={{ borderColor: '#BFDBFE', background: '#EFF6FF' }}
          >
            <div>
              <p className="text-[14px] font-semibold" style={{ color: '#1D4ED8' }}>
                {lang === 'ko' ? '관리자 답변이 도착했습니다' : 'New admin reply'}
              </p>
              {adminReplyNotice.title && (
                <p className="text-[13px] mt-1 truncate" style={{ color: GRAY_500 }}>
                  {adminReplyNotice.title}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={openInquiryFromNotice}
              className="shrink-0 px-4 py-2 rounded-lg text-[14px] font-semibold text-white border-none cursor-pointer"
              style={{ background: 'var(--color-blue)' }}
            >
              {lang === 'ko' ? '답변 확인 · 추가 문의' : 'View & reply'}
            </button>
          </div>
        )}
        {renderInquiryForm()}
      </>
    );
  };

  /* ================================================================ */
  /*  Page layout                                                      */
  /* ================================================================ */

  const TABS: { key: SupportTab; label: string }[] = [
    { key: 'notice', label: '공지사항' },
    { key: 'faq', label: 'FAQ' },
    { key: 'ask', label: '1:1 문의' },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-white)', color: 'var(--color-body)' }}>
      <SiteHeader active="support" />

      <PageHeroSolid
        title="고객센터"
        subtitle="공지사항 · FAQ · 1:1 문의"
      />

      <PageTabs
        tabs={TABS}
        active={activeTab}
        onChange={switchTab}
      />

      {/* Tab content */}
      <div className="flex-1">
        <div
          className="mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 lg:pt-10 pb-16 lg:pb-20 max-lg:break-keep"
          style={{ maxWidth: 'var(--spacing-content-w)' }}
        >
          {activeTab === 'notice' && renderNotice()}
          {activeTab === 'faq' && renderFaq()}
          {activeTab === 'ask' && renderAsk()}
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
