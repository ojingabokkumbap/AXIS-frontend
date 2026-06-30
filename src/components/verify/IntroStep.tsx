import { ShieldCheck } from 'lucide-react';
import { useI18n } from '@/i18n';

interface IntroStepProps {
  onNext: () => void;
}

export function IntroStep({ onNext }: IntroStepProps) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center mb-8">
          <ShieldCheck className="w-10 h-10 text-blue-600" strokeWidth={1.5} />
        </div>
        <h1 className="text-[32px] md:text-[36px] font-bold tracking-tight text-gray-900 mb-4">
          {t('idverify.intro.title' as never)}
        </h1>
        <p className="text-[15px] md:text-base text-gray-500 leading-relaxed max-w-md">
          {t('idverify.intro.body1' as never)}
          <br />
          {t('idverify.intro.body2' as never)}
        </p>
      </div>
      <div className="px-6 pb-8 pt-4 space-y-3">
        <button
          onClick={onNext}
          className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors text-white font-medium"
        >
          {t('idverify.intro.start' as never)}
        </button>
        <div className="text-center">
          <span className="text-[13px] text-gray-400 underline cursor-pointer hover:text-gray-600">
            {t('idverify.intro.privacy' as never)}
          </span>
        </div>
      </div>
    </div>
  );
}
