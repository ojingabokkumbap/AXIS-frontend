import { useEffect, useRef, useState, type ReactNode } from 'react';
import { FileSearch, MoreVertical } from 'lucide-react';
import { useI18n } from '@/i18n';
import type { BadgeTone } from './types';

const badgeToneClass: Record<BadgeTone, string> = {
  green: 'text-[#059669] font-semibold',
  orange: 'text-[#D97706]',
  red: 'text-status-danger font-semibold',
  blue: 'text-blue font-semibold',
  gray: 'text-[#D1D5DB]',
  purple: 'text-ink font-semibold',
};

export function Badge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return (
    <span className={`text-[13px] whitespace-nowrap flex-shrink-0 ${badgeToneClass[tone]}`}>
      {children}
    </span>
  );
}

export type BtnVariant = 'default' | 'primary' | 'danger' | 'green' | 'orange' | 'blue';

export function Btn({
  variant = 'default',
  className = '',
  children,
  ...rest
}: {
  variant?: BtnVariant;
  className?: string;
  children: ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variants: Record<BtnVariant, string> = {
    default: 'bg-transparent border-[1.5px] border-[#D1D5DB] text-muted hover:bg-[#F9FAFB] hover:border-muted hover:text-body',
    primary: 'bg-blue border-[1.5px] border-blue text-white hover:bg-[#0052CC]',
    danger: 'bg-transparent border-none text-status-danger font-medium hover:text-status-danger',
    green: 'bg-transparent border-[1.5px] border-[#059669] text-[#059669] hover:bg-[#059669]/5',
    orange: 'bg-[#D97706] border-[1.5px] border-[#D97706] text-white hover:bg-[#B45309]',
    blue: 'bg-transparent border-[1.5px] border-blue text-blue hover:bg-blue/5',
  };
  return (
    <button
      {...rest}
      className={`px-5 py-2 rounded-md text-[13px] font-semibold cursor-pointer transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center ${variants[variant]} ${className}`}
      style={{ fontFamily: 'inherit' }}
    >
      {children}
    </button>
  );
}

export function SectionTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-[20px] sm:text-[22px] lg:text-[24px] font-semibold leading-[1.3] tracking-[-0.02em] text-ink mb-2">
        {title}
      </h2>
      <p className="text-[14px] sm:text-[15px] text-light leading-[1.7] tracking-[-0.005em]">{sub}</p>
    </div>
  );
}

export function SectionDivider() {
  return <div className="w-10 h-px bg-border my-10" />;
}

export function InfoBox({ variant = 'default', children }: { variant?: 'default' | 'neutral' | 'important'; children: ReactNode }) {
  const styles = {
    default: 'border-l-2 border-blue bg-[rgba(0,102,255,0.04)]',
    neutral: 'border-l-2 border-ink bg-[#F9FAFB]',
    important: 'border-l-2 border-status-danger bg-[rgba(220,38,38,0.035)]',
  };
  return (
    <div className={`${styles[variant]} px-[18px] py-[14px] my-4 text-[14px] text-body leading-[1.8]`}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, suffix }: { label: string; value: ReactNode; suffix?: string }) {
  return (
    <div className="p-3 border border-border rounded-lg">
      <div className="text-[12px] text-light mb-0.5">{label}</div>
      <div className="text-[18px] font-semibold text-ink font-en tracking-[-0.01em]">
        {value}
        {suffix && <span className="text-[12px] font-normal text-muted ml-1">{suffix}</span>}
      </div>
    </div>
  );
}

export function ListItem({ children }: { children: ReactNode }) {
  return (
    <div className="py-5 border-b border-border last:border-b-0">
      {children}
    </div>
  );
}

export function DetailRow({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-3 py-2 text-[14px] border-b border-border last:border-b-0">
      <span className="text-light flex-shrink-0">{label}</span>
      <span className="text-ink font-medium sm:text-right break-words">{value}</span>
    </div>
  );
}

export function EmptyState({
  children,
  description,
  className = '',
  icon,
}: {
  children: ReactNode;
  description?: ReactNode;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <div className={`flex flex-col items-center justify-center px-4 py-14 text-center ${className}`}>
      <div className="mb-5 text-[#E5E7EB]">
        {icon ?? <FileSearch className="h-16 w-16" strokeWidth={1.7} />}
      </div>
      <div className="text-[16px] font-medium leading-[1.8] text-[#98A2B3] whitespace-pre-line">
        {children}
      </div>
      {description ? (
        <div className="mt-2 text-[14px] leading-[1.7] text-[#B8C0CC] whitespace-pre-line">
          {description}
        </div>
      ) : null}
    </div>
  );
}

export function ScoreBar({
  label,
  value,
  variant = 'default',
}: {
  label: string;
  value: number;
  variant?: 'default' | 'pass' | 'fail';
}) {
  const fill =
    variant === 'pass' ? 'bg-[#059669]' : variant === 'fail' ? 'bg-status-danger' : 'bg-blue';
  return (
    <div className="my-2">
      <div className="flex justify-between text-[12px] text-light mb-1">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 bg-[#F3F5F9] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${fill}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
    </div>
  );
}

export interface KebabItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
}

export function KebabMenu({ items }: { items: KebabItem[] }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        btnRef.current && !btnRef.current.contains(target) &&
        menuRef.current && !menuRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    const onScroll = () => setOpen(false);
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [open]);

  const handleToggle = () => {
    if (open) {
      setOpen(false);
      return;
    }
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) {
      setPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    }
    setOpen(true);
  };

  if (items.length === 0) return null;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={handleToggle}
        className="w-9 h-9 sm:w-7 sm:h-7 inline-flex items-center justify-center rounded-md hover:bg-gray-100 cursor-pointer border border-transparent text-muted flex-shrink-0"
        aria-label={t('mypage.actMenu.more' as never)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <MoreVertical className="w-4 h-4" strokeWidth={2} />
      </button>
      {open && pos && (
        <div
          ref={menuRef}
          role="menu"
          style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 50 }}
          className="min-w-20 bg-white border border-[#E5E5E5] rounded-lg shadow-lg py-1"
        >
          {items.map((item, i) => (
            <button
              key={i}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
              className={`flex flex-col text-left px-5 py-2.5 sm:py-2 text-[13px] cursor-pointer transition-colors ${
                item.danger ? 'text-status-danger hover:bg-red-50' : 'text-ink hover:bg-gray-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

export function SubTabBar<K extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: ReadonlyArray<{ key: K; label: string }>;
  active: K;
  onChange: (k: K) => void;
}) {
  return (
    <div className="flex items-center mb-6 w-full">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`flex-1 px-2 sm:px-4 py-3 text-[15px] sm:text-[17px] font-medium mb-10 transition-all whitespace-nowrap cursor-pointer ${
            active === tab.key
              ? 'bg-blue-500 text-white'
              : ' text-gray-500 hover:text-ink border border-gray-300'
          }`}
          style={{ fontFamily: 'inherit' }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
