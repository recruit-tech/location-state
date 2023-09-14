import { Syncer } from "../types";
import { searchParamEncoder, URLStore } from "./url-store";

describe("URLStore", () => {
  function prepareLocation({
    pathname,
    search = "",
    hash = "",
  }: {
    pathname: string;
    search?: `?${string}` | "";
    hash?: `#${string}` | "";
  }) {
    Object.defineProperty(window, "location", {
      value: {
        pathname,
        search,
        href: `http://localhost${pathname}${search}${hash}`,
      },
      writable: true,
    });
  }

  const syncerMock = {
    updateURL: jest.fn() as unknown,
  } as Syncer;

  beforeEach(() => {
    prepareLocation({
      pathname: "/",
      search: "",
    });
    (syncerMock.updateURL as jest.Mock).mockClear();
  });

  describe("Default urlEncoder", () => {
    test("If params is empty, the initial value is undefined.", () => {
      // Arrange
      const store = new URLStore(syncerMock);
      // Act
      const value = store.get("foo");
      // Assert
      expect(value).toBeUndefined();
    });

    test("When called `set`, store's values are updated and reflected in the URL.", () => {
      // Arrange
      prepareLocation({
        pathname: "/",
        search: "?hoge=fuga",
      });
      const store = new URLStore(syncerMock);
      // Act
      store.set("foo", "updated");
      // Assert
      expect(store.get("foo")).toBe("updated");
      expect(syncerMock.updateURL).toHaveBeenCalledTimes(1);
      expect(syncerMock.updateURL).toHaveBeenCalledWith(
        "http://localhost/?hoge=fuga&location-state=%7B%22foo%22%3A%22updated%22%7D",
      );
    });

    test("listener is called when updating value.", () => {
      // Arrange
      const store = new URLStore(syncerMock);
      const listener = jest.fn();
      store.subscribe("foo", listener);
      // Act
      store.set("foo", "updated");
      // Assert
      expect(listener).toBeCalledTimes(1);
    });

    test("listener is called even if updated with undefined.", () => {
      // Arrange
      const store = new URLStore(syncerMock);
      store.set("foo", "updated");
      const listener = jest.fn();
      store.subscribe("foo", listener);
      // Act
      store.set("foo", undefined);
      // Assert
      expect(listener).toBeCalledTimes(1);
    });

    test("When called `store.get` in the listener to get the latest value.", () => {
      // Arrange
      expect.assertions(4);
      const store = new URLStore(syncerMock);
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

    test("When the listener is unsubscribed, it will no longer be called when the value is updated.", () => {
      // Arrange
      const store = new URLStore(syncerMock);
      const listeners = {
        unsubscribeTarget: jest.fn(),
        other: jest.fn(),
      };
      const unsubscribe = store.subscribe("foo", listeners.unsubscribeTarget);
      store.subscribe("foo", listeners.other);
      // Act
      unsubscribe();
      store.set("foo", "updated");
      // Assert
      expect(listeners.unsubscribeTarget).not.toBeCalled();
      expect(listeners.other).toBeCalled();
    });

    test("When called `load`, the state is loaded from url.", () => {
      // Arrange
      prepareLocation({
        pathname: "/",
        search: "?location-state=%7B%22foo%22%3A%22updated%22%7D",
      });
      const store = new URLStore(syncerMock);
      // Act
      store.load();
      // Assert
      expect(store.get("foo")).toBe("updated");
    });

    test("When called `load`, all listener notified.", async () => {
      // Arrange
      const store = new URLStore(syncerMock);
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      store.subscribe("foo", listener1);
      store.subscribe("bar", listener2);
      // Act
      store.load();
      // Generate and execute microtasks with Promise to wait for listener execution.
      await Promise.resolve();
      // Assert
      expect(listener1).toBeCalledTimes(1);
      expect(listener2).toBeCalledTimes(1);
    });

    test("When called `load`, delete parameter if invalid JSON string.", () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      prepareLocation({
        pathname: "/",
        search: "?location-state=invalid-json-string",
      });
      const store = new URLStore(syncerMock);
      // Act
      store.load();
      // Assert
      expect(store.get("foo")).toBeUndefined();
      expect(syncerMock.updateURL).toHaveBeenCalledTimes(1);
      expect(syncerMock.updateURL).toHaveBeenCalledWith("http://localhost/");
      // Restore console
      consoleSpy.mockRestore();
    });
  });

  describe("Custom urlEncoder", () => {
    describe("with searchParamEncoder", () => {
      test("When called `set` with serializer, store's values are updated and reflected in the URL.", () => {
        // Arrange
        prepareLocation({
          pathname: "/",
          search: "?hoge=fuga",
        });
        const store = new URLStore(
          syncerMock,
          searchParamEncoder("location-state", {
            serialize: () => "dummy-result",
            deserialize: () => ({
              foo: "not-used-value",
            }),
          }),
        );
        // Act
        store.set("foo", "updated");
        // Assert
        expect(store.get("foo")).toBe("updated");
        expect(syncerMock.updateURL).toHaveBeenCalledTimes(1);
        expect(syncerMock.updateURL).toHaveBeenCalledWith(
          "http://localhost/?hoge=fuga&location-state=dummy-result",
        );
      });

      test("When called `set` with invalid serializer, store's values are initial value and not reflected in the URL.", () => {
        // Arrange
        const consoleSpy = jest.spyOn(console, "error").mockImplementation();
        prepareLocation({
          pathname: "/",
          search: "?hoge=fuga",
        });
        const store = new URLStore(
          syncerMock,
          searchParamEncoder("location-state", {
            serialize: () => {
              throw new Error("serialize error");
            },
            deserialize: () => ({
              foo: "not-used-value",
            }),
          }),
        );
        // Act
        store.set("foo", "updated");
        // Assert
        expect(store.get("foo")).toBe("updated");
        expect(syncerMock.updateURL).not.toHaveBeenCalled();
        // Restore console
        consoleSpy.mockRestore();
      });

      test("When called `load` with serializer, the value is obtained through serialize.", () => {
        // Arrange
        prepareLocation({
          pathname: "/",
          search: "?location-state=%7B%22foo%22%3A%22updated%22%7D",
        });
        const store = new URLStore(
          syncerMock,
          searchParamEncoder("location-state", {
            serialize: () => "not-used-value",
            deserialize: () => ({
              foo: "dummy-result",
            }),
          }),
        );
        // Act
        store.load();
        // Assert
        expect(store.get("foo")).toBe("dummy-result");
      });

      test("When called `load` with invalid serializer, the value is initial value.", () => {
        // Arrange
        const consoleSpy = jest.spyOn(console, "error").mockImplementation();
        prepareLocation({
          pathname: "/",
          search: "?location-state=%7B%22foo%22%3A%22updated%22%7D",
        });
        const store = new URLStore(
          syncerMock,
          searchParamEncoder("location-state", {
            serialize: JSON.stringify,
            deserialize: () => {
              throw new Error("deserialize error");
            },
          }),
        );
        // Act
        store.load();
        // Assert
        expect(store.get("foo")).toBeUndefined();
        expect(syncerMock.updateURL).toHaveBeenCalledTimes(1);
        expect(syncerMock.updateURL).toHaveBeenCalledWith("http://localhost/");
        // Restore console
        consoleSpy.mockRestore();
      });
    });

    describe("with custom encoder", () => {
      test("When called `set` with urlHandlers, store's values are updated and reflected in the URL.", () => {
        // Arrange
        prepareLocation({
          pathname: "/",
          search: "?hoge=fuga",
        });
        const encodeMock = jest.fn(
          (url, state) => `${url}#mock-location-state=${JSON.stringify(state)}`,
        );
        const store = new URLStore(syncerMock, {
          decode: () => ({}), // unused
          encode: encodeMock,
        });
        // Act
        store.set("foo", "updated");
        // Assert
        expect(store.get("foo")).toBe("updated");
        expect(syncerMock.updateURL).toHaveBeenCalledTimes(1);
        expect(syncerMock.updateURL).toHaveBeenCalledWith(
          'http://localhost/?hoge=fuga#mock-location-state={"foo":"updated"}',
        );
        expect(encodeMock).toHaveBeenCalledTimes(1);
      });

      test("When called `load` with urlHandlers, initial value depends on getter.", () => {
        // Arrange
        prepareLocation({
          pathname: "/",
        });
        const decodeMock = jest.fn(() => ({
          foo: "initial-value",
        }));
        const store = new URLStore(syncerMock, {
          decode: decodeMock,
          encode: () => "unused",
        });
        // Act
        store.load();
        // Assert
        expect(store.get("foo")).toBe("initial-value");
        expect(decodeMock).toHaveBeenCalledTimes(1);
      });
    });
  });
});
