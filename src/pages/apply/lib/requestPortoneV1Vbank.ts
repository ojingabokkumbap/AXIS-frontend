import { loadIamport } from './loadIamport';
import { formatIamportVbankDue, toKcpVbankCode } from './applyPortoneV1Banks';

export type IamportVbankRequest = {
  impCode: string;
  pgProvider: string;
  merchantUid: string;
  orderName: string;
  amount: number;
  bankCode: string;
  buyerName: string;
  buyerEmail: string;
  buyerTel: string;
};

type IamportPayResponse = {
  success?: boolean;
  imp_uid?: string;
  merchant_uid?: string;
  error_msg?: string;
  error_code?: string;
};

export async function requestPortoneV1Vbank(req: IamportVbankRequest): Promise<string> {
  await loadIamport();
  if (!window.IMP) {
    throw new Error('PortOne V1 SDK (IMP) failed to load');
  }

  const pg = req.pgProvider.trim() || 'kcp';
  const vbankCode = toKcpVbankCode(req.bankCode);

  return new Promise((resolve, reject) => {
    window.IMP!.init(req.impCode);
    window.IMP!.request_pay(
      {
        pg,
        pay_method: 'vbank',
        merchant_uid: req.merchantUid,
        name: req.orderName,
        amount: req.amount,
        buyer_name: req.buyerName,
        buyer_email: req.buyerEmail || undefined,
        buyer_tel: req.buyerTel,
        vbank_due: formatIamportVbankDue(24),
        digital: false,
        vbank_code: vbankCode,
      },
      (rsp: IamportPayResponse) => {
        if (rsp.success && rsp.imp_uid) {
          resolve(rsp.imp_uid);
          return;
        }
        const msg = rsp.error_msg?.trim() || '가상계좌 발급이 취소되었습니다.';
        reject(new Error(msg));
      },
    );
  });
}
