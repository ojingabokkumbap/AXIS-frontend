import { useState, useEffect, useCallback } from 'react';
import { Plus, Pin, Eye, EyeOff, Edit3, Trash2, GripVertical, Loader2 } from 'lucide-react';
import {
  Card,
  PageHeader,
  Button,
  Tabs,
  TabItem,
  FilterBar,
  Search,
  Select,
  TableWrap,
  Table,
  Th,
  Td,
  Drawer,
  Pagination,
  pushToast,
} from '@admin/components/shared/ui-kit';
import { useI18n } from '@admin/i18n';
import { adminApi } from '@admin/services/api';
import type {
  ContentNoticeRow,
  ContentNoticeStatus,
  NoticeTagType,
  ContentFaqRow,
  ContentFaqCategory,
} from '@admin/services/api';

type Tab = 'notices' | 'faq';
type FaqCategoryFilter = 'all' | ContentFaqCategory;

const FAQ_CAT_LABEL: Record<ContentFaqCategory, string> = {
  REGISTRATION: 'content.faq.cat.reg',
  EXAM: 'content.faq.cat.env',
  ENVIRONMENT: 'content.faq.cat.env',
  PASS: 'content.faq.cat.score',
  CERTIFICATE: 'content.faq.cat.cert',
  REFUND: 'content.faq.cat.refund',
  OTHER: 'content.faq.cat.other',
};

const FAQ_CATS: { id: FaqCategoryFilter; key: string }[] = [
  { id: 'all', key: 'content.faq.cat.all' },
  { id: 'REGISTRATION', key: 'content.faq.cat.reg' },
  { id: 'ENVIRONMENT', key: 'content.faq.cat.env' },
  { id: 'PASS', key: 'content.faq.cat.score' },
  { id: 'CERTIFICATE', key: 'content.faq.cat.cert' },
  { id: 'REFUND', key: 'content.faq.cat.refund' },
  { id: 'OTHER', key: 'content.faq.cat.other' },
];

interface NoticeForm {
  id: string;
  tag: string;
  tagType: NoticeTagType;
  title: string;
  content: string;
  status: ContentNoticeStatus;
  pinned: boolean;
}

interface FaqForm {
  id: string;
  category: ContentFaqCategory;
  question: string;
  answer: string;
  sortOrder: number;
  pinned: boolean;
  published: boolean;
}

const emptyNotice = (): NoticeForm => ({
  id: '',
  tag: '공지',
  tagType: 'NORMAL',
  title: '',
  content: '',
  status: 'DRAFT',
  pinned: false,
});

const emptyFaq = (): FaqForm => ({
  id: '',
  category: 'OTHER',
  question: '',
  answer: '',
  sortOrder: 0,
  pinned: false,
  published: true,
});

