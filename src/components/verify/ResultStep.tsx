import { Check, AlertTriangle, X } from 'lucide-react';
import { useI18n } from '@/i18n';

export type ResultState = 'match' | 'review' | 'no_match';

interface ResultStepProps {
  state: ResultState;
  similarity?: number;
  onPrimary: () => void;
}

export function ResultStep({ state, similarity, onPrimary }: ResultStepProps) {
  const { t } = useI18n();

  const config: Record<
    ResultState,
    {
      icon: React.ReactNode;
      iconBg: string;
      ring: string;
      title: string;
      body: string;
      button: string;
      buttonClass: string;
    }
  > = {
    match: {
      icon: <Check className="w-12 h-12 text-white" strokeWidth={3} />,
      iconBg: 'bg-green-500',
      ring: 'bg-green-50',
      title: t('idverify.result.matchTitle' as never),
      body: t('idverify.result.matchBody' as never),
      button: t('idverify.result.matchBtn' as never),
      buttonClass: 'bg-blue-600 hover:bg-blue-700',
    },
    review: {
      icon: <AlertTriangle className="w-12 h-12 text-white" strokeWidth={2.5} />,
      iconBg: 'bg-amber-500',
      ring: 'bg-amber-50',
      title: t('idverify.result.reviewTitle' as never),
      body: t('idverify.result.reviewBody' as never),
      button: t('idverify.result.reviewBtn' as never),
      buttonClass: 'bg-gray-900 hover:bg-gray-800',
    },
    no_match: {
      icon: <X className="w-12 h-12 text-red-500" strokeWidth={3} />,
      iconBg: 'bg-red-100',
      ring: 'bg-red-50',
      title: t('idverify.result.failTitle' as never),
      body: t('idverify.result.failBody' as never),
      button: t('idverify.result.failBtn' as never),
      buttonClass: 'bg-blue-600 hover:bg-blue-700',
    },
  };

  const c = config[state];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div
          className={`w-32 h-32 rounded-full ${c.ring} flex items-center justify-center mb-8`}
          style={{ animation: 'fadeZoomIn 0.4s ease-out' }}
        >
          <div className={`w-20 h-20 rounded-full ${c.iconBg} flex items-center justify-center`}>
            {c.icon}
          </div>
        </div>

        <h1 className="text-[28px] md:text-[32px] font-bold tracking-tight text-gray-900 mb-4">
          {c.title}
        </h1>
        <p className="text-[15px] md:text-base text-gray-500 leading-relaxed max-w-md whitespace-pre-line">
          {c.body}
        </p>

        {/* Similarity badge — only shown on match */}
        {state === 'match' && similarity != null && (
          <div className="mt-5 px-4 py-1.5 rounded-full bg-green-100 text-green-700 text-[13px] font-medium">
            {t('idverify.result.similarity' as never, { pct: similarity.toFixed(0) })}
          </div>
        )}
      </div>

      <div className="px-6 pb-8 pt-4">
        <button
          onClick={onPrimary}
          className={`w-full h-12 rounded-2xl text-white font-medium transition-colors ${c.buttonClass}`}
        >
          {c.button}
        </button>
      </div>
    </div>
  );
}
