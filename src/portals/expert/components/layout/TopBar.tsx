import { useMemo } from 'react';
import { Menu, ShieldCheck } from 'lucide-react';
import { CertTag, certCodeOf } from '@expert/components/shared/ui-kit';
import { getStoredExpertUser } from '@expert/utils/auth';
import type { CertType } from '@expert/services/api';

interface Props {
  competencies: CertType[];
  onToggleSidebar: () => void;
}

export function TopBar({ competencies, onToggleSidebar }: Props) {
  const user = useMemo(() => getStoredExpertUser(), []);

  return (
    <header className="h-14 shrink-0 bg-white border-b border-[var(--gray-border)] flex items-center px-4 gap-3">
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
        className="axis-focus h-9 w-9 inline-flex items-center justify-center rounded-md text-[var(--gray-600)] hover:bg-[var(--gray-50)]"
      >
        <Menu className="h-4 w-4" />
      </button>
      <div className="flex items-center gap-2 text-[15px] font-semibold text-[var(--gray-900)]">
        <ShieldCheck className="h-4 w-4 text-[var(--primary)]" />
        AXIS 채점위원 포털
      </div>
      <div className="ml-auto flex items-center gap-3 text-[12px] text-[var(--gray-600)]">
        {competencies.length > 0 ? (
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--gray-500)]">채점 대상</span>
            <CertTag code={certCodeOf('AXIS')} />
            <CertTag code={certCodeOf('AXIS_C')} />
            <CertTag code={certCodeOf('AXIS_H')} />
          </div>
        ) : null}
        {user && (
          <div className="flex items-center gap-1.5 pl-3 border-l border-[var(--gray-border)]">
            <span className="text-[var(--gray-500)]">@{user.userId}</span>
            <span className="font-medium text-[var(--gray-800)]">{user.name}</span>
          </div>
        )}
      </div>
    </header>
  );
}
