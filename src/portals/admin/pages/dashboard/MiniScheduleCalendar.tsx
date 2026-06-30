import { useMemo, useState } from 'react';
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { enUS, ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useI18n } from '@admin/i18n';

export type MiniExam = {
  scheduleId: string;
  name: string;
  dDay: number;
  date: string;
};

type CertCode = 'axis' | 'axisc' | 'axish';

const DOT_COLOR: Record<CertCode, string> = {
  axis: 'var(--blue)',
  axisc: 'var(--green)',
  axish: 'var(--purple)',
};

function codeFromName(name: string): CertCode {
  if (name.includes('AXIS-C')) return 'axisc';
  if (name.includes('AXIS-H')) return 'axish';
  return 'axis';
}

export function MiniScheduleCalendar({
  exams,
  focusDate,
}: {
  exams: MiniExam[];
  focusDate: Date;
}) {
  const { lang } = useI18n();
  const locale = lang === 'ko' ? ko : enUS;
  const [month, setMonth] = useState(() => startOfMonth(focusDate));

  const examsByDay = useMemo(() => {
    const map = new Map<string, MiniExam[]>();
    for (const exam of exams) {
      const key = format(new Date(exam.date), 'yyyy-MM-dd');
      const list = map.get(key);
      if (list) list.push(exam);
      else map.set(key, [exam]);
    }
    return map;
  }, [exams]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const weekdays = useMemo(() => {
    const base = startOfWeek(new Date(), { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => format(addDays(base, i), 'EEEEEE', { locale }));
  }, [locale]);

  const monthLabel = format(month, lang === 'ko' ? 'yyyy년 M월' : 'MMMM yyyy', { locale });

  return (
    <div className="select-none">
      {/* header */}
      <div className="mb-2 flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => setMonth((m) => subMonths(m, 1))}
          className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--gray-500)] hover:bg-[var(--gray-100)]"
          aria-label={lang === 'ko' ? '이전 달' : 'Previous month'}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <strong className="text-[14px] font-bold text-[var(--primary)]">{monthLabel}</strong>
        <button
          type="button"
          onClick={() => setMonth((m) => addMonths(m, 1))}
          className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--gray-500)] hover:bg-[var(--gray-100)]"
          aria-label={lang === 'ko' ? '다음 달' : 'Next month'}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* weekday row */}
      <div className="grid grid-cols-7">
        {weekdays.map((w) => (
          <div key={w} className="py-1.5 text-center text-[11px] font-semibold text-[var(--gray-400)]">
            {w}
          </div>
        ))}
      </div>

      {/* day grid */}
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const dayExams = examsByDay.get(key);
          const inMonth = isSameMonth(day, month);
          const today = isToday(day);
          const codes = dayExams ? Array.from(new Set(dayExams.map((e) => codeFromName(e.name)))) : [];

          return (
            <div
              key={key}
              className={[
                'relative flex h-9 flex-col items-center justify-center gap-0.5',
                dayExams ? 'group cursor-default' : '',
              ].join(' ')}
            >
              <span
                className={[
                  'flex h-6 w-6 items-center justify-center rounded-full text-[15px] tabular-nums',
                  today ? 'bg-[var(--gray-100)] font-bold text-[var(--primary)]' : '',
                  !today && dayExams ? 'font-bold text-[var(--blue)]' : '',
                  !today && !dayExams && inMonth ? 'text-[var(--gray-700)]' : '',
                  !inMonth ? 'text-[var(--gray-300)]' : '',
                ].join(' ')}
              >
                {format(day, 'd')}
              </span>
              <span className="flex h-1 items-center gap-0.5">
                {codes.slice(0, 3).map((code) => (
                  <span
                    key={code}
                    className="h-1 w-1 rounded-full"
                    style={{ backgroundColor: DOT_COLOR[code] }}
                  />
                ))}
              </span>

              {dayExams && (
                <div className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden -translate-x-1/2 group-hover:block">
                  <div className="w-max max-w-[210px] rounded-lg border border-[var(--gray-200)] bg-white px-3 py-2 text-left shadow-[0_10px_28px_rgba(15,23,42,0.14)]">
                    <div className="mb-1.5 text-[11px] font-semibold text-[var(--gray-400)]">
                      {format(day, lang === 'ko' ? 'M월 d일 (EEEEE)' : 'MMM d (EEE)', { locale })}
                    </div>
                    <ul className="space-y-1">
                      {dayExams.map((exam) => (
                        <li key={exam.scheduleId} className="flex items-center gap-2 text-[12px]">
                          <span
                            className="h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{ backgroundColor: DOT_COLOR[codeFromName(exam.name)] }}
                          />
                          <span className="truncate font-semibold text-[var(--primary)]">{exam.name}</span>
                          <span className="ml-auto shrink-0 text-[11px] font-bold text-[var(--blue)]">
                            D-{exam.dDay}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mx-auto h-2 w-2 -translate-y-1 rotate-45 border-b border-r border-[var(--gray-200)] bg-white" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MiniScheduleCalendar;
