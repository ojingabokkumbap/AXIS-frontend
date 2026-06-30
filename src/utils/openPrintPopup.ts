/**
 * Open a PDF / print-style document in a centered popup window.
 * Falls back to a normal new tab if the popup is blocked.
 */
export function openPrintPopup(path: string, name: string) {
  const w = 860;
  const h = Math.min(1040, window.screen.availHeight - 40);
  const left = window.screenX + Math.max(0, (window.outerWidth - w) / 2);
  const top = window.screenY + Math.max(0, (window.outerHeight - h) / 2);
  const features = `popup=yes,width=${w},height=${h},left=${Math.round(left)},top=${Math.round(top)},resizable=yes,scrollbars=yes`;
  const popup = window.open(path, name, features);
  if (!popup) window.open(path, '_blank', 'noopener');
  else popup.focus();
}
