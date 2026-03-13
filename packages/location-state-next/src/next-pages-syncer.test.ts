import { createNavigationMock } from "@repo/test-utils";
import { describe, expect, test, vi } from "vitest";
import { NextPagesSyncer } from "./next-pages-syncer";

function createMockRouter() {
  return {
    replace: vi.fn(),
  } as unknown as import("next/router.js").NextRouter;
}

describe(NextPagesSyncer, () => {
  describe(NextPagesSyncer.prototype.key, () => {
    test("Prefers Navigation API key when available.", () => {
      // Arrange
      const navigation = createNavigationMock("/");
      Object.defineProperty(window, "navigation", {
        value: navigation,
        writable: true,
        configurable: true,
      });
      history.replaceState({ key: "history-key" }, "", "/");
      const syncer = new NextPagesSyncer(createMockRouter());
      // Act
      const key = syncer.key();
      // Assert
      expect(key).toBe(navigation.currentEntry?.key);
      expect(key).not.toBe("history-key");
    });

    test("Falls back to `history.state.key` when Navigation API is unavailable.", () => {
      // Arrange
      Object.defineProperty(window, "navigation", {
        value: undefined,
        writable: true,
        configurable: true,
      });
      history.replaceState({ key: "history-key" }, "", "/");
      const syncer = new NextPagesSyncer(createMockRouter());
      // Act
      const key = syncer.key();
      // Assert
      expect(key).toBe("history-key");
    });
  });

  describe(NextPagesSyncer.prototype.sync, () => {
    test("Listener is added.", () => {
      // Arrange
      const syncer = new NextPagesSyncer(createMockRouter());
      const listener = vi.fn();
      // Act
      syncer.sync({ listener, signal: new AbortController().signal });
      // Assert (notify triggers registered listeners)
      Object.defineProperty(window, "navigation", {
        value: createNavigationMock("/"),
        writable: true,
        configurable: true,
      });
      syncer.notify();
      expect(listener).toHaveBeenCalledTimes(1);
    });

    test("Listener is removed after abort.", () => {
      // Arrange
      Object.defineProperty(window, "navigation", {
        value: createNavigationMock("/"),
        writable: true,
        configurable: true,
      });
      const syncer = new NextPagesSyncer(createMockRouter());
      const listener = vi.fn();
      const controller = new AbortController();
      syncer.sync({ listener, signal: controller.signal });
      // Act
      controller.abort();
      syncer.notify();
      // Assert
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe(NextPagesSyncer.prototype.notify, () => {
    test("All registered listeners are called.", () => {
      // Arrange
      Object.defineProperty(window, "navigation", {
        value: createNavigationMock("/"),
        writable: true,
        configurable: true,
      });
      const syncer = new NextPagesSyncer(createMockRouter());
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      syncer.sync({
        listener: listener1,
        signal: new AbortController().signal,
      });
      syncer.sync({
        listener: listener2,
        signal: new AbortController().signal,
      });
      // Act
      syncer.notify();
      // Assert
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });
  });

  describe(NextPagesSyncer.prototype.updateURL, () => {
    test("`router.replace(url, undefined, { shallow: true })` is called.", () => {
      // Arrange
      const router = createMockRouter();
      const syncer = new NextPagesSyncer(router);
      // Act
      syncer.updateURL("/hoge");
      // Assert
      expect(router.replace).toHaveBeenCalledWith("/hoge", undefined, {
        shallow: true,
      });
    });
  });
});
