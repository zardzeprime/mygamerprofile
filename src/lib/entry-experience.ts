/**
 * Non-sensitive UI markers for the one-time ÍMPAR entry sequence.
 * They never represent authentication state; Supabase remains the auth source of truth.
 */
const INTRO_SEEN_KEY = "impar:entry-intro:v1";
const ACCOUNT_ENTRY_KEY = "impar:account-entry:v1";
const ACCOUNT_ENTRY_MAX_AGE_MS = 24 * 60 * 60 * 1000;

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function hasSeenEntryIntro(): boolean {
  try {
    return storage()?.getItem(INTRO_SEEN_KEY) === "seen";
  } catch {
    return false;
  }
}

export function markEntryIntroSeen(): void {
  try {
    storage()?.setItem(INTRO_SEEN_KEY, "seen");
  } catch {
    // If browser storage is unavailable, the welcome screen can appear again next visit.
  }
}

export function markAccountEntryPending(): void {
  try {
    const store = storage();
    store?.setItem(INTRO_SEEN_KEY, "seen");
    store?.setItem(ACCOUNT_ENTRY_KEY, String(Date.now()));
  } catch {
    // The account flow must continue even if local storage is unavailable.
  }
}

export function clearAccountEntryPending(): void {
  try {
    storage()?.removeItem(ACCOUNT_ENTRY_KEY);
  } catch {
    // Ignore unavailable storage; it is only an animation marker.
  }
}

export function consumeAccountEntryPending(): boolean {
  try {
    const store = storage();
    const createdAt = Number(store?.getItem(ACCOUNT_ENTRY_KEY));
    store?.removeItem(ACCOUNT_ENTRY_KEY);
    return Number.isFinite(createdAt) && createdAt > 0 && Date.now() - createdAt < ACCOUNT_ENTRY_MAX_AGE_MS;
  } catch {
    return false;
  }
}
