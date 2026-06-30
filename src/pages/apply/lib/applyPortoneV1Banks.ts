/** KCP / IAMPORT vbank bank codes (PortOne V1 결제창). */
const V2_CODE_TO_KCP: Record<string, string> = {
  KOOKMIN_BANK: '04',
  KOOKMIN: '04',
  SHINHAN_BANK: '88',
  SHINHAN: '88',
  WOORI_BANK: '20',
  WOORI: '20',
  HANA_BANK: '81',
  HANA: '81',
  INDUSTRIAL_BANK_OF_KOREA: '03',
  IBK: '03',
  NH_NONGHYUP_BANK: '11',
  NONGHYUP: '11',
  KAKAO_BANK: '90',
  KAKAO: '90',
  TOSS_BANK: '92',
  TOSS: '92',
};

export function toKcpVbankCode(portoneV2BankCode: string): string {
  return V2_CODE_TO_KCP[portoneV2BankCode] ?? '04';
}

export function formatIamportVbankDue(hoursFromNow = 24): string {
  const d = new Date(Date.now() + hoursFromNow * 3_600_000);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}`;
}
