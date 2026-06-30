import { useRef, useState, useEffect } from 'react';
import { Camera, Check, RotateCcw } from 'lucide-react';
import { useI18n } from '@/i18n';

interface IdCardStepProps {
  onNext: (file: File) => void;
}

export function IdCardStep({ onNext }: IdCardStepProps) {
  const { t } = useI18n();
  const tips = [
    { icon: '🔦', label: t('idverify.id.tipBright' as never) },
    { icon: '📐', label: t('idverify.id.tipFlat' as never) },
    { icon: '🚫', label: t('idverify.id.tipNoGlare' as never) },
  ];
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!capturedFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(capturedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [capturedFile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setCapturedFile(file);
  };

  const handleRetake = () => {
    setCapturedFile(null);
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const handleConfirm = () => {
    if (capturedFile) onNext(capturedFile);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-6">
        <h1 className="text-[28px] md:text-[32px] font-bold tracking-tight text-gray-900 mb-2">
          {t('idverify.id.title' as never)}
        </h1>
        <p className="text-[14px] md:text-[15px] text-gray-500">
          {t('idverify.id.sub' as never)}
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-6">
        {/* ID card frame / preview */}
        <div className="relative w-full max-w-md aspect-[1.6/1] bg-gray-50 rounded-2xl overflow-hidden">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Captured ID card"
              className="absolute inset-0 w-full h-full object-contain"
            />
          ) : (
            <>
              <div className="absolute inset-3 rounded-xl border-2 border-dashed border-blue-400 animate-pulse" />
              {[
                'top-3 left-3 border-t-4 border-l-4 rounded-tl-xl',
                'top-3 right-3 border-t-4 border-r-4 rounded-tr-xl',
                'bottom-3 left-3 border-b-4 border-l-4 rounded-bl-xl',
                'bottom-3 right-3 border-b-4 border-r-4 rounded-br-xl',
              ].map((cls, i) => (
                <div key={i} className={`absolute w-8 h-8 border-blue-600 ${cls}`} />
              ))}
            </>
          )}
          {capturedFile && !previewUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-green-50/70">
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="w-8 h-8 text-white" strokeWidth={3} />
              </div>
            </div>
          )}
        </div>

        {/* Tips */}
        {!capturedFile && (
          <div className="flex gap-2 mt-6 overflow-x-auto w-full max-w-md justify-center">
            {tips.map((tip) => (
              <div
                key={tip.label}
                className="px-3 py-1.5 rounded-full bg-gray-100 text-[12px] text-gray-600 whitespace-nowrap"
              >
                <span className="mr-1">{tip.icon}</span>
                {tip.label}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-6 pb-8 pt-4 space-y-3">
        {/* Hidden file inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleInputChange}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleInputChange}
        />

        {capturedFile ? (
          <>
            <button
              onClick={handleConfirm}
              className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 transition-colors text-white font-medium flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              {t('idverify.id.confirm' as never)}
            </button>
            <button
              onClick={handleRetake}
              className="w-full h-12 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 font-medium flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              {t('idverify.id.retake' as never)}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 transition-colors text-white font-medium flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              {t('idverify.id.capture' as never)}
            </button>
            <div className="text-center">
              <button
                onClick={() => galleryInputRef.current?.click()}
                className="text-[13px] text-gray-500 underline hover:text-gray-700"
              >
                {t('idverify.id.fromGallery' as never)}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
