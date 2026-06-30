export type EligibilityRejectCode =
  | 'INSUFFICIENT_PROOF'
  | 'DOC_UNREADABLE'
  | 'DOC_EXPIRED'
  | 'WRONG_DOC_TYPE';

export const ELIG_REJECT_REASONS: Array<{ code: EligibilityRejectCode; label: string }> = [
  { code: 'INSUFFICIENT_PROOF', label: '증빙 서류 불충분 (응시자격 미충족)' },
  { code: 'DOC_UNREADABLE', label: '서류 식별 불가 (흐림·잘림 등)' },
  { code: 'DOC_EXPIRED', label: '증빙 서류 유효기간 만료' },
  { code: 'WRONG_DOC_TYPE', label: '선택한 근거와 무관한 서류' },
];

export const ELIG_NOTE_PREFIX = '@@AXIS_ELIG:';

export function encodeEligibilityRejectNote(code: EligibilityRejectCode): string {
  return `${ELIG_NOTE_PREFIX}${code}`;
}
