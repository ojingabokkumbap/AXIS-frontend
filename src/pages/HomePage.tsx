import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../services/api';
import { LangToggle, useI18n } from '../i18n';

interface Profile {
  id: string;
  userId: string;
  name: string;
  phone?: string;
  email?: string | null;
  birthDate?: string | null;
  roles?: string[];
}

export default function HomePage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await userApi.getProfile();
        if (!cancelled) setProfile(res.data);
      } catch (err: any) {
        if (cancelled) return;
        if (err.response?.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          navigate('/login', { replace: true });
          return;
        }
        setError(err.response?.data?.message || t('home.profileError'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate, t]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-light flex flex-col">
      <header className="bg-primary text-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 h-14 sm:h-16 flex items-center justify-between">
          <span className="text-xl font-extrabold tracking-tight">AXIS</span>
          <nav className="flex items-center gap-4 text-sm">
            <LangToggle />
            <button
              type="button"
              onClick={() => navigate('/mypage')}
              className="text-white/80 hover:text-white transition-colors duration-200"
            >
              {t('gnb.mypage')}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="text-white/80 hover:text-white transition-colors duration-200"
            >
              {t('gnb.logout')}
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[520px] bg-white rounded-xl border border-gray-border p-8 md:p-10">
          <h1 className="text-2xl font-extrabold text-primary mb-6">{t('home.success')}</h1>

          {loading && <p className="text-sm text-gray">{t('home.loading')}</p>}

          {error && (
            <div role="alert" className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
              {error}
            </div>
          )}

          {profile && (
            <dl className="grid grid-cols-[120px_1fr] gap-y-3 text-sm">
              <dt className="text-gray">{t('home.userId')}</dt>
              <dd className="font-semibold text-primary">{profile.userId}</dd>
              <dt className="text-gray">{t('home.name')}</dt>
              <dd className="font-semibold text-primary">{profile.name}</dd>
              {profile.phone && (
                <>
                  <dt className="text-gray">{t('home.phone')}</dt>
                  <dd className="font-semibold text-primary">{profile.phone}</dd>
                </>
              )}
              {profile.email && (
                <>
                  <dt className="text-gray">{t('home.email')}</dt>
                  <dd className="font-semibold text-primary">{profile.email}</dd>
                </>
              )}
              {profile.roles && profile.roles.length > 0 && (
                <>
                  <dt className="text-gray">{t('home.roles')}</dt>
                  <dd className="font-semibold text-primary">{profile.roles.join(', ')}</dd>
                </>
              )}
            </dl>
          )}
        </div>
      </main>
    </div>
  );
}
