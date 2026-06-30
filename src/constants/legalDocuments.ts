/** Public legal pages — served from /legal/*.html (open in browser, not download). */
export const LEGAL_DOCUMENTS = [
  { id: 'terms', path: '/legal/1-terms.html', labelKey: 'footer.terms' as const, emphasized: false },
  { id: 'privacy', path: '/legal/2-privacy.html', labelKey: 'footer.privacy' as const, emphasized: true },
  { id: 'videoPrivacy', path: '/legal/3-video-privacy.html', labelKey: 'footer.videoPrivacy' as const, emphasized: false },
  { id: 'examPolicy', path: '/legal/4-exam-policy.html', labelKey: 'footer.examPolicy' as const, emphasized: false },
  { id: 'refund', path: '/legal/5-refund.html', labelKey: 'footer.refundPolicy' as const, emphasized: false },
  { id: 'misconduct', path: '/legal/6-misconduct.html', labelKey: 'footer.misconduct' as const, emphasized: false },
  { id: 'qualification', path: '/legal/7-qualification.html', labelKey: 'footer.qualification' as const, emphasized: false },
  { id: 'noEmail', path: '/legal/8-no-email.html', labelKey: 'footer.noEmail' as const, emphasized: false },
] as const;

export const LEGAL_TERMS_PATH = LEGAL_DOCUMENTS[0].path;
export const LEGAL_PRIVACY_PATH = LEGAL_DOCUMENTS[1].path;
