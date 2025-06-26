import { beforeEach, expect, test, vi } from "vitest";
import { StorageStore } from "./storage-store";

const storageMock = {
  getItem: vi.fn().mockReturnValue(null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
// Partial mock storage to be Storage type
const storage = storageMock as unknown as Storage;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("StoreStorage", () => {
  describe("`constructor` format", () => {
    describe("Recommended", () => {
      test("`sessionStorage` is used when arguments are omitted", () => {
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
        const store = new StorageStore();
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

      test("`storage` is provided", () => {
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

      test("`storage` and `stateSerializer` are provided", () => {
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
        expect(storageMock.getItem).toHaveBeenCalledWith(
          "__location_state_test_key",
        );
        expect(store.get("test")).toBe("value");
      });

      test("`sessionStorage` is used even when explicit `{}` is provided", () => {
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
    });

    describe("Legacy", () => {
      test("`storage` is provided", () => {
        // Arrange
        const customStorage = {
          getItem: vi.fn().mockReturnValue(null),
          setItem: vi.fn(),
          removeItem: vi.fn(),
        } as unknown as Storage;
        const store = new StorageStore(customStorage);
        // Act
        store.load("test_key");
        // Assert
        expect(customStorage.getItem).toHaveBeenCalledWith(
          "__location_state_test_key",
        );
      });

      test("`sessionStorage` is used even when explicit `undefined` is provided, but it should not throw an error", () => {
        // Act & Assert
        expect(() => {
          // Only SSR is assumed, so as long as no error occurs, it's fine.
          new StorageStore(undefined);
        }).not.toThrow();
      });

      test("`storage` and `stateSerializer` are provided", () => {
        // Arrange
        const customSerializer = {
          serialize: vi.fn().mockReturnValue("serialized"),
          deserialize: vi.fn().mockReturnValue({ test: "value" }),
        };
        storageMock.getItem.mockReturnValueOnce(
          JSON.stringify({ test: "storage value" }),
        );
        const store = new StorageStore(storage, customSerializer);
        // Act
        store.load("test_key");
        // Assert
        expect(customSerializer.deserialize).toHaveBeenCalled();
        expect(store.get("test")).toBe("value");
        expect(storageMock.getItem).toHaveBeenCalledWith(
          "__location_state_test_key",
        );
      });

      test("`stateSerializer` is used with `undefined` storage, but it should not throw an error", () => {
        // Arrange
        const customSerializer = {
          serialize: vi.fn().mockReturnValue("serialized"),
          deserialize: vi.fn().mockReturnValue({ test: "value" }),
        };
        // Act & Assert
        expect(() => {
          // Only SSR is assumed, so as long as no error occurs, it's fine.
          new StorageStore(undefined, customSerializer);
        }).not.toThrow();
      });
    });
  });

  describe("`storage` is provided", () => {
    test("The initial value is undefined when storage is empty.", () => {
      // Arrange
      const store = new StorageStore({ storage });
      // Act
      const slice = store.get("foo");
      // Assert
      expect(slice).toBeUndefined();
    });

    describe("On `set`", () => {
      test("The updated value is obtained.", () => {
        // Arrange
        const store = new StorageStore({ storage });
        // Act
        store.set("foo", "updated");
        // Assert
        expect(store.get("foo")).toBe("updated");
      });

      test("The listener is notified.", () => {
        // Arrange
        const store = new StorageStore({ storage });
        const listener = vi.fn();
        store.subscribe("foo", listener);
        // Act
        store.set("foo", "updated");
        // Assert
        expect(listener).toBeCalledTimes(1);
      });

      test("The listener is notified when updating with `undefined`.", () => {
        // Arrange
        const store = new StorageStore({ storage });
        store.set("foo", "updated");
        const listener = vi.fn();
        store.subscribe("foo", listener);
        // Act
        store.set("foo", undefined);
        // Assert
        expect(listener).toBeCalledTimes(1);
      });

      test("The multiple listeners are notified when updating with the same key.", () => {
        // Arrange
        expect.assertions(4);
        const store = new StorageStore({ storage });
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

      test("The listener is unsubscribed by the returned callback, it will no longer be called when updating.", () => {
        // Arrange
        const store = new StorageStore({ storage });
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
    });

    describe("On `load`", () => {
      test("The slice is the value in storage.", () => {
        // Arrange
        const navigationKey = "current_location";
        storageMock.getItem.mockReturnValueOnce(
          JSON.stringify({ foo: "storage value" }),
        );
        const store = new StorageStore({ storage });
        // Act
        store.load(navigationKey);
        // Assert
        expect(store.get("foo")).toBe("storage value");
        expect(storageMock.getItem).toHaveBeenCalledTimes(1);
        expect(storageMock.getItem).toHaveBeenCalledWith(
          `__location_state_${navigationKey}`,
        );
      });

      test("The value of the slice is merged with the value in storage.", () => {
        // Arrange
        storageMock.getItem.mockReturnValueOnce(
          JSON.stringify({
            foo: "storage foo",
            bar: "storage bar",
          }),
        );
        const store = new StorageStore({ storage });
        store.set("bar", "updated bar");
        store.set("baz", "updated baz");
        // Act
        store.load("current_location");
        // Assert
        expect(store.get("foo")).toBe("storage foo");
        expect(store.get("bar")).toBe("updated bar");
        expect(store.get("baz")).toBe("updated baz");
      });

      test("The value of the slice is reset when `load` is called with different key.", () => {
        // Arrange
        const store = new StorageStore({ storage });
        store.set("bar", "updated");
        store.load("current_location");
        // Act
        store.load("other_location");
        // Assert
        expect(store.get("bar")).toBeUndefined();
      });

      test("All listeners are notified.", async () => {
        // Arrange
        const navigationKey = "current_location";
        const store = new StorageStore({ storage });
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
    });

    describe("On `save`", () => {
      test("The state is saved in Storage.", () => {
        // Arrange
        const currentLocationKey = "current_location";
        const store = new StorageStore({ storage });
        store.load(currentLocationKey);
        store.set("foo", "updated");
        // Act
        store.save();
        // Assert
        expect(storageMock.setItem).toHaveBeenCalledTimes(1);
        expect(storageMock.setItem).toHaveBeenCalledWith(
          `__location_state_${currentLocationKey}`,
          JSON.stringify({ foo: "updated" }),
        );
      });

      test("The Storage is removed when `save` is called with empty.", () => {
        // Arrange
        const currentLocationKey = "current_location";
        const store = new StorageStore({ storage });
        store.load(currentLocationKey); // set key
        // Act
        store.save();
        // Assert
        expect(storageMock.removeItem).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("`storage` and `stateSerializer` are provided", () => {
    describe("On `load`", () => {
      test("The value of the slice is evaluated by `deserialize`.", () => {
        // Arrange
        const navigationKey = "current_location";
        storageMock.getItem.mockReturnValueOnce(
          JSON.stringify({ foo: "storage value" }),
        );
        const store = new StorageStore({
          storage,
          stateSerializer: {
            serialize: () => "not-used-value",
            deserialize: () => ({
              foo: "dummy-result",
            }),
          },
        });
        // Act
        store.load(navigationKey);
        // Assert
        expect(store.get("foo")).toBe("dummy-result");
      });

      test("The value of the slice remains at its initial value when `load` is called with invalid `stateSerializer`.", () => {
        // Arrange
        const consoleSpy = vi
          .spyOn(console, "error")
          .mockImplementation(() => {});
        const navigationKey = "current_location";
        storageMock.getItem.mockReturnValueOnce(
          JSON.stringify({ foo: "storage value" }),
        );
        const store = new StorageStore({
          storage,
          stateSerializer: {
            serialize: JSON.stringify,
            deserialize: () => {
              throw new Error("deserialize error");
            },
          },
        });
        // Act
        store.load(navigationKey);
        // Assert
        expect(store.get("foo")).toBeUndefined();
        // Restore console
        consoleSpy.mockRestore();
      });
    });

    describe("On `save`", () => {
      test("The state is saved in Storage with evaluated by `serialize`.", () => {
        // Arrange
        const currentLocationKey = "current_location";
        const store = new StorageStore({
          storage,
          stateSerializer: {
            serialize: () => "dummy-result",
            deserialize: () => ({
              foo: "not-used-value",
            }),
          },
        });
        store.load(currentLocationKey);
        store.set("foo", "updated");
        // Act
        store.save();
        // Assert
        expect(storageMock.setItem).toHaveBeenCalledTimes(1);
        expect(storageMock.setItem).toHaveBeenCalledWith(
          `__location_state_${currentLocationKey}`,
          "dummy-result",
        );
      });

      test("The state is not saved in Storage when `save` is called with invalid `stateSerializer`.", () => {
        // Arrange
        const consoleSpy = vi
          .spyOn(console, "error")
          .mockImplementation(() => {});
        const currentLocationKey = "current_location";
        const store = new StorageStore({
          storage,
          stateSerializer: {
            serialize: () => {
              throw new Error("serialize error");
            },
            deserialize: JSON.parse,
          },
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
    });
  });
});
