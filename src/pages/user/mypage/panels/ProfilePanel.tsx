import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useI18n } from '@/i18n';
import type { InquiryCategory } from '@/services/api';
import { userApi } from '@/services/api';
import {
  formatPhoneDisplay,
  isStrongPassword,
  normalizeBirthDateDigits,
  runNiceVerification,
  type NiceVerifiedIdentity,
} from '@/lib/niceVerification';
import {
  H_CARD,
  T_BODY,
  T_META,
  INK_900,
  GRAY_500,
} from '@/pages/apply/lib/applyTokens';
import { SectionTitle } from '../primitives';
import type { Profile } from '../types';
import { InfoCallout } from '@/components/InfoCallout';

function CardSection({
  title,
  children,
  className = '',
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`bg-white mb-4 ${className}`}>
      <header className="py-4">
        <h3 className={H_CARD} style={{ color: INK_900 }}>
          {title}
        </h3>
      </header>
      <div>{children}</div>
    </section>
  );
}

function FieldRow({
  label,
  help,
  children,
}: {
  label: string;
  help?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className="flex flex-col sm:flex-row border-b first:border-t"
      style={{ borderColor: '#E5E5E5' }}
    >
      <div className="w-full sm:w-27.5 lg:w-32.5 shrink-0 flex items-center px-4 py-3 sm:py-4 bg-[#F8FAFC]">
        <span className={`${T_BODY} font-semibold`} style={{ color: INK_900 }}>
          {label}
        </span>
      </div>
      <div className="flex-1 min-w-0 px-4 py-3 sm:py-4">
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3 sm:flex-wrap">
          {children}
          {help && (
            <p className={`${T_META} min-w-0 flex-1`} style={{ color: GRAY_500 }}>
              {help}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* 모바일: full-width·44px 높이·16px 텍스트(iOS 확대 방지), sm 이상은 기존 데스크톱 사이즈 유지 */
const FIELD_TEXT = 'text-[16px] sm:text-[14px] lg:text-[15px]';
const DISABLED_FIELD_CLASS = `w-full max-w-[350px] h-11 sm:h-10 px-3.5 flex items-center rounded-md bg-[#F3F5F9] border border-[#E0E4ED] cursor-not-allowed select-none ${FIELD_TEXT}`;
const INPUT_CLASS = `w-full max-w-[350px] h-11 sm:h-10 px-3.5 rounded-md bg-white border border-[#E0E4ED] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 ${FIELD_TEXT}`;
const INLINE_LINK_CLASS =
  'text-blue-500 font-semibold underline underline-offset-2 bg-transparent border-none cursor-pointer hover:text-blue-700 p-0';

export function ProfilePanel({
  profile,
  onProfileUpdated,
}: {
  profile: Profile | null;
  onProfileUpdated?: () => void | Promise<void>;
}) {
  const { t, lang } = useI18n();
  const navigate = useNavigate();

  const [newPhone, setNewPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [niceVerified, setNiceVerified] = useState<NiceVerifiedIdentity | null>(null);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    setNewPhone(formatPhoneDisplay(profile?.phone ?? ''));
    setNiceVerified(null);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setSaveError('');
  }, [profile?.phone, profile?.userId]);

  const openSupport = (
    category: InquiryCategory,
    titleKo: string,
    titleEn: string,
  ) =>
    navigate('/qna', {
      state: {
        prefill: {
          category,
          title: lang === 'ko' ? titleKo : titleEn,
        },
      },
    });

  const goLabel = lang === 'ko' ? '바로가기' : 'Go';

  const newPhoneDigits = newPhone.replace(/\D/g, '');
  const currentPhoneDigits = (profile?.phone ?? '').replace(/\D/g, '');
  const phoneChanged =
    newPhoneDigits.length >= 10 && newPhoneDigits !== currentPhoneDigits;
  const showPhoneVerify = phoneChanged && niceVerified === null;

  const phoneReadyToSave =
    phoneChanged &&
    niceVerified !== null &&
    niceVerified.phone.replace(/\D/g, '') === newPhoneDigits;

  const willUpdatePassword =
    currentPassword.length > 0 && newPassword.length > 0 && confirmPassword.length > 0;
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const passwordValid = isStrongPassword(newPassword);

  const handlePhoneInput = (raw: string) => {
    setNewPhone(formatPhoneDisplay(raw));
    setNiceVerified(null);
    setSaveError('');
  };

  const identityMatchesProfile = (identity: NiceVerifiedIdentity): boolean => {
    if (!profile) return false;
    const nameOk = identity.name.trim() === (profile.name ?? '').trim();
    const birthOk =
      normalizeBirthDateDigits(identity.birthDate) ===
      normalizeBirthDateDigits(profile.birthDate);
    return nameOk && birthOk;
  };

  const handleNiceVerifyPhone = async () => {
    if (!profile?.userId || !phoneChanged) return;
    setSaveError('');
    setVerifyingPhone(true);
    try {
      const result = await runNiceVerification({
        allowExistingAccount: true,
        expectedUserId: profile.userId,
        popupBlockedMessage:
          lang === 'ko'
            ? '팝업이 차단되었습니다. 팝업 허용 후 다시 시도해 주세요.'
            : 'Popup blocked. Allow popups and try again.',
        requestFailedMessage:
          lang === 'ko' ? '본인인증 요청에 실패했습니다.' : 'Verification request failed.',
        verifyFailedMessage:
          lang === 'ko' ? '본인인증에 실패했습니다.' : 'Identity verification failed.',
        timeoutMessage:
          lang === 'ko' ? '본인인증 시간이 초과되었습니다.' : 'Verification timed out.',
        identityMismatchMessage:
          lang === 'ko'
            ? '본인인증 정보가 로그인 계정과 일치하지 않습니다.'
            : 'Verified identity does not match your account.',
      });
      if (!result) return;
      if (!identityMatchesProfile(result)) {
        setSaveError(
          lang === 'ko'
            ? '본인인증 성명·생년월일이 등록된 정보와 일치하지 않습니다.'
            : 'Verified name or birth date does not match your profile.',
        );
        return;
      }
      const verifiedDigits = result.phone.replace(/\D/g, '');
      if (verifiedDigits !== newPhoneDigits) {
        setSaveError(
          lang === 'ko'
            ? '본인인증 휴대전화 번호가 입력한 번호와 일치하지 않습니다.'
            : 'Verified phone number does not match what you entered.',
        );
        return;
      }
      setNiceVerified(result);
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : String(e));
    } finally {
      setVerifyingPhone(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaveError('');
    const willUpdatePhone = phoneReadyToSave;

    if (!willUpdatePhone && !willUpdatePassword) {
      if (phoneChanged && !niceVerified) {
        setSaveError(
          lang === 'ko'
            ? '휴대전화 변경 전 본인인증을 완료해 주세요.'
            : 'Complete identity verification before changing your phone.',
        );
        return;
      }
      setSaveError(lang === 'ko' ? '변경된 내용이 없습니다.' : 'No changes to save.');
      return;
    }

    if (willUpdatePhone && !phoneReadyToSave) {
      setSaveError(
        lang === 'ko'
          ? '휴대전화 변경 전 본인인증을 완료해 주세요.'
          : 'Complete identity verification before changing your phone.',
      );
      return;
    }

    if (willUpdatePassword) {
      if (!currentPassword) {
        setSaveError(
          lang === 'ko' ? '현재 비밀번호를 입력해 주세요.' : 'Enter your current password.',
        );
        return;
      }
      if (!passwordValid) {
        setSaveError(
          lang === 'ko'
            ? '새 비밀번호는 8자 이상, 영문·숫자·특수문자를 포함해야 합니다.'
            : 'New password must be 8+ chars with letters, numbers, and a symbol.',
        );
        return;
      }
      if (!passwordsMatch) {
        setSaveError(
          lang === 'ko' ? '새 비밀번호가 일치하지 않습니다.' : 'New passwords do not match.',
        );
        return;
      }
    }

    setSaving(true);
    try {
      if (willUpdatePhone && niceVerified) {
        await userApi.updatePhone({
          niceSessionId: niceVerified.sessionId,
          phone: newPhoneDigits,
        });
      }
      if (willUpdatePassword) {
        await userApi.changePassword({
          currentPassword,
          newPassword,
        });
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setNiceVerified(null);
      await onProfileUpdated?.();
      alert(lang === 'ko' ? '정보가 저장되었습니다.' : 'Your changes have been saved.');
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const msg = err.response?.data?.message;
        setSaveError(
          typeof msg === 'string'
            ? msg
            : lang === 'ko'
              ? '저장에 실패했습니다.'
              : 'Failed to save changes.',
        );
      } else {
        setSaveError(lang === 'ko' ? '저장에 실패했습니다.' : 'Failed to save changes.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SectionTitle title={t('sec.profile.title')} sub="" />

      <CardSection title={lang === 'ko' ? '개인 정보' : 'Personal Info'}>
        <FieldRow
          label={lang === 'ko' ? '성명' : 'Name'}
          help={
            <>
              {lang === 'ko'
                ? '성명 변경이 필요한 경우 1:1 문의로 신청해주세요. '
                : 'Name cannot be changed. Submit a 1:1 inquiry to request a change. '}
              <button
                type="button"
                onClick={() =>
                  openSupport(
                    'OTHER',
                    '[계정] 성명 변경 요청',
                    '[Account] Name change request',
                  )
                }
                className={INLINE_LINK_CLASS}
                style={{ fontFamily: 'inherit', fontSize: 'inherit' }}
              >
                {goLabel}
              </button>
            </>
          }
        >
          <div className={DISABLED_FIELD_CLASS} style={{ color: '#737373' }} aria-disabled="true">
            {profile?.name ?? '—'}
          </div>
        </FieldRow>

        <FieldRow label={lang === 'ko' ? '생년월일' : 'Date of birth'}>
          <div className={DISABLED_FIELD_CLASS} style={{ color: '#737373' }} aria-disabled="true">
            {profile?.birthDate ?? '—'}
          </div>
        </FieldRow>

        <FieldRow
          label={lang === 'ko' ? '이메일 (ID)' : 'Email (ID)'}
          help={
            <>
              {lang === 'ko'
                ? '이메일 변경은 1:1 문의로 신청해주세요. '
                : 'Email changes are handled via 1:1 inquiry. '}
              <button
                type="button"
                onClick={() =>
                  openSupport(
                    'TECHNICAL',
                    '[계정] 이메일 변경 요청',
                    '[Account] Email change request',
                  )
                }
                className={INLINE_LINK_CLASS}
                style={{ fontFamily: 'inherit', fontSize: 'inherit' }}
              >
                {goLabel}
              </button>
            </>
          }
        >
          <div className={DISABLED_FIELD_CLASS} style={{ color: '#737373' }} aria-disabled="true">
            {profile?.email ?? '—'}
          </div>
        </FieldRow>
      </CardSection>

      <CardSection title={lang === 'ko' ? '변경 가능 정보' : 'Editable Info'}>
        <FieldRow label={lang === 'ko' ? '휴대전화' : 'Phone'}>
          <input
            type="tel"
            value={newPhone}
            onChange={(e) => handlePhoneInput(e.target.value)}
            placeholder={lang === 'ko' ? '새 휴대전화 번호' : 'New phone number'}
            className={INPUT_CLASS}
            style={{ color: INK_900 }}
            autoComplete="tel"
          />
          {showPhoneVerify && (
            <button
              type="button"
              onClick={handleNiceVerifyPhone}
              disabled={verifyingPhone || saving}
              className="w-full sm:w-auto h-11 sm:h-10 px-4 rounded-md text-[14px] font-semibold text-white bg-blue-500 hover:bg-blue-700 disabled:opacity-50 border-none cursor-pointer whitespace-nowrap"
            >
              {verifyingPhone
                ? lang === 'ko'
                  ? '인증 중…'
                  : 'Verifying…'
                : lang === 'ko'
                  ? '본인인증'
                  : 'Verify'}
            </button>
          )}
          {phoneReadyToSave && (
            <span className={`${T_META} text-[#16A34A] font-medium`}>
              {lang === 'ko' ? '인증 완료' : 'Verified'}
            </span>
          )}
        </FieldRow>

        <FieldRow label={lang === 'ko' ? '현재 비밀번호' : 'Current password'}>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder={lang === 'ko' ? '현재 비밀번호' : 'Current password'}
            className={INPUT_CLASS}
            style={{ color: INK_900 }}
            autoComplete="current-password"
          />
        </FieldRow>

        <FieldRow label={lang === 'ko' ? '새 비밀번호' : 'New password'}>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={lang === 'ko' ? '새 비밀번호' : 'New password'}
            className={INPUT_CLASS}
            style={{ color: INK_900 }}
            autoComplete="new-password"
          />
        </FieldRow>

        <FieldRow label={lang === 'ko' ? '비밀번호 확인' : 'Confirm Password'}>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={lang === 'ko' ? '비밀번호 재입력' : 'Re-enter password'}
            className={INPUT_CLASS}
            style={{ color: INK_900 }}
            autoComplete="new-password"
          />
          {confirmPassword.length > 0 && !passwordsMatch && (
            <span className={`${T_META} text-status-danger`}>
              {lang === 'ko' ? '비밀번호가 일치하지 않습니다.' : 'Passwords do not match.'}
            </span>
          )}
          {newPassword.length > 0 && !passwordValid && (
            <span className={`${T_META} text-status-danger`}>
              {lang === 'ko'
                ? '8자 이상, 영문·숫자·특수문자 포함'
                : '8+ chars with letters, numbers, and a symbol'}
            </span>
          )}
        </FieldRow>
      </CardSection>

      {saveError && (
        <div
          className={`mb-4 px-4 py-3 rounded-xl border border-[#FECACA] bg-[#FEE2E2] ${T_BODY} text-status-danger`}
          role="alert"
        >
          {saveError}
        </div>
      )}

      <InfoCallout tone="red" className="my-10 ">
        <p className="text-red-500 font-semibold">
          회원탈퇴 시 로그인 계정은 비활성화되지만 검정 응시 이력 및 자격 발급 이력은 관련 법령 및
          검정 운영규정에 따라 보관될 수 있습니다.
        </p>
      </InfoCallout>

      <div className="flex flex-col items-stretch gap-3 mt-4 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
        <button
          type="button"
          onClick={handleSaveProfile}
          disabled={saving || verifyingPhone}
          className="w-full sm:w-auto h-11 px-8 rounded-md text-[16px] font-semibold text-white bg-blue-500 hover:bg-blue-700 disabled:opacity-50 border-none cursor-pointer transition-colors"
          style={{ fontFamily: 'inherit' }}
        >
          {saving
            ? lang === 'ko'
              ? '저장 중…'
              : 'Saving…'
            : lang === 'ko'
              ? '정보수정'
              : 'Save Changes'}
        </button>
        <button
          type="button"
          className="w-full sm:w-auto h-11 px-8 rounded-md text-[16px] font-semibold text-white bg-gray-600 hover:bg-gray-700 border-none cursor-pointer transition-colors"
          style={{ fontFamily: 'inherit' }}
        >
          {lang === 'ko' ? '회원탈퇴' : 'Delete Account'}
        </button>
      </div>
    </>
  );
}
