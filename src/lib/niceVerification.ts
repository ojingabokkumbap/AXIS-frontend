import { authApi } from '@/services/api';

export type NiceVerifiedIdentity = {
  sessionId: string;
  name: string;
  phone: string;
  birthDate: string;
  gender?: string;
  alreadyRegistered?: boolean;
  existingUserId?: string;
};

type NiceSessionPoll = {
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  verified?: boolean;
  alreadyRegistered?: boolean;
  existingUserId?: string;
  sessionId?: string;
  name?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  message?: string;
};

export type RunNiceVerificationOptions = {
  authType?: 'CHECKPLUS' | 'IPIN';
  /** Profile phone update: existing account is expected. */
  allowExistingAccount?: boolean;
  /** When allowExistingAccount, require this login id from NICE. */
  expectedUserId?: string;
  popupBlockedMessage: string;
  requestFailedMessage: string;
  verifyFailedMessage: string;
  timeoutMessage: string;
  identityMismatchMessage: string;
};

export async function runNiceVerification(
  options: RunNiceVerificationOptions,
): Promise<NiceVerifiedIdentity | null> {
  const authType = options.authType ?? 'CHECKPLUS';

  const popup = window.open(
    '',
    'nicePopup',
    'width=460,height=640,scrollbars=yes,resizable=yes',
  );
  if (!popup) {
    throw new Error(options.popupBlockedMessage);
  }

  let stopped = false;
  let pollTimer: ReturnType<typeof setInterval> | undefined;
  let timeoutTimer: ReturnType<typeof setTimeout> | undefined;

  const cleanup = () => {
    if (stopped) return;
    stopped = true;
    if (pollTimer !== undefined) clearInterval(pollTimer);
    if (timeoutTimer !== undefined) clearTimeout(timeoutTimer);
  };

  try {
    const reqRes = await authApi.requestNiceVerification(authType);
    const { encData, actionUrl, sessionId } = reqRes.data as {
      encData: string;
      actionUrl: string;
      sessionId: string;
    };

    const form = popup.document.createElement('form');
    form.method = 'POST';
    form.action = actionUrl;

    const mInput = popup.document.createElement('input');
    mInput.type = 'hidden';
    mInput.name = 'm';
    mInput.value = 'checkplusSerivce';
    form.appendChild(mInput);

    const input = popup.document.createElement('input');
    input.type = 'hidden';
    input.name = 'EncodeData';
    input.value = encData;
    form.appendChild(input);

    popup.document.body.appendChild(form);
    form.submit();

    return await new Promise<NiceVerifiedIdentity | null>((resolve, reject) => {
      pollTimer = setInterval(async () => {
        if (stopped) return;
        try {
          const res = await authApi.getNiceSession(sessionId);
          const data = res.data as NiceSessionPoll;
          if (data.status === 'PENDING') return;

          cleanup();
          try {
            popup.close();
          } catch {
            /* noop */
          }

          if (data.status === 'FAILED') {
            reject(new Error(data.message || options.verifyFailedMessage));
            return;
          }

          if (!data.verified) {
            reject(new Error(options.verifyFailedMessage));
            return;
          }

          if (data.alreadyRegistered && !options.allowExistingAccount) {
            reject(
              new Error(
                data.message ||
                  `이미 가입된 회원입니다 (${data.existingUserId ?? ''})`,
              ),
            );
            return;
          }

          if (
            options.allowExistingAccount &&
            options.expectedUserId &&
            data.existingUserId &&
            data.existingUserId !== options.expectedUserId
          ) {
            reject(new Error(options.identityMismatchMessage));
            return;
          }

          resolve({
            sessionId: data.sessionId || sessionId,
            name: data.name || '',
            phone: (data.phone || '').replace(/\D/g, ''),
            birthDate: data.birthDate || '',
            gender: data.gender,
            alreadyRegistered: data.alreadyRegistered,
            existingUserId: data.existingUserId,
          });
        } catch {
          // keep polling on transient errors
        }
      }, 1500);

      timeoutTimer = setTimeout(() => {
        cleanup();
        try {
          popup.close();
        } catch {
          /* noop */
        }
        reject(new Error(options.timeoutMessage));
      }, 5 * 60 * 1000);
    });
  } catch (e) {
    cleanup();
    try {
      popup.close();
    } catch {
      /* noop */
    }
    if (e instanceof Error) throw e;
    throw new Error(options.requestFailedMessage);
  }
}

export function normalizeBirthDateDigits(value: string | null | undefined): string {
  return (value ?? '').replace(/\D/g, '').slice(0, 8);
}

export function formatPhoneDisplay(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
}

const PASSWORD_RULE =
  /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

export function isStrongPassword(value: string): boolean {
  return value.length >= 8 && PASSWORD_RULE.test(value);
}
