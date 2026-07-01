import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { lazy, Suspense, type ReactElement } from 'react';
import { SessionSupersededModalHost } from '@/components/SessionSupersededModalHost';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import HomePage from './pages/info/HomePage';
import MyPage from './pages/user/MyPage';
// react-pdf is heavy — keep it out of the main bundle (loaded only on these routes).
const CertificatePrintPage = lazy(() => import('./pages/user/CertificatePrintPage'));
const ConfirmationPrintPage = lazy(() => import('./pages/user/ConfirmationPrintPage'));
const VoucherPrintPage = lazy(() => import('./pages/user/VoucherPrintPage'));
const GuidePdfPage = lazy(() => import('./pages/info/GuidePdfPage'));
import ExamRunnerPage from './pages/exam/runner/ExamRunnerPage';
import ExamResultPage from './pages/exam/result/ExamResultPage';
import DemoPage from './pages/exam/runner/DemoPage';
import ProctorPage from './pages/exam/preflight/ProctorPage';
import IdentityVerificationPage from './pages/exam/preflight/IdentityVerificationPage';
import SessionEvidencePage from './pages/exam/result/SessionEvidencePage';
import EnvironmentCheckPage from './pages/exam/preflight/EnvironmentCheckPage';
import ExamReadinessPage from './pages/exam/preflight/ExamReadinessPage';
import ApplyPage from './pages/apply/ApplyPage';
import ApplyCompletePage from './pages/apply/ApplyCompletePage';
import QnAPage from './pages/info/QnAPage';
import CertGuidePage from './pages/info/CertGuidePage';
import ResultsPage from './pages/info/ResultsPage';
import VerifyCertPage from './pages/info/VerifyCertPage';
import AboutPage from './pages/info/AboutPage';
import { OnboardingProvider } from '@/components/onboarding/OnboardingProvider';

function RequireAuth({ children }: { children: ReactElement }) {
  const location = useLocation();
  const token = localStorage.getItem('accessToken');
  if (token) return children;
  const from = `${location.pathname}${location.search}`;
  return <Navigate to="/login" replace state={{ from }} />;
}

export default function PublicApp() {
  return (
    <BrowserRouter>
      <OnboardingProvider>
      <SessionSupersededModalHost />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Public informational pages — visible without login */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/guide" element={<CertGuidePage />} />
        <Route
          path="/guide/pdf/:guideId"
          element={
            <Suspense fallback={null}>
              <GuidePdfPage />
            </Suspense>
          }
        />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/verify-cert" element={<VerifyCertPage />} />
        <Route path="/qna" element={<QnAPage />} />

        {/* Authenticated pages */}
        <Route
          path="/mypage"
          element={
            <RequireAuth>
              <MyPage />
            </RequireAuth>
          }
        />
        <Route
          path="/mypage/certificate/:certNumber"
          element={
            <RequireAuth>
              <Suspense fallback={null}>
                <CertificatePrintPage />
              </Suspense>
            </RequireAuth>
          }
        />
        <Route
          path="/mypage/confirmation/:resultId"
          element={
            <RequireAuth>
              <Suspense fallback={null}>
                <ConfirmationPrintPage />
              </Suspense>
            </RequireAuth>
          }
        />
        <Route
          path="/mypage/voucher/:registrationId"
          element={
            <RequireAuth>
              <Suspense fallback={null}>
                <VoucherPrintPage />
              </Suspense>
            </RequireAuth>
          }
        />
        {/* /cbt used to render ExamSelectPage which called an admin-only session
            creation API — real candidates enter exams from My Page > 응시 카드. */}
        <Route path="/cbt" element={<Navigate to="/mypage?section=exams" replace />} />
        <Route
          path="/cbt/exam/:sessionId"
          element={
            <RequireAuth>
              <ExamRunnerPage />
            </RequireAuth>
          }
        />
        <Route
          path="/cbt/exam/:sessionId/result"
          element={
            <RequireAuth>
              <ExamResultPage />
            </RequireAuth>
          }
        />
        <Route
          path="/cbt/sessions/:sessionId/evidence"
          element={
            <RequireAuth>
              <SessionEvidencePage />
            </RequireAuth>
          }
        />
        <Route
          path="/cbt/demo/evidence"
          element={
            <RequireAuth>
              <SessionEvidencePage />
            </RequireAuth>
          }
        />
        <Route
          path="/demo/:certType/:level"
          element={
            <RequireAuth>
              <DemoPage />
            </RequireAuth>
          }
        />
        <Route
          path="/proctor"
          element={
            <RequireAuth>
              <ProctorPage />
            </RequireAuth>
          }
        />
        <Route
          path="/verify"
          element={
            <RequireAuth>
              <IdentityVerificationPage />
            </RequireAuth>
          }
        />
        <Route
          path="/env-check"
          element={
            <RequireAuth>
              <EnvironmentCheckPage />
            </RequireAuth>
          }
        />
        <Route
          path="/exam-ready"
          element={
            <RequireAuth>
              <ExamReadinessPage />
            </RequireAuth>
          }
        />
        <Route path="/payments/success" element={<Navigate to="/mypage" replace />} />
        <Route path="/payments/fail" element={<Navigate to="/apply" replace />} />
        <Route path="/apply/success" element={<Navigate to="/apply/complete" replace />} />
        <Route path="/apply/fail" element={<Navigate to="/apply" replace />} />
        {/* 4-step exam registration wizard — page is public; wizard requires login */}
        <Route path="/apply" element={<ApplyPage />} />
        <Route
          path="/apply/complete"
          element={
            <RequireAuth>
              <ApplyCompletePage />
            </RequireAuth>
          }
        />
      </Routes>
      </OnboardingProvider>
    </BrowserRouter>
  );
}
