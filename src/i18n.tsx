import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import { en } from './i18n/en';
import { ko } from './i18n/ko';

export type Lang = 'ko' | 'en';

const STORAGE_KEY = 'axis.lang';

const dict = { ko, en } as const;

type Key = keyof typeof ko;

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: Key, vars?: Record<string, string | number>) => string;
}

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'en' || saved === 'ko' ? saved : 'ko';
  });

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    localStorage.setItem(STORAGE_KEY, l);
    setLangState(l);
  };

  const t = (key: Key, vars?: Record<string, string | number>) => {
    let s: string = dict[lang][key] ?? dict.ko[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        s = s.replace(`{${k}}`, String(v));
      }
    }
    return s;
  };

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

export function LangToggle({ className = '' }: { className?: string }) {
  const { lang, setLang } = useI18n();
  const base = 'px-2 py-1 text-xs font-semibold rounded transition-colors';
  const active = 'bg-white text-primary';
  const inactive = 'text-white/70 hover:text-white';
  return (
    <div className={`inline-flex items-center gap-1 rounded-md bg-white/10 p-0.5 ${className}`}>
      <button
        type="button"
        onClick={() => setLang('ko')}
        aria-pressed={lang === 'ko'}
        className={`${base} ${lang === 'ko' ? active : inactive}`}
      >
        KO
      </button>
      <button
        type="button"
        onClick={() => setLang('en')}
        aria-pressed={lang === 'en'}
        className={`${base} ${lang === 'en' ? active : inactive}`}
      >
        EN
      </button>
    </div>
  );
}
