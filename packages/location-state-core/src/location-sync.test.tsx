import { screen, waitFor } from "@testing-library/react";
import { useEffect, useRef } from "react";
import { createNavigationMock } from "test-utils";
import { renderWithUser } from "test-utils";
import {
  type LocationStateDefinition,
  useLocationSetState,
  useLocationState,
  useLocationStateValue,
} from "./hooks";
import { LocationStateProvider } from "./provider";
import { locationKeyPrefix } from "./stores";

const mockNavigation = createNavigationMock("/");
// @ts-ignore
globalThis.navigation = mockNavigation;

beforeEach(() => {
  mockNavigation.navigate("/");
  sessionStorage.clear();
});

describe("using `useLocationState`.", () => {
  function LocationSyncCounter() {
    const [count, setCount] = useLocationState({
      name: "count",
      defaultValue: 0,
      storeName: "session",
    });
    return (
      <div>
        <h1>count: {count}</h1>
        <button type="button" onClick={() => setCount(count + 1)}>
          increment
        </button>
        <button type="button" onClick={() => setCount((prev) => prev + 1)}>
          increment with updater
        </button>
      </div>
    );
  }

  function LocationSyncCounterPage() {
    return (
      <LocationStateProvider>
        <LocationSyncCounter />
      </LocationStateProvider>
    );
  }

  test("`count` can be updated.", async () => {
    // Arrange
    const { user } = renderWithUser(<LocationSyncCounterPage />);
    // Act
    await user.click(await screen.findByRole("button", { name: "increment" }));
    // Assert
    expect(screen.getByRole("heading")).toHaveTextContent("count: 1");
  });

  test("`count` can be updated with updater.", async () => {
    // Arrange
    const { user } = renderWithUser(<LocationSyncCounterPage />);
    // Act
    await user.click(
      await screen.findByRole("button", { name: "increment with updater" }),
    );
    // Assert
    expect(screen.getByRole("heading")).toHaveTextContent("count: 1");
  });

  test("`count` is reset at navigation.", async () => {
    // Arrange
    const { user } = renderWithUser(<LocationSyncCounterPage />);
    await user.click(await screen.findByRole("button", { name: "increment" }));
    // Act
    mockNavigation.navigate("/anywhere");
    // Assert
    await waitFor(() =>
      expect(screen.getByRole("heading")).toHaveTextContent("count: 0"),
    );
  });

  test("If there is a value in sessionStorage, it will be restored as initial value", async () => {
    // Arrange
    const key = mockNavigation.currentEntry?.key as string;
    sessionStorage.setItem(`${locationKeyPrefix}${key}`, `{"count":2}`);
    // Act
    renderWithUser(<LocationSyncCounterPage />);
    // Assert
    await waitFor(() =>
      expect(screen.getByRole("heading")).toHaveTextContent("count: 2"),
    );
  });
});

describe("using `useLocationStateValue`.", () => {
  function LocationSyncCounter() {
    const counter: LocationStateDefinition<number> = {
      name: "count",
      defaultValue: 0,
      storeName: "session",
    };
    const count = useLocationStateValue(counter);
    return <h1>count: {count}</h1>;
  }

  function LocationSyncCounterPage() {
    return (
      <LocationStateProvider>
        <LocationSyncCounter />
      </LocationStateProvider>
    );
  }

  test("If there is a value in sessionStorage, it will be restored as initial value", async () => {
    // Arrange
    const key = mockNavigation.currentEntry?.key as string;
    sessionStorage.setItem(`${locationKeyPrefix}${key}`, `{"count":2}`);
    // Act
    renderWithUser(<LocationSyncCounterPage />);
    // Assert
    await waitFor(() =>
      expect(screen.getByRole("heading")).toHaveTextContent("count: 2"),
    );
  });

  test.todo(`When store's value is changed, component is re-rendered.`);
});

describe("using `useLocationSetState`.", () => {
  function LocationSyncCounter() {
    const counter: LocationStateDefinition<number> = {
      name: "counter",
      defaultValue: 0,
      storeName: "session",
    };
    const rendered = useRef(1);
    const setCount = useLocationSetState(counter);
    useEffect(() => {
      rendered.current++;
    }, []);

    return (
      <div>
        <h1>rendered: {rendered.current}</h1>
        <button type="button" onClick={() => setCount((prev) => prev + 1)}>
          increment
        </button>
      </div>
    );
  }

  function LocationSyncCounterPage() {
    return (
      <LocationStateProvider>
        <LocationSyncCounter />
      </LocationStateProvider>
    );
  }

  test("setCount does not re-render.", async () => {
    // Arrange
    const { user } = renderWithUser(<LocationSyncCounterPage />);
    // Act
    await user.click(await screen.findByRole("button", { name: "increment" }));
    // Assert
    expect(screen.getByRole("heading")).toHaveTextContent("rendered: 1");
    // todo: assert store's value updated.
  });
});
