import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { schedulesApi, userApi } from '@/services/api';
import type { DashboardDto } from '@/pages/user/mypage/types';
import {
  pickPublicL3ScheduleRows,
  pickUserScheduleRows,
  type HomeScheduleCta,
  type HomeScheduleRowModel,
  type PublicScheduleDto,
} from './homeSchedule';

const SURFACE = '#FFFFFF';
const SURFACE_ALT = '#F7F7F8';
const BORDER = '#bbbbbb';
const INK_900 = '#191919';
const GRAY_300 = '#737373';
const GRAY_500 = '#525252';

const SECTION = 'py-8 sm:py-[64px] lg:py-[120px] px-5 sm:px-6 lg:px-10';
const WRAP = 'mx-auto max-w-[1280px]';
const H_SEC = 'text-[20px] sm:text-[26px] lg:text-[34px] font-semibold leading-[1.25] sm:leading-[1.15] tracking-[-0.025em]';
const H_CARD = 'text-[15px] sm:text-[19px] lg:text-[22px] font-semibold leading-[1.35] sm:leading-[1.3] tracking-[-0.015em]';
const T_SMALL = 'text-[12px] sm:text-[14px] lg:text-[15px] leading-[1.5]';

const CTA_BASE =
  'inline-flex items-center justify-center h-10 sm:h-12 min-w-0 sm:min-w-29.5 px-5 sm:px-6 rounded-[10px] text-[14px] sm:text-[16px] lg:text-[17px] font-semibold';

export function HomeScheduleSection() {
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const [rows, setRows] = useState<HomeScheduleRowModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        let nextRows: HomeScheduleRowModel[] = [];

        if (token) {
          try {
            const res = await userApi.getDashboard();
            if (cancelled) return;
            const data = res.data as DashboardDto;
            nextRows = pickUserScheduleRows(data.registrations, lang);
          } catch {
            /* fall through to public schedules */
          }
        }

        if (nextRows.length === 0) {
          const schedRes = await schedulesApi.list({ level: 'L3', upcomingOnly: true });
          if (cancelled) return;
          const schedules = schedRes.data as PublicScheduleDto[];
          nextRows = pickPublicL3ScheduleRows(schedules, lang);
        }

        if (!cancelled) setRows(nextRows);
      } catch {
        if (!cancelled) setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [lang]);

  useEffect(() => {
    if (loading) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
    );
    document.querySelectorAll('#home-schedule .reveal:not(.visible)').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [loading, rows]);

  const renderCta = (cta: HomeScheduleCta) => {
    switch (cta.kind) {
      case 'apply':
        return (
          <Link to="/apply" className={`${CTA_BASE} bg-blue-700`} style={{ color: '#fff' }}>
            {t('gnb.applyNav')}
          </Link>
        );
      case 'pay':
        return (
          <button
            type="button"
            className={`${CTA_BASE} bg-amber-500 text-white hover:bg-amber-600 transition-colors`}
            onClick={() => navigate('/apply', {
              state: {
                step: 5,
                regId: cta.reg.id,
                seatHeldUntil: cta.reg.seatHeldUntil,
                certType: cta.reg.certType,
                level: cta.reg.level,
              },
            })}
          >
            {t('home.sched.ctaPay')}
          </button>
        );
      case 'mypage':
        return (
          <Link to="/mypage?section=schedule" className={`${CTA_BASE} bg-blue-700`} style={{ color: '#fff' }}>
            {t('home.sched.ctaMyExams')}
          </Link>
        );
      case 'results':
        return (
          <Link to="/mypage?section=scores" className={`${CTA_BASE} bg-blue-700`} style={{ color: '#fff' }}>
            {t('home.sched.ctaResults')}
          </Link>
        );
      case 'alert':
        return (
          <Link
            to="/apply"
            className={`${CTA_BASE} border-2 bg-amber-400 border-amber-400 text-white hover:bg-yellow-100 transition-colors`}
          >
            {t('home.sched.ctaAlert')}
          </Link>
        );
      case 'closed':
        return (
          <span className={`${CTA_BASE} bg-gray-200 text-gray-500`}>
            {t('home.sched.regClosed')}
          </span>
        );
    }
  };

  return (
    <section id="home-schedule" className={SECTION} style={{ background: SURFACE_ALT }}>
      <div className={WRAP}>
        <div className="flex flex-wrap items-end justify-between gap-6 reveal">
          <h2 className={`${H_SEC} mt-0 sm:mt-4`} style={{ color: INK_900 }}>{t('home.sched.title')}</h2>
          <MoreLink to="/apply">{t('home.sched.viewAll')}</MoreLink>
        </div>

        <div className="mt-5 sm:mt-10 space-y-2.5 sm:space-y-3">
          {loading && (
            <div className="reveal p-8 text-center" style={{ background: SURFACE, borderRadius: 20, border: `1px solid ${BORDER}` }}>
              <span className={T_SMALL} style={{ color: GRAY_300 }}>{t('home.sched.loading')}</span>
            </div>
          )}

          {!loading && rows.length === 0 && (
            <div className="reveal p-8 text-center" style={{ background: SURFACE, borderRadius: 20, border: `1px solid ${BORDER}` }}>
              <span className={T_SMALL} style={{ color: GRAY_500 }}>{t('home.sched.empty')}</span>
            </div>
          )}

          {!loading && rows.map((row) => (
            <div
              key={row.key}
              className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 p-4 sm:p-6 lg:p-8 reveal"
              style={{ background: SURFACE, borderRadius: 20, border: `1px solid ${BORDER}` }}
            >
              <span className={`shrink-0 sm:min-w-24 ${T_SMALL} font-semibold`} style={{ color: row.statusColor }}>
                {t(row.statusKey)}
              </span>
              <div className="flex-1 min-w-0">
                <div className={H_CARD} style={{ color: INK_900 }}>
                  {row.title}{' '}
                  <span className="font-normal break-keep" style={{ color: GRAY_500 }}>· {row.meta}</span>
                </div>
                {row.sub && (
                  <div className={`${T_SMALL} mt-1.5 sm:mt-2`} style={{ color: GRAY_300 }}>{row.sub}</div>
                )}
              </div>
              <div className="shrink-0">{renderCta(row.cta)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MoreLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="group inline-flex items-center gap-1.5 sm:gap-2 h-9 sm:h-11 lg:h-12 px-3.5 sm:px-5 lg:px-6 rounded-full text-[13px] sm:text-[14px] lg:text-[15px] font-semibold border-2 transition-colors border-[#191919] text-[#191919] bg-transparent hover:bg-black hover:!text-white"
    >
      <span className="group-hover:text-white">{children}</span>
      <svg
        className="transition-transform group-hover:translate-x-0.5 group-hover:text-white"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    </Link>
  );
}
