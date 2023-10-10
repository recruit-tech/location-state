import { InMemoryStore } from "./in-memory-store";

test("The initial value is undefined.", () => {
  // Arrange
  const store = new InMemoryStore();
  // Act
  const slice = store.get("foo");
  // Assert
  expect(slice).toBeUndefined();
});

test("After updating a slice, the updated value can be obtained.", () => {
  // Arrange
  const store = new InMemoryStore();
  // Act
  store.set("foo", "updated");
  // Assert
  expect(store.get("foo")).toBe("updated");
});

test("listener is called when updating slice.", () => {
  // Arrange
  const store = new InMemoryStore();
  const listener = jest.fn();
  store.subscribe("foo", listener);
  // Act
  store.set("foo", "updated");
  // Assert
  expect(listener).toBeCalledTimes(1);
});

test("listener is called even if updated with undefined.", () => {
  // Arrange
  const store = new InMemoryStore();
  store.set("foo", "updated");
  const listener = jest.fn();
  store.subscribe("foo", listener);
  // Act
  store.set("foo", undefined);
  // Assert
  expect(listener).toBeCalledTimes(1);
});

test("store.get in the listener to get the latest value.", () => {
  // Arrange
  expect.assertions(4);
  const store = new InMemoryStore();
  const listener1 = jest.fn(() => {
    expect(store.get("foo")).toBe("updated");
  });
  const listener2 = jest.fn(() => {
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

test("The listener is unsubscribed by the returned callback, it will no longer be called when the slice is updated.", () => {
  // Arrange
  const store = new InMemoryStore();
  const listener = jest.fn();
  const unsubscribe = store.subscribe("foo", listener);
  // Act
  unsubscribe();
  store.set("foo", "updated");
  // Assert
  expect(listener).toBeCalledTimes(0);
});

test("The slice is reset when `load` is called and the key is updated.", () => {
  // Arrange
  const store = new InMemoryStore();
  store.load("initial");
  store.set("foo", "updated");
  // Act
  store.load("second");
  // Assert
  expect(store.get("foo")).toBeUndefined();
});

test("When the key is restored, the slice value is also restored.", () => {
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

test("On `load` called, all listener notified.", async () => {
  // Arrange
  const store = new InMemoryStore();
  const listener1 = jest.fn();
  const listener2 = jest.fn();
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
