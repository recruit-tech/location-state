import { beforeEach, expect, test, vi } from "vitest";
import { StorageStore, locationKeyPrefix } from "./storage-store";

const storageMock = {
  getItem: vi.fn().mockReturnValue(null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

beforeEach(() => {
  storageMock.getItem.mockClear();
  storageMock.setItem.mockClear();
  storageMock.removeItem.mockClear();
});

// partial mock storage to be Storage type
const storage = storageMock as unknown as Storage;

test("If Storage is empty, the initial value is undefined.", () => {
  // Arrange
  const store = new StorageStore(storage);
  // Act
  const slice = store.get("foo");
  // Assert
  expect(slice).toBeUndefined();
});

test("After updating a slice, the updated value can be obtained.", () => {
  // Arrange
  const store = new StorageStore(storage);
  // Act
  store.set("foo", "updated");
  // Assert
  expect(store.get("foo")).toBe("updated");
});

test("listener is called when updating slice.", () => {
  // Arrange
  const store = new StorageStore(storage);
  const listener = vi.fn();
  store.subscribe("foo", listener);
  // Act
  store.set("foo", "updated");
  // Assert
  expect(listener).toBeCalledTimes(1);
});

test("listener is called even if updated with undefined.", () => {
  // Arrange
  const store = new StorageStore(storage);
  store.set("foo", "updated");
  const listener = vi.fn();
  store.subscribe("foo", listener);
  // Act
  store.set("foo", undefined);
  // Assert
  expect(listener).toBeCalledTimes(1);
});

test("store.get in the listener to get the latest value.", () => {
  // Arrange
  expect.assertions(4);
  const store = new StorageStore(storage);
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

test("The listener is unsubscribed by the returned callback, it will no longer be called when the slice is updated.", () => {
  // Arrange
  const store = new StorageStore(storage);
  const listeners = {
    unsubscribeTarget: vi.fn(),
    other: vi.fn(),
  };
  const unsubscribe = store.subscribe("foo", listeners.unsubscribeTarget);
  store.subscribe("foo", listeners.other);
  unsubscribe();
  // Act
  store.set("foo", "updated");
  // Assert
  expect(listeners.unsubscribeTarget).not.toBeCalled();
  expect(listeners.other).toBeCalled();
});

test("On `load` called, if the value of the corresponding key is in Storage, then slice is the value in storage.", () => {
  // Arrange
  const navigationKey = "current_location";
  storageMock.getItem.mockReturnValueOnce(
    JSON.stringify({ foo: "storage value" }),
  );
  const store = new StorageStore(storage);
  // Act
  store.load(navigationKey);
  // Assert
  expect(store.get("foo")).toBe("storage value");
  expect(storageMock.getItem).toHaveBeenCalledTimes(1);
  expect(storageMock.getItem).toHaveBeenCalledWith(
    `${locationKeyPrefix}${navigationKey}`,
  );
});

test("On `load` called after `set`, the value of the slice is merged with the value in storage.", () => {
  // Arrange
  storageMock.getItem.mockReturnValueOnce(
    JSON.stringify({
      foo: "storage foo",
      bar: "storage bar",
    }),
  );
  const store = new StorageStore(storage);
  store.set("bar", "updated bar");
  store.set("baz", "updated baz");
  // Act
  store.load("current_location");
  // Assert
  expect(store.get("foo")).toBe("storage foo");
  expect(store.get("bar")).toBe("updated bar");
  expect(store.get("baz")).toBe("updated baz");
});

test("On `load` called twice with different key after `set`, the value of the slice is reset.", () => {
  // Arrange
  const store = new StorageStore(storage);
  store.set("bar", "updated");
  store.load("current_location");
  // Act
  store.load("other_location");
  // Assert
  expect(store.get("bar")).toBeUndefined();
});

test("On `load` called with serializer, if the value of the corresponding key is in Storage, then slice is evaluated by deserialize.", () => {
  // Arrange
  const navigationKey = "current_location";
  storageMock.getItem.mockReturnValueOnce(
    JSON.stringify({ foo: "storage value" }),
  );
  const store = new StorageStore(storage, {
    serialize: () => "not-used-value",
    deserialize: () => ({
      foo: "dummy-result",
    }),
  });
  // Act
  store.load(navigationKey);
  // Assert
  expect(store.get("foo")).toBe("dummy-result");
});

test("On `load` called with invalid serializer, the value of slice remains at its initial value.", () => {
  // Arrange
  const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  const navigationKey = "current_location";
  storageMock.getItem.mockReturnValueOnce(
    JSON.stringify({ foo: "storage value" }),
  );
  const store = new StorageStore(storage, {
    serialize: JSON.stringify,
    deserialize: () => {
      throw new Error("deserialize error");
    },
  });
  // Act
  store.load(navigationKey);
  // Assert
  expect(store.get("foo")).toBeUndefined();
  // Restore console
  consoleSpy.mockRestore();
});

test("On `load` called, all listener notified.", async () => {
  // Arrange
  const navigationKey = "current_location";
  const store = new StorageStore(storage);
  const listener1 = vi.fn();
  const listener2 = vi.fn();
  store.subscribe("foo", listener1);
  store.subscribe("bar", listener2);
  // Act
  store.load(navigationKey);
  // Generate and execute microtasks with Promise to wait for listener execution.
  await Promise.resolve();
  // Assert
  expect(listener1).toBeCalledTimes(1);
  expect(listener2).toBeCalledTimes(1);
});

test("On `save` called, the state is saved in Storage with evaluated by deserialize.", () => {
  // Arrange
  const currentLocationKey = "current_location";
  const store = new StorageStore(storage, {
    serialize: () => "dummy-result",
    deserialize: () => ({
      foo: "not-used-value",
    }),
  });
  store.load(currentLocationKey);
  store.set("foo", "updated");
  // Act
  store.save();
  // Assert
  expect(storageMock.setItem).toHaveBeenCalledTimes(1);
  expect(storageMock.setItem).toHaveBeenCalledWith(
    `${locationKeyPrefix}${currentLocationKey}`,
    "dummy-result",
  );
});

test("On `save` called with serializer, the state is saved in Storage with the previous Location key.", () => {
  // Arrange
  const currentLocationKey = "current_location";
  const store = new StorageStore(storage);
  store.load(currentLocationKey);
  store.set("foo", "updated");
  // Act
  store.save();
  // Assert
  expect(storageMock.setItem).toHaveBeenCalledTimes(1);
  expect(storageMock.setItem).toHaveBeenCalledWith(
    `${locationKeyPrefix}${currentLocationKey}`,
    JSON.stringify({ foo: "updated" }),
  );
});

test("On `save` called with invalid serializer, the state is not saved in Storage.", () => {
  // Arrange
  const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  const currentLocationKey = "current_location";
  const store = new StorageStore(storage, {
    serialize: () => {
      throw new Error("serialize error");
    },
    deserialize: JSON.parse,
  });
  store.load(currentLocationKey);
  store.set("foo", "updated");
  // Act
  store.save();
  // Assert
  expect(store.get("foo")).toBe("updated");
  expect(storageMock.setItem).not.toBeCalled();
  // Restore console
  consoleSpy.mockRestore();
});

test("Calling `save` with empty will remove the Storage with Location key.", () => {
  // Arrange
  const currentLocationKey = "current_location";
  const store = new StorageStore(storage);
  store.load(currentLocationKey); // set key
  // Act
  store.save();
  // Assert
  expect(storageMock.removeItem).toHaveBeenCalledTimes(1);
});

test("Recommended format: new StorageStore({ storage, stateSerializer }) works correctly", () => {
  // Arrange
  const customSerializer = {
    serialize: vi.fn().mockReturnValue("serialized"),
    deserialize: vi.fn().mockReturnValue({ test: "value" }),
  };
  storageMock.getItem.mockReturnValueOnce(
    JSON.stringify({ test: "storage value" }),
  );
  const store = new StorageStore({
    storage,
    stateSerializer: customSerializer,
  });
  // Act
  store.load("test_key");
  // Assert
  expect(customSerializer.deserialize).toHaveBeenCalled();
});

test("Recommended format: default storage should be sessionStorage when available", () => {
  // Arrange
  const originalSessionStorage = globalThis.sessionStorage;
  const mockSessionStorage = {
    getItem: vi.fn().mockReturnValue(null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  } as unknown as Storage;
  // Mock globalThis.sessionStorage
  Object.defineProperty(globalThis, "sessionStorage", {
    value: mockSessionStorage,
    writable: true,
  });
  const store = new StorageStore({});
  // Act
  store.load("test_key");
  // Assert
  expect(mockSessionStorage.getItem).toHaveBeenCalledWith(
    "__location_state_test_key",
  );
  // Restore
  Object.defineProperty(globalThis, "sessionStorage", {
    value: originalSessionStorage,
    writable: true,
  });
});

test("Recommended format: explicit storage overrides default sessionStorage", () => {
  // Arrange
  const customStorage = {
    getItem: vi.fn().mockReturnValue(null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  } as unknown as Storage;
  const store = new StorageStore({ storage: customStorage });
  // Act
  store.load("test_key");
  // Assert
  expect(customStorage.getItem).toHaveBeenCalledWith(
    "__location_state_test_key",
  );
});
