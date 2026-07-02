import { useMemo, useState } from 'react';
import { EXAM } from '@/pages/exam/shared';

/**
 * L3 실습형 (practical) structured-answer UI.
 *
 * Unlike the L2 free-text + AI-chat practical view, L3 tasks are graded against
 * an answer key: the candidate makes selections (multi/single/free-entry) and
 * writes an 80–150자 근거. There is NO in-exam AI assistant for L3.
 *
 * The paper API supplies `task.l3` — an answer-free render spec (fields keyed by
 * the grader's answerKey field NAMES, option pools from responseFormat; the
 * correct answers are never sent). The whole answer is serialized to the task's
 * `contentText` as a versioned envelope so the existing auto-save/hydrate/submit
 * plumbing works unchanged:
 *   { version: 1, selects: { <field.key>: string[] | string }, shortReason }
 */

export type L3Field = {
  key: string;
  label: string;
  kind: 'multi' | 'multiText' | 'single' | 'text' | 'prompt';
  options?: string[];
  maxLen?: number;
};

export type L3Spec = {
  practiceType: string | null;
  fixedAiOutput: string | null;
  fields: L3Field[];
  reason: { min: number; max: number };
};

export type L3Task = {
  taskId: string;
  title: string;
  scenario: string;
  points: number;
  durationMin: number;
  l3?: L3Spec | null;
};

type SelectValue = string[] | string;
type AnswerState = { selects: Record<string, SelectValue>; shortReason: string };

function parseAnswer(text: string): AnswerState {
  const empty: AnswerState = { selects: {}, shortReason: '' };
  const raw = (text ?? '').trim();
  if (!raw.startsWith('{')) return empty;
  try {
    const p = JSON.parse(raw) as { selects?: Record<string, SelectValue>; shortReason?: string };
    return {
      selects: p.selects && typeof p.selects === 'object' ? p.selects : {},
      shortReason: typeof p.shortReason === 'string' ? p.shortReason : '',
    };
  } catch {
    return empty;
  }
}

