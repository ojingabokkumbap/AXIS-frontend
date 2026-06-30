import { lazy, Suspense, useSyncExternalStore } from 'react';

const PublicApp = lazy(() => import('./PublicApp'));
const AdminApp = lazy(() => import('./portals/admin/App'));
const ExpertApp = lazy(() => import('./portals/expert/App'));

function usePathname(): string {
  return useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener('popstate', onStoreChange);
      return () => window.removeEventListener('popstate', onStoreChange);
    },
    () => window.location.pathname,
    () => '/',
  );
}

/**
 * Single Vite app serving three portals on one origin:
 *   /              — public examinee site
 *   /axis_manager/ — admin console
 *   /axis_expert/  — expert grader console
 *
 * Each portal keeps its own BrowserRouter + basename so existing route
 * logic needs no rewrite. Cross-portal navigation uses full page loads.
 */
export default function App() {
  const pathname = usePathname();

  const Portal = pathname.startsWith('/axis_manager')
    ? AdminApp
    : pathname.startsWith('/axis_expert')
      ? ExpertApp
      : PublicApp;

  return (
    <Suspense fallback={null}>
      <Portal />
    </Suspense>
  );
}
