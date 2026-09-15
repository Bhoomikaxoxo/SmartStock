/**
 * Debounced LocalStorage Utility
 * Batches and debounces JSON serialization writes to localStorage
 * to prevent blocking the main thread during high-frequency state updates.
 */

const pendingTimers = new Map<string, ReturnType<typeof setTimeout>>();

export function saveDebounced<T>(key: string, value: T, delayMs = 250): void {
  const existingTimer = pendingTimers.get(key);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  const timer = setTimeout(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (err) {
      console.warn(`[SmartStock Storage] Failed to persist key "${key}":`, err);
    } finally {
      pendingTimers.delete(key);
    }
  }, delayMs);

  pendingTimers.set(key, timer);
}

/**
 * Flush all pending debounced storage writes immediately.
 * Useful before page unload or explicit demo resets.
 */
export function flushPendingStorage(): void {
  pendingTimers.forEach((timer) => clearTimeout(timer));
  pendingTimers.clear();
}
