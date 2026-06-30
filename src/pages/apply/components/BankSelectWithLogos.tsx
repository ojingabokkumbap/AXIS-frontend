import { useEffect, useRef, useState } from 'react';
import { Bank } from '@portone/browser-sdk/v2';

export const VA_BANK_OPTIONS: { label: string; code: string; logo: string }[] = [
  { label: 'KB국민은행', code: Bank.KOOKMIN_BANK, logo: '/banks/kb.svg' },
  { label: '신한은행', code: Bank.SHINHAN_BANK, logo: '/banks/shinhan.svg' },
  { label: '우리은행', code: Bank.WOORI_BANK, logo: '/banks/woori.svg' },
  { label: '하나은행', code: Bank.HANA_BANK, logo: '/banks/hana.svg' },
  { label: 'IBK기업은행', code: Bank.INDUSTRIAL_BANK_OF_KOREA, logo: '/banks/ibk.svg' },
  { label: 'NH농협은행', code: Bank.NH_NONGHYUP_BANK, logo: '/banks/nh.svg' },
  { label: '카카오뱅크', code: Bank.KAKAO_BANK, logo: '/banks/kakao.svg' },
  { label: '토스뱅크', code: Bank.TOSS_BANK, logo: '/banks/toss.svg' },
];

type Props = {
  id: string;
  labelId?: string;
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
};

export function BankSelectWithLogos({ id, labelId, value, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const selected = VA_BANK_OPTIONS.find((b) => b.code === value);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={labelId}
        onClick={() => {
          if (!disabled) setOpen((o) => !o);
        }}
        className="w-full min-h-12 px-3 py-2 border border-[#E5E7EB] rounded-xl text-[14px] bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] flex items-center gap-3 text-left disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {selected ? (
          <>
            <img
              src={selected.logo}
              alt=""
              width={28}
              height={28}
              className="w-7 h-7 rounded-md object-contain shrink-0 border border-[#F1F5F9] bg-white"
            />
            <span className="flex-1 truncate font-medium">{selected.label}</span>
          </>
        ) : (
          <span className="flex-1 text-[#64748B]">은행을 선택해 주세요</span>
        )}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#64748B"
          strokeWidth="2"
          className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && !disabled && (
        <ul
          role="listbox"
          aria-labelledby={labelId}
          className="absolute z-[100] mt-1 w-full max-h-72 overflow-y-auto rounded-xl border border-[#E5E7EB] bg-white shadow-lg py-1"
        >
          <li role="presentation">
            <button
              type="button"
              role="option"
              aria-selected={value === ''}
              className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-[14px] hover:bg-[#F8FAFC] ${
                value === '' ? 'bg-[#EFF6FF]' : ''
              }`}
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
            >
              <span className="w-7 h-7 shrink-0 rounded-md bg-[#F1F5F9] border border-[#E2E8F0]" aria-hidden />
              <span className="text-[#64748B]">은행을 선택해 주세요</span>
            </button>
          </li>
          {VA_BANK_OPTIONS.map((b) => (
            <li key={b.code} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={value === b.code}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-[14px] hover:bg-[#F8FAFC] ${
                  value === b.code ? 'bg-[#EFF6FF]' : ''
                }`}
                onClick={() => {
                  onChange(b.code);
                  setOpen(false);
                }}
              >
                <img
                  src={b.logo}
                  alt=""
                  width={28}
                  height={28}
                  className="w-7 h-7 rounded-md object-contain shrink-0 border border-[#F1F5F9] bg-white"
                />
                <span className="font-medium text-[#0F172A]">{b.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
