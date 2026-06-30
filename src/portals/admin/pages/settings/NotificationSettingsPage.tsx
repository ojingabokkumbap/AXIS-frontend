import { useEffect, useState } from 'react';
import { useI18n } from '@admin/i18n';
import { adminApi, AdminNotificationPreferences } from '@admin/services/api';
import { Button, PageHeader } from '@admin/components/shared/ui-kit';

const PREF_ROWS: {
  key: keyof AdminNotificationPreferences;
  labelKey: string;
  descKey: string;
}[] = [
  { key: 'examStart', labelKey: 'notif.pref.examStart', descKey: 'notif.pref.examStartDesc' },
  { key: 'examFinish', labelKey: 'notif.pref.examFinish', descKey: 'notif.pref.examFinishDesc' },
  { key: 'cheating', labelKey: 'notif.pref.cheating', descKey: 'notif.pref.cheatingDesc' },
  { key: 'inquiry', labelKey: 'notif.pref.inquiry', descKey: 'notif.pref.inquiryDesc' },
  { key: 'inquiryReply', labelKey: 'notif.pref.inquiryReply', descKey: 'notif.pref.inquiryReplyDesc' },
  { key: 'grading', labelKey: 'notif.pref.grading', descKey: 'notif.pref.gradingDesc' },
  { key: 'registration', labelKey: 'notif.pref.registration', descKey: 'notif.pref.registrationDesc' },
];

export default function NotificationSettingsPage() {
  const { t } = useI18n();
  const [prefs, setPrefs] = useState<AdminNotificationPreferences | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    adminApi
      .getNotificationPreferences()
      .then((res) => setPrefs(res.data))
      .catch(() => undefined);
  }, []);

  const toggle = (key: keyof AdminNotificationPreferences) => {
    if (!prefs) return;
    setPrefs({ ...prefs, [key]: !prefs[key] });
    setSaved(false);
  };

  const save = async () => {
    if (!prefs) return;
    setSaving(true);
    try {
      const res = await adminApi.updateNotificationPreferences(prefs);
      setPrefs(res.data);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={t('notif.settingsTitle')}
        subtitle={t('notif.settingsSub')}
      />

      <div className="mt-6 max-w-2xl rounded-xl border border-[var(--gray-border)] bg-white">
        <div className="border-b border-[var(--gray-100)] px-5 py-4">
          <div className="text-[14px] font-semibold text-[var(--primary)]">{t('notif.pref.heading')}</div>
          <div className="mt-1 text-[12px] text-[var(--gray-500)]">{t('notif.pref.headingDesc')}</div>
        </div>

        <div className="divide-y divide-[var(--gray-50)]">
          {PREF_ROWS.map((row) => (
            <label
              key={row.key}
              className="flex cursor-pointer items-start justify-between gap-4 px-5 py-4 hover:bg-[var(--gray-50)]"
            >
              <div className="min-w-0">
                <div className="text-[13px] font-medium text-[var(--gray-800)]">{t(row.labelKey)}</div>
                <div className="mt-0.5 text-[12px] text-[var(--gray-500)]">{t(row.descKey)}</div>
              </div>
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 shrink-0 accent-[var(--blue)]"
                checked={prefs?.[row.key] ?? false}
                onChange={() => toggle(row.key)}
              />
            </label>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[var(--gray-100)] px-5 py-4">
          {saved && <span className="text-[12px] text-[var(--green)]">{t('notif.saved')}</span>}
          <Button onClick={() => void save()} disabled={!prefs || saving}>
            {saving ? t('common.loading') : t('notif.save')}
          </Button>
        </div>
      </div>
    </div>
  );
}
