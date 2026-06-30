import type { ComponentType } from 'react';
import { ClipboardList, CalendarClock, Trophy, BookOpen, FileCheck, LogOut } from 'lucide-react';

type NavItem = {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: number;
};

const NAV_ITEMS: NavItem[] = [
  { id: 'assignments', label: '내 배정 과제', icon: ClipboardList },
  { id: 'eligibility', label: 'L1 자격검토', icon: FileCheck },
  { id: 'deadlines', label: '마감 일정', icon: CalendarClock },
  { id: 'results', label: '확정 결과', icon: Trophy },
  { id: 'rules', label: '채점위원 규정', icon: BookOpen },
];

interface SidebarProps {
  activeId: string;
  onNavigate: (id: string) => void;
  onLogout: () => void;
  isPanelOpen: boolean;
  overdueCount?: number;
  eligibilityPendingCount?: number;
}

export function Sidebar({ activeId, onNavigate, onLogout, isPanelOpen, overdueCount, eligibilityPendingCount }: SidebarProps) {
  return (
    <aside
      className={[
        'relative z-20 shrink-0 bg-white flex h-full overflow-visible transition-[width] duration-300 ease-out',
        isPanelOpen ? 'w-[240px]' : 'w-[72px]',
      ].join(' ')}
    >
      <div className="w-[80px] shrink-0 bg-[var(--primary)] text-white flex flex-col items-center py-4 rounded-tr-3xl">
        <div className="flex flex-col items-center gap-1.5 text-white/90">
          <div className="h-9 w-9 rounded-xl bg-white/15 grid place-items-center font-bold tracking-wider text-[13px]">
            AX
          </div>
          <span className="text-[10px] font-light leading-[1.2] tracking-[-0.01em] text-center">
            EXPERT
          </span>
        </div>

        <div className="mt-auto pt-3">
          <button
            type="button"
            onClick={onLogout}
            aria-label="Logout"
            className="axis-focus flex h-11 w-11 items-center justify-center rounded-lg text-white/75 transition-colors hover:bg-white/10 hover:text-[var(--red-100,#FEE2E2)]"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>

      <div
        className={[
          'min-w-0 flex flex-col overflow-hidden transition-all duration-300 ease-out',
          isPanelOpen ? 'w-[160px] opacity-100' : 'w-0 opacity-0 border-l-0',
        ].join(' ')}
      >
        <nav className="flex-1 overflow-y-auto pl-3 pr-2 py-3 border-r border-[var(--gray-border)]">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeId === item.id;
              const badge =
                item.id === 'deadlines' && overdueCount
                  ? overdueCount
                  : item.id === 'eligibility' && eligibilityPendingCount
                  ? eligibilityPendingCount
                  : item.badge;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onNavigate(item.id)}
                    className={[
                      'axis-focus w-full flex items-center gap-2.5 rounded-md pl-4 pr-2 py-2.5 text-[14px] font-medium transition-colors relative',
                      isActive
                        ? 'bg-[var(--blue-50)] text-[var(--gray-900)]'
                        : 'text-[var(--gray-700)] hover:bg-[var(--gray-50)]',
                    ].join(' ')}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        isActive ? 'text-[var(--primary)]' : 'text-[var(--gray-500)]'
                      }`}
                    />
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {badge ? (
                      <span className="rounded-full bg-[var(--red)] px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {badge}
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
