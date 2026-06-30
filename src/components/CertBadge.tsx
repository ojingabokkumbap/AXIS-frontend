import type { CSSProperties, ReactNode } from 'react';

export type CertBadgeType = 'AXIS' | 'AXIS_C' | 'AXIS_H';
export type CertBadgeVariant = 'solid' | 'soft' | 'dark';
export type CertBadgeSize = 'sm' | 'md' | 'lg';

interface Props {
  type: CertBadgeType;
  /** Optional level suffix shown after a separator (e.g. "L3", "L2 STARTER"). */
  level?: string;
  variant?: CertBadgeVariant;
  size?: CertBadgeSize;
  className?: string;
  /** Override the rendered text entirely. */
  children?: ReactNode;
}

const labelOf = (t: CertBadgeType): string =>
  t === 'AXIS_C' ? 'AXIS-C' : t === 'AXIS_H' ? 'AXIS-H' : 'AXIS';

const colorOf = (t: CertBadgeType) =>
  t === 'AXIS_C'
    ? { solid: '#16A34A', soft: 'rgba(22,163,74,0.18)', softText: '#86EFAC' }
    : t === 'AXIS_H'
    ? { solid: '#7C3AED', soft: 'rgba(124,58,237,0.18)', softText: '#C4B5FD' }
    : { solid: '#2563EB', soft: 'rgba(37,99,235,0.18)', softText: '#93C5FD' };

const sizes: Record<CertBadgeSize, string> = {
  sm: 'px-2 py-[2px] text-[10px]',
  md: 'px-2.5 py-[3px] text-[11px]',
  lg: 'px-3 py-[4px] text-[12px]',
};

/** Cert badge chip — used across marketing, MyPage, CBT lobby, and exam result. */
export function CertBadge({
  type,
  level,
  variant = 'solid',
  size = 'md',
  className = '',
  children,
}: Props) {
  const c = colorOf(type);
  const text = children ?? (level ? `${labelOf(type)} · ${level}` : labelOf(type));

  let style: CSSProperties = {};
  let cls = '';
  if (variant === 'solid') {
    style = { background: c.solid, color: '#fff' };
  } else if (variant === 'soft') {
    style = { background: c.soft, color: c.softText };
  } else {
    cls = 'bg-white/5 border border-white/10 text-white/85';
  }

  return (
    <span
      className={`inline-flex items-center rounded font-bold tracking-wide ${sizes[size]} ${cls} ${className}`}
      style={style}
    >
      {text}
    </span>
  );
}

export default CertBadge;
