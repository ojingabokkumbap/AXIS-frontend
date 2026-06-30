import { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { useI18n } from '@/i18n';

interface SelfieStepProps {
  onNext: (file: File) => void;
}

type Hint =
  | { type: 'warn'; text: string }
  | { type: 'success'; text: string };

export function SelfieStep({ onNext }: SelfieStepProps) {
  const { t } = useI18n();
  const [hint] = useState<Hint>({ type: 'warn', text: t('idverify.face.hint' as never) });
  const [processing, setProcessing] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setProcessing(true);
    setTimeout(() => onNext(file), 400);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const hintStyles =
    hint.type === 'success'
      ? 'bg-green-50 text-green-700 border border-green-200'
      : 'bg-amber-50 text-amber-700 border border-amber-200';

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-6">
        <h1 className="text-[28px] md:text-[32px] font-bold tracking-tight text-gray-900 mb-2">
          {t('idverify.face.title' as never)}
        </h1>
        <p className="text-[14px] md:text-[15px] text-gray-500">{t('idverify.face.sub' as never)}</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-6">
        {/* Oval face guide frame */}
        <div className="relative w-full max-w-sm aspect-[3/4] bg-gradient-to-b from-blue-50 to-gray-50 rounded-3xl overflow-hidden flex items-center justify-center">
          <div
            className={`absolute w-[70%] aspect-[3/4] rounded-[50%] border-[3px] transition-all duration-500 ${
              hint.type === 'success'
                ? 'border-green-400 shadow-[0_0_40px_rgba(74,222,128,0.5)]'
                : 'border-blue-400 shadow-[0_0_30px_rgba(96,165,250,0.4)]'
            }`}
          />
          {/* Placeholder silhouette */}
          <div className="w-24 h-24 rounded-full bg-gray-200/60" />

          {/* Hint badge */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-center">
            <div className={`px-4 py-2 rounded-full text-[13px] ${hintStyles}`}>
              {hint.text}
            </div>
          </div>

          {/* Processing overlay */}
          {processing && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          )}
        </div>
      </div>

      <div className="px-6 pb-8 pt-4">
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="user"
          className="hidden"
          onChange={handleInputChange}
        />
        <button
          onClick={() => cameraInputRef.current?.click()}
          disabled={processing}
          className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors text-white font-medium flex items-center justify-center gap-2"
        >
          <Camera className="w-5 h-5" />
          {t('idverify.face.capture' as never)}
        </button>
      </div>
    </div>
  );
}
