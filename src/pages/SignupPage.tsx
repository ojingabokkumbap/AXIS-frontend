import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';

type Step = 'verify' | 'register';

interface NiceResult {
  sessionId: string;
  name: string;
  phone: string;
  birthDate: string;
  gender: string;
}

export default function SignupPage() {
  const navigate = useNavigate();

  // Step control
  const [step, setStep] = useState<Step>('verify');

  // Step 1: NICE verification
  const [phone, setPhone] = useState('');
  const [verifyMethod, setVerifyMethod] = useState<'CHECKPLUS' | 'IPIN'>('CHECKPLUS');
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [verifyFallback, setVerifyFallback] = useState<string | null>(null);
  const [niceResult, setNiceResult] = useState<NiceResult | null>(null);

  // Step 2: Account creation
  const [userId, setUserId] = useState('');
  const [userIdChecked, setUserIdChecked] = useState<boolean | null>(null);
  const [userIdChecking, setUserIdChecking] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [agreeAll, setAgreeAll] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);

  // Phone formatting
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 11);
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
  };

  // Step 1: Start NICE verification
  const handleVerify = async () => {
    setVerifyError('');
    setVerifyFallback(null);
    const cleanPhone = phone.replace(/-/g, '');

    if (!cleanPhone || cleanPhone.length < 10) {
      setVerifyError('올바른 휴대폰 번호를 입력해주세요.');
      return;
    }

    setVerifying(true);

    // Apply a verified result. Returns true if user can advance to signup.
    // "Already registered" is a business outcome, NOT a NICE failure — no fallback.
    const applyVerified = (
      data: { verified?: boolean; alreadyRegistered?: boolean; existingUserId?: string;
        sessionId: string; name: string; phone?: string; birthDate: string; gender: string },
      fallbackReason?: string,
    ): 'ok' | 'duplicate' | 'invalid' => {
      if (!data?.verified) return 'invalid';
      if (data.alreadyRegistered) {
        setVerifyError(`이미 가입된 회원입니다. 아이디: ${data.existingUserId}`);
        return 'duplicate';
      }
      setNiceResult({
        sessionId: data.sessionId,
        name: data.name,
        phone: data.phone || cleanPhone,
        birthDate: data.birthDate,
        gender: data.gender,
      });
      if (fallbackReason) setVerifyFallback(fallbackReason);
      setStep('register');
      return 'ok';
    };

    // Try the sample-data fallback. Returns true on success.
    // Backend rejects this when NICE_DEV_MODE=false, so production stays safe.
    const runFallback = async (reason: string): Promise<boolean> => {
      try {
        const res = await authApi.devNiceVerify(cleanPhone, verifyMethod);
        return applyVerified(res.data, reason) === 'ok';
      } catch {
        return false;
      }
    };

    try {
      const isDev = import.meta.env.DEV;

      if (isDev) {
        // ─── DEV MODE: skip real NICE, use mock endpoint ───
        const res = await authApi.devNiceVerify(cleanPhone, verifyMethod);
        applyVerified(res.data);
        setVerifying(false);
        return;
      }

      // ─── PRODUCTION: real NICE popup flow with sample-data fallback ───
      let reqRes;
      try {
        reqRes = await authApi.requestNiceVerification(verifyMethod);
      } catch {
        const ok = await runFallback('NICE 서비스 연결 실패 — 샘플 데이터로 진행합니다');
        if (!ok) setVerifyError('본인인증 요청에 실패했습니다. 다시 시도해주세요.');
        setVerifying(false);
        return;
      }

      const { encData, actionUrl, requestNo, sessionId } = reqRes.data;

      const popup = window.open(
        '',
        'nicePopup',
        'width=500,height=600,scrollbars=yes,resizable=yes',
      );

      if (!popup) {
        const ok = await runFallback('NICE 팝업이 차단됨 — 샘플 데이터로 진행합니다');
        if (!ok) setVerifyError('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.');
        setVerifying(false);
        return;
      }

      const form = popup.document.createElement('form');
      form.method = 'POST';
      form.action = actionUrl;

      const input = popup.document.createElement('input');
      input.type = 'hidden';
      input.name = 'EncodeData';
      input.value = encData;
      form.appendChild(input);

      popup.document.body.appendChild(form);
      form.submit();

      const checkPopup = setInterval(async () => {
        if (!popup.closed) return;
        clearInterval(checkPopup);
        try {
          const callbackRes = await authApi.handleNiceCallback(encData, verifyMethod, requestNo);
          const outcome = applyVerified({
            ...callbackRes.data,
            sessionId: callbackRes.data.sessionId || sessionId,
          });
          if (outcome === 'invalid') {
            await runFallback('NICE 인증 결과가 유효하지 않음 — 샘플 데이터로 진행합니다');
          }
        } catch {
          const ok = await runFallback('NICE 인증 처리 실패 — 샘플 데이터로 진행합니다');
          if (!ok) setVerifyError('본인인증 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
          setVerifying(false);
        }
      }, 500);
    } catch {
      const ok = await runFallback('본인인증 중 알 수 없는 오류 — 샘플 데이터로 진행합니다');
      if (!ok) setVerifyError('본인인증 요청에 실패했습니다. 다시 시도해주세요.');
      setVerifying(false);
    }
  };

  // Check user ID availability
  const handleCheckUserId = async () => {
    if (!userId || userId.length < 4) return;
    setUserIdChecking(true);
    try {
      const res = await authApi.checkUserId(userId);
      setUserIdChecked(res.data.available);
    } catch {
      setUserIdChecked(null);
    } finally {
      setUserIdChecking(false);
    }
  };

  // Password validation
  const passwordValid =
    password.length >= 8 &&
    /[a-zA-Z]/.test(password) &&
    /\d/.test(password) &&
    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  const passwordsMatch = password === passwordConfirm && passwordConfirm.length > 0;

  // Agree all
  const handleAgreeAll = (checked: boolean) => {
    setAgreeAll(checked);
    setAgreeTerms(checked);
    setAgreePrivacy(checked);
    setAgreeMarketing(checked);
  };

  // Step 2: Submit signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');

    if (!niceResult) {
      setSignupError('본인인증을 먼저 완료해주세요.');
      return;
    }
    if (!userId || userId.length < 4) {
      setSignupError('아이디는 4자 이상이어야 합니다.');
      return;
    }
    if (userIdChecked === false) {
      setSignupError('이미 사용중인 아이디입니다.');
      return;
    }
    if (!passwordValid) {
      setSignupError('비밀번호는 영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다.');
      return;
    }
    if (!passwordsMatch) {
      setSignupError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!agreeTerms || !agreePrivacy) {
      setSignupError('필수 약관에 동의해주세요.');
      return;
    }

    setSignupLoading(true);
    try {
      const res = await authApi.signup({
        userId,
        password,
        niceSessionId: niceResult.sessionId,
        email: email || undefined,
        agreePrivacy,
        agreeTerms,
        agreeMarketing,
      });
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.message || '회원가입에 실패했습니다.';
      setSignupError(msg);
    } finally {
      setSignupLoading(false);
    }
  };

  // Format birth date for display
  const formatBirthDate = (bd: string) => {
    if (!bd || bd.length !== 8) return bd;
    return `${bd.slice(0, 4)}.${bd.slice(4, 6)}.${bd.slice(6, 8)}`;
  };

  return (
    <div className="min-h-screen bg-gray-light flex flex-col">
      {/* Skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded-md focus:text-primary focus:font-semibold"
      >
        본문으로 바로가기
      </a>

      {/* Header */}
      <header className="bg-primary text-white">
        <div className="max-w-[860px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-extrabold tracking-tight no-underline text-white">
            AXIS
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/login" className="text-white/80 hover:text-white no-underline transition-colors duration-200">
              로그인
            </Link>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main id="main-content" className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[520px]">
          {/* Card */}
          <div className="bg-white rounded-xl border border-gray-border p-8 md:p-10">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-extrabold text-primary mb-2">회원가입</h1>
              <p className="text-sm text-gray">AXIS 자격검정 시스템 회원가입</p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-200 ${
                    step === 'verify'
                      ? 'bg-axis-blue text-white'
                      : 'bg-axis-blue text-white'
                  }`}
                >
                  {step === 'register' ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    '1'
                  )}
                </div>
                <span className={`text-sm font-semibold ${step === 'verify' ? 'text-primary' : 'text-axis-blue'}`}>
                  본인인증
                </span>
              </div>

              <div className="w-8 h-px bg-gray-border" />

              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-200 ${
                    step === 'register'
                      ? 'bg-axis-blue text-white'
                      : 'bg-gray-border text-gray'
                  }`}
                >
                  2
                </div>
                <span className={`text-sm font-semibold ${step === 'register' ? 'text-primary' : 'text-gray'}`}>
                  정보입력
                </span>
              </div>
            </div>

            {/* ═══ STEP 1: NICE Verification ═══ */}
            {step === 'verify' && (
              <div>
                {/* Verification method tabs */}
                <div className="flex rounded-lg border border-gray-border overflow-hidden mb-6">
                  <button
                    type="button"
                    onClick={() => setVerifyMethod('CHECKPLUS')}
                    className={`flex-1 h-11 text-sm font-semibold transition-colors duration-200 ${
                      verifyMethod === 'CHECKPLUS'
                        ? 'bg-axis-blue text-white'
                        : 'bg-white text-gray-text hover:bg-gray-light'
                    }`}
                  >
                    PASS 인증
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerifyMethod('IPIN')}
                    className={`flex-1 h-11 text-sm font-semibold transition-colors duration-200 border-l border-gray-border ${
                      verifyMethod === 'IPIN'
                        ? 'bg-axis-blue text-white'
                        : 'bg-white text-gray-text hover:bg-gray-light'
                    }`}
                  >
                    I-PIN 인증
                  </button>
                </div>

                {/* Phone number input */}
                {verifyMethod === 'CHECKPLUS' && (
                  <div className="mb-6">
                    <label htmlFor="phone" className="block text-sm font-semibold text-primary mb-1.5">
                      휴대폰 번호
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      placeholder="010-1234-5678"
                      aria-required="true"
                      className="w-full h-12 px-4 rounded-md border border-gray-border bg-white text-primary text-sm
                                 placeholder:text-gray
                                 focus:border-axis-blue focus:ring-2 focus:ring-axis-blue/20 focus:outline-none
                                 transition-colors duration-200"
                    />
                    <p className="mt-1.5 text-xs text-gray">
                      PASS 앱이 설치된 번호를 입력해주세요
                    </p>
                  </div>
                )}

                {/* IPIN info */}
                {verifyMethod === 'IPIN' && (
                  <div className="mb-6 p-4 rounded-lg bg-gray-light border border-gray-border">
                    <p className="text-sm text-gray-text">
                      I-PIN 인증은 별도의 아이핀 발급이 필요합니다.
                      인증하기 버튼을 클릭하면 아이핀 인증 창이 열립니다.
                    </p>
                  </div>
                )}

                {/* Error */}
                {verifyError && (
                  <div
                    role="alert"
                    className="mb-6 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm flex items-start gap-2"
                  >
                    <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{verifyError}</span>
                  </div>
                )}

                {/* Verify button */}
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={verifying}
                  className="w-full h-12 rounded-md bg-accent text-white font-bold text-sm
                             hover:bg-accent/90
                             focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2
                             disabled:bg-gray-border disabled:text-gray disabled:cursor-not-allowed
                             transition-colors duration-200"
                >
                  {verifying ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      인증 진행중...
                    </span>
                  ) : (
                    '인증하기'
                  )}
                </button>

                {/* Info box */}
                <div className="mt-6 p-4 rounded-lg bg-axis-blue/5 border border-axis-blue/10">
                  <h3 className="text-sm font-bold text-primary mb-2 flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-axis-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    본인인증 안내
                  </h3>
                  <ul className="text-xs text-gray-text space-y-1 pl-5 list-disc">
                    <li>KRIVET 등록 자격검정으로 실명 확인이 필요합니다</li>
                    <li>인증 완료 후 이름, 생년월일이 자동으로 입력됩니다</li>
                    <li>개인정보는 자격관리 목적으로만 사용됩니다</li>
                  </ul>
                </div>
              </div>
            )}

            {/* ═══ STEP 2: Registration Form ═══ */}
            {step === 'register' && niceResult && (
              <form onSubmit={handleSignup}>
                {verifyFallback && (
                  <div
                    role="alert"
                    className="mb-4 p-3 rounded-lg bg-yellow-50 border border-yellow-300 text-yellow-900 text-sm flex items-start gap-2"
                  >
                    <svg className="w-5 h-5 shrink-0 mt-0.5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                    <div>
                      <p className="font-semibold">본인인증 우회됨</p>
                      <p className="text-xs mt-0.5">{verifyFallback}. 가입은 정상 진행되지만 시험 응시 전 실제 본인인증이 필요합니다.</p>
                    </div>
                  </div>
                )}
                {/* Auto-filled verified info */}
                <div className="mb-6 p-4 rounded-lg bg-success/5 border border-success/20">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-sm font-bold text-success">본인인증 완료</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray text-xs">이름</span>
                      <p className="font-semibold text-primary">{niceResult.name}</p>
                    </div>
                    <div>
                      <span className="text-gray text-xs">휴대폰</span>
                      <p className="font-semibold text-primary">{formatPhone(niceResult.phone)}</p>
                    </div>
                    <div>
                      <span className="text-gray text-xs">생년월일</span>
                      <p className="font-semibold text-primary">{formatBirthDate(niceResult.birthDate)}</p>
                    </div>
                    <div>
                      <span className="text-gray text-xs">성별</span>
                      <p className="font-semibold text-primary">
                        {niceResult.gender === '1' ? '남성' : '여성'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* User ID */}
                  <div>
                    <label htmlFor="userId" className="block text-sm font-semibold text-primary mb-1.5">
                      아이디 <span className="text-danger">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="userId"
                        type="text"
                        value={userId}
                        onChange={(e) => {
                          setUserId(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''));
                          setUserIdChecked(null);
                        }}
                        placeholder="영문, 숫자, 밑줄 4-20자"
                        maxLength={20}
                        aria-required="true"
                        aria-describedby="userId-status"
                        className="flex-1 h-12 px-4 rounded-md border border-gray-border bg-white text-primary text-sm
                                   placeholder:text-gray
                                   focus:border-axis-blue focus:ring-2 focus:ring-axis-blue/20 focus:outline-none
                                   transition-colors duration-200"
                      />
                      <button
                        type="button"
                        onClick={handleCheckUserId}
                        disabled={!userId || userId.length < 4 || userIdChecking}
                        className="shrink-0 h-12 px-4 rounded-md border border-gray-border bg-white text-sm font-semibold text-gray-text
                                   hover:bg-gray-light
                                   disabled:bg-gray-light disabled:text-gray disabled:cursor-not-allowed
                                   transition-colors duration-200"
                      >
                        {userIdChecking ? '확인중...' : '중복확인'}
                      </button>
                    </div>
                    <div id="userId-status" aria-live="polite" className="mt-1">
                      {userIdChecked === true && (
                        <p className="text-xs text-success font-medium">사용 가능한 아이디입니다</p>
                      )}
                      {userIdChecked === false && (
                        <p className="text-xs text-danger font-medium">이미 사용중인 아이디입니다</p>
                      )}
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="signup-password" className="block text-sm font-semibold text-primary mb-1.5">
                      비밀번호 <span className="text-danger">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="영문 + 숫자 + 특수문자 8자 이상"
                        aria-required="true"
                        aria-describedby="password-requirements"
                        className="w-full h-12 px-4 pr-12 rounded-md border border-gray-border bg-white text-primary text-sm
                                   placeholder:text-gray
                                   focus:border-axis-blue focus:ring-2 focus:ring-axis-blue/20 focus:outline-none
                                   transition-colors duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray hover:text-gray-text p-1"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {/* Password strength indicators */}
                    {password.length > 0 && (
                      <div id="password-requirements" className="mt-2 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs">
                          <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${password.length >= 8 ? 'bg-success' : 'bg-gray-border'}`}>
                            {password.length >= 8 && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <span className={password.length >= 8 ? 'text-success' : 'text-gray'}>8자 이상</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${/[a-zA-Z]/.test(password) ? 'bg-success' : 'bg-gray-border'}`}>
                            {/[a-zA-Z]/.test(password) && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <span className={/[a-zA-Z]/.test(password) ? 'text-success' : 'text-gray'}>영문 포함</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${/\d/.test(password) ? 'bg-success' : 'bg-gray-border'}`}>
                            {/\d/.test(password) && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <span className={/\d/.test(password) ? 'text-success' : 'text-gray'}>숫자 포함</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) ? 'bg-success' : 'bg-gray-border'}`}>
                            {/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <span className={/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) ? 'text-success' : 'text-gray'}>특수문자 포함</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Password confirm */}
                  <div>
                    <label htmlFor="password-confirm" className="block text-sm font-semibold text-primary mb-1.5">
                      비밀번호 확인 <span className="text-danger">*</span>
                    </label>
                    <input
                      id="password-confirm"
                      type="password"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      placeholder="비밀번호를 다시 입력하세요"
                      aria-required="true"
                      className="w-full h-12 px-4 rounded-md border border-gray-border bg-white text-primary text-sm
                                 placeholder:text-gray
                                 focus:border-axis-blue focus:ring-2 focus:ring-axis-blue/20 focus:outline-none
                                 transition-colors duration-200"
                    />
                    {passwordConfirm.length > 0 && (
                      <p className={`mt-1 text-xs font-medium ${passwordsMatch ? 'text-success' : 'text-danger'}`}>
                        {passwordsMatch ? '비밀번호가 일치합니다' : '비밀번호가 일치하지 않습니다'}
                      </p>
                    )}
                  </div>

                  {/* Email (optional) */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-primary mb-1.5">
                      이메일 <span className="text-gray text-xs font-normal">(선택)</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@email.com"
                      className="w-full h-12 px-4 rounded-md border border-gray-border bg-white text-primary text-sm
                                 placeholder:text-gray
                                 focus:border-axis-blue focus:ring-2 focus:ring-axis-blue/20 focus:outline-none
                                 transition-colors duration-200"
                    />
                  </div>

                  {/* Consent checkboxes */}
                  <div className="pt-2">
                    <div className="border border-gray-border rounded-lg overflow-hidden">
                      {/* Agree all */}
                      <label className="flex items-center gap-3 p-4 bg-gray-light cursor-pointer border-b border-gray-border">
                        <input
                          type="checkbox"
                          checked={agreeAll}
                          onChange={(e) => handleAgreeAll(e.target.checked)}
                          className="w-5 h-5 rounded border-gray-border text-axis-blue focus:ring-axis-blue accent-[#2563EB]"
                        />
                        <span className="text-sm font-bold text-primary">전체 동의</span>
                      </label>

                      {/* Terms */}
                      <label className="flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-border">
                        <input
                          type="checkbox"
                          checked={agreeTerms}
                          onChange={(e) => {
                            setAgreeTerms(e.target.checked);
                            if (!e.target.checked) setAgreeAll(false);
                            else if (agreePrivacy) setAgreeAll(true);
                          }}
                          aria-required="true"
                          className="w-5 h-5 rounded border-gray-border text-axis-blue focus:ring-axis-blue accent-[#2563EB]"
                        />
                        <span className="text-sm text-gray-text">
                          <span className="text-danger font-semibold">[필수]</span> 서비스 이용약관 동의
                        </span>
                      </label>

                      {/* Privacy */}
                      <label className="flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-border">
                        <input
                          type="checkbox"
                          checked={agreePrivacy}
                          onChange={(e) => {
                            setAgreePrivacy(e.target.checked);
                            if (!e.target.checked) setAgreeAll(false);
                            else if (agreeTerms) setAgreeAll(true);
                          }}
                          aria-required="true"
                          className="w-5 h-5 rounded border-gray-border text-axis-blue focus:ring-axis-blue accent-[#2563EB]"
                        />
                        <span className="text-sm text-gray-text">
                          <span className="text-danger font-semibold">[필수]</span> 개인정보 수집·이용 동의
                        </span>
                      </label>

                      {/* Marketing */}
                      <label className="flex items-center gap-3 px-4 py-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agreeMarketing}
                          onChange={(e) => {
                            setAgreeMarketing(e.target.checked);
                            if (!e.target.checked) setAgreeAll(false);
                            else if (agreeTerms && agreePrivacy) setAgreeAll(true);
                          }}
                          className="w-5 h-5 rounded border-gray-border text-axis-blue focus:ring-axis-blue accent-[#2563EB]"
                        />
                        <span className="text-sm text-gray-text">
                          <span className="text-gray font-semibold">[선택]</span> 마케팅 정보 수신 동의
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Error */}
                  {signupError && (
                    <div
                      role="alert"
                      className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm flex items-start gap-2"
                    >
                      <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{signupError}</span>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={signupLoading || !agreeTerms || !agreePrivacy}
                    className="w-full h-12 rounded-md bg-axis-blue text-white font-bold text-sm
                               hover:bg-axis-blue/90
                               focus-visible:ring-2 focus-visible:ring-axis-blue focus-visible:ring-offset-2
                               disabled:bg-gray-border disabled:text-gray disabled:cursor-not-allowed
                               transition-colors duration-200"
                  >
                    {signupLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        가입 처리중...
                      </span>
                    ) : (
                      '회원가입'
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Login link */}
            <div className="text-center mt-8 pt-6 border-t border-gray-border">
              <p className="text-sm text-gray">
                이미 회원이신가요?{' '}
                <Link
                  to="/login"
                  className="text-axis-blue font-semibold hover:underline no-underline"
                >
                  로그인
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray mt-6">
            &copy; 2026 AiNex Inc. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
}
