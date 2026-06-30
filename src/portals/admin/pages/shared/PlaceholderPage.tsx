import { Construction } from 'lucide-react';
import { useI18n } from '@admin/i18n';

interface PlaceholderPageProps {
  title: string;
  subtitle?: string;
}

export default function PlaceholderPage({ title, subtitle }: PlaceholderPageProps) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 grid place-items-center mb-6">
        <Construction className="w-8 h-8 text-slate-400" />
      </div>
      <h2 className="text-xl font-semibold text-slate-800 mb-2">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500 mb-1">{subtitle}</p>}
      <p className="text-sm text-slate-400 max-w-md">{t('ph.body')}</p>
    </div>
  );
}
