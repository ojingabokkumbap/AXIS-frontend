/** Session flag: Step 4 skips PortOne and calls /payment/test-confirm instead. */
const STORAGE_KEY = 'axis:apply-payment-demo';

export function readApplyPaymentDemo(): boolean {
  if (typeof sessionStorage === 'undefined') return false;
  return sessionStorage.getItem(STORAGE_KEY) === '1';
}

export function writeApplyPaymentDemo(on: boolean): void {
  if (typeof sessionStorage === 'undefined') return;
  if (on) sessionStorage.setItem(STORAGE_KEY, '1');
  else sessionStorage.removeItem(STORAGE_KEY);
}
