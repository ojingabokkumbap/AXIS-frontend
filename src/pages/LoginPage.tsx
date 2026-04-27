import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!userId.trim() || !password) {
      setError('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.login(userId, password);
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.message || '로그인에 실패했습니다.';
      setError(msg);
    } finally {
      setLoading(false);
    }
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
            <Link to="/signup" className="text-white/80 hover:text-white no-underline transition-colors duration-200">
              회원가입
            </Link>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main id="main-content" className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[440px]">
          {/* Card */}
          <div className="bg-white rounded-xl border border-gray-border p-8 md:p-10">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-extrabold text-primary mb-2">로그인</h1>
              <p className="text-sm text-gray">
                AXIS 자격검정 시스템에 로그인합니다
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="mb-6 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm flex items-start gap-2"
              >
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* User ID */}
              <div>
                <label htmlFor="userId" className="block text-sm font-semibold text-primary mb-1.5">
                  아이디
                </label>
                <input
                  id="userId"
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="아이디를 입력하세요"
                  autoComplete="username"
                  aria-required="true"
                  className="w-full h-12 px-4 rounded-md border border-gray-border bg-white text-primary text-sm
                             placeholder:text-gray
                             focus:border-axis-blue focus:ring-2 focus:ring-axis-blue/20 focus:outline-none
                             transition-colors duration-200"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-primary mb-1.5">
                  비밀번호
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                    autoComplete="current-password"
                    aria-required="true"
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
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-md bg-axis-blue text-white font-bold text-sm
                           hover:bg-axis-blue/90
                           focus-visible:ring-2 focus-visible:ring-axis-blue focus-visible:ring-offset-2
                           disabled:bg-gray-border disabled:text-gray disabled:cursor-not-allowed
                           transition-colors duration-200"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    로그인 중...
                  </span>
                ) : (
                  '로그인'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-border" />
              <span className="text-xs text-gray font-medium">또는</span>
              <div className="flex-1 h-px bg-gray-border" />
            </div>

            {/* Social login buttons */}
            <div className="space-y-3">
              <button
                type="button"
                className="w-full h-12 rounded-md border border-gray-border bg-[#FEE500] text-[#191919] font-semibold text-sm
                           flex items-center justify-center gap-2
                           hover:bg-[#FDD800] transition-colors duration-200"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#191919">
                  <path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.72 1.8 5.108 4.516 6.467-.197.735-.714 2.666-.818 3.079-.128.508.186.501.391.364.161-.107 2.565-1.74 3.604-2.448.746.11 1.515.168 2.307.168 5.523 0 10-3.463 10-7.63C22 6.463 17.523 3 12 3z"/>
                </svg>
                카카오로 로그인
              </button>

              <button
                type="button"
                className="w-full h-12 rounded-md border border-gray-border bg-[#03C75A] text-white font-semibold text-sm
                           flex items-center justify-center gap-2
                           hover:bg-[#02b351] transition-colors duration-200"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                  <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z"/>
                </svg>
                네이버로 로그인
              </button>

              <button
                type="button"
                className="w-full h-12 rounded-md border border-gray-border bg-white text-gray-text font-semibold text-sm
                           flex items-center justify-center gap-2
                           hover:bg-gray-light transition-colors duration-200"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google로 로그인
              </button>
            </div>

            {/* Sign up link */}
            <div className="text-center mt-8 pt-6 border-t border-gray-border">
              <p className="text-sm text-gray">
                아직 회원이 아니신가요?{' '}
                <Link
                  to="/signup"
                  className="text-axis-blue font-semibold hover:underline no-underline"
                >
                  회원가입
                </Link>
              </p>
            </div>
          </div>

          {/* Footer text */}
          <p className="text-center text-xs text-gray mt-6">
            &copy; 2026 AiNex Inc. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
}
