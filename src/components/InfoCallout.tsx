import type { ReactNode } from 'react';

type InfoCalloutTone = 'blue' | 'red';

export function InfoCallout({
  tone,
  title,
  children,
  bodyColor = '#525252',
  className = '',
  iconClassName = 'mt-1.5',
  iconSizeClassName = 'sm:w-4 sm:h-4',
}: {
  tone: InfoCalloutTone;
  title?: string;
  children: ReactNode;
  bodyColor?: string;
  className?: string;
  iconClassName?: string;
  iconSizeClassName?: string;
}) {
  const titleClass = tone === 'blue' ? 'text-blue-600' : 'text-red-400';

  return (
    <div className={`flex items-start gap-1 sm:gap-2 min-w-0 ${className}`.trim()}>
      <div className={`${iconClassName} shrink-0 ${titleClass}`.trim()} aria-hidden>
        <svg width="16" height="16" viewBox="0 0 26 26" fill="none" className={iconSizeClassName}>
          <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="12" cy="7.5" r="1.1" fill="currentColor" />
          <path d="M12 11V17.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        {title ? <h3 className={`text-[16px] sm:text-[18px] font-semibold ${titleClass}`}>{title}</h3> : null}
        <div className={`${title ? 'mt-1.5' : ''} text-[14px] sm:text-[16px] leading-relaxed`} style={{ color: bodyColor }}>
          {children}
        </div>
      </div>
    </div>
  );
}
