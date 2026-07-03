/* ─────────────────────────────────────────────────────────────
   PageHero — 상세 페이지 공통 hero
   ───────────────────────────────────────────────────────────── */
interface Props {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  image: string;
  /** 공통 오버레이 프리셋 */
  overlayVariant?: 'none' | 'left-dark-fade';
  /** 필요 시 직접 지정하는 커스텀 오버레이 */
  overlayGradient?: string;
  minHeight?: number;
}

export function PageHero({
  title,
  subtitle,
  image,
  overlayVariant = 'none',
  overlayGradient,
  minHeight = 450,
}: Props) {
  const variantGradient =
    overlayVariant === 'left-dark-fade'
      ? 'linear-gradient(90deg, rgba(16, 23, 34, 0.56) 0%, rgba(16, 23, 34, 0.34) 52%, rgba(16, 23, 34, 0) 100%)'
      : 'transparent';
  const background = overlayGradient ?? variantGradient;
  return (
    <section
      className="relative overflow-hidden min-h-[clamp(220px,38vh,300px)] sm:min-h-[340px] lg:min-h-[450px]"
      style={{
        backgroundImage: `url(${image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        ...(minHeight !== 450 ? { minHeight } : {}),
      }}
    >
      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          background,
        }}
      />

      <div
        className="relative mx-auto w-full min-h-[inherit] px-5 sm:px-6 lg:px-10 flex flex-col justify-center pt-24 sm:pt-28 lg:pt-36 pb-12 sm:pb-20 lg:pb-24"
        style={{ maxWidth: 1280 }}
      >
        <h1 className="text-[28px] sm:text-[40px] lg:text-[54px] font-semibold leading-[1.2] sm:leading-[1.15] tracking-tight text-white">
          {title}
        </h1>
        {subtitle && (
          <p
            className="mt-3 sm:mt-5 lg:mt-6 text-[15px] sm:text-[18px] lg:text-[22px] font-light leading-[1.5] sm:leading-[1.55] max-w-3xl"
            style={{ color: 'rgba(255,255,255,0.78)' }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}

export default PageHero;
