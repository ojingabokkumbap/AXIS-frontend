import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { examApi, type CertLevel, type ExamPart } from '../services/api';

type Question = {
  questionId: string;
  orderIndex: number;
  stem: string;
  choices: { key: string; text: string }[];
  subjectName: string;
  points: number;
  selectedChoice: string | null;
  flagged: boolean;
  version: number;
};

type Task = {
  taskId: string;
  part: ExamPart;
  title: string;
  scenario: string;
  durationMin: number;
  points: number;
  orderIndex: number;
};

type Paper = {
  session: {
    id: string;
    certType: string;
    level: CertLevel;
    status: string;
    startedAt: string | null;
    hardDeadline: string | null;
    timing: { totalMinutes: number; writtenMinutes: number; practicalMinutes: number };
  };
  questions: Question[];
  tasks: Task[];
};

type Stage = 'WRITTEN' | 'PRACTICAL' | 'DELIVERABLE' | 'ESSAY';

const CERT_COLORS: Record<string, string> = { AXIS: '#185FA5', AXIS_C: '#3B6D11', AXIS_H: '#534AB7' };

export default function ExamRunnerPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [paper, setPaper] = useState<Paper | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [practicalText, setPracticalText] = useState<Record<string, string>>({});
  const [practicalChat, setPracticalChat] = useState<Record<string, { role: 'user' | 'assistant'; text: string; ts: number }[]>>({});
  const [practicalVersion, setPracticalVersion] = useState<Record<string, number>>({});
  const [chatInput, setChatInput] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const [stage, setStage] = useState<Stage>('WRITTEN');
  const [now, setNow] = useState(Date.now());
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const saveTimers = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!sessionId) return;
    examApi
      .paper(sessionId)
      .then((res) => {
        const p: Paper = res.data;
        setPaper(p);
        setQuestions(p.questions);
        const txt: Record<string, string> = {};
        const ver: Record<string, number> = {};
        for (const t of p.tasks) {
          txt[t.taskId] = '';
          ver[t.taskId] = 0;
        }
        setPracticalText(txt);
        setPracticalVersion(ver);
      })
      .catch((e) => setError(e.response?.data?.message || 'Failed to load exam'));
  }, [sessionId]);

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  const remainingMs = paper?.session.hardDeadline ? new Date(paper.session.hardDeadline).getTime() - now : 0;
  const remaining = formatRemaining(remainingMs);
  const color = paper ? CERT_COLORS[paper.session.certType] || '#185FA5' : '#185FA5';

  // Auto-submit on time-over
  useEffect(() => {
    if (paper && remainingMs <= 0 && !submitting && stage !== 'WRITTEN') {
      doSubmit();
    } else if (paper && remainingMs <= 0 && !submitting && paper.session.level === 'L3') {
      doSubmit();
    }
  }, [remainingMs, paper, submitting, stage]);

  const writtenQs = questions;
  const tasks = paper?.tasks ?? [];
  const practicalTasks = tasks.filter((t) => t.part === 'PRACTICAL');
  const deliverableTask = tasks.find((t) => t.part === 'DELIVERABLE');
  const essayTask = tasks.find((t) => t.part === 'ESSAY');

  const answeredCount = useMemo(() => writtenQs.filter((q) => q.selectedChoice).length, [writtenQs]);

  const updateAnswer = (q: Question, choiceKey: string | null, flagged?: boolean) => {
    setQuestions((prev) => prev.map((x) => (x.questionId === q.questionId ? { ...x, selectedChoice: choiceKey, flagged: flagged ?? x.flagged } : x)));
    if (saveTimers.current[q.questionId]) window.clearTimeout(saveTimers.current[q.questionId]);
    saveTimers.current[q.questionId] = window.setTimeout(() => {
      examApi
        .saveAnswer(sessionId!, {
          questionId: q.questionId,
          selectedChoice: choiceKey,
          flagged: flagged ?? q.flagged,
          version: q.version,
        })
        .then((res) => {
          setQuestions((prev) => prev.map((x) => (x.questionId === q.questionId ? { ...x, version: res.data.version } : x)));
        })
        .catch(() => {});
    }, 400);
  };

  const savePracticalNow = async (taskId: string, contentText: string, chat: { role: 'user' | 'assistant'; text: string; ts: number }[]) => {
    try {
      const res = await examApi.savePractical(sessionId!, {
        taskId,
        contentText,
        aiChatLog: chat,
        version: practicalVersion[taskId] ?? 0,
      });
      setPracticalVersion((v) => ({ ...v, [taskId]: res.data.version }));
    } catch {
      // swallow — auto-save will retry
    }
  };

  const updatePractical = (taskId: string, text: string) => {
    setPracticalText((t) => ({ ...t, [taskId]: text }));
    if (saveTimers.current[taskId]) window.clearTimeout(saveTimers.current[taskId]);
    saveTimers.current[taskId] = window.setTimeout(() => {
      savePracticalNow(taskId, text, practicalChat[taskId] ?? []);
    }, 600);
  };

  const sendChat = (taskId: string) => {
    if (!chatInput.trim()) return;
    const userMsg = { role: 'user' as const, text: chatInput, ts: Date.now() };
    const aiMsg = { role: 'assistant' as const, text: simulateAi(chatInput), ts: Date.now() + 1 };
    const newChat = [...(practicalChat[taskId] ?? []), userMsg, aiMsg];
    setPracticalChat((c) => ({ ...c, [taskId]: newChat }));
    setChatInput('');
    savePracticalNow(taskId, practicalText[taskId] ?? '', newChat);
  };

  const doSubmit = async () => {
    if (!sessionId || submitting) return;
    setSubmitting(true);
    try {
      // Flush any pending saves
      for (const t of tasks) {
        await savePracticalNow(t.taskId, practicalText[t.taskId] ?? '', practicalChat[t.taskId] ?? []);
      }
      await examApi.submit(sessionId);
      navigate(`/cbt/exam/${sessionId}/result`);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Submit failed');
      setSubmitting(false);
    }
  };

  if (error) return <div className="p-8 text-red-700">{error}</div>;
  if (!paper) return <div className="p-8 text-gray-600">Loading exam…</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-extrabold tracking-tight">AXIS EXAM</span>
          <span className="text-xs px-2 py-0.5 rounded" style={{ background: `${color}33`, color: '#fff' }}>
            {paper.session.certType.replace('_', '-')} · {paper.session.level}
          </span>
          <span className="text-xs text-gray-400">Stage: {stage}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className={`font-mono text-lg ${remainingMs < 60_000 ? 'text-red-400' : 'text-white'}`}>{remaining}</span>
          <button
            onClick={doSubmit}
            disabled={submitting}
            className="px-4 py-1.5 rounded text-sm font-semibold bg-red-600 hover:bg-red-500 disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : 'Submit exam'}
          </button>
        </div>
      </header>

      {paper.session.level !== 'L3' && (
        <div className="bg-gray-800/60 border-b border-gray-700 px-4 py-2 flex gap-2 text-xs">
          <StageTab label="Part 1 · Written" active={stage === 'WRITTEN'} onClick={() => setStage('WRITTEN')} />
          {practicalTasks.length > 0 && (
            <StageTab label={`Part 2 · Practical (${practicalTasks.length})`} active={stage === 'PRACTICAL'} onClick={() => setStage('PRACTICAL')} />
          )}
          {deliverableTask && <StageTab label="Part 2A · Deliverable" active={stage === 'DELIVERABLE'} onClick={() => setStage('DELIVERABLE')} />}
          {essayTask && <StageTab label="Part 2B · Essay" active={stage === 'ESSAY'} onClick={() => setStage('ESSAY')} />}
        </div>
      )}

      <main className="flex-1 flex overflow-hidden">
        {stage === 'WRITTEN' && (
          <WrittenView
            questions={writtenQs}
            activeIdx={activeIdx}
            setActiveIdx={setActiveIdx}
            onChange={updateAnswer}
            color={color}
            answered={answeredCount}
          />
        )}
        {stage === 'PRACTICAL' && (
          <PracticalListView
            tasks={practicalTasks}
            text={practicalText}
            setText={updatePractical}
            chat={practicalChat}
            chatInput={chatInput}
            setChatInput={setChatInput}
            onSendChat={sendChat}
            color={color}
          />
        )}
        {stage === 'DELIVERABLE' && deliverableTask && (
          <DeliverableView
            task={deliverableTask}
            text={practicalText[deliverableTask.taskId] ?? ''}
            setText={(v) => updatePractical(deliverableTask.taskId, v)}
            chat={practicalChat[deliverableTask.taskId] ?? []}
            chatInput={chatInput}
            setChatInput={setChatInput}
            onSendChat={() => sendChat(deliverableTask.taskId)}
            color={color}
          />
        )}
        {stage === 'ESSAY' && essayTask && (
          <EssayView
            task={essayTask}
            text={practicalText[essayTask.taskId] ?? ''}
            setText={(v) => updatePractical(essayTask.taskId, v)}
            color={color}
          />
        )}
      </main>
    </div>
  );
}

function StageTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded ${active ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
    >
      {label}
    </button>
  );
}

function WrittenView({
  questions,
  activeIdx,
  setActiveIdx,
  onChange,
  color,
  answered,
}: {
  questions: Question[];
  activeIdx: number;
  setActiveIdx: (i: number) => void;
  onChange: (q: Question, choice: string | null, flagged?: boolean) => void;
  color: string;
  answered: number;
}) {
  const active = questions[activeIdx];
  if (!active) return <div className="p-8 text-gray-400">No questions in paper.</div>;
  return (
    <>
      <aside className="w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto p-3">
        <div className="text-xs text-gray-400 mb-2">
          Answered {answered} / {questions.length}
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {questions.map((q, i) => {
            const isActive = i === activeIdx;
            const isAnswered = !!q.selectedChoice;
            return (
              <button
                key={q.questionId}
                onClick={() => setActiveIdx(i)}
                className={`aspect-square text-xs rounded border ${
                  isActive
                    ? 'border-white text-white'
                    : isAnswered
                    ? 'border-gray-600 bg-gray-700 text-gray-200'
                    : 'border-gray-700 text-gray-400'
                } ${q.flagged ? 'ring-1 ring-amber-400' : ''}`}
                style={isActive ? { background: color } : undefined}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </aside>

      <section className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-xs text-gray-400 mb-1">{active.subjectName} · {active.points} pts</div>
          <h2 className="text-lg font-semibold mb-6">
            Q{activeIdx + 1}. {active.stem}
          </h2>
          <div className="space-y-2">
            {active.choices.map((c) => {
              const selected = active.selectedChoice === c.key;
              return (
                <label
                  key={c.key}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${
                    selected ? 'border-white bg-gray-800' : 'border-gray-700 hover:border-gray-500'
                  }`}
                  style={selected ? { borderColor: color } : undefined}
                >
                  <input
                    type="radio"
                    name={active.questionId}
                    checked={selected}
                    onChange={() => onChange(active, c.key)}
                    className="accent-white"
                  />
                  <span className="text-sm font-mono text-gray-400 w-5">{c.key}.</span>
                  <span className="text-sm">{c.text}</span>
                </label>
              );
            })}
          </div>
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setActiveIdx(Math.max(0, activeIdx - 1))}
              disabled={activeIdx === 0}
              className="px-4 py-2 text-sm rounded border border-gray-600 disabled:opacity-30"
            >
              ← Prev
            </button>
            <label className="text-xs text-gray-400 flex items-center gap-2">
              <input
                type="checkbox"
                checked={active.flagged}
                onChange={(e) => onChange(active, active.selectedChoice, e.target.checked)}
              />
              Flag for review
            </label>
            <button
              onClick={() => setActiveIdx(Math.min(questions.length - 1, activeIdx + 1))}
              disabled={activeIdx === questions.length - 1}
              className="px-4 py-2 text-sm rounded border border-gray-600 disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

function PracticalListView({
  tasks,
  text,
  setText,
  chat,
  chatInput,
  setChatInput,
  onSendChat,
  color,
}: {
  tasks: Task[];
  text: Record<string, string>;
  setText: (taskId: string, v: string) => void;
  chat: Record<string, { role: 'user' | 'assistant'; text: string; ts: number }[]>;
  chatInput: string;
  setChatInput: (v: string) => void;
  onSendChat: (taskId: string) => void;
  color: string;
}) {
  const [active, setActive] = useState(0);
  const t = tasks[active];
  if (!t) return <div className="p-8 text-gray-400">No practical tasks.</div>;
  return (
    <div className="flex w-full">
      <aside className="w-56 bg-gray-800 border-r border-gray-700 p-3">
        {tasks.map((tk, i) => (
          <button
            key={tk.taskId}
            onClick={() => setActive(i)}
            className={`w-full text-left p-2 mb-1 rounded text-xs ${i === active ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
            style={i === active ? { borderLeft: `3px solid ${color}` } : undefined}
          >
            <div className="font-semibold">Task {i + 1}</div>
            <div className="text-gray-500 truncate">{tk.title}</div>
          </button>
        ))}
      </aside>
      <DeliverableView
        task={t}
        text={text[t.taskId] ?? ''}
        setText={(v) => setText(t.taskId, v)}
        chat={chat[t.taskId] ?? []}
        chatInput={chatInput}
        setChatInput={setChatInput}
        onSendChat={() => onSendChat(t.taskId)}
        color={color}
      />
    </div>
  );
}

function DeliverableView({
  task,
  text,
  setText,
  chat,
  chatInput,
  setChatInput,
  onSendChat,
  color,
}: {
  task: Task;
  text: string;
  setText: (v: string) => void;
  chat: { role: 'user' | 'assistant'; text: string; ts: number }[];
  chatInput: string;
  setChatInput: (v: string) => void;
  onSendChat: () => void;
  color: string;
}) {
  return (
    <section className="flex-1 grid grid-cols-2 gap-3 p-3 overflow-hidden">
      <div className="bg-gray-800 rounded-lg p-4 overflow-y-auto">
        <div className="text-xs uppercase text-gray-500 mb-1">Scenario · {task.points} pts · {task.durationMin} min</div>
        <h3 className="font-semibold mb-3">{task.title}</h3>
        <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{task.scenario}</p>
      </div>
      <div className="grid grid-rows-2 gap-3 overflow-hidden">
        <div className="bg-gray-800 rounded-lg flex flex-col overflow-hidden">
          <div className="px-3 py-2 text-xs uppercase text-gray-500 border-b border-gray-700">AI chat (logged)</div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {chat.length === 0 && <div className="text-xs text-gray-500">Type a prompt to use the in-platform AI.</div>}
            {chat.map((m, i) => (
              <div key={i} className={`text-xs ${m.role === 'user' ? 'text-blue-300' : 'text-green-300'}`}>
                <span className="font-semibold uppercase">{m.role}:</span> {m.text}
              </div>
            ))}
          </div>
          <div className="border-t border-gray-700 p-2 flex gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSendChat()}
              placeholder="Ask the AI…"
              className="flex-1 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs"
            />
            <button onClick={onSendChat} className="px-3 py-1 text-xs rounded font-semibold" style={{ background: color }}>
              Send
            </button>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg flex flex-col overflow-hidden">
          <div className="px-3 py-2 text-xs uppercase text-gray-500 border-b border-gray-700">Deliverable editor</div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write or paste your deliverable here…"
            className="flex-1 bg-gray-900 p-3 text-sm font-mono outline-none resize-none"
          />
        </div>
      </div>
    </section>
  );
}

function EssayView({ task, text, setText, color }: { task: Task; text: string; setText: (v: string) => void; color: string }) {
  return (
    <section className="flex-1 grid grid-cols-2 gap-3 p-3 overflow-hidden">
      <div className="bg-gray-800 rounded-lg p-4 overflow-y-auto">
        <div className="text-xs uppercase text-gray-500 mb-1">Essay · {task.points} pts · {task.durationMin} min</div>
        <h3 className="font-semibold mb-3">{task.title}</h3>
        <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{task.scenario}</p>
        <div className="mt-4 text-xs text-amber-300/80">
          ⚠ Essay answers are submitted to a similarity check. Write in your own words.
        </div>
      </div>
      <div className="bg-gray-800 rounded-lg flex flex-col overflow-hidden">
        <div className="px-3 py-2 text-xs uppercase text-gray-500 border-b border-gray-700 flex justify-between">
          <span>Your answer</span>
          <span style={{ color }}>{text.trim().split(/\s+/).filter(Boolean).length} words</span>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Answer all three scenario questions…"
          className="flex-1 bg-gray-900 p-3 text-sm outline-none resize-none"
        />
      </div>
    </section>
  );
}

function formatRemaining(ms: number) {
  if (ms <= 0) return '00:00';
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function simulateAi(prompt: string): string {
  return `(simulated) You asked: "${prompt.slice(0, 60)}${prompt.length > 60 ? '…' : ''}". A real LLM would respond here. The chat log is being saved with your submission.`;
}