export default function ContentPage() {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>('notices');

  /* ── Notices state ── */
  const [notices, setNotices] = useState<ContentNoticeRow[]>([]);
  const [noticeTotal, setNoticeTotal] = useState(0);
  const [noticeLoading, setNoticeLoading] = useState(false);
  const [noticeSearch, setNoticeSearch] = useState('');
  const [noticeStatusFilter, setNoticeStatusFilter] = useState<ContentNoticeStatus | ''>('');
  const [noticePage, setNoticePage] = useState(1);
  const [editingNotice, setEditingNotice] = useState<NoticeForm | null>(null);
  const [saving, setSaving] = useState(false);

  /* ── FAQ state ── */
  const [faqs, setFaqs] = useState<ContentFaqRow[]>([]);
  const [faqTotal, setFaqTotal] = useState(0);
  const [faqLoading, setFaqLoading] = useState(false);
  const [faqCategory, setFaqCategory] = useState<FaqCategoryFilter>('all');
  const [editingFaq, setEditingFaq] = useState<FaqForm | null>(null);

  /* ── Fetch notices ── */
  const fetchNotices = useCallback(async () => {
    setNoticeLoading(true);
    try {
      const res = await adminApi.getNotices({
        status: noticeStatusFilter || undefined,
        search: noticeSearch || undefined,
        page: noticePage,
        limit: 20,
      });
      setNotices(res.data.notices);
      setNoticeTotal(res.data.pagination.total);
    } catch {
      pushToast(t('content.toast.error'), 'red');
    } finally {
      setNoticeLoading(false);
    }
  }, [noticeStatusFilter, noticeSearch, noticePage, t]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  useEffect(() => {
    setNoticePage(1);
  }, [noticeSearch, noticeStatusFilter]);

  /* ── Fetch FAQs ── */
  const fetchFaqs = useCallback(async () => {
    setFaqLoading(true);
    try {
      const res = await adminApi.getFaqs({
        category: faqCategory === 'all' ? undefined : faqCategory,
        limit: 100,
      });
      setFaqs(res.data.faqs);
      setFaqTotal(res.data.pagination.total);
    } catch {
      pushToast(t('content.toast.error'), 'red');
    } finally {
      setFaqLoading(false);
    }
  }, [faqCategory, t]);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  /* ── Notice CRUD handlers ── */
  const handleSaveNotice = async () => {
    if (!editingNotice) return;
    setSaving(true);
    try {
      if (editingNotice.id) {
        await adminApi.updateNotice(editingNotice.id, {
          tag: editingNotice.tag,
          tagType: editingNotice.tagType,
          title: editingNotice.title,
          content: editingNotice.content,
          status: editingNotice.status,
          pinned: editingNotice.pinned,
        });
      } else {
        await adminApi.createNotice({
          tag: editingNotice.tag,
          tagType: editingNotice.tagType,
          title: editingNotice.title,
          content: editingNotice.content,
          status: editingNotice.status,
          pinned: editingNotice.pinned,
        });
      }
      pushToast(t('content.toast.saved'), 'green');
      setEditingNotice(null);
      fetchNotices();
    } catch {
      pushToast(t('content.toast.error'), 'red');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!confirm(t('content.confirm.delete'))) return;
    try {
      await adminApi.deleteNotice(id);
      pushToast(t('content.toast.deleted'), 'green');
      fetchNotices();
    } catch {
      pushToast(t('content.toast.error'), 'red');
    }
  };

  /* ── FAQ CRUD handlers ── */
  const handleSaveFaq = async () => {
    if (!editingFaq) return;
    setSaving(true);
    try {
      if (editingFaq.id) {
        await adminApi.updateFaq(editingFaq.id, {
          category: editingFaq.category,
          question: editingFaq.question,
          answer: editingFaq.answer,
          sortOrder: editingFaq.sortOrder,
          pinned: editingFaq.pinned,
          published: editingFaq.published,
        });
      } else {
        await adminApi.createFaq({
          category: editingFaq.category,
          question: editingFaq.question,
          answer: editingFaq.answer,
          sortOrder: editingFaq.sortOrder,
          pinned: editingFaq.pinned,
          published: editingFaq.published,
        });
      }
      pushToast(t('content.toast.saved'), 'green');
      setEditingFaq(null);
      fetchFaqs();
    } catch {
      pushToast(t('content.toast.error'), 'red');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!confirm(t('content.confirm.delete'))) return;
    try {
      await adminApi.deleteFaq(id);
      pushToast(t('content.toast.deleted'), 'green');
      fetchFaqs();
    } catch {
      pushToast(t('content.toast.error'), 'red');
    }
  };

  const noticeToForm = (n: ContentNoticeRow): NoticeForm => ({
    id: n.id,
    tag: n.tag,
    tagType: n.tagType,
    title: n.title,
    content: n.content,
    status: n.status,
    pinned: n.pinned,
  });

  const faqToForm = (f: ContentFaqRow): FaqForm => ({
    id: f.id,
    category: f.category,
    question: f.question,
    answer: f.answer,
    sortOrder: f.sortOrder,
    pinned: f.pinned,
    published: f.published,
  });

  /* ── Tabs config ── */
  const tabs: TabItem<Tab>[] = [
    { id: 'notices', label: t('content.tab.notices'), count: noticeTotal },
    { id: 'faq', label: t('content.tab.faq'), count: faqTotal },
  ];

  return (
    <div>
      <PageHeader
        title={t('page.content.title')}
        subtitle={t('page.content.sub')}
        actions={
          <Button
            variant="blue"
            onClick={() => {
              if (tab === 'notices') setEditingNotice(emptyNotice());
              else setEditingFaq(emptyFaq());
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            {tab === 'notices' ? t('content.notice.add') : t('content.faq.add')}
          </Button>
        }
      />

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {tab === 'notices' ? (
        <>
          <FilterBar>
            <Search
              placeholder={t('content.search.title')}
              value={noticeSearch}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNoticeSearch(e.target.value)}
            />
            <Select
              value={noticeStatusFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setNoticeStatusFilter(e.target.value as ContentNoticeStatus | '')
              }
            >
              <option value="">{t('content.filter.statusAll')}</option>
              <option value="PUBLISHED">{t('content.filter.public')}</option>
              <option value="DRAFT">{t('content.filter.private')}</option>
            </Select>
          </FilterBar>

          <div className="border-0">
            {noticeLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-[var(--gray-400)]" />
              </div>
            ) : (
              <TableWrap>
                <Table>
                  <thead>
                    <tr>
                      <Th align="center">{t('content.col.no')}</Th>
                      <Th>{t('content.col.title')}</Th>
                      <Th>{t('content.col.regDate')}</Th>
                      <Th align="right">{t('content.col.views')}</Th>
                      <Th>{t('content.col.status')}</Th>
                      <Th align="right">{t('content.col.actions')}</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {notices.map((n, idx) => (
                      <tr key={n.id} className="hover:bg-[var(--gray-50)]">
                        <Td align="center" mono>
                          {notices.length - idx}
                        </Td>
                        <Td>
                          <div className="flex items-center gap-2">
                            {n.pinned && (
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-[var(--orange-50)] text-[var(--orange)]">
                                <Pin className="w-3 h-3" />
                              </span>
                            )}
                            <span className="font-semibold text-[var(--primary)]">{n.title}</span>
                          </div>
                        </Td>
                        <Td className="tabular-nums">{n.createdAt.slice(0, 10)}</Td>
                        <Td align="right" className="tabular-nums">
                          {n.views.toLocaleString()}
                        </Td>
                        <Td>
                          {n.status === 'PUBLISHED' ? (
                            <span className="text-[var(--green)]">{t('content.filter.public')}</span>
                          ) : (
                            <span className="text-[var(--gray-600)]">{t('content.filter.private')}</span>
                          )}
                        </Td>
                        <Td align="right">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setEditingNotice(noticeToForm(n))}
                            className="mr-2"
                          >
                            {t('common.editBtn')}
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteNotice(n.id)}
                          >
                            {t('common.delete')}
                          </Button>
                        </Td>
                      </tr>
                    ))}
                    {notices.length === 0 && (
                      <tr>
                        <Td colSpan={6} align="center" className="py-12 text-[var(--gray-400)]">
                          {t('content.search.title')}
                        </Td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </TableWrap>
            )}
            {!noticeLoading && (
              <Pagination
                page={noticePage}
                totalPages={Math.max(1, Math.ceil(noticeTotal / 20))}
                onChange={setNoticePage}
                total={noticeTotal}
              />
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-1 mb-4 overflow-x-auto">
            {FAQ_CATS.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFaqCategory(cat.id)}
                className={[
                  'axis-focus px-3 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap',
                  faqCategory === cat.id
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-white border border-[var(--gray-border)] text-[var(--gray-700)] hover:bg-[var(--gray-50)]',
                ].join(' ')}
              >
                {t(cat.key)}
              </button>
            ))}
          </div>

          <Card className="p-0">
            {faqLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-[var(--gray-400)]" />
              </div>
            ) : (
              <ul className="divide-y divide-[var(--gray-100)]">
                {faqs.map((f) => (
                  <li key={f.id} className="px-4 py-3 hover:bg-[var(--gray-50)] flex items-start gap-3 group">
                    <button
                      className="opacity-0 group-hover:opacity-100 transition-opacity mt-1 cursor-grab text-[var(--gray-400)]"
                      title={t('content.faq.reorder')}
                    >
                      <GripVertical className="w-4 h-4" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[var(--blue)] font-medium">
                          {t(FAQ_CAT_LABEL[f.category] || 'content.faq.cat.other')}
                        </span>
                        {f.pinned && (
                          <span className="text-[var(--orange)] font-medium">{t('content.pinned')}</span>
                        )}
                        {!f.published && (
                          <span className="text-[var(--gray-600)] font-medium">{t('content.filter.private')}</span>
                        )}
                      </div>
                      <div className="text-[14px] font-semibold text-[var(--primary)] mb-1">
                        Q. {f.question}
                      </div>
                      <div className="text-[13px] text-[var(--gray-600)] leading-relaxed">
                        A. {f.answer}
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingFaq(faqToForm(f))}
                      className="axis-focus opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-[var(--gray-100)] text-[var(--gray-500)]"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFaq(f.id)}
                      className="axis-focus opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-[var(--gray-100)] text-[var(--red)]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
                {faqs.length === 0 && (
                  <li className="px-4 py-12 text-center text-[var(--gray-400)]">
                    {t('content.search.title')}
                  </li>
                )}
              </ul>
            )}
          </Card>
        </>
      )}

      {/* Notice Drawer */}
      <Drawer
        open={!!editingNotice}
        onClose={() => setEditingNotice(null)}
        title={editingNotice?.id ? t('content.notice.editTitle') : t('content.notice.newTitle')}
        width={520}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditingNotice(null)}>
              {t('common.cancel')}
            </Button>
            <Button variant="blue" onClick={handleSaveNotice} disabled={saving}>
              {t('common.save')}
            </Button>
          </>
        }
      >
        {editingNotice && (
          <div className="space-y-4">
            <Field label={t('content.notice.titleField')}>
              <input
                className="axis-input axis-focus w-full"
                placeholder={t('content.notice.titlePlaceholder')}
                value={editingNotice.title}
                onChange={(e) => setEditingNotice({ ...editingNotice, title: e.target.value })}
              />
            </Field>
            <Field label={t('content.notice.tagField')}>
              <div className="flex gap-2">
                <input
                  className="axis-input axis-focus flex-1"
                  placeholder={t('content.notice.tagPlaceholder')}
                  value={editingNotice.tag}
                  onChange={(e) => setEditingNotice({ ...editingNotice, tag: e.target.value })}
                />
                <select
                  className="axis-input axis-focus w-[120px]"
                  value={editingNotice.tagType}
                  onChange={(e) =>
                    setEditingNotice({ ...editingNotice, tagType: e.target.value as NoticeTagType })
                  }
                >
                  <option value="IMPORTANT">{t('content.notice.tagTypeImportant')}</option>
                  <option value="NORMAL">{t('content.notice.tagTypeNormal')}</option>
                </select>
              </div>
            </Field>
            <Field label={t('content.notice.contentField')}>
              <textarea
                className="axis-input axis-focus w-full min-h-[280px] resize-y"
                placeholder={t('content.notice.contentPlaceholder')}
                value={editingNotice.content}
                onChange={(e) => setEditingNotice({ ...editingNotice, content: e.target.value })}
              />
            </Field>
            <div className="flex gap-4">
              <ToggleField
                label={t('content.notice.publishField')}
                onLabel={
                  <span className="flex items-center gap-1 text-[var(--green)]">
                    <Eye className="w-3.5 h-3.5" /> {t('content.notice.public')}
                  </span>
                }
                offLabel={
                  <span className="flex items-center gap-1 text-[var(--gray-500)]">
                    <EyeOff className="w-3.5 h-3.5" /> {t('content.notice.private')}
                  </span>
                }
                checked={editingNotice.status === 'PUBLISHED'}
                onChange={(v) =>
                  setEditingNotice({ ...editingNotice, status: v ? 'PUBLISHED' : 'DRAFT' })
                }
              />
              <ToggleField
                label={t('content.notice.pinField')}
                onLabel={<span className="text-[var(--orange)]">{t('content.notice.pinned')}</span>}
                offLabel={<span className="text-[var(--gray-500)]">{t('content.notice.normal')}</span>}
                checked={editingNotice.pinned}
                onChange={(v) => setEditingNotice({ ...editingNotice, pinned: v })}
              />
            </div>
          </div>
        )}
      </Drawer>

      {/* FAQ Drawer */}
      <Drawer
        open={!!editingFaq}
        onClose={() => setEditingFaq(null)}
        title={editingFaq?.id ? t('content.faq.editTitle') : t('content.faq.newTitle')}
        width={520}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditingFaq(null)}>
              {t('common.cancel')}
            </Button>
            <Button variant="blue" onClick={handleSaveFaq} disabled={saving}>
              {t('common.save')}
            </Button>
          </>
        }
      >
        {editingFaq && (
          <div className="space-y-4">
            <Field label={t('content.faq.categoryField')}>
              <Select
                className="w-full"
                value={editingFaq.category}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setEditingFaq({ ...editingFaq, category: e.target.value as ContentFaqCategory })
                }
              >
                {FAQ_CATS.filter((c) => c.id !== 'all').map((c) => (
                  <option key={c.id} value={c.id}>
                    {t(c.key)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t('content.faq.questionField')}>
              <input
                className="axis-input axis-focus w-full"
                placeholder={t('content.faq.questionPlaceholder')}
                value={editingFaq.question}
                onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
              />
            </Field>
            <Field label={t('content.faq.answerField')}>
              <textarea
                className="axis-input axis-focus w-full min-h-[200px] resize-y"
                placeholder={t('content.faq.answerPlaceholder')}
                value={editingFaq.answer}
                onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
              />
            </Field>
            <ToggleField
              label={t('content.faq.publishedField')}
              onLabel={
                <span className="flex items-center gap-1 text-[var(--green)]">
                  <Eye className="w-3.5 h-3.5" /> {t('content.filter.public')}
                </span>
              }
              offLabel={
                <span className="flex items-center gap-1 text-[var(--gray-500)]">
                  <EyeOff className="w-3.5 h-3.5" /> {t('content.filter.private')}
                </span>
              }
              checked={editingFaq.published}
              onChange={(v) => setEditingFaq({ ...editingFaq, published: v })}
            />
          </div>
        )}
      </Drawer>
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

function ToggleField({
  label,
  onLabel,
  offLabel,
  checked,
  onChange,
}: {
  label: string;
  onLabel: React.ReactNode;
  offLabel: React.ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex-1">
      <div className="text-[12px] font-semibold text-[var(--gray-600)] mb-1.5">{label}</div>
      <button
        onClick={() => onChange(!checked)}
        className="axis-focus w-full px-3 py-2 rounded-lg border border-[var(--gray-border)] text-left flex items-center justify-between"
      >
        {checked ? onLabel : offLabel}
        <span
          className={[
            'inline-block w-9 h-5 rounded-full relative transition-colors',
            checked ? 'bg-[var(--blue)]' : 'bg-[var(--gray-300)]',
          ].join(' ')}
        >
          <span
            className={[
              'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform',
              checked ? 'translate-x-[18px]' : 'translate-x-0.5',
            ].join(' ')}
          />
        </span>
      </button>
    </div>
  );
}
