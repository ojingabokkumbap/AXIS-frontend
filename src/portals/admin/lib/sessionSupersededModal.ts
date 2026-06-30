export const ADMIN_SESSION_SUPERSEDED_EVENT = 'axis:admin-session-superseded';

export type AdminSessionSupersededDetail = {
  redirectTo: string;
  backendMessage?: string;
};

let notifyInFlight = false;

export function showAdminSessionSupersededModal(detail: AdminSessionSupersededDetail): void {
  if (typeof window === 'undefined' || notifyInFlight) return;
  notifyInFlight = true;
  window.dispatchEvent(
    new CustomEvent<AdminSessionSupersededDetail>(ADMIN_SESSION_SUPERSEDED_EVENT, { detail }),
  );
}

export function releaseAdminSessionSupersededNotifyLock(): void {
  notifyInFlight = false;
}
