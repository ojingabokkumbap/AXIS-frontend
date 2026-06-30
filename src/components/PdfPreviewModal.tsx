import { useEffect } from 'react';

interface PdfPreviewModalProps {
  title: string;
  url: string;
  downloadName?: string;
  onClose: () => void;
}

export function PdfPreviewModal({
  title,
  url,
  downloadName,
  onClose,
}: PdfPreviewModalProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  const viewerUrl = `${url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`;

  return (
    <div
      className="fixed inset-0 z-1100 flex items-center justify-center p-4 sm:p-6"
      style={{ background: 'rgba(0, 0, 0, 0.55)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="flex h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-h-[1200px] max-w-[1400px] flex-col overflow-hidden rounded-[18px] bg-white shadow-2xl sm:h-[calc(100dvh-2rem)] sm:w-[calc(100vw-2rem)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#E5E7EB] px-6 py-4">
          <h2 className="min-w-0 truncate text-[20px] font-semibold text-[#111827]">{title}</h2>
          <div className="flex shrink-0 items-center gap-3">
            <a
              href={url}
              download={downloadName}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center justify-center rounded-[8px] border border-[#D1D5DB] bg-white px-5 text-[15px] font-semibold text-gray-700 no-underline transition-colors hover:bg-blue-50 hover:text-blue-700"
            >
              다운로드
            </a>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] border border-[#D1D5DB] bg-white text-[#6B7280]"
              aria-label="닫기"
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden  ">
          <iframe title={title} src={viewerUrl} className="h-full min-h-[65vh] w-full border-0 bg-white" />
        </div>
      </div>
    </div>
  );
}
