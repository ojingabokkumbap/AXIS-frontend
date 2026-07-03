import { isMobileDevice } from '@/lib/useIsMobile';

export function openPublicPdf(url: string): void {
  if (isMobileDevice()) {
    window.location.href = url;
    return;
  }
  const opened = window.open(url, '_blank', 'noopener');
  if (!opened) {
    window.location.href = url;
  }
}