export function L3PracticalTaskView({
  task,
  text,
  setText,
  color,
}: {
  task: L3Task;
  text: string;
  setText: (v: string) => void;
  color: string;
}) {
  // State is seeded once from the persisted contentText. The parent remounts
  // this view (key={taskId}) when switching tasks, so no re-hydration effect is
  // needed — a fresh mount re-reads the saved answer for the new task.
  const [answer, setAnswer] = useState<AnswerState>(() => parseAnswer(text));

  const spec = task.l3 ?? null;
  const fields = useMemo(() => spec?.fields ?? [], [spec]);
  const reason = spec?.reason ?? { min: 80, max: 150 };

  const commit = (next: AnswerState) => {
    setAnswer(next);
    setText(JSON.stringify({ version: 1, selects: next.selects, shortReason: next.shortReason }));
  };
  const setValue = (key: string, value: SelectValue) =>
    commit({ ...answer, selects: { ...answer.selects, [key]: value } });
  const toggleMulti = (key: string, option: string) => {
    const cur = Array.isArray(answer.selects[key]) ? (answer.selects[key] as string[]) : [];
    setValue(key, cur.includes(option) ? cur.filter((o) => o !== option) : [...cur, option]);
  };

  const reasonLen = Array.from(answer.shortReason).length;
  const reasonOk = reasonLen >= reason.min && reasonLen <= reason.max;

  return (
    <section className="flex-1 grid grid-cols-2 gap-[clamp(10px,0.8vw,18px)] p-[clamp(10px,0.8vw,18px)] overflow-hidden bg-[var(--exam-bg)]">
      {/* Left: scenario + fixed AI output (read-only context) */}
      <div className={`${EXAM.surface.card} p-[clamp(16px,1.4vw,32px)] overflow-y-auto`}>
        <div className={`${EXAM.text.pill} text-[#A16207] mb-2 uppercase tracking-wider font-semibold`}>
          {task.points}점 · {task.durationMin}분{task.l3?.practiceType ? ` · ${task.l3.practiceType}` : ''}
        </div>
        <h3 className={`${EXAM.text.cardHeading} ${EXAM.color.ink} mb-3`}>{task.title}</h3>
        <p className={`${EXAM.text.body} ${EXAM.color.body} whitespace-pre-wrap leading-relaxed`}>{task.scenario}</p>
        {task.l3?.fixedAiOutput && (
          <div className={`mt-5 ${EXAM.surface.infoBox} px-4 py-3`}>
            <div className={`${EXAM.text.pill} ${EXAM.color.brand} uppercase tracking-wider font-semibold mb-1.5`}>
              AI 산출물 (검토 대상)
            </div>
            <p className={`${EXAM.text.helper} ${EXAM.color.body} whitespace-pre-wrap leading-relaxed`}>
              {task.l3.fixedAiOutput}
            </p>
          </div>
        )}
        <div className={`mt-5 ${EXAM.surface.warningBox} px-4 py-3 ${EXAM.text.helper} ${EXAM.color.warning} leading-relaxed`}>
          이 문항은 AI 어시스턴트를 사용할 수 없습니다. 아래 항목을 직접 선택하고 근거를 작성하세요.
        </div>
      </div>

      {/* Right: structured answer form */}
      <div className={`${EXAM.surface.card} flex flex-col overflow-hidden`}>
        <div className={`px-[clamp(12px,1vw,20px)] py-[clamp(8px,0.7vw,14px)] border-b border-[var(--exam-border)] ${EXAM.text.pill} ${EXAM.color.muted} uppercase tracking-wider font-semibold`}>
          답안 작성 · 자동 저장
        </div>
        <div className="flex-1 overflow-y-auto p-[clamp(12px,1vw,22px)] space-y-[clamp(14px,1.1vw,24px)]">
          {fields.map((f) => (
            <FieldBlock
              key={f.key}
              field={f}
              value={answer.selects[f.key]}
              color={color}
              onMultiToggle={(opt) => toggleMulti(f.key, opt)}
              onSetValue={(v) => setValue(f.key, v)}
            />
          ))}

          {/* short_reason — always present, live counter */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className={`${EXAM.text.helper} ${EXAM.color.ink} font-semibold`}>근거 (서술)</label>
              <span className={`${EXAM.text.pill} tabular-nums ${reasonOk ? EXAM.color.success : EXAM.color.muted}`}>
                {reasonLen} / {reason.min}–{reason.max}자
              </span>
            </div>
            <textarea
              value={answer.shortReason}
              onChange={(e) => commit({ ...answer, shortReason: e.target.value })}
              rows={4}
              placeholder={`선택한 근거를 ${reason.min}~${reason.max}자로 서술하세요.`}
              className={`w-full bg-[var(--exam-surface)] border rounded-lg p-3 ${EXAM.text.body} ${EXAM.color.ink} outline-none resize-none placeholder:text-[var(--exam-text-muted)] leading-relaxed transition-colors ${
                reasonOk ? 'border-[var(--exam-border)]' : 'border-[#FDE68A]'
              } focus:border-[var(--exam-accent)]`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function FieldBlock({
  field,
  value,
  color,
  onMultiToggle,
  onSetValue,
}: {
  field: L3Field;
  value: SelectValue | undefined;
  color: string;
  onMultiToggle: (option: string) => void;
  onSetValue: (v: SelectValue) => void;
}) {
  const label = <div className={`${EXAM.text.helper} ${EXAM.color.ink} font-semibold mb-1.5`}>{field.label}</div>;
  const options = field.options ?? [];

  if (field.kind === 'multi' || field.kind === 'single') {
    const multi = field.kind === 'multi';
    const selected = multi ? (Array.isArray(value) ? value : []) : typeof value === 'string' ? [value] : [];
    return (
      <div>
        {label}
        <div className="space-y-1.5">
          {options.map((opt) => {
            const on = selected.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => (multi ? onMultiToggle(opt) : onSetValue(opt))}
                className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-colors ${EXAM.text.helper} ${
                  on
                    ? 'bg-[var(--exam-accent-bg)] text-[var(--exam-accent-text)]'
                    : 'border-[var(--exam-border)] hover:bg-[var(--exam-surface-2)] ' + EXAM.color.body
                }`}
                style={on ? { borderColor: color } : undefined}
              >
                <span
                  className={`w-4 h-4 ${multi ? 'rounded' : 'rounded-full'} border flex items-center justify-center shrink-0 ${
                    on ? 'text-white' : 'border-[var(--exam-border)]'
                  }`}
                  style={on ? { background: color, borderColor: color } : undefined}
                >
                  {on && multi ? '✓' : ''}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (field.kind === 'multiText') {
    const items = Array.isArray(value) ? value : [];
    return <ChipEntry label={field.label} items={items} onChange={onSetValue} color={color} />;
  }

  // text | prompt
  const cur = typeof value === 'string' ? value : '';
  const isPrompt = field.kind === 'prompt';
  const len = Array.from(cur).length;
  const maxLen = field.maxLen ?? 250;
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <label className={`${EXAM.text.helper} ${EXAM.color.ink} font-semibold`}>{field.label}</label>
        {isPrompt && (
          <span className={`${EXAM.text.pill} tabular-nums ${EXAM.color.muted}`}>
            {len} / {maxLen}자
          </span>
        )}
      </div>
      {isPrompt ? (
        <textarea
          value={cur}
          onChange={(e) => onSetValue(e.target.value)}
          rows={3}
          placeholder={`${maxLen}자 이내로 작성하세요.`}
          className={`w-full bg-[var(--exam-surface)] border border-[var(--exam-border)] rounded-lg p-3 ${EXAM.text.helper} ${EXAM.color.ink} outline-none resize-none placeholder:text-[var(--exam-text-muted)] leading-relaxed focus:border-[var(--exam-accent)] transition-colors`}
        />
      ) : (
        <input
          value={cur}
          onChange={(e) => onSetValue(e.target.value)}
          placeholder="입력하세요"
          className={`w-full bg-[var(--exam-surface)] border border-[var(--exam-border)] rounded-lg px-3 py-2 ${EXAM.text.helper} ${EXAM.color.ink} outline-none placeholder:text-[var(--exam-text-muted)] focus:border-[var(--exam-accent)] transition-colors`}
        />
      )}
    </div>
  );
}

/** Free multi-entry (chips) for lists with no fixed option pool. */
function ChipEntry({
  label,
  items,
  onChange,
  color,
}: {
  label: string;
  items: string[];
  onChange: (v: string[]) => void;
  color: string;
}) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const v = draft.trim();
    if (!v || items.includes(v)) return;
    onChange([...items, v]);
    setDraft('');
  };
  return (
    <div>
      <div className={`${EXAM.text.helper} ${EXAM.color.ink} font-semibold mb-1.5`}>{label}</div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {items.map((it) => (
            <span
              key={it}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${EXAM.text.pill} text-[var(--exam-accent-text)] bg-[var(--exam-accent-bg)]`}
              style={{ borderColor: color }}
            >
              {it}
              <button type="button" onClick={() => onChange(items.filter((x) => x !== it))} className="opacity-70 hover:opacity-100">
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder="항목 입력 후 Enter"
          className={`flex-1 bg-[var(--exam-surface)] border border-[var(--exam-border)] rounded-lg px-3 py-2 ${EXAM.text.helper} ${EXAM.color.ink} outline-none placeholder:text-[var(--exam-text-muted)] focus:border-[var(--exam-accent)] transition-colors`}
        />
        <button
          type="button"
          onClick={add}
          className={`px-[clamp(12px,1vw,20px)] py-2 rounded-lg text-white ${EXAM.text.button} hover:brightness-110 transition-colors`}
          style={{ background: color }}
        >
          추가
        </button>
      </div>
    </div>
  );
}

/**
 * Sidebar + active-task wrapper for the L3 practical stage — mirrors
 * PracticalListView's task list, but renders the structured L3 view (no AI chat).
 */
export function L3PracticalListView({
  tasks,
  text,
  setText,
  color,
}: {
  tasks: L3Task[];
  text: Record<string, string>;
  setText: (taskId: string, v: string) => void;
  color: string;
}) {
  const [active, setActive] = useState(0);
  const current = tasks[active];
  if (!current) return <div className={`p-8 ${EXAM.color.muted}`}>실습 과제가 없습니다.</div>;
  return (
    <div className="flex w-full bg-[var(--exam-bg)]">
      <aside className="w-[clamp(200px,14vw,280px)] bg-[var(--exam-surface)] border-r border-[var(--exam-border)] p-[clamp(10px,0.8vw,16px)] shrink-0">
        <div className={`${EXAM.text.pill} ${EXAM.color.muted} mb-3 uppercase tracking-wider font-semibold px-1`}>
          실습 과제
        </div>
        {tasks.map((tk, i) => (
          <button
            key={tk.taskId}
            onClick={() => setActive(i)}
            className={`w-full text-left p-[clamp(10px,0.8vw,16px)] mb-1 rounded-lg transition-colors border-l-[3px] ${
              i === active ? 'bg-[var(--exam-accent-bg)]' : 'border-transparent hover:bg-[var(--exam-surface-2)]'
            }`}
            style={i === active ? { borderLeftColor: color } : undefined}
          >
            <div className={`${EXAM.text.button} ${i === active ? EXAM.color.ink : EXAM.color.body}`}>과제 {i + 1}</div>
            <div className={`${EXAM.text.helper} ${EXAM.color.muted} truncate mt-0.5`}>{tk.title}</div>
          </button>
        ))}
      </aside>
      <L3PracticalTaskView
        key={current.taskId}
        task={current}
        text={text[current.taskId] ?? ''}
        setText={(v) => setText(current.taskId, v)}
        color={color}
      />
    </div>
  );
}
