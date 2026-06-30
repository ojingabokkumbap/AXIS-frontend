import { LEGAL_DOCUMENTS } from '@/constants/legalDocuments';
import { useI18n } from '@/i18n';

const INK = '#191919';
const MUTED = '#8C8C8C';

interface Props {
  doc: (typeof LEGAL_DOCUMENTS)[number];
}

/** Opens a legal HTML page in a new browser tab (inline view, not download). */
export function LegalDocumentLink({ doc }: Props) {
  const { t } = useI18n();
  return (
    <a
      href={doc.path}
      target="_blank"
      rel="noopener noreferrer"
      className={`no-underline transition-colors ${
        doc.emphasized ? 'font-bold hover:opacity-80' : 'hover:text-[#191919]'
      }`}
      style={{ color: doc.emphasized ? INK : MUTED }}
    >
      {t(doc.labelKey)}
    </a>
  );
}

export function FooterLegalLinks() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
      {LEGAL_DOCUMENTS.map((doc) => (
        <LegalDocumentLink key={doc.id} doc={doc} />
      ))}
    </div>
  );
}
