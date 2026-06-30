import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { proctorApi } from '@/services/api';
import { useI18n } from '@/i18n';
import { ProgressBar } from '@/components/verify/ProgressBar';
import { IntroStep } from '@/components/verify/IntroStep';
import { IdCardStep } from '@/components/verify/IdCardStep';
import { SelfieStep } from '@/components/verify/SelfieStep';
import { ResultStep, type ResultState } from '@/components/verify/ResultStep';
import { CbtShell } from '@/components/cbt/CbtShell';

type Step = 1 | 2 | 3 | 4;

export default function IdentityVerificationPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [step, setStep] = useState<Step>(1);
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [resultState, setResultState] = useState<ResultState>('match');
  const [similarity, setSimilarity] = useState<number | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleIdCardNext = useCallback((file: File) => {
    setIdCardFile(file);
    setStep(3);
  }, []);

  const handleSelfieNext = useCallback(
    async (liveFaceFile: File) => {
      if (!idCardFile) return;
      setSubmitting(true);
      setApiError('');
      try {
        const res = await proctorApi.verify(idCardFile, liveFaceFile);
        const { decision, similarity: sim } = res.data as {
          decision: 'MATCH' | 'REVIEW' | 'NO_MATCH';
          similarity: number;
        };
        setSimilarity(sim);
        setResultState(
          decision === 'MATCH' ? 'match' : decision === 'REVIEW' ? 'review' : 'no_match',
        );
        setStep(4);
      } catch (e: unknown) {
        const msg =
          (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          t('idverify.serverError' as never);
        setApiError(msg);
      } finally {
        setSubmitting(false);
      }
    },
    [idCardFile, t],
  );

  const handlePrimary = useCallback(() => {
    if (resultState === 'no_match') {
      // Retry from ID card capture
      setIdCardFile(null);
      setApiError('');
      setStep(2);
    } else if (resultState === 'match') {
      navigate('/cbt');
    } else {
      // review — go home
      navigate('/');
    }
  }, [resultState, navigate]);

  return (
    <CbtShell title={t('idverify.shell' as never)}>
      <div className="size-full min-h-full flex items-center justify-center p-0 md:p-8">
        <div className="w-full max-w-[480px] md:max-w-[520px] h-screen md:h-[820px] md:max-h-[88vh] bg-white md:rounded-3xl md:shadow-2xl md:border md:border-white/10 flex flex-col overflow-hidden">

          {/* Progress bar — fixed top */}
          <div className="px-6 pt-6 pb-2 shrink-0">
            <ProgressBar current={step} total={4} />
          </div>

          {/* Step content */}
          <div className="flex-1 overflow-y-auto relative">
            {/* API submission overlay */}
            {submitting && (
              <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-10 h-10 text-[#2563EB] animate-spin" />
                <p className="text-[14px] text-gray-600">{t('idverify.analyzing' as never)}</p>
              </div>
            )}

            {/* API error banner */}
            {apiError && !submitting && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[13px]">
                {apiError}
                <button
                  onClick={() => { setApiError(''); setStep(2); setIdCardFile(null); }}
                  className="ml-2 underline font-medium"
                >
                  {t('idverify.tryAgain' as never)}
                </button>
              </div>
            )}

            {step === 1 && <IntroStep onNext={() => setStep(2)} />}
            {step === 2 && <IdCardStep onNext={handleIdCardNext} />}
            {step === 3 && <SelfieStep onNext={handleSelfieNext} />}
            {step === 4 && (
              <ResultStep
                state={resultState}
                similarity={similarity}
                onPrimary={handlePrimary}
              />
            )}
          </div>
        </div>
      </div>
    </CbtShell>
  );
}
