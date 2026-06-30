import { useCallback, useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Edit3, Eye, EyeOff, GripVertical, Loader2, Plus, Trash2 } from 'lucide-react';
import {
  Button,
  PageHeader,
  Select,
  Tabs,
  TabItem,
  pushToast,
  Card,
} from '@admin/components/shared/ui-kit';
import { useI18n } from '@admin/i18n';
import { adminApi } from '@admin/services/api';
import type { ContentFaqCategory, ContentFaqRow } from '@admin/services/api';
import { ContentSidePanel } from './components/ContentSidePanel';

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

const FAQ_TAB_ITEMS: TabItem<FaqCategoryFilter>[] = FAQ_CATS.map((cat) => ({
  id: cat.id,
  label: cat.key,
}));

interface FaqForm {
  id: string;
  category: ContentFaqCategory;
  question: string;
  answer: string;
  sortOrder: number;
  pinned: boolean;
  published: boolean;
}

const emptyFaq = (): FaqForm => ({
  id: '',
  category: 'OTHER',
  question: '',
  answer: '',
  sortOrder: 0,
  pinned: false,
  published: true,
});

export default function FaqPage() {
  const { t } = useI18n();
  const [faqs, setFaqs] = useState<ContentFaqRow[]>([]);
  const [faqTotal, setFaqTotal] = useState(0);
  const [faqLoading, setFaqLoading] = useState(false);
  const [faqCategory, setFaqCategory] = useState<FaqCategoryFilter>('all');
  const [editingFaq, setEditingFaq] = useState<FaqForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  const faqToForm = (f: ContentFaqRow): FaqForm => ({
    id: f.id,
    category: f.category,
    question: f.question,
    answer: f.answer,
    sortOrder: f.sortOrder,
    pinned: f.pinned,
    published: f.published,
  });

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

  return (
    <div>
      <PageHeader
        title={t('nav.faq')}
        subtitle={t('ph.faq.sub')}
        actions={
          <Button variant="blue" onClick={() => setEditingFaq(emptyFaq())}>
            <Plus className="w-3.5 h-3.5" />
            {t('content.faq.add')}
          </Button>
        }
      />

      <Tabs
        tabs={FAQ_TAB_ITEMS.map((tab) => ({ ...tab, label: t(tab.label as string) }))}
        active={faqCategory}
        onChange={setFaqCategory}
      />

      <Card className="p-0">
        {faqLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-[var(--gray-400)]" />
          </div>
        ) : (
          <div className="divide-y divide-[var(--gray-100)]">
            {faqs.map((f) => (
              <div key={f.id} className="hover:bg-[var(--gray-50)]">
                <div
                  onClick={() => setExpandedId(expandedId === f.id ? null : f.id)}
                  className="px-4 py-3.5 cursor-pointer"
                >
                  <div className="flex items-start gap-5">

                    <div className="min-w-[96px] pt-0.5">
                      <div className="text-[14px] font-semibold text-[var(--gray-800)]">
                        {t(FAQ_CAT_LABEL[f.category] || 'content.faq.cat.other')}
                      </div>
                      <div className="mt-1 text-[12px] text-[var(--gray-500)]">
                        {f.pinned
                          ? t('content.pinned')
                          : !f.published
                            ? t('content.filter.private')
                            : t('content.filter.public')}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="line-clamp-2 text-[15px] font-medium leading-6 text-[var(--gray-900)]">
                        Q. {f.question}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[var(--gray-500)]">
                        <span>{t(FAQ_CAT_LABEL[f.category] || 'content.faq.cat.other')}</span>
                        <span className="text-[var(--gray-300)]">|</span>
                        <span>{f.published ? t('content.filter.public') : t('content.filter.private')}</span>
                        {f.pinned && (
                          <>
                            <span className="text-[var(--gray-300)]">|</span>
                            <span>{t('content.pinned')}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-2 pl-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingFaq(faqToForm(f));
                        }}
                        className="axis-focus pt-2 text-[var(--gray-400)] hover:text-[var(--gray-600)]"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFaq(f.id);
                        }}
                        className="axis-focus pt-2 text-[var(--gray-400)] hover:text-[var(--red)]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="pt-2 text-[var(--gray-400)] hover:text-[var(--gray-600)]">
                        {expandedId === f.id ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {expandedId === f.id && (
                  <div className="px-4 pb-4">
                    <div className="ml-[137px] rounded-lg bg-slate-50 px-4 py-4">
                      <div className="text-[12px] font-semibold text-[var(--gray-500)] mb-2">답변</div>
                      <div className="text-[15px] leading-6 text-[var(--gray-700)] whitespace-pre-wrap">
                        {f.answer}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {faqs.length === 0 && (
              <div className="px-4 py-12 text-center text-[var(--gray-400)]">
                {t('content.search.title')}
              </div>
            )}
          </div>
        )}
      </Card>

      <ContentSidePanel
        open={!!editingFaq}
        onClose={() => setEditingFaq(null)}
        title={editingFaq?.id ? t('content.faq.editTitle') : t('content.faq.newTitle')}
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
          <>
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
          </>
        )}
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
