import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  // NICE 본인인증 요청
  requestNiceVerification: (authType: 'CHECKPLUS' | 'IPIN', returnUrl?: string) =>
    api.post('/auth/nice/request', { authType, returnUrl }),

  // NICE 인증 결과 처리
  handleNiceCallback: (encData: string, authType: 'CHECKPLUS' | 'IPIN', requestNo: string) =>
    api.post('/auth/nice/callback', { encData, authType, requestNo }),

  // 회원가입
  signup: (data: {
    userId: string;
    password: string;
    niceSessionId: string;
    email?: string;
    agreePrivacy: boolean;
    agreeTerms: boolean;
    agreeMarketing?: boolean;
  }) => api.post('/auth/signup', data),

  // 로그인
  login: (userId: string, password: string) =>
    api.post('/auth/login', { userId, password }),

  // 아이디 중복 확인
  checkUserId: (userId: string) =>
    api.get(`/auth/check-userid?userId=${userId}`),

  // [DEV] NICE 인증 시뮬레이션
  devNiceVerify: (phone: string, authType: 'CHECKPLUS' | 'IPIN') =>
    api.post('/auth/nice/dev-verify', { phone, authType }),

  // 토큰 갱신
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
};

// User API
export const userApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: { email?: string }) => api.patch('/users/profile', data),
};

// Exam (CBT) API
export type CertType = 'AXIS' | 'AXIS_C' | 'AXIS_H';
export type CertLevel = 'L3' | 'L2' | 'L1';
export type ExamPart = 'WRITTEN' | 'PRACTICAL' | 'DELIVERABLE' | 'ESSAY';

export const examApi = {
  createSession: (certType: CertType, level: CertLevel) =>
    api.post('/cbt/sessions', { certType, level }),
  start: (sessionId: string) => api.post(`/cbt/sessions/${sessionId}/start`),
  paper: (sessionId: string) => api.get(`/cbt/sessions/${sessionId}/paper`),
  saveAnswer: (
    sessionId: string,
    body: { questionId: string; selectedChoice?: string | null; flagged?: boolean; version: number },
  ) => api.post(`/cbt/sessions/${sessionId}/answers`, body),
  savePractical: (
    sessionId: string,
    body: {
      taskId: string;
      contentText: string;
      aiChatLog?: { role: 'user' | 'assistant'; text: string; ts: number }[];
      version: number;
    },
  ) => api.post(`/cbt/sessions/${sessionId}/practical`, body),
  submit: (sessionId: string) => api.post(`/cbt/sessions/${sessionId}/submit`),
  result: (sessionId: string) => api.get(`/cbt/sessions/${sessionId}/result`),
  mine: () => api.get('/cbt/sessions/mine'),
};

export default api;
