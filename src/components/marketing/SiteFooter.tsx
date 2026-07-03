import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { authNavigate } from '@/utils/authNavigate';
import { FooterLegalLinks } from './LegalDocumentLink';
import { publicSiteApi } from '@/services/api';

/* ─────────────────────────────────────────────────────────────
   Light footer — Channel Talk 레퍼런스 스타일
   ───────────────────────────────────────────────────────────── */
const INK = '#191919';
const BODY = '#525252';
const MUTED = '#8C8C8C';
const DIVIDER = '#E5E5E5';

const colHead = `text-[14px] sm:text-[15px] font-bold mb-3 sm:mb-5 font-en`;
const colLink = `block text-[14px] leading-[1.95] sm:leading-[2.1] no-underline transition-colors text-[${BODY}] hover:text-[${INK}]`;

function adminFooterHostLabel(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

export function SiteFooter() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [footerAdminLink, setFooterAdminLink] = useState<string | null>(null);

  const authFooterLink = (path: string, label: string) => (
    <button
      type="button"
      onClick={() => authNavigate(navigate, path)}
      className={`${colLink} bg-transparent border-none cursor-pointer text-left p-0`}
      style={{ color: BODY, fontFamily: 'inherit' }}
    >
      {label}
    </button>
  );

  useEffect(() => {
    let cancelled = false;
    void publicSiteApi
      .context()
      .then((res) => {
        if (!cancelled) setFooterAdminLink(res.data.footerAdminLink ?? null);
      })
      .catch(() => {
        if (!cancelled) setFooterAdminLink(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <footer
      className="bg-white"
      style={{ borderTop: `1px solid #bfbfbf`, color: BODY }}
    >
      <div className="mx-auto px-5 sm:px-6 lg:px-10 pt-10 sm:pt-16 lg:pt-20 pb-6 sm:pb-8" style={{ maxWidth: 1280 }}>

        {/* ── Top: 다칼럼 ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-6 sm:gap-x-8 sm:gap-y-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div
              className="text-[24px] sm:text-[28px] font-extrabold font-en"
              style={{ color: INK, letterSpacing: '-0.02em' }}
            >
              AXIS
            </div>
            <p className="mt-3 sm:mt-4 text-[13px] sm:text-[14px] leading-[1.6] sm:leading-[1.7] max-lg:break-keep" style={{ color: MUTED }}>
              AI 시대의 실무 역량을 검증하는<br />
              민간자격 검정 플랫폼
            </p>
          </div>

          {/* 서비스 */}
          <div>
            <div className={colHead} style={{ color: INK }}>{t('footer.quick')}</div>
            {authFooterLink('/apply', t('footer.q.apply'))}
            <Link to="/demo/AXIS/L3" className={colLink} style={{ color: BODY }}>
              {t('footer.q.exam')}
            </Link>
            {authFooterLink('/results', t('footer.q.results'))}
            <Link to="/verify-cert" className={colLink} style={{ color: BODY }}>
              {t('footer.q.verify')}
            </Link>
          </div>

          {/* 지원 */}
          <div>
            <div className={colHead} style={{ color: INK }}>{t('footer.support')}</div>
            <Link to="/qna?tab=notice" className={colLink} style={{ color: BODY }}>{t('footer.q.notice')}</Link>
            <Link to="/qna?tab=faq" className={colLink} style={{ color: BODY }}>{t('footer.q.faq')}</Link>
            <Link to="/qna?tab=ask" className={colLink} style={{ color: BODY }}>{t('footer.q.ask')}</Link>
          </div>

          {/* 연락처 */}
          <div className="col-span-2 md:col-span-1">
            <div className={colHead} style={{ color: INK }}>{t('footer.contact')}</div>
            <div className="text-[18px] sm:text-[20px] font-bold font-en mb-1" style={{ color: INK }}>
              {t('footer.phone')}
            </div>
            <a href="mailto:support@axisexam.com" className={colLink} style={{ color: BODY }}>
              {t('footer.email')}
            </a>
            <div className="text-[14px] leading-[2.1]" style={{ color: MUTED }}>
              {t('footer.hours')}
            </div>

            <div className="mt-4 sm:mt-5 flex flex-col gap-1.5">
              <a
                href="https://ainexs.co.kr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[14px] no-underline transition-colors"
                style={{ color: BODY, fontFamily: 'var(--font-en)' }}
              >
                ainexs.co.kr <span className="text-[12px]" style={{ color: MUTED }}>↗</span>
              </a>
              {footerAdminLink ? (
                <a
                  href={footerAdminLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[14px] font-bold no-underline transition-colors"
                  style={{ color: INK, fontFamily: 'var(--font-en)' }}
                >
                  <span className="sr-only">{t('footer.adminPortal')} — </span>
                  {adminFooterHostLabel(footerAdminLink)}
                  <span className="text-[12px]" style={{ color: MUTED }}>↗</span>
                </a>
              ) : null}
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div
          className="mt-7 md:mt-14 pt-5 sm:pt-6 flex flex-col gap-3 sm:gap-4 md:flex-row md:items-start md:justify-between"
          style={{ borderTop: `1px solid #bfbfbf` }}
        >
          {/* Copyright + 회사 정보 */}
          <div className="text-[13px] leading-[1.9] max-lg:break-keep" style={{ color: MUTED }}>
            <div className="font-medium" style={{ color: BODY }}>{t('footer.copyright')}</div>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
              <span>{t('footer.company')}</span>
              <span className="hidden sm:inline" style={{ color: DIVIDER }}>|</span>
              <span>{t('footer.ceo')}</span>
              <span className="hidden sm:inline" style={{ color: DIVIDER }}>|</span>
              <span>{t('footer.bizno')}</span>
            </div>
            <div className="mt-0.5">{t('footer.address')}</div>
          </div>

          <FooterLegalLinks />
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
