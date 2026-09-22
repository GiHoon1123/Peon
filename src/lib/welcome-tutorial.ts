/** Set to `'1'` when onboarding finishes; cleared when the user dismisses the dialog. */
export const WELCOME_TUTORIAL_STORAGE_KEY = 'peon.welcomeTutorial';

const listeners = new Set<() => void>();

function notifyWelcomeTutorialChange() {
  listeners.forEach((listener) => listener());
}

/** Subscribe to localStorage flag changes (same tab + other tabs). */
export function subscribeWelcomeTutorial(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  if (typeof window === 'undefined') {
    return () => {
      listeners.delete(onStoreChange);
    };
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === WELCOME_TUTORIAL_STORAGE_KEY) {
      onStoreChange();
    }
  };
  window.addEventListener('storage', onStorage);

  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener('storage', onStorage);
  };
}

export function getWelcomeTutorialServerSnapshot(): boolean {
  return false;
}

export function shouldShowWelcomeTutorial(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(WELCOME_TUTORIAL_STORAGE_KEY) === '1';
}

export function markWelcomeTutorialPending(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(WELCOME_TUTORIAL_STORAGE_KEY, '1');
  notifyWelcomeTutorialChange();
}

export function dismissWelcomeTutorial(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(WELCOME_TUTORIAL_STORAGE_KEY, '0');
  notifyWelcomeTutorialChange();
}
