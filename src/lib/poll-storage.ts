const ACTIVE_POLL_KEY = "active_poll_id";

export function getActivePollId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_POLL_KEY);
}

export function setActivePollId(pollId: string): void {
  localStorage.setItem(ACTIVE_POLL_KEY, pollId);
}

export function clearActivePollId(): void {
  localStorage.removeItem(ACTIVE_POLL_KEY);
}

export function getVotedCount(pollId: string): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(`voted_count_${pollId}`);
  const n = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(n) ? n : 0;
}

export function setVotedCount(pollId: string, count: number): void {
  localStorage.setItem(`voted_count_${pollId}`, String(count));
}

export function incrementVotedCount(pollId: string): number {
  const next = getVotedCount(pollId) + 1;
  setVotedCount(pollId, next);
  return next;
}
