import "client-only";

export const unsafeNavigation =
  typeof window === "undefined"
    ? undefined
    : window.navigation
      ? window.navigation
      : installUnsafeNavigation();

function installUnsafeNavigation(): Navigation {
  const originalHistory = window.history;
  const originalPushState = window.history.pushState.bind(window.history);
  const originalReplaceState = window.history.replaceState.bind(window.history);

  if (!originalHistory.state) {
    originalReplaceState(
      { ___UNSAFE_NAVIGATION_KEY___: crypto.randomUUID() },
      "",
      location.href,
    );
  }

  window.history.pushState = (state, unused, url) => {
    originalPushState(
      { ___UNSAFE_NAVIGATION_KEY___: crypto.randomUUID(), ...state },
      unused,
      url,
    );
    notify("currententrychange", {
      navigationType: "push",
    } as NavigationCurrentEntryChangeEvent);
  };

  window.history.replaceState = (state, unused, url) => {
    const { ___UNSAFE_NAVIGATION_KEY___ } = originalHistory.state ?? {};
    originalReplaceState(
      { ...state, ___UNSAFE_NAVIGATION_KEY___ },
      unused,
      url,
    );
    notify("currententrychange", {
      navigationType: "replace",
    } as NavigationCurrentEntryChangeEvent);
  };

  const listenersMap = new Map<string, Set<EventListener>>();

  const addEventListener: (
    type: string,
    listener: EventListener,
    options?: boolean | AddEventListenerOptions | undefined,
  ) => void = (type, listener, options) => {
    if (!listener) return;
    const listeners = listenersMap.get(type);
    if (listeners) {
      listeners.add(listener);
    } else {
      listenersMap.set(type, new Set([listener]));
    }
    if (options && typeof options === "object" && options.signal) {
      options.signal.addEventListener("abort", () =>
        removeEventListener(type, listener, options),
      );
    }
  };

  const removeEventListener: (
    type: string,
    listener: EventListener,
    options?: boolean | AddEventListenerOptions | undefined,
  ) => void = (type, listener, options) => {
    if (!listener) return;
    const listeners = listenersMap.get(type);
    if (!listeners) return;
    listeners.delete(listener);
    if (listeners.size === 0) {
      listenersMap.delete(type);
    }
  };

  const notify = (type: string, event: Event) => {
    const listeners = listenersMap.get("currententrychange");
    listeners?.forEach((listener) => {
      listener(event);
    });
  };

  const navigation = {
    addEventListener,
    removeEventListener,
  };
  Object.defineProperty(navigation, "currentEntry", {
    configurable: true,
    enumerable: true,
    get: () => {
      const { ___UNSAFE_NAVIGATION_KEY___ } = originalHistory.state ?? {};
      return {
        key: ___UNSAFE_NAVIGATION_KEY___ ?? crypto.randomUUID(),
      };
    },
  });
  Object.defineProperty(window, "navigation", {
    configurable: true,
    enumerable: true,
    get: () => navigation,
  });

  return navigation as Navigation;
}
