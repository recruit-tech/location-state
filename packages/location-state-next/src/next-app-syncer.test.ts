import { createNavigationMock } from "@repo/test-utils";
import { describe, expect, test, vi } from "vitest";
import { NextAppSyncer } from "./next-app-syncer";

describe(NextAppSyncer, () => {
  test("The key changes when `navigation.currentEntry` changes.", () => {
    // Arrange
    const navigation = createNavigationMock("/");
    const syncer = new NextAppSyncer(navigation);
    const key1 = syncer.key();
    navigation.navigate("/hoge");
    // Act
    const key2 = syncer.key();
    // Assert
    expect(key1).not.toBeUndefined();
    expect(key2).not.toBeUndefined();
    expect(key1).not.toBe(key2);
  });

  describe(NextAppSyncer.prototype.sync, () => {
    test("The listener is called when `currententrychange` event and `event.navigationType` is `push`.", () => {
      // Arrange
      const navigation = createNavigationMock("/");
      const syncer = new NextAppSyncer(navigation);
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
      navigation.navigate("/hoge");
      // Assert
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });

    test("The listener is called when `currententrychange` event and `event.navigationType` is `replace`.", () => {
      // Arrange
      const navigation = createNavigationMock("/");
      const syncer = new NextAppSyncer(navigation);
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
      navigation.navigate("/hoge", { history: "replace" });
      // Assert
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });

    test("The listener is not called when `currententrychange` event and `event.navigationType` is `reload`.", () => {
      // Arrange
      const navigation = createNavigationMock("/");
      const syncer = new NextAppSyncer(navigation);
      const listener = vi.fn();
      syncer.sync({
        listener,
        signal: new AbortController().signal,
      });
      // Act
      navigation.reload();
      // Assert
      expect(listener).not.toHaveBeenCalled();
    });

    test("After `abort`, the listener is not called.", () => {
      // Arrange
      const navigation = createNavigationMock("/");
      const syncer = new NextAppSyncer(navigation);
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const controller = new AbortController();
      syncer.sync({ listener: listener1, signal: controller.signal });
      syncer.sync({
        listener: listener2,
        signal: new AbortController().signal,
      });
      controller.abort();
      // Act
      navigation.navigate("/hoge");
      // Assert
      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });
  });

  describe(NextAppSyncer.prototype.updateURL, () => {
    test("`__NA` and `__N` are excluded from history.state when calling replaceState.", () => {
      // Arrange
      history.replaceState({ __NA: true, __N: true, foo: "bar" }, "", "/");
      const navigation = createNavigationMock("/");
      const syncer = new NextAppSyncer(navigation);
      // Act
      syncer.updateURL("/hoge");
      // Assert
      expect(globalThis.history.state).toEqual({ foo: "bar" });
      expect(location.href).toBe("http://localhost:3000/hoge");
    });

    test("Non `__NA`/`__N` state properties are preserved.", () => {
      // Arrange
      history.replaceState(
        { __NA: true, __N: true, tree: [1, 2], custom: "value" },
        "",
        "/",
      );
      const navigation = createNavigationMock("/");
      const syncer = new NextAppSyncer(navigation);
      // Act
      syncer.updateURL("/hoge");
      // Assert
      expect(globalThis.history.state).toEqual({
        tree: [1, 2],
        custom: "value",
      });
    });

    test("When state is null, null is passed to replaceState.", () => {
      // Arrange
      history.replaceState(null, "", "/");
      const navigation = createNavigationMock("/");
      const syncer = new NextAppSyncer(navigation);
      // Act
      syncer.updateURL("/hoge");
      // Assert
      expect(globalThis.history.state).toBeNull();
      expect(location.href).toBe("http://localhost:3000/hoge");
    });

    test("When state only contains `__NA` and `__N`, null is passed to replaceState.", () => {
      // Arrange
      history.replaceState({ __NA: true, __N: true }, "", "/");
      const navigation = createNavigationMock("/");
      const syncer = new NextAppSyncer(navigation);
      // Act
      syncer.updateURL("/hoge");
      // Assert
      expect(globalThis.history.state).toBeNull();
      expect(location.href).toBe("http://localhost:3000/hoge");
    });
  });
});
