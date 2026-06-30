import { useEffect, useRef } from 'react';

interface Options {
  enabled: boolean;
  /** BroadcastChannel name. One per exam scope. */
  channel: string;
  /** Called when this tab discovers another claimant — i.e. *we* are the duplicate. */
  onDuplicateDetected: (peerTabId: string) => void;
}

interface JoinMessage {
  type: 'JOIN';
  tabId: string;
  ts: number;
}

interface ClaimedMessage {
  type: 'CLAIMED';
  tabId: string;
  ts: number;
}

type GuardMessage = JoinMessage | ClaimedMessage;

/**
 * Single-instance lock for an exam page.
 *
 * On mount this tab posts JOIN. Any tab already claimed on the same channel
 * replies CLAIMED. If we receive any CLAIMED within ~600 ms we know we are the
 * duplicate and call `onDuplicateDetected` — caller is expected to terminate.
 *
 * BroadcastChannel scope is the same browser profile (covers duplicate tabs,
 * incognito → not the same profile so won't collide, which is correct).
 */
export function useDuplicateTabGuard({ enabled, channel, onDuplicateDetected }: Options): void {
  const onDuplicateRef = useRef(onDuplicateDetected);
  useEffect(() => {
    onDuplicateRef.current = onDuplicateDetected;
  }, [onDuplicateDetected]);

  useEffect(() => {
    if (!enabled) return;
    if (typeof BroadcastChannel === 'undefined') return;

    const tabId =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `tab-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const bc = new BroadcastChannel(channel);
    let detectedDuplicate = false;
    let claimed = false;
    const claimedAt = Date.now();

    const onMessage = (ev: MessageEvent<GuardMessage>) => {
      const msg = ev.data;
      if (!msg || msg.tabId === tabId) return;
      if (msg.type === 'JOIN') {
        // Another tab is asking — answer if we've already claimed.
        if (claimed) {
          bc.postMessage({ type: 'CLAIMED', tabId, ts: claimedAt } satisfies ClaimedMessage);
        }
      } else if (msg.type === 'CLAIMED') {
        // Someone else owns the channel — we are the duplicate.
        if (!detectedDuplicate) {
          detectedDuplicate = true;
          onDuplicateRef.current(msg.tabId);
        }
      }
    };

    bc.addEventListener('message', onMessage);
    bc.postMessage({ type: 'JOIN', tabId, ts: claimedAt } satisfies JoinMessage);

    // After a short grace period with no CLAIMED reply, mark ourselves as the
    // owner so subsequent JOINs from other tabs get our CLAIMED.
    const claimTimer = window.setTimeout(() => {
      if (!detectedDuplicate) {
        claimed = true;
      }
    }, 600);

    return () => {
      window.clearTimeout(claimTimer);
      bc.removeEventListener('message', onMessage);
      bc.close();
    };
  }, [enabled, channel]);
}
