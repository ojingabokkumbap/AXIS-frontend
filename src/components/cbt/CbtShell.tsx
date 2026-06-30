import type { ReactNode } from 'react';

interface Props {
  /** Center slot in the top bar (e.g. "AXIS L3 Starter · 제5회"). */
  title?: ReactNode;
  /** Optional center-overlay slot (used for the cyan exam timer in ExamRunnerPage). */
  centerSlot?: ReactNode;
  /** Right-side slot (user name, webcam pip, logout). */
  rightSlot?: ReactNode;
  /** Optional left-side extra (after logo). */
  leftSlot?: ReactNode;
  /** Body content. */
  children: ReactNode;
  /** Optional bottom bar (used by ExamRunnerPage). */
  bottomBar?: ReactNode;
  /** Override min-height — defaults to full viewport. */
  className?: string;
  /** When true the shell becomes a strict fixed-height layout (no scroll on body). */
  fixedHeight?: boolean;
}

/**
 * Dark CBT chrome (cbt.axisexam.com) matching new design / cbt-entry.jsx + cbt-exam.jsx.
 * The top bar is 52px high with the AXIS EXAM logo on the left and a flexible right slot.
 * Use `centerSlot` for absolutely-centered content (timer).
 */
export function CbtShell({
  title,
  centerSlot,
  rightSlot,
  leftSlot,
  children,
  bottomBar,
  className = '',
  fixedHeight = false,
}: Props) {
  return (
    <div
      className={`flex w-full flex-col bg-[#0F1724] font-sans text-[#F1F5F9] ${
        fixedHeight ? 'h-screen overflow-hidden' : 'min-h-screen'
      } ${className}`}
    >
      <div
        className="relative flex h-[52px] flex-shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#0B1220] px-5"
      >
        <div className="flex items-center gap-4">
          <div className="text-[14px] font-extrabold tracking-[0.06em]">
            AXIS<span className="ml-1 text-[#00B4D8]">EXAM</span>
          </div>
          {title && (
            <>
              <div className="h-4 w-px bg-white/10" aria-hidden />
              <div className="text-[12px] text-white/60">{title}</div>
            </>
          )}
          {leftSlot}
        </div>

        {centerSlot && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {centerSlot}
          </div>
        )}

        <div className="flex items-center gap-3">{rightSlot}</div>
      </div>

      <div className={`flex-1 ${fixedHeight ? 'overflow-hidden' : ''}`}>{children}</div>

      {bottomBar && (
        <div className="flex h-[56px] flex-shrink-0 items-center justify-between border-t border-white/[0.06] bg-[#0B1220] px-5">
          {bottomBar}
        </div>
      )}
    </div>
  );
}

export default CbtShell;
