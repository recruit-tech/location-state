import "client-only";

export const unsafeNavigation =
  typeof window === "undefined"
    ? undefined
    : window.navigation
    ? window.navigation
    : installUnsafeNavigation();

function installUnsafeNavigation(): Navigation {
  const originalHistory = window.history;
  if (!originalHistory.state) {
    originalHistory.replaceState(
      { ___UNSAFE_NAVIGATION_KEY___: crypto.randomUUID() },
      "",
      location.href,
    );
  }

  const pushState: History["pushState"] = (state, unused, url) => {
    originalHistory.pushState(
      { ___UNSAFE_NAVIGATION_KEY___: crypto.randomUUID(), ...state },
      unused,
      url,
    );
    notify("currententrychange", {
      navigationType: "push",
    } as NavigationCurrentEntryChangeEvent);
  };

  const replaceState: History["replaceState"] = (state, unused, url) => {
    const { ___UNSAFE_NAVIGATION_KEY___ } = originalHistory.state ?? {};
    originalHistory.replaceState(
      { ...state, ___UNSAFE_NAVIGATION_KEY___ },
      unused,
      url,
    );
    notify("currententrychange", {
      navigationType: "replace",
    } as NavigationCurrentEntryChangeEvent);
  };

  const proxyHandler: ProxyHandler<History> = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    get(target, propName, receiver) {
      // if (typeof propName !== "string") return;
      switch (propName) {
        case "state": {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { ___UNSAFE_NAVIGATION_KEY___, state } = target.state;
          return state;
        }
        case "pushState": {
          return pushState;
        }
        case "replaceState": {
          return replaceState;
        }
      }
      const value = Reflect.get(target, propName);
      if (typeof value === "function") {
        return value.bind(target);
      }
      return value;
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    set(target, propertyName, newValue, receiver) {
      if (propertyName !== "scrollRestoration") return false;
      return Reflect.set(target, propertyName, newValue);
    },
  };

  const historyProxy = new Proxy(originalHistory, proxyHandler);

  Object.defineProperty(window, "history", {
    configurable: true,
    enumerable: true,
    get() {
      return historyProxy;
    },
  });

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
