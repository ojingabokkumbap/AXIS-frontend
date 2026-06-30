import { useCallback, useEffect, useState } from 'react';
import { adminApi, AdminNotificationRow } from '@admin/services/api';
import { getAdminSocket } from '@admin/services/adminSocket';

export function useAdminNotifications() {
  const [items, setItems] = useState<AdminNotificationRow[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await adminApi.getNotifications();
      setItems(res.data.items.filter((i) => !i.read));
      setUnreadCount(res.data.unreadCount);
    } catch {
      /* keep last known state */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const sock = getAdminSocket();
    const onNew = (payload: AdminNotificationRow) => {
      setItems((prev) => {
        const next = [{ ...payload, read: false }, ...prev.filter((i) => i.id !== payload.id)];
        return next.slice(0, 50);
      });
      setUnreadCount((c) => c + 1);
    };
    sock.on('notification:new', onNew);
    return () => {
      sock.off('notification:new', onNew);
    };
  }, [refresh]);

  const markRead = useCallback(async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await adminApi.markNotificationRead(id);
    } catch {
      void refresh();
    }
  }, [refresh]);

  const markAllRead = useCallback(async () => {
    setItems([]);
    setUnreadCount(0);
    try {
      await adminApi.markAllNotificationsRead();
    } catch {
      void refresh();
    }
  }, [refresh]);

  return { items, unreadCount, loading, refresh, markRead, markAllRead };
}
