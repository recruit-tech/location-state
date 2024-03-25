import { createNavigationMock } from "test-utils";
import { expect, test, vi } from "vitest";
import { NavigationSyncer } from "./navigation-syncer";

test("Key changes when `navigation.currentEntry` changes.", () => {
  // Arrange
  const navigation = createNavigationMock("/");
  const navigationSyncer = new NavigationSyncer(navigation);
  const key1 = navigationSyncer.key();
  navigation.navigate("/hoge");
  // Act
  const key2 = navigationSyncer.key();
  // Assert
  expect(key1).not.toBeUndefined();
  expect(key2).not.toBeUndefined();
  expect(key1).not.toBe(key2);
});

test("Listener is called when `currententrychange` event and `event.navigationType` is `push`.", () => {
  // Arrange
  const navigation = createNavigationMock("/");
  const navigationSyncer = new NavigationSyncer(navigation);
  const listener1 = vi.fn();
  const listener2 = vi.fn();
  navigationSyncer.sync({
    listener: listener1,
    signal: new AbortController().signal,
  });
  navigationSyncer.sync({
    listener: listener2,
    signal: new AbortController().signal,
  });
  // Act
  navigation.navigate("/hoge");
  // Assert
  expect(listener1).toHaveBeenCalledTimes(1);
  expect(listener2).toHaveBeenCalledTimes(1);
});

test("Listener is called when `currententrychange` event and `event.navigationType` is `replace`.", () => {
  // Arrange
  const navigation = createNavigationMock("/");
  const navigationSyncer = new NavigationSyncer(navigation);
  const listener1 = vi.fn();
  const listener2 = vi.fn();
  navigationSyncer.sync({
    listener: listener1,
    signal: new AbortController().signal,
  });
  navigationSyncer.sync({
    listener: listener2,
    signal: new AbortController().signal,
  });
  // Act
  navigation.navigate("/hoge", { history: "replace" });
  // Assert
  expect(listener1).toHaveBeenCalledTimes(1);
  expect(listener2).toHaveBeenCalledTimes(1);
});

test("Listener is not called when `currententrychange` event and `event.navigationType` is `reload`.", () => {
  // Arrange
  const navigation = createNavigationMock("/");
  const navigationSyncer = new NavigationSyncer(navigation);
  const listener = vi.fn();
  navigationSyncer.sync({
    listener,
    signal: new AbortController().signal,
  });
  // Act
  navigation.reload();
  // Assert
  expect(listener).not.toHaveBeenCalled();
});

// abort does not work well, but the cause is unknown
test("After `abort`, listener is called when `currententrychange` event and `event.navigationType` is `push`.", () => {
  // Arrange
  const navigation = createNavigationMock("/");
  const navigationSyncer = new NavigationSyncer(navigation);
  const listener1 = vi.fn();
  const listener2 = vi.fn();
  const controller = new AbortController();
  navigationSyncer.sync({ listener: listener1, signal: controller.signal });
  navigationSyncer.sync({
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

test("When `updateURL` called, navigation.navigate` is called with replace specified.", () => {
  // Arrange
  history.replaceState({ foo: "bar" }, "", "/");
  const navigation = createNavigationMock("/");
  const navigationSyncer = new NavigationSyncer(navigation);
  // Act
  navigationSyncer.updateURL("/hoge");
  // Assert
  expect(globalThis.history.state).toEqual({
    foo: "bar",
  });
  expect(location.href).toBe("http://localhost:3000/hoge");
});
