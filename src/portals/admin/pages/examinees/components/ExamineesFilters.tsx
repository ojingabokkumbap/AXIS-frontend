import { Search } from 'lucide-react';
import { useI18n } from '@admin/i18n';
import type { CertLevel, CertType, ExamineeStatus } from '@admin/services/api';
import {
  CERT_OPTIONS,
  LEVEL_OPTIONS,
  STATUS_OPTIONS,
  certLabel,
} from '../lib/status';

interface ExamineesFiltersProps {
  q: string;
  onQChange: (v: string) => void;
  certType: CertType | '';
  onCertChange: (v: CertType | '') => void;
  level: CertLevel | '';
  onLevelChange: (v: CertLevel | '') => void;
  status: ExamineeStatus | '';
  onStatusChange: (v: ExamineeStatus | '') => void;
}

export function ExamineesFilters({
  q,
  onQChange,
  certType,
  onCertChange,
  level,
  onLevelChange,
  status,
  onStatusChange,
}: ExamineesFiltersProps) {
  const { t } = useI18n();
  return (
    <div className="mb-4">
      <div className="flex items-stretch gap-2 flex-wrap">
          <SelectField
            value={certType}
            onChange={(v) => onCertChange(v as CertType | '')}
            options={[
              { value: '', label: t('exm.filter.allCerts') },
              ...CERT_OPTIONS.map((c) => ({ value: c, label: certLabel(c) })),
            ]}
          />
          <SelectField
            value={level}
            onChange={(v) => onLevelChange(v as CertLevel | '')}
            options={[
              { value: '', label: t('exm.filter.allLevels') },
              ...LEVEL_OPTIONS.map((l) => ({ value: l, label: l })),
            ]}
          />
          <SelectField
            value={status}
            onChange={(v) => onStatusChange(v as ExamineeStatus | '')}
            options={[
              { value: '', label: t('exm.filter.allStatuses') },
              ...STATUS_OPTIONS.map((s) => ({ value: s, label: t(`exm.status.${s}`) })),
            ]}
          />
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={q}
            onChange={(e) => onQChange(e.target.value)}
            placeholder={t('exm.search.placeholder')}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>
      </div>
    </div>
  );
}

function SelectField({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="text-xs text-slate-500 inline-flex items-center gap-1.5">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
