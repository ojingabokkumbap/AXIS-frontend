import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { ReactElement } from 'react';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import MyPage from './pages/MyPage';
import ExamSelectPage from './pages/ExamSelectPage';
import ExamRunnerPage from './pages/ExamRunnerPage';
import ExamResultPage from './pages/ExamResultPage';

function RequireAuth({ children }: { children: ReactElement }) {
  const token = localStorage.getItem('accessToken');
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <HomePage />
            </RequireAuth>
          }
        />
        <Route
          path="/mypage"
          element={
            <RequireAuth>
              <MyPage />
            </RequireAuth>
          }
        />
        <Route
          path="/cbt"
          element={
            <RequireAuth>
              <ExamSelectPage />
            </RequireAuth>
          }
        />
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
