const IAMPORT_SCRIPT = 'https://cdn.iamport.kr/v1/iamport.js';

let loadPromise: Promise<void> | null = null;

export function loadIamport(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('IMP is only available in the browser'));
  }
  if (window.IMP) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${IAMPORT_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('iamport.js load failed')), {
        once: true,
      });
      return;
    }
    const script = document.createElement('script');
    script.src = IAMPORT_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('iamport.js load failed'));
    document.head.appendChild(script);
  });

  return loadPromise;
}
