/* ─────────────────────────────────────────────────────────────
   PageHeroSolid — 단색 배경 hero (이미지 없음, 임시 샘플)
   기본 배경: bg-blue-500
   ───────────────────────────────────────────────────────────── */
interface Props {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Tailwind 배경 클래스 (기본 'bg-blue-500') */
  bgClassName?: string;
  minHeight?: number;
}

export function PageHeroSolid({
  title,
  subtitle,
  bgClassName = 'bg-blue-500',
}: Props) {
  return (
    <section
      className={`relative overflow-hidden min-h-[70px] ${bgClassName} py-14`}
    >
      <div
        className="relative mx-auto w-full min-h-[inherit] flex flex-col justify-center"
        style={{ maxWidth: 1280 }}
      >
        <h1 className="text-[28px] sm:text-[35px] font-semibold leading-[1.2] sm:leading-[1.15] tracking-tight text-white">
          {title}
        </h1>
        {subtitle && (
          <p
            className="mt-3 sm:mt-5 lg:mt-2 text-[15px] sm:text-[18px] font-light max-w-3xl"
            style={{ color: 'rgba(255,255,255,0.85)' }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}

export default PageHeroSolid;
