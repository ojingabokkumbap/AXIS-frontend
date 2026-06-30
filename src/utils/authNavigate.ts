import type { NavigateFunction } from 'react-router-dom';

export function isLoggedIn(): boolean {
  return typeof window !== 'undefined' && !!localStorage.getItem('accessToken');
}

/** Safe in-app path for post-login redirect (blocks open redirects). */
export function safeRedirectPath(from: string | undefined): string {
  if (!from || !from.startsWith('/') || from.startsWith('//')) return '/';
  return from;
}

/** Navigate when authenticated; otherwise send user to login with return path. */
export function authNavigate(navigate: NavigateFunction, path: string): void {
  if (isLoggedIn()) {
    navigate(path);
    return;
  }
  navigate('/login', { state: { from: path } });
}
