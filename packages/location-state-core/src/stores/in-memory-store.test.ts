import { expect, test, vi } from "vitest";
import { InMemoryStore } from "./in-memory-store";

describe("InMemoryStore", () => {
  test("The initial value is undefined.", () => {
    // Arrange
    const store = new InMemoryStore();
    // Act
    const slice = store.get("foo");
    // Assert
    expect(slice).toBeUndefined();
  });

  describe("on `set`", () => {
    test("The updated value can be obtained.", () => {
      // Arrange
      const store = new InMemoryStore();
      // Act
      store.set("foo", "updated");
      // Assert
      expect(store.get("foo")).toBe("updated");
    });

    test("The listener is called.", () => {
      // Arrange
      const store = new InMemoryStore();
      const listener = vi.fn();
      store.subscribe("foo", listener);
      // Act
      store.set("foo", "updated");
      // Assert
      expect(listener).toBeCalledTimes(1);
    });

    test("`set` with `undefined` is also called the listener.", () => {
      // Arrange
      const store = new InMemoryStore();
      store.set("foo", "updated");
      const listener = vi.fn();
      store.subscribe("foo", listener);
      // Act
      store.set("foo", undefined);
      // Assert
      expect(listener).toBeCalledTimes(1);
    });

    test("The listener can get the latest value by calling `store.get`.", () => {
      // Arrange
      expect.assertions(4);
      const store = new InMemoryStore();
      const listener1 = vi.fn(() => {
        expect(store.get("foo")).toBe("updated");
      });
      const listener2 = vi.fn(() => {
        expect(store.get("foo")).toBe("updated");
      });
      store.subscribe("foo", listener1);
      store.subscribe("foo", listener2);
      // Act
      store.set("foo", "updated");
      // Assert
      expect(listener1).toBeCalledTimes(1);
      expect(listener2).toBeCalledTimes(1);
    });

    test("The listener is unsubscribed, it will no longer be called when the slice is updated.", () => {
      expect.assertions(1);
      // Arrange
      const store = new InMemoryStore();
      const listener = vi.fn();
      const unsubscribe = store.subscribe("foo", listener);
      // Act
      unsubscribe();
      store.set("foo", "updated");
      // Assert
      expect(listener).toBeCalledTimes(0);
    });
  });

  describe("on `load`", () => {
    test("`load` without `set` is undefined.", () => {
      // Arrange
      const store = new InMemoryStore();
      // Act
      store.load("initial");
      // Assert
      expect(store.get("foo")).toBeUndefined();
    });

    test("`load` after `set` is merged.", () => {
      // Arrange
      const store = new InMemoryStore();
      store.set("foo", 0);
      // Act
      store.load("initial");
      // Assert
      expect(store.get("foo")).toBe(0);
      expect(store.get("bar")).toBeUndefined();
    });

    test("`load` with different key is reset.", () => {
      // Arrange
      const store = new InMemoryStore();
      store.load("initial");
      store.set("foo", "updated");
      // Act
      store.load("second");
      // Assert
      expect(store.get("foo")).toBeUndefined();
    });

    test("The key is restored, the slice is also restored.", () => {
      // Arrange
      const store = new InMemoryStore();
      store.load("initial");
      store.set("foo", "updated initial");
      store.save();
      store.load("second");
      store.set("foo", "updated second");
      // Act
      store.load("initial");
      // Assert
      expect(store.get("foo")).toBe("updated initial");
    });

    test("`load` is called, all listener notified.", async () => {
      // Arrange
      const store = new InMemoryStore();
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      store.subscribe("foo", listener1);
      store.subscribe("foo", listener2);
      // Act
      store.load("initial");
      // Generate and execute microtasks with Promise to wait for listener execution.
      await Promise.resolve();
      // Assert
      expect(listener1).toBeCalledTimes(1);
      expect(listener2).toBeCalledTimes(1);
    });
  });
});
