interface IamportRequestPayParams {
  pg: string;
  pay_method: string;
  merchant_uid: string;
  name: string;
  amount: number;
  buyer_name?: string;
  buyer_email?: string;
  buyer_tel?: string;
  vbank_due?: string;
  vbank_code?: string;
  digital?: boolean;
}

interface IamportInstance {
  init: (impCode: string) => void;
  request_pay: (
    params: IamportRequestPayParams,
    callback: (response: {
      success?: boolean;
      imp_uid?: string;
      merchant_uid?: string;
      error_msg?: string;
      error_code?: string;
    }) => void,
  ) => void;
}

interface Window {
  IMP?: IamportInstance;
}
