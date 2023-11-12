import { Syncer } from "../types";
import { jsonSerializer } from "./serializer";
import { searchParamEncoder, URLStore } from "./url-store";

describe("`URLStore`", () => {
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
      expect(listener).toHaveBeenCalledTimes(1);
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
      expect(listener).toHaveBeenCalledTimes(1);
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
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
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
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
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

    test("On `load` called, `onLoad` listener notified.", async () => {
      // Arrange
      const store = new URLStore(syncerMock);
      const listener = jest.fn();
      store.onLoad(listener);
      // Act
      store.load();
      // Generate and execute microtasks with Promise to wait for listener execution.
      await Promise.resolve();
      // Assert
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe("Custom urlEncoder", () => {
    test("When called `set` with urlEncoder, store's values are updated and reflected in the URL.", () => {
      // Arrange
      prepareLocation({
        pathname: "/",
        search: "?hoge=fuga",
      });
      const encodeMock = jest.fn(
        (url, state) => `${url}#mock-location-state=${JSON.stringify(state)}`,
      );
      const store = new URLStore(syncerMock, {
        encode: encodeMock,
        decode: () => ({}), // unused
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

    test("When called `load` with urlEncoder, initial value depends on getter.", () => {
      // Arrange
      prepareLocation({
        pathname: "/",
      });
      const decodeMock = jest.fn(() => ({
        foo: "initial-value",
      }));
      const store = new URLStore(syncerMock, {
        encode: () => "unused",
        decode: decodeMock,
      });
      // Act
      store.load();
      // Assert
      expect(store.get("foo")).toBe("initial-value");
      expect(decodeMock).toHaveBeenCalledTimes(1);
    });
  });
});

describe("`searchParamEncoder`", () => {
  describe("Default serializer", () => {
    const encoder = searchParamEncoder("location-state", jsonSerializer);

    test("When encoding with state, the state is reflected in the URL.", () => {
      // Arrange
      const url = "http://localhost/";
      const state = { foo: "bar" };
      // Act
      const encoded = encoder.encode(url, state);
      // Assert
      expect(encoded).toBe(`${url}?location-state=%7B%22foo%22%3A%22bar%22%7D`);
    });

    test("When encoding with undefined, the parameter is deleted.", () => {
      // Arrange
      const url =
        "http://localhost/?location-state=%7B%22foo%22%3A%22bar%22%7D";
      // Act
      const encoded = encoder.encode(url, undefined);
      // Assert
      expect(encoded).toBe("http://localhost/");
    });

    test("When decoding, the state is obtained.", () => {
      // Arrange
      const url =
        "http://localhost/?location-state=%7B%22foo%22%3A%22bar%22%7D";
      // Act
      const decoded = encoder.decode(url);
      // Assert
      expect(decoded).toEqual({ foo: "bar" });
    });
  });

  describe("Custom serializer", () => {
    test("When encoding, the state is reflected in the returned URL.", () => {
      // Arrange
      const url = "http://localhost/";
      const state = { foo: "bar" };
      const serializeMock = jest.fn(() => "dummy-result");
      const encoder = searchParamEncoder("location-state", {
        serialize: serializeMock,
        deserialize: () => ({}), // unused
      });
      // Act
      const encoded = encoder.encode(url, state);
      // Assert
      expect(encoded).toBe(`${url}?location-state=dummy-result`);
      expect(serializeMock).toHaveBeenCalledTimes(1);
      expect(serializeMock).toHaveBeenCalledWith(state);
    });

    test("When decoding, the state is obtained based on deserialize.", () => {
      // Arrange
      const stateString = "dummy-result";
      const deserializeMock = jest.fn(() => ({ foo: "bar" }));
      const encoder = searchParamEncoder("location-state", {
        serialize: () => "unused",
        deserialize: deserializeMock,
      });
      // Act
      const decoded = encoder.decode(
        `http://localhost/?location-state=${stateString}`,
      );
      // Assert
      expect(decoded).toEqual({ foo: "bar" });
      expect(deserializeMock).toHaveBeenCalledTimes(1);
      expect(deserializeMock).toHaveBeenCalledWith(stateString);
    });
  });
});
