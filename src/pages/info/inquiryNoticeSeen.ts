const STORAGE_KEY = 'axis:inquiry-admin-replies-seen';

type SeenMap = Record<string, string>;

function readMap(): SeenMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === 'object' ? (parsed as SeenMap) : {};
  } catch {
    return {};
  }
}

function writeMap(map: SeenMap): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

/** Mark an inquiry's admin reply as seen (opens thread or explicit dismiss). */
export function markInquiryAdminReplySeen(inquiryId: string, replyId?: string): void {
  const map = readMap();
  map[inquiryId] = replyId ?? 'viewed';
  writeMap(map);
}

/** True when the admin reply should still prompt the user. */
export function hasUnseenAdminReply(inquiryId: string, replyId: string): boolean {
  const seen = readMap()[inquiryId];
  if (!seen) return true;
  if (seen === 'viewed') return false;
  return seen !== replyId;
}

/** Latest admin reply id on an inquiry, if any. */
export function latestAdminReplyId(
  replies: { id: string; isAdmin: boolean }[] | undefined,
): string | null {
  if (!replies?.length) return null;
  for (let i = replies.length - 1; i >= 0; i -= 1) {
    if (replies[i].isAdmin) return replies[i].id;
  }
  return null;
}

export function findUnseenAdminReplyInquiry(
  inquiries: { id: string; title: string; replies?: { id: string; isAdmin: boolean }[] }[],
): { inquiryId: string; title: string; replyId: string } | null {
  for (const inq of inquiries) {
    const replyId = latestAdminReplyId(inq.replies);
    if (replyId && hasUnseenAdminReply(inq.id, replyId)) {
      return { inquiryId: inq.id, title: inq.title, replyId };
    }
  }
  return null;
}
