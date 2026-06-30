export const SESSION_SUPERSEDED_EVENT = 'axis:session-superseded';

export type SessionSupersededDetail = {
  redirectTo: string;
  backendMessage?: string;
};

let notifyInFlight = false;

export function showSessionSupersededModal(detail: SessionSupersededDetail): void {
  if (typeof window === 'undefined' || notifyInFlight) return;
  notifyInFlight = true;
  window.dispatchEvent(new CustomEvent<SessionSupersededDetail>(SESSION_SUPERSEDED_EVENT, { detail }));
}

export function releaseSessionSupersededNotifyLock(): void {
  notifyInFlight = false;
}
