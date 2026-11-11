const ACCESS_TOKEN_KEY = 'fsph-fleet-management.access-token';
const SESSION_EVENT = 'fsph-session-change';

export const authToken = {
  get(): string | null {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  },
  set(token: string): void {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
    window.dispatchEvent(new Event(SESSION_EVENT));
  },
  clear(): void {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    window.dispatchEvent(new Event(SESSION_EVENT));
  },
  subscribe(listener: () => void): () => void {
    window.addEventListener(SESSION_EVENT, listener);
    return () => window.removeEventListener(SESSION_EVENT, listener);
  },
};
