import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { aiProctorApi, type AiEvidenceItem } from '@/services/api';
import { useI18n } from '@/i18n';

const SEVERITY_COLOR: Record<'LOW' | 'MED' | 'HIGH', string> = {
  LOW: 'bg-amber-100 text-amber-800 border-amber-200',
  MED: 'bg-orange-100 text-orange-800 border-orange-200',
  HIGH: 'bg-red-100 text-red-800 border-red-200',
};

// Partial because the backend may surface event types that we don't yet have
// dedicated i18n strings for (page-leave class — FULLSCREEN_EXIT, TAB_SWITCH,
// WINDOW_BLUR, TAB_HIDDEN, BEFORE_UNLOAD — were added alongside snapshot
// capture). Unknown types fall back to evidence.type.* i18n below.
const TYPE_LABEL_KEY: Partial<Record<AiEvidenceItem['type'], string>> = {
  AI_FLAG_SUSPICIOUS: 'evidence.kind.AI_FLAG_SUSPICIOUS',
  AI_FLAG_CONFIRMED: 'evidence.kind.AI_FLAG_CONFIRMED',
  AUDIO_HIGH: 'evidence.kind.AUDIO_HIGH',
};

/** Safe i18n lookup — returns translated string or raw key if no translation exists. */
function tSafe(t: ReturnType<typeof useI18n>['t'], key: string): string {
  const result = t(key as never);
  return result === key ? '' : result;
}

export default function SessionEvidencePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const [items, setItems] = useState<AiEvidenceItem[] | null>(null);
  const [error, setError] = useState('');

  // Same page serves /cbt/sessions/:sessionId/evidence and /cbt/demo/evidence.
  // Demo mode aggregates the caller's persisted demo evidence (no session FK).
  const isDemo = location.pathname.startsWith('/cbt/demo/evidence');

  useEffect(() => {
    if (isDemo) {
      aiProctorApi
        .demoMyEvidence()
        .then((res) => setItems(res.data.items))
        .catch((e) => setError(e.response?.data?.message || t('evidence.loadFailed' as never)));
      return;
    }
    if (!sessionId) return;
    aiProctorApi
      .myEvidence(sessionId)
      .then((res) => setItems(res.data.items))
      .catch((e) => setError(e.response?.data?.message || t('evidence.loadFailed' as never)));
  }, [sessionId, isDemo, t]);

  if (error) {
    return (
      <div className="p-8">
        <div className="text-red-700">{error}</div>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-sm text-gray-600 underline"
        >
          {t('evidence.back' as never)}
        </button>
      </div>
    );
  }
  if (!items) return <div className="p-8 text-gray-600">{t('evidence.loading' as never)}</div>;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-600 mb-4"
        >
          {t('evidence.back' as never)}
        </button>

        <header className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">{t('evidence.title' as never)}</h1>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
            {t('evidence.intro1' as never)}
            {' '}
            {t('evidence.intro2' as never)}
            <br />
            {t('evidence.retention1' as never)}
            {' '}<span className="font-semibold">{t('evidence.retention90' as never)}</span>
            {t('evidence.retention2' as never)}
            {' '}<span className="font-semibold">{t('evidence.retention2y' as never)}</span>
            {t('evidence.retention3' as never)}
          </p>
        </header>

        {items.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
            {t('evidence.empty' as never)}
          </div>
        ) : (
          <ol className="relative border-l-2 border-gray-200 ml-3 space-y-6">
            {items.map((item) => (
              <li key={item.id} className="ml-6">
                <span className="absolute -left-2 mt-2 w-3 h-3 rounded-full bg-gray-400 border border-white" />
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-mono">
                      {new Date(item.createdAt).toLocaleString(lang === 'ko' ? 'ko-KR' : 'en-US')}
                    </span>
                    {item.severity && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded border ${SEVERITY_COLOR[item.severity]}`}
                      >
                        {tSafe(t, `severity.${item.severity}`) || item.severity}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {TYPE_LABEL_KEY[item.type]
                        ? t(TYPE_LABEL_KEY[item.type] as never)
                        : (tSafe(t, `evidence.type.${item.type}`) || item.type)}
                    </span>
                  </div>
                  {(lang === 'ko' ? item.captionKo : item.captionEn) && (
                    <div className="text-base font-semibold text-gray-900 leading-snug">
                      {lang === 'ko' ? item.captionKo : item.captionEn}
                    </div>
                  )}
                  {(lang === 'ko' ? item.captionEn : item.captionKo) && (
                    <div className="text-sm italic text-gray-600 mt-0.5">
                      {lang === 'ko' ? item.captionEn : item.captionKo}
                    </div>
                  )}
                  {item.ruleBroken && (
                    <div className="text-xs text-gray-500 mt-2 font-mono">
                      rule: {item.ruleBroken}
                      {item.confidence != null && ` · confidence: ${item.confidence.toFixed(2)}`}
                    </div>
                  )}
                  <div className="mt-3 flex flex-col gap-3">
                    {item.evidenceUrl && (
                      <a
                        href={item.evidenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img
                          src={item.evidenceUrl}
                          alt="evidence"
                          className="max-w-xs rounded border border-gray-200"
                          loading="lazy"
                        />
                      </a>
                    )}
                    {item.videoClipUrl && (
                      <video
                        src={item.videoClipUrl}
                        controls
                        className="max-w-md rounded border border-gray-200"
                      />
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
