import { ko } from '@/i18n/ko';

export type EligibilityNoteCode =
  | 'INSUFFICIENT_PROOF'
  | 'DOC_UNREADABLE'
  | 'DOC_EXPIRED'
  | 'WRONG_DOC_TYPE';

export const ELIG_NOTE_PREFIX = '@@AXIS_ELIG:';

type EligNoteI18nKey = `mypage.eligNote.${EligibilityNoteCode}`;

const VALID_CODES = new Set<string>([
  'INSUFFICIENT_PROOF',
  'DOC_UNREADABLE',
  'DOC_EXPIRED',
  'WRONG_DOC_TYPE',
]);

function isEligibilityNoteCode(value: string): value is EligibilityNoteCode {
  return VALID_CODES.has(value);
}

/** Legacy English (and other) free-text notes → canonical reason code. */
const LEGACY_NOTE_ALIASES: Array<{ code: EligibilityNoteCode; test: (normalized: string) => boolean }> = [
  {
    code: 'INSUFFICIENT_PROOF',
    test: (s) =>
      /not enough proof|insufficient proof|enough proof for the exam|does not meet eligibility|not sufficient proof/i.test(
        s,
      ),
  },
  {
    code: 'DOC_UNREADABLE',
    test: (s) =>
      /unreadable|cannot read|can't read|blurry|illegible|not clear|identify the document/i.test(s),
  },
  {
    code: 'DOC_EXPIRED',
    test: (s) => /expired|out of date|validity period|no longer valid/i.test(s),
  },
  {
    code: 'WRONG_DOC_TYPE',
    test: (s) =>
      /wrong document|incorrect document|does not match|not the required|wrong type of document/i.test(
        s,
      ),
  },
];

function normalizeNoteText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function resolveNoteCode(raw: string): EligibilityNoteCode | null {
  if (raw.startsWith(ELIG_NOTE_PREFIX)) {
    const code = raw.slice(ELIG_NOTE_PREFIX.length).trim();
    if (isEligibilityNoteCode(code)) return code;
  }
  const normalized = normalizeNoteText(raw);
  for (const { code, test } of LEGACY_NOTE_ALIASES) {
    if (test(normalized)) return code;
  }
  return null;
}

type TranslateFn = (key: keyof typeof ko, vars?: Record<string, string | number>) => string;

/** Show admin rejection notes in the candidate's selected language. */
export function localizeEligibilityNote(
  note: string | null | undefined,
  t: TranslateFn,
): string {
  const raw = note?.trim();
  if (!raw) return '';

  const code = resolveNoteCode(raw);
  if (code) {
    const key = `mypage.eligNote.${code}` as EligNoteI18nKey;
    return t(key);
  }

  return raw;
}

export function encodeEligibilityNoteCode(code: EligibilityNoteCode): string {
  return `${ELIG_NOTE_PREFIX}${code}`;
}
